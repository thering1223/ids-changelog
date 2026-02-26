import { GoogleGenerativeAI } from "@google/generative-ai";
import { Octokit } from "@octokit/rest";
import fs from "fs";
import path from "path";

const ROOT = process.env.GITHUB_WORKSPACE || path.resolve("../..");

// ============================================================
// Entry point
// ============================================================
async function main() {
  const webhook = parseWebhook();
  if (!webhook) return;

  const readResult = readGitHub();
  const fetchResult = await fetchFigma(webhook);
  const reportResult = await buildReport(webhook, readResult, fetchResult);
  await writeGitHub(readResult, reportResult);
  await notifySlack(webhook, reportResult);
}

// ============================================================
// 1. parseWebhook
// ============================================================
function parseWebhook() {
  const raw = JSON.parse(process.env.WEBHOOK_PAYLOAD);
  if (raw.event_type === "PING") {
    console.log("PING received, skipping");
    return null;
  }
  if (raw.passcode !== "ids-changelog-2026") {
    console.log("Invalid passcode, skipping");
    return null;
  }
  // Pipedream 10개 프로퍼티 제한 우회: changes 객체 언팩
  const { changes, ...rest } = raw;
  return { ...rest, ...(changes || {}) };
}

// ============================================================
// 2. readGitHub (changelog + g3 prompt only)
// ============================================================
function readGitHub() {
  const changelogContent = fs.readFileSync(path.join(ROOT, "changelog/CHANGELOG.md"), "utf-8");
  const versionMatch = changelogContent.match(/^## (\d+\.\d+\.\d+)/m);
  const currentVersion = versionMatch ? versionMatch[1] : "0.0.0";

  let g3Prompt = "";
  try {
    g3Prompt = fs.readFileSync(path.join(ROOT, "prompts/g3.txt"), "utf-8");
  } catch (e) { /* optional */ }

  console.log(`Current version: ${currentVersion}`);
  return { changelogContent, currentVersion, g3Prompt };
}

// ============================================================
// 3. fetchFigma (metas only — nodeId for Figma links)
// ============================================================
async function fetchFigma(webhook) {
  const figmaToken = process.env.FIGMA_TOKEN;
  const figmaFetch = async (url) => {
    const res = await fetch(`https://api.figma.com${url}`, {
      headers: { "X-Figma-Token": figmaToken },
    });
    if (!res.ok) throw new Error(`Figma API ${res.status}: ${url}`);
    return res.json();
  };

  const componentKeys = [
    ...(webhook.created_components || []),
    ...(webhook.modified_components || []),
  ].map((c) => c.key);

  const styleKeys = [
    ...(webhook.created_styles || []),
    ...(webhook.modified_styles || []),
  ].map((s) => s.key);

  const [componentMetas, styleMetas] = await Promise.all([
    Promise.all(
      componentKeys.map((key) =>
        figmaFetch(`/v1/components/${key}`).catch((e) => ({ error: e.message, key }))
      )
    ),
    Promise.all(
      styleKeys.map((key) =>
        figmaFetch(`/v1/styles/${key}`).catch((e) => ({ error: e.message, key }))
      )
    ),
  ]);

  console.log(`Fetched: ${componentMetas.length} component metas, ${styleMetas.length} style metas`);
  return { componentMetas, styleMetas };
}

// ============================================================
// 4. buildReport
// ============================================================
async function buildReport(webhook, readResult, fetchResult) {
  const { currentVersion, g3Prompt } = readResult;
  const { componentMetas, styleMetas } = fetchResult;

  const figmaBase = `https://www.figma.com/file/${webhook.file_key}`;
  const mdLink = (name, nodeId) => nodeId ? `[${name}](${figmaBase}?node-id=${nodeId})` : name;

  const getCompMeta = (key) => componentMetas.find((m) => m.meta?.key === key)?.meta;
  const getStyleMeta = (key) => styleMetas.find((m) => m.meta?.key === key)?.meta;

  // --- Variables ---
  const variablesAdded = webhook.created_variables || [];
  const variablesDeleted = webhook.deleted_variables || [];
  const variablesModified = webhook.modified_variables || [];

  // --- Styles (enrich with nodeId) ---
  const stylesAdded = (webhook.created_styles || []).map((s) => ({
    ...s, nodeId: getStyleMeta(s.key)?.node_id,
  }));
  const stylesDeleted = webhook.deleted_styles || [];
  const stylesModified = (webhook.modified_styles || []).map((s) => ({
    ...s, nodeId: getStyleMeta(s.key)?.node_id,
  }));

  // --- Components (enrich with nodeId + setName) ---
  const enrichComp = (c) => {
    const meta = getCompMeta(c.key);
    return {
      ...c,
      nodeId: meta?.node_id,
      setName: meta?.containing_frame?.containing_component_set?.name
        || meta?.containing_frame?.containingComponentSet?.name
        || meta?.containing_frame?.name
        || c.name,
    };
  };
  const componentsAdded = (webhook.created_components || []).map(enrichComp);
  const componentsDeleted = (webhook.deleted_components || []).map((c) => ({ ...c, setName: c.name }));
  const componentsModified = (webhook.modified_components || []).map(enrichComp);

  // Group by setName
  const groupBySet = (items) =>
    Object.values(
      items.reduce((acc, c) => {
        const key = c.setName || c.name;
        if (!acc[key]) acc[key] = { ...c, variantCount: 1 };
        else acc[key].variantCount++;
        return acc;
      }, {})
    );

  const groupedAdded = groupBySet(componentsAdded);
  const groupedDeleted = groupBySet(componentsDeleted);
  const groupedModified = groupBySet(componentsModified);

  // --- SemVer ---
  const hasAdded = variablesAdded.length + stylesAdded.length + componentsAdded.length > 0;
  const hasDeleted = variablesDeleted.length + stylesDeleted.length + componentsDeleted.length > 0;

  const [major, minor, patch] = currentVersion.split(".").map(Number);
  let newVersion;
  if (major >= 1) {
    if (hasDeleted) newVersion = `${major + 1}.0.0`;
    else if (hasAdded) newVersion = `${major}.${minor + 1}.0`;
    else newVersion = `${major}.${minor}.${patch + 1}`;
  } else {
    if (hasAdded || hasDeleted) newVersion = `0.${minor + 1}.0`;
    else newVersion = `0.${minor}.${patch + 1}`;
  }
  console.log(`New version: ${newVersion} (added=${hasAdded}, deleted=${hasDeleted})`);

  // --- Gemini G3 ---
  const varSummary = [
    ...variablesAdded.map((v) => `추가 ${v.name}`),
    ...variablesDeleted.map((v) => `삭제 ${v.name}`),
    ...(variablesModified.length > 0 ? [`수정 ${variablesModified.length}개(미확인)`] : []),
  ].join(", ") || "없음";

  const styleSummary = [
    ...stylesAdded.map((s) => `추가 ${s.name}`),
    ...stylesModified.map((s) => `수정 ${s.name}`),
    ...stylesDeleted.map((s) => `삭제 ${s.name}`),
  ].join(", ") || "없음";

  const compSummary = [
    ...componentsAdded.map((c) => `추가 ${c.name}`),
    ...componentsModified.map((c) => `수정 ${c.name}`),
    ...componentsDeleted.map((c) => `삭제 ${c.name}`),
  ].join(", ") || "없음";

  let g3Summary = "변경 사항 없음";
  if (g3Prompt && (varSummary !== "없음" || styleSummary !== "없음" || compSummary !== "없음")) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const fillPrompt = (t, v) => t.replace(/\{\{(\w+)\}\}/g, (_, k) => v[k] ?? "");
    const prompt = fillPrompt(g3Prompt, { variables: varSummary, styles: styleSummary, components: compSummary });
    const res = await model.generateContent(prompt);
    g3Summary = res.response.text().trim();
  }
  console.log(`G3: ${g3Summary}`);

  // --- Changelog Section ---
  const now = new Date(webhook.timestamp || Date.now());
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const dateStr = kst.toISOString().slice(0, 10);
  const deployer = webhook.triggered_by?.handle || "Unknown";
  const email = webhook.triggered_by?.email || "";

  let md = `## ${newVersion} - ${dateStr}\n\n`;
  md += `${g3Summary}\n\n`;

  // 추가
  const addedLines = [
    ...variablesAdded.map((v) => `- ${v.name}`),
    ...stylesAdded.map((s) => `- ${mdLink(s.name, s.nodeId)}`),
    ...groupedAdded.map((c) => `- ${mdLink(c.setName, c.nodeId)}${c.variantCount > 1 ? ` *(${c.variantCount})*` : ""}`),
  ];
  if (addedLines.length > 0) md += `### 추가\n${addedLines.join("\n")}\n\n`;

  // 수정
  const modifiedLines = [
    ...(variablesModified.length > 0 ? [`- ⚠️ 수정된 변수 있음 (${variablesModified.length}개 미확인)`] : []),
    ...stylesModified.map((s) => `- ${mdLink(s.name, s.nodeId)}`),
    ...groupedModified.map((c) => `- ${mdLink(c.setName, c.nodeId)}${c.variantCount > 1 ? ` *(${c.variantCount})*` : ""}`),
  ];
  if (modifiedLines.length > 0) md += `### 수정\n${modifiedLines.join("\n")}\n\n`;

  // 삭제
  const deletedLines = [
    ...variablesDeleted.map((v) => `- ${v.name}`),
    ...stylesDeleted.map((s) => `- ${s.name}`),
    ...groupedDeleted.map((c) => `- ${c.setName}${c.variantCount > 1 ? ` *(${c.variantCount})*` : ""}`),
  ];
  if (deletedLines.length > 0) md += `### 삭제\n${deletedLines.join("\n")}\n\n`;

  return {
    newVersion,
    changelogMd: md,
    g3Summary,
    variablesAdded,
    variablesDeleted,
    variablesModified,
    stylesAdded,
    stylesDeleted,
    stylesModified,
    groupedAdded,
    groupedDeleted,
    groupedModified,
  };
}

