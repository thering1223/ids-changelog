import { Octokit } from "@octokit/rest";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
  const diffResult = await diffAndReport(webhook, readResult, fetchResult);
  await writeGitHub(readResult, diffResult);
  await notifySlack(webhook, diffResult);
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
// 2. readGitHub (로컬 파일 직접 읽기)
// ============================================================
function readGitHub() {
  const tokens = JSON.parse(fs.readFileSync(path.join(ROOT, "tokens/tokens.json"), "utf-8"));
  const components = JSON.parse(fs.readFileSync(path.join(ROOT, "components/components.json"), "utf-8"));
  const changelogContent = fs.readFileSync(path.join(ROOT, "changelog/CHANGELOG.md"), "utf-8");

  const versionMatch = changelogContent.match(/\[v(\d+\.\d+\.\d+)\]/);
  const currentVersion = versionMatch ? versionMatch[1] : "0.0.0";

  let prompts = { g1: "", g2: "", g3: "" };
  try {
    prompts.g1 = fs.readFileSync(path.join(ROOT, "prompts/g1.txt"), "utf-8");
    prompts.g2 = fs.readFileSync(path.join(ROOT, "prompts/g2.txt"), "utf-8");
    prompts.g3 = fs.readFileSync(path.join(ROOT, "prompts/g3.txt"), "utf-8");
  } catch (e) { /* 없으면 빈 기본값 사용 */ }

  console.log(`Current version: ${currentVersion}`);
  return { tokens, components, changelogContent, currentVersion, prompts };
}

// ============================================================
// 3. fetchFigma
// ============================================================
async function fetchFigma(webhook) {
  const fileKey = webhook.file_key;
  const figmaToken = process.env.FIGMA_TOKEN;

  const figmaFetch = async (url) => {
    const res = await fetch(`https://api.figma.com${url}`, {
      headers: { "X-Figma-Token": figmaToken },
    });
    if (!res.ok) throw new Error(`Figma API ${res.status}: ${url}`);
    return res.json();
  };

  // variableMap: 로컬 파일 읽기
  let variableMap = {};
  try {
    variableMap = JSON.parse(fs.readFileSync(path.join(ROOT, "variables/variable-map.json"), "utf-8"));
  } catch (e) { /* 없으면 빈 객체 */ }

  const componentKeys = [
    ...(webhook.created_components || []),
    ...(webhook.modified_components || []),
  ].map((c) => c.key);

  const styleKeys = [
    ...(webhook.created_styles || []),
    ...(webhook.modified_styles || []),
  ].map((s) => s.key);

  const componentMetas = await Promise.all(
    componentKeys.map((key) =>
      figmaFetch(`/v1/components/${key}`).catch((e) => ({ error: e.message, key }))
    )
  );
  const styleMetas = await Promise.all(
    styleKeys.map((key) =>
      figmaFetch(`/v1/styles/${key}`).catch((e) => ({ error: e.message, key }))
    )
  );

  const nodeIds = [
    ...componentMetas.filter((m) => m.meta).map((m) => m.meta.node_id),
    ...styleMetas.filter((m) => m.meta).map((m) => m.meta.node_id),
  ];

  let nodes = {};
  if (nodeIds.length > 0) {
    const nodesData = await figmaFetch(`/v1/files/${fileKey}/nodes?ids=${nodeIds.join(",")}`);
    nodes = nodesData.nodes;
  }

  console.log(`Fetched: ${componentMetas.length} components, ${styleMetas.length} styles, ${nodeIds.length} nodes`);
  return { componentMetas, styleMetas, nodes, variableMap };
}