// ============================================================
// 5. writeGitHub (changelog files only)
// ============================================================
async function writeGitHub(readResult, reportResult) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
  const branch = "main";

  const { newVersion, changelogMd, g3Summary } = reportResult;
  const { changelogContent } = readResult;

  // 가장 최신 버전을 맨 위에 삽입
  const firstVersionIdx = changelogContent.search(/^## \d/m);
  const updatedChangelog = firstVersionIdx !== -1
    ? changelogContent.slice(0, firstVersionIdx) + changelogMd + changelogContent.slice(firstVersionIdx)
    : changelogContent.trimEnd() + "\n\n" + changelogMd;

  const { data: ref } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
  const latestCommitSha = ref.object.sha;
  const { data: baseCommit } = await octokit.git.getCommit({ owner, repo, commit_sha: latestCommitSha });

  const files = [
    { path: "changelog/CHANGELOG.md", content: updatedChangelog },
  ];

  const blobs = await Promise.all(
    files.map((f) =>
      octokit.git.createBlob({ owner, repo, content: Buffer.from(f.content).toString("base64"), encoding: "base64" })
    )
  );

  const { data: tree } = await octokit.git.createTree({
    owner, repo,
    base_tree: baseCommit.tree.sha,
    tree: files.map((f, i) => ({ path: f.path, mode: "100644", type: "blob", sha: blobs[i].data.sha })),
  });

  const { data: commit } = await octokit.git.createCommit({
    owner, repo,
    message: `${newVersion}: ${g3Summary}`,
    tree: tree.sha,
    parents: [latestCommitSha],
  });

  await octokit.git.updateRef({ owner, repo, ref: `heads/${branch}`, sha: commit.sha });
  console.log(`Committed v${newVersion}: ${commit.sha}`);
}