// ============================================================
// 4. diffAndReport
// ============================================================
async function diffAndReport(webhook, readResult, fetchResult) {
  const { tokens, components, currentVersion, prompts } = readResult;
  const { componentMetas, styleMetas, nodes, variableMap } = fetchResult;
  const keyIndex = tokens.$extensions?.figma?.keyIndex || {};
  const compKeyIndex = components.$extensions?.figma?.keyIndex || {};

  // === 공통 헬퍼 ===
  const deepEqual = (a, b) => {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (typeof a !== "object" || a === null || b === null) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => deepEqual(a[k], b[k]));
  };

  const getByPath = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);

  const rgbaToHex = (color) => {
    if (!color) return undefined;
    const r = Math.round(color.r * 255).toString(16).padStart(2, "0");
    const g = Math.round(color.g * 255).toString(16).padStart(2, "0");
    const b = Math.round(color.b * 255).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  };

  const BLACKLIST = new Set(["x", "y", "rotation", "constraints", "absoluteTransform", "relativeTransform", "exportSettings"]);

  const transformNode = (node) => {
    const result = {};
    if (node.type) result.type = node.type;
    if (node.layoutMode) result.layout = node.layoutMode;
    if (node.itemSpacing !== undefined) result.gap = node.itemSpacing;
    if (node.paddingLeft !== undefined) result.paddingLeft = node.paddingLeft;
    if (node.paddingRight !== undefined) result.paddingRight = node.paddingRight;
    if (node.paddingTop !== undefined) result.paddingTop = node.paddingTop;
    if (node.paddingBottom !== undefined) result.paddingBottom = node.paddingBottom;
    if (node.cornerRadius !== undefined) result.borderRadius = node.cornerRadius;
    if (node.opacity != null && node.opacity !== 1) result.opacity = node.opacity;
    if (node.visible === false) result.visible = false;
    if (node.size) { result.width = node.size.x; result.height = node.size.y; }
    if (node.fills?.length > 0 && node.fills[0].color) result.fill = rgbaToHex(node.fills[0].color);
    if (node.strokes?.length > 0 && node.strokes[0].color) result.border = rgbaToHex(node.strokes[0].color);
    if (node.type === "TEXT" && node.style) {
      result.fontSize = node.style.fontSize;
      result.fontWeight = node.style.fontWeight;
      result.fontFamily = node.style.fontFamily;
      if (node.fills?.length > 0) result.color = rgbaToHex(node.fills[0].color);
    }
    if (node.componentId) result.componentId = node.componentId;
    if (node.children?.length > 0) {
      result.children = {};
      for (const child of node.children) {
        result.children[child.name || child.id] = transformNode(child);
      }
    }
    return result;
  };

  const diffNodes = (oldNode, newNode, path = "") => {
    const changes = [];
    if (!oldNode || !newNode) return changes;
    const allKeys = new Set([...Object.keys(oldNode), ...Object.keys(newNode)]);
    for (const key of allKeys) {
      if (BLACKLIST.has(key) || key === "children" || key === "$extensions") continue;
      if (!deepEqual(oldNode[key], newNode[key])) {
        changes.push({ path: path ? `${path} / ${key}` : key, oldValue: oldNode[key], newValue: newNode[key] });
      }
    }
    const oldCh = oldNode.children || {};
    const newCh = newNode.children || {};
    for (const name of new Set([...Object.keys(oldCh), ...Object.keys(newCh)])) {
      const childPath = path ? `${path} / ${name}` : name;
      if (oldCh[name] && newCh[name]) {
        changes.push(...diffNodes(oldCh[name], newCh[name], childPath));
      }
    }
    return changes;
  };

  // ==============================
  // STEP 1: Variables diff
  // ==============================
  const variablesDiff = [];
  const normalize = (s) => s.replace(/[-\/]/g, "_");

  // 이름 → 경로 역인덱스 구축
  const varNameIndex = {};
  const varsObj = tokens.variables || {};
  for (const [category, vars] of Object.entries(varsObj)) {
    if (typeof vars !== "object" || vars === null) continue;
    for (const [varName, varData] of Object.entries(vars)) {
      const name = varData?.$extensions?.figma?.originalName || varName;
      varNameIndex[name] = { path: `variables.${category}.${varName}`, category };
      varNameIndex[normalize(name)] = { path: `variables.${category}.${varName}`, category };
    }
  }

  // 🟢 Created
  for (const v of webhook.created_variables || []) {
    variablesDiff.push({ status: "added", name: v.name, key: v.key, valueUnknown: true });
  }

  // 🔴 Deleted
  for (const v of webhook.deleted_variables || []) {
    const entry = keyIndex[v.key] || varNameIndex[v.name] || varNameIndex[normalize(v.name)];
    const snapshotPath = entry?.path;
    const oldValue = snapshotPath ? getByPath(tokens, snapshotPath)?.$value : undefined;
    variablesDiff.push({ status: "deleted", name: v.name, key: v.key, oldValue });
  }

  // 🟠 Modified
  const accumulatedKeys = {};
  for (const v of webhook.modified_variables || []) {
    let entry = keyIndex[v.key];
    if (!entry) entry = varNameIndex[v.name];
    if (!entry) entry = varNameIndex[normalize(v.name)];

    if (!entry) {
      variablesDiff.push({ status: "modified", name: v.name, key: v.key, note: "스냅샷 미등록", valueUnknown: true });
      continue;
    }

    const snapshotPath = entry.path;
    const oldToken = getByPath(tokens, snapshotPath);
    if (!oldToken) continue;

    accumulatedKeys[v.key] = { path: snapshotPath, type: "variable" };

    const pathParts = snapshotPath.split(".");
    const oldName = pathParts[pathParts.length - 1];
    if (normalize(oldName) !== normalize(v.name)) {
      variablesDiff.push({
        status: "modified", name: v.name, key: v.key,
        property: "(이름 변경)", oldValue: oldName, newValue: v.name,
      });
      continue;
    }
    // 이름 동일 → 거짓 양성 스킵
  }

  // ==============================
  // STEP 2: Styles diff
  // ==============================
  const stylesDiff = [];

  // 🟢 Created
  for (const s of webhook.created_styles || []) {
    stylesDiff.push({ status: "added", name: s.name, key: s.key });
  }

  // 🔴 Deleted
  for (const s of webhook.deleted_styles || []) {
    const entry = keyIndex[s.key];
    const oldValue = entry ? getByPath(tokens, entry.path)?.$value : undefined;
    stylesDiff.push({ status: "deleted", name: s.name, key: s.key, oldValue });
  }

  // 🟠 Modified
  for (const s of webhook.modified_styles || []) {
    const meta = styleMetas.find((m) => m.meta?.key === s.key);
    if (!meta?.meta) continue;
    const nodeData = nodes[meta.meta.node_id]?.document;
    if (!nodeData) continue;

    const entry = keyIndex[s.key];
    const oldToken = entry ? getByPath(tokens, entry.path) : null;
    if (!oldToken) {
      stylesDiff.push({ status: "modified", name: s.name, key: s.key, nodeId: meta.meta.node_id, note: "스냅샷 미등록" });
      continue;
    }

    let newValue;
    const styleType = meta.meta.style_type;
    if (styleType === "TEXT") {
      const st = nodeData.style || {};
      newValue = { fontFamily: st.fontFamily, fontWeight: st.fontWeight, fontSize: st.fontSize, letterSpacing: st.letterSpacing, lineHeight: st.lineHeightPx };
    } else if (styleType === "EFFECT") {
      newValue = (nodeData.effects || []).map((e) => ({
        type: e.type, offsetX: e.offset?.x, offsetY: e.offset?.y, blur: e.radius, spread: e.spread,
        color: e.color ? `rgba(${Math.round(e.color.r * 255)},${Math.round(e.color.g * 255)},${Math.round(e.color.b * 255)},${e.color.a})` : undefined,
      }));
    }

    const pathParts = entry.path.split(".");
    const oldName = pathParts[pathParts.length - 1];
    const newName = s.name.split("/").pop();
    if (oldName !== newName) {
      stylesDiff.push({ status: "modified", name: s.name, key: s.key, nodeId: meta.meta.node_id, property: "(이름 변경)", oldValue: oldName, newValue: newName });
    }
    if (newValue && !deepEqual(oldToken.$value, newValue)) {
      stylesDiff.push({ status: "modified", name: s.name, key: s.key, nodeId: meta.meta.node_id, oldValue: oldToken.$value, newValue });
    }
  }

  // ==============================
  // STEP 3: Components diff
  // ==============================
  const componentsDiff = [];

  for (const c of webhook.created_components || []) {
    const meta = componentMetas.find((m) => m.meta?.key === c.key);
    const nodeData = meta?.meta ? nodes[meta.meta.node_id]?.document : null;
    const snapshot = nodeData ? transformNode(nodeData) : null;
    const setName = meta?.meta?.containing_frame?.containing_component_set?.name
      || meta?.meta?.containing_frame?.containingComponentSet?.name
      || meta?.meta?.containing_frame?.name
      || c.name || "-";
    componentsDiff.push({ status: "added", name: c.name, key: c.key, nodeId: meta?.meta?.node_id, containingComponentSet: setName, snapshot });
  }

  for (const c of webhook.deleted_components || []) {
    const indexEntry = compKeyIndex[c.key];
    const setName = indexEntry ? indexEntry.split(".")[0] : c.name;
    componentsDiff.push({ status: "deleted", name: c.name, key: c.key, containingComponentSet: setName });
  }

  for (const c of webhook.modified_components || []) {
    const meta = componentMetas.find((m) => m.meta?.key === c.key);
    if (!meta?.meta) continue;
    const nodeData = nodes[meta.meta.node_id]?.document;
    if (!nodeData) continue;

    const newSnapshot = transformNode(nodeData);
    const indexEntry = compKeyIndex[c.key];
    const oldSnapshot = indexEntry ? getByPath(components, indexEntry) : null;
    const setName = meta.meta.containing_frame?.containing_component_set?.name
      || meta.meta.containing_frame?.containingComponentSet?.name
      || meta.meta.containing_frame?.name
      || (indexEntry ? indexEntry.split(".")[0] : null)
      || c.name || "-";

    if (!oldSnapshot) {
      componentsDiff.push({ status: "modified", name: c.name, key: c.key, nodeId: meta.meta.node_id, containingComponentSet: setName, note: "스냅샷 미등록", snapshot: newSnapshot });
      continue;
    }

    const changes = diffNodes(oldSnapshot, newSnapshot);
    if (changes.length > 0) {
      componentsDiff.push({ status: "modified", name: c.name, key: c.key, nodeId: meta.meta.node_id, containingComponentSet: setName, changes, snapshot: newSnapshot });
    }
  }

  // ==============================
  // STEP 4: SemVer 계산
  // ==============================
  const allDiffs = [...variablesDiff, ...stylesDiff, ...componentsDiff];
  const hasAdded = allDiffs.some((d) => d.status === "added");
  const hasDeleted = allDiffs.some((d) => d.status === "deleted");

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

  // ==============================
  // STEP 5: Gemini API (G1/G2/G3)
  // ==============================
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const fillPrompt = (template, vars) => template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");

  const varSummary = variablesDiff.map((d) => {
    if (d.property === "(이름 변경)") return `${d.status} ${d.name} (이름 변경: ${d.oldValue} → ${d.newValue})`;
    if (d.note) return `${d.status} ${d.name} (${d.note})`;
    return `${d.status} ${d.name}`;
  }).join(", ") || "없음";

  const styleSummary = stylesDiff.map((d) => {
    if (d.property === "(이름 변경)") return `${d.status} ${d.name} (이름 변경: ${d.oldValue} → ${d.newValue})`;
    if (d.note) return `${d.status} ${d.name} (${d.note})`;
    return `${d.status} ${d.name}`;
  }).join(", ") || "없음";

  const compSummary = componentsDiff.map((d) => {
    if (d.note) return `${d.status} ${d.name} (${d.note})`;
    return `${d.status} ${d.name}`;
  }).join(", ") || "없음";

  let g1Result = [];
  const modifiedComps = componentsDiff.filter((d) => d.status === "modified");
  if (modifiedComps.length > 1 && prompts.g1) {
    const g1Prompt = fillPrompt(prompts.g1, {
      modifiedComps: JSON.stringify(modifiedComps.map((c) => ({ name: c.name, componentSet: c.containingComponentSet, changes: c.changes?.map((ch) => ch.path) })), null, 2),
    });
    const g1Response = await model.generateContent(g1Prompt);
    const g1Match = g1Response.response.text().match(/\[[\s\S]*\]/);
    if (g1Match) g1Result = JSON.parse(g1Match[0]);
  }

  let g2Result = "";
  if (webhook.description && prompts.g2) {
    const g2Prompt = fillPrompt(prompts.g2, { description: webhook.description, variables: varSummary, styles: styleSummary, components: compSummary });
    const g2Response = await model.generateContent(g2Prompt);
    g2Result = g2Response.response.text();
  }

  const g3Prompt = fillPrompt(prompts.g3, { variables: varSummary, styles: styleSummary, components: compSummary });
  const g3Response = await model.generateContent(g3Prompt);
  const g3Summary = g3Response.response.text().trim();
  console.log(`G3 summary: ${g3Summary}`);

  // ==============================
  // STEP 6: 체인지로그 생성
  // ==============================
  const now = new Date(webhook.timestamp || Date.now());
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const today = kst.toISOString().replace("T", " ").slice(0, 19) + " (KST)";
  const deployer = webhook.triggered_by?.handle || "Unknown";
  const statusEmoji = { added: "🟢", modified: "🟠", deleted: "🔴" };
  const statusOrder = { added: 0, modified: 1, deleted: 2 };
  const figmaBase = `https://www.figma.com/file/${webhook.file_key}`;
  const mdLink = (name, nodeId) => nodeId ? `[${name}](${figmaBase}?node-id=${nodeId})` : name;

  const tokenReverse = {};
  for (const [, info] of Object.entries(variableMap)) {
    const vals = Array.isArray(info.resolved) ? info.resolved : [info.resolved];
    for (const rv of vals) {
      if (rv) tokenReverse[String(rv).toLowerCase()] = info.name;
    }
  }
  const resolveToken = (v) => {
    if (v === undefined) return "-";
    const str = String(v).toLowerCase();
    return tokenReverse[str] || JSON.stringify(v);
  };

  let changelogMd = `# IDS Figma 2.0 Changelog\n\n`;
  changelogMd += `updated: [${deployer}](mailto:${webhook.triggered_by?.email || ""})\n`;
  if (webhook.description) changelogMd += `💬 "${webhook.description}"\n`;
  changelogMd += `\n## v${newVersion}\n\n---\n\n`;
  changelogMd += `## 상세 변경 내역\n\n`;

  if (variablesDiff.length > 0) {
    changelogMd += `### Variables\n`;
    changelogMd += `| 상태 | 분류 | 항목 | 현재값 | 이전값 |\n`;
    changelogMd += `|---|---|---|---|---|\n`;
    const sorted = [...variablesDiff].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    for (const d of sorted) {
      const emoji = statusEmoji[d.status];
      const inferCollection = (name) => {
        if (name.startsWith("spacing")) return "spacing";
        if (name.startsWith("radius")) return "radius";
        if (name.startsWith("font")) return "typography";
        if (name.startsWith("solid-") || name.startsWith("alpha-")) return "color";
        if (/^(xs|s|m|l|xl)/.test(name)) return "size";
        return "semantic";
      };
      const entry = keyIndex[d.key] || varNameIndex[d.name] || varNameIndex[normalize(d.name)];
      const collection = entry?.path?.split(".")?.[1] || inferCollection(d.name);
      const itemName = d.property === "(이름 변경)" ? `${d.name} (이름 변경)` : d.name;
      const currentVal = d.valueUnknown ? "(미확인)" : (d.newValue ?? "-");
      const prevVal = d.property === "(이름 변경)" ? d.oldValue : (d.oldValue ?? "-");
      changelogMd += `| ${emoji} | ${collection} | ${itemName} | ${currentVal} | ${prevVal} |\n`;
    }
    const unknownVars = sorted.filter((d) => d.valueUnknown).map((d) => d.name);
    if (unknownVars.length > 0) {
      changelogMd += `\n> ⚠️    미확인 변수값이 있습니다. 스냅샷 갱신이 필요합니다.\n> ${unknownVars.join(", ")}\n`;
    }
    changelogMd += `\n`;
  }

  if (stylesDiff.length > 0) {
    changelogMd += `### Styles\n`;
    changelogMd += `| 상태 | 분류 | 항목 | 현재값 | 이전값 |\n`;
    changelogMd += `|---|---|---|---|---|\n`;
    const sorted = [...stylesDiff].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    for (const d of sorted) {
      const emoji = statusEmoji[d.status];
      const entry = keyIndex[d.key];
      const collection = entry?.path?.split(".")?.[1] || d.name.split("/")[0];
      const itemName = d.property === "(이름 변경)" ? `${d.name} (이름 변경)` : d.name;
      const itemLink = mdLink(itemName, d.nodeId);
      if (d.property === "(이름 변경)") {
        changelogMd += `| ${emoji} | ${collection} | ${itemLink} | ${d.newValue} | ${d.oldValue} |\n`;
      } else {
        const cur = d.newValue ? JSON.stringify(d.newValue) : "-";
        const prev = d.oldValue ? JSON.stringify(d.oldValue) : "-";
        changelogMd += `| ${emoji} | ${collection} | ${itemLink} | ${cur} | ${prev} |\n`;
      }
    }
    changelogMd += `\n`;
  }

  if (componentsDiff.length > 0) {
    changelogMd += `### Components\n`;
    changelogMd += `| 상태 | 분류 | 항목 | 속성 | 현재값 | 이전값 |\n`;
    changelogMd += `|---|---|---|---|---|---|\n`;
    const sorted = [...componentsDiff].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    for (const d of sorted) {
      const emoji = statusEmoji[d.status];
      const cascade = g1Result.find((g) => g.name === d.name);
      const note = cascade?.cascadeFrom ? ` *(${cascade.cascadeFrom} 연쇄 수정)*` : "";
      const variantName = d.containingComponentSet === d.name ? "-" : d.name;
      const isStandalone = variantName === "-";
      const setCell = isStandalone ? mdLink(d.containingComponentSet, d.nodeId) : (d.containingComponentSet || "-");
      const itemCell = isStandalone ? "-" : mdLink(`${variantName}${note}`, d.nodeId);
      if (d.status === "added" || d.status === "deleted") {
        changelogMd += `| ${emoji} | ${setCell} | ${itemCell} | - | - | - |\n`;
      } else if (d.changes?.length > 0) {
        const first = d.changes[0];
        changelogMd += `| ${emoji} | ${setCell} | ${itemCell} | ${first.path} | ${resolveToken(first.newValue)} | ${resolveToken(first.oldValue)} |\n`;
        for (const ch of d.changes.slice(1)) {
          changelogMd += `| ${emoji} | | | ${ch.path} | ${resolveToken(ch.newValue)} | ${resolveToken(ch.oldValue)} |\n`;
        }
      } else {
        changelogMd += `| ${emoji} | ${setCell} | ${itemCell} | - | - | - |\n`;
      }
    }
    changelogMd += `\n`;
  }

  if (g2Result && g2Result !== "일치") {
    changelogMd += `## 교차검증 경고\n${g2Result}\n\n`;
  }

  // ==============================
  // STEP 7: 스냅샷 갱신 준비
  // ==============================
  const updatedTokens = tokens;
  const updatedComponents = components;

  // 변수 삭제
  for (const d of variablesDiff.filter((v) => v.status === "deleted")) {
    const entry = keyIndex[d.key] || varNameIndex[d.name] || varNameIndex[normalize(d.name)];
    if (!entry) continue;
    const parts = entry.path.split(".");
    const propName = parts.pop();
    const parent = getByPath(updatedTokens, parts.join("."));
    if (parent) delete parent[propName];
    if (updatedTokens.$extensions.figma.keyIndex[d.key]) {
      delete updatedTokens.$extensions.figma.keyIndex[d.key];
    }
  }

  // 변수 이름 변경
  for (const d of variablesDiff.filter((v) => v.status === "modified" && v.property === "(이름 변경)")) {
    const entry = keyIndex[d.key] || varNameIndex[d.oldValue] || varNameIndex[normalize(d.oldValue)];
    if (!entry) continue;
    const parts = entry.path.split(".");
    const oldPropName = parts.pop();
    const newPropName = d.newValue.replace(/\//g, "-");
    const parent = getByPath(updatedTokens, parts.join("."));
    if (parent && parent[oldPropName]) {
      parent[newPropName] = parent[oldPropName];
      delete parent[oldPropName];
      if (updatedTokens.$extensions.figma.keyIndex[d.key]) {
        updatedTokens.$extensions.figma.keyIndex[d.key].path = [...parts, newPropName].join(".");
      }
    }
  }

  // 변수 추가
  for (const d of variablesDiff.filter((v) => v.status === "added")) {
    const nameParts = d.name.split("/")[0];
    const category = nameParts === "spacing" ? "spacing"
      : nameParts === "radius" ? "radius"
      : nameParts === "font" ? "typography"
      : d.name.includes("/") ? "semantic"
      : "color";
    if (!updatedTokens.variables[category]) updatedTokens.variables[category] = {};
    const propName = d.name.replace(/\//g, "-");
    updatedTokens.variables[category][propName] = {
      $type: "unknown",
      $value: null,
      $extensions: { figma: { originalName: d.name } },
    };
    if (d.key) {
      updatedTokens.$extensions.figma.keyIndex[d.key] = { path: `variables.${category}.${propName}`, type: "variable" };
    }
  }

  // key 축적 (이름 매칭 → keyIndex 보강)
  for (const [key, entry] of Object.entries(accumulatedKeys)) {
    if (!updatedTokens.$extensions.figma.keyIndex[key]) {
      updatedTokens.$extensions.figma.keyIndex[key] = entry;
    }
  }

  updatedTokens.$extensions.figma.updatedAt = webhook.timestamp;

  // 스타일 추가
  for (const d of stylesDiff.filter((s) => s.status === "added")) {
    const meta = styleMetas.find((m) => m.meta?.key === d.key);
    const nodeData = meta?.meta ? nodes[meta.meta.node_id]?.document : null;
    const styleType = meta?.meta?.style_type;
    const category = styleType === "TEXT" ? "typography" : styleType === "EFFECT" ? "shadows" : "unknown";
    const styleName = d.name.split("/").pop();
    let value = null;
    if (nodeData && styleType === "TEXT") {
      const st = nodeData.style || {};
      value = { fontFamily: st.fontFamily, fontWeight: st.fontWeight, fontSize: st.fontSize };
    } else if (nodeData && styleType === "EFFECT") {
      value = (nodeData.effects || []).map((e) => ({ type: e.type, blur: e.radius }));
    }
    if (!updatedTokens.styles[category]) updatedTokens.styles[category] = {};
    updatedTokens.styles[category][styleName] = {
      $type: styleType?.toLowerCase() || "unknown",
      $value: value,
      $extensions: { figma: { key: d.key, originalName: d.name } },
    };
    if (d.key) {
      updatedTokens.$extensions.figma.keyIndex[d.key] = { path: `styles.${category}.${styleName}`, type: "style" };
    }
  }

  // 스타일 삭제
  for (const d of stylesDiff.filter((s) => s.status === "deleted")) {
    const entry = keyIndex[d.key];
    if (!entry) continue;
    const parts = entry.path.split(".");
    const propName = parts.pop();
    const parent = getByPath(updatedTokens, parts.join("."));
    if (parent) delete parent[propName];
    delete updatedTokens.$extensions.figma.keyIndex[d.key];
  }

  // 스타일 값 갱신
  for (const d of stylesDiff.filter((s) => s.status === "modified" && s.newValue)) {
    const entry = keyIndex[d.key];
    if (!entry) continue;
    const token = getByPath(updatedTokens, entry.path);
    if (token) token.$value = d.newValue;
  }

  // 컴포넌트 삭제
  for (const d of componentsDiff.filter((c) => c.status === "deleted")) {
    const entry = compKeyIndex[d.key];
    if (!entry) continue;
    const parts = entry.split(".");
    const propName = parts.pop();
    const parent = getByPath(updatedComponents, parts.join("."));
    if (parent) delete parent[propName];
    delete updatedComponents.$extensions.figma.keyIndex[d.key];
  }

  // 컴포넌트 스냅샷 갱신
  for (const d of componentsDiff.filter((c) => c.snapshot)) {
    const setName = d.containingComponentSet && d.containingComponentSet !== "-"
      ? d.containingComponentSet
      : d.name;
    if (!updatedComponents[setName]) updatedComponents[setName] = {};
    updatedComponents[setName][d.name] = { ...d.snapshot, $extensions: { figma: { key: d.key } } };
    updatedComponents.$extensions.figma.keyIndex[d.key] = `${setName}.${d.name}`;
  }

  updatedComponents.$extensions.figma.updatedAt = webhook.timestamp;

  return {
    newVersion,
    changelogMd,
    updatedTokens,
    updatedComponents,
    g3Summary,
    hasUnknownVars: variablesDiff.some((d) => d.valueUnknown),
    unknownVarNames: variablesDiff.filter((d) => d.valueUnknown).map((d) => d.name),
    variablesDiff,
    stylesDiff,
    componentsDiff,
    stats: {
      added: allDiffs.filter((d) => d.status === "added").length,
      modified: allDiffs.filter((d) => d.status === "modified").length,
      deleted: allDiffs.filter((d) => d.status === "deleted").length,
    },
  };
}

// ============================================================
// 5. writeGitHub
// ============================================================
async function writeGitHub(readResult, diffResult) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
  const branch = "main";

  const { newVersion, changelogMd, updatedTokens, updatedComponents, g3Summary } = diffResult;
  const { changelogContent } = readResult;

  const today = new Date().toISOString().split("T")[0];
  const newRow = `| [v${newVersion}](./v${newVersion}.md) | ${today} | ${g3Summary} |`;
  const updatedChangelog = changelogContent.replace(
    /(^\|.*\|.*\|.*\|\n\|[-\s|]+\|\n)/m,
    `$1${newRow}\n`
  );

  const { data: ref } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
  const latestCommitSha = ref.object.sha;

  const files = [
    { path: `changelog/v${newVersion}.md`, content: changelogMd },
    { path: "changelog/CHANGELOG.md", content: updatedChangelog },
    { path: "tokens/tokens.json", content: JSON.stringify(updatedTokens, null, 2) },
    { path: "components/components.json", content: JSON.stringify(updatedComponents, null, 2) },
  ];

  const blobs = await Promise.all(
    files.map((f) => octokit.git.createBlob({ owner, repo, content: Buffer.from(f.content).toString("base64"), encoding: "base64" }))
  );

  const { data: tree } = await octokit.git.createTree({
    owner, repo,
    base_tree: (await octokit.git.getCommit({ owner, repo, commit_sha: latestCommitSha })).data.tree.sha,
    tree: files.map((f, i) => ({ path: f.path, mode: "100644", type: "blob", sha: blobs[i].data.sha })),
  });

  const { data: commit } = await octokit.git.createCommit({
    owner, repo,
    message: `v${newVersion}: ${g3Summary}`,
    tree: tree.sha,
    parents: [latestCommitSha],
  });

  await octokit.git.updateRef({ owner, repo, ref: `heads/${branch}`, sha: commit.sha });
  console.log(`Committed v${newVersion}: ${commit.sha}`);
}

// ============================================================
// 6. notifySlack
// ============================================================
async function notifySlack(webhook, diffResult) {
  const { newVersion, hasUnknownVars, unknownVarNames, variablesDiff, stylesDiff, componentsDiff } = diffResult;
  const fileKey = webhook.file_key;
  const deployer = webhook.triggered_by?.handle || "Unknown";
  const email = webhook.triggered_by?.email || "";
  const description = webhook.description;

  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
  const changelogUrl = `https://github.com/${owner}/${repo}/blob/main/changelog/v${newVersion}.md`;
  const figmaBase = `https://www.figma.com/file/${fileKey}`;
  const figmaLink = (name, nodeId) => nodeId ? `<${figmaBase}?node-id=${nodeId}|${name}>` : name;

  const allDiffs = [...variablesDiff, ...stylesDiff, ...componentsDiff];
  const added = allDiffs.filter((d) => d.status === "added");
  const modified = allDiffs.filter((d) => d.status === "modified");
  const deleted = allDiffs.filter((d) => d.status === "deleted");

  const formatList = (items, withLink) => items.map((d) => `• ${withLink ? figmaLink(d.name, d.nodeId) : d.name}`).join("\n");

  let body = `*v${newVersion}*`;
  if (added.length > 0) body += `\n\n🟢 *추가 (${added.length})*\n${formatList(added, true)}`;
  if (modified.length > 0) body += `\n\n🟠 *수정 (${modified.length})*\n${formatList(modified, true)}`;
  if (deleted.length > 0) body += `\n\n🔴 *삭제 (${deleted.length})*\n${formatList(deleted, false)}`;

  const blocks = [
    { type: "section", text: { type: "mrkdwn", text: `updated: <mailto:${email}|${deployer}>${description ? `\n💬 "${description}"` : ""}` } },
    { type: "divider" },
    { type: "section", text: { type: "mrkdwn", text: body.trim() || `*v${newVersion}*\n변경 사항 없음` } },
    { type: "divider" },
    { type: "section", text: { type: "mrkdwn", text: `<${changelogUrl}|Changelog 보기 →>` } },
  ];

  if (hasUnknownVars) {
    blocks.push({ type: "divider" });
    blocks.push({ type: "section", text: { type: "mrkdwn", text: `⚠️  *미확인 변수값이 있습니다. 스냅샷 갱신이 필요합니다.*\n${unknownVarNames.join(", ")}` } });
  }

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