// ============================================================
// 6. notifySlack
// ============================================================
async function notifySlack(webhook, reportResult) {
  const {
    newVersion, g3Summary,
    variablesAdded, variablesDeleted, variablesModified,
    stylesAdded, stylesDeleted, stylesModified,
    groupedAdded, groupedDeleted, groupedModified,
  } = reportResult;

  const fileKey = webhook.file_key;
  const deployer = webhook.triggered_by?.handle || "Unknown";
  const email = webhook.triggered_by?.email || "";
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

  const changelogUrl = `https://github.com/${owner}/${repo}/blob/main/changelog/CHANGELOG.md`;
  const figmaBase = `https://www.figma.com/file/${fileKey}`;
  const slackLink = (name, nodeId) => nodeId ? `<${figmaBase}?node-id=${nodeId}|${name}>` : name;

  const MAX_ITEMS = 20;
  const buildSection = (label, items) => {
    if (items.length === 0) return null;
    const shown = items.slice(0, MAX_ITEMS).map((t) => `• ${t}`).join("\n");
    const extra = items.length > MAX_ITEMS ? `\n• _...외 ${items.length - MAX_ITEMS}건_` : "";
    return `${label}\n${shown}${extra}`;
  };

  const addedItems = [
    ...variablesAdded.map((v) => v.name),
    ...stylesAdded.map((s) => slackLink(s.name, s.nodeId)),
    ...groupedAdded.map((c) => `${slackLink(c.setName, c.nodeId)}${c.variantCount > 1 ? ` *(${c.variantCount})*` : ""}`),
  ];
  const modifiedItems = [
    ...(variablesModified.length > 0 ? [`⚠️ 수정된 변수 ${variablesModified.length}개 (미확인)`] : []),
    ...stylesModified.map((s) => slackLink(s.name, s.nodeId)),
    ...groupedModified.map((c) => `${slackLink(c.setName, c.nodeId)}${c.variantCount > 1 ? ` *(${c.variantCount})*` : ""}`),
  ];
  const deletedItems = [
    ...variablesDeleted.map((v) => v.name),
    ...stylesDeleted.map((s) => s.name),
    ...groupedDeleted.map((c) => `${c.setName}${c.variantCount > 1 ? ` *(${c.variantCount})*` : ""}`),
  ];

  const sections = [
    buildSection(`🟢 *추가 (${addedItems.length})*`, addedItems),
    buildSection(`🟠 *수정 (${modifiedItems.length})*`, modifiedItems),
    buildSection(`🔴 *삭제 (${deletedItems.length})*`, deletedItems),
  ].filter(Boolean);

  const bodyText = [`*${newVersion}*\n${g3Summary}`, ...sections].join("\n\n").trim();

  const blocks = [
    { type: "section", text: { type: "mrkdwn", text: bodyText || `*${newVersion}*\n변경 사항 없음` } },
    { type: "divider" },
    { type: "section", text: { type: "mrkdwn", text: `<${changelogUrl}|Changelog 보기 →>` } },
  ];

  const slackRes = await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocks }),
  });
  if (!slackRes.ok) {
    const text = await slackRes.text();
    throw new Error(`Slack notification failed: ${slackRes.status} ${text}`);
  }
  console.log("Slack notification sent");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
