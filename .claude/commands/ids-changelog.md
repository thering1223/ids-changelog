# IDS Changelog 생성

Figma IDS 2.0 라이브러리의 변경사항을 분석하고 Changelog를 생성합니다.

## 설정 정보

- **Figma 파일 키:** O1WTxthxL51pHpLrWMWAf7
- **파일 이름:** IDS 2.0
- **인덱스 노드 ID:** 1573:1276
- **스냅샷 위치:** /Users/juneui/Documents/ids2/snapshots/latest.json
- **Changelog 폴더:** /Users/juneui/Documents/ids2/changelog/
- **환경 변수:** /Users/juneui/Documents/ids2/.env
- **웹훅 읽기 endpoint:** https://eogqtkwflyib6eq.m.pipedream.net

---

## 토큰 만료 체크

실행 시 `.env` 파일의 `FIGMA_TOKEN_EXPIRES`를 확인:
- 만료 7일 전부터 경고 표시: "⚠️ Figma 토큰이 X일 후 만료됩니다. 갱신 필요."
- 만료됨: "❌ Figma 토큰이 만료되었습니다. 갱신해주세요."

---

## 실행 단계

### 1. 웹훅 데이터 조회

Pipedream endpoint에서 최신 웹훅 데이터 조회:
- `WebFetch` - https://eogqtkwflyib6eq.m.pipedream.net
- 신규/수정/삭제된 변수, 컴포넌트, 스타일 목록 확인

### 1-1. 컴포넌트 상세 정보 조회 (신규/수정 컴포넌트)

웹훅의 컴포넌트 key로 정식 이름과 nodeId 조회:
```bash
curl -H "X-Figma-Token: {TOKEN}" \
  "https://api.figma.com/v1/components/{COMPONENT_KEY}"
```

응답에서:
- `containingComponentSet.name` → 컴포넌트 정식 이름
- `containingComponentSet.nodeId` → 컴포넌트 nodeId

### 2. 현재 상태 조회

Figma MCP 도구를 사용하여 현재 라이브러리 상태를 조회:
- `get_variable_defs` - 변수(토큰) 정보
- `get_design_context` - 컴포넌트 정보

### 3. 스냅샷 비교

`/Users/juneui/Documents/ids2/snapshots/latest.json`과 비교하여 변경사항 감지.

스냅샷이 없으면:
- 사용자에게 알림
- 현재 상태로 첫 스냅샷 생성할지 확인

### 4. 변경사항 분류

| 등급 | 의미 | 기준 |
|------|------|------|
| 🔴 주의 | 영향 있을 수 있음 | 삭제됨 / 바인딩 변경 / 기본값 변경 |
| 🟡 수정 | 기존 항목 수정됨 | 값 변경 / 옵션 추가 |
| 🟢 추가 | 신규 항목 | 신규 생성 |

### 5. 버전 결정

| 변경 유형 | 버전 증가 | 방식 |
|----------|----------|------|
| 🟢 추가만 | Minor (v1.0 → v1.1) | 자동 |
| 🟡 수정만 | Patch (v1.0.0 → v1.0.1) | 자동 |
| 🔴 주의 포함 | Patch (v1.0.0 → v1.0.1) | 자동 |
| Major | Major (v1 → v2) | 수동 요청 시만 |

### 6. 미리보기 표시

아래 템플릿 형식으로 미리보기 표시:

```markdown
## v{버전} — {날짜} {시간}
**배포자:** {이름}
**배포 메모:** {간단한 요약}

> {버전 유형} 업데이트: {설명}

---

### 영향도 요약

#### 🔴 주의
| 대상 | 내용 | 확인 사항 |
|------|------|----------|
| {대상} | {내용} | {확인 사항} |

#### 🟡 수정
| 대상 | 이전 | 이후 |
|------|------|------|
| {대상} | {이전값} | {이후값} |

#### 🟢 추가
| 대상 | 내용 |
|------|------|
| {대상} | {내용} |

---

### 상세 변경사항

#### 변수

##### {변수명}
| 항목 | 이전 | 이후 |
|------|------|------|
| 값 | {이전} | **{이후}** |

##### {변수명} `신규`
| 항목 | 값 |
|------|-----|
| 값 | {값} |

---

#### 스타일

##### {스타일명}
| 항목 | 이전 | 이후 |
|------|------|------|
| {속성} | {이전} | **{이후}** |

---

#### 컴포넌트

##### [{컴포넌트명}](https://figma.com/file/O1WTxthxL51pHpLrWMWAf7?node-id={노드ID})
| 항목 | 이전 | 이후 |
|------|------|------|
| {속성} | {이전} | **{이후}** |

##### [{컴포넌트명}](https://figma.com/file/O1WTxthxL51pHpLrWMWAf7?node-id={노드ID}) `신규`
| Prop | 옵션 |
|------|------|
| {prop명} | {옵션들} |

##### {컴포넌트명} `삭제`
- {삭제 내용}
```

### 7. 사용자 검토

사용자가 수정 요청하면 반영:
- "Button 설명 바꿔줘: ..."
- "이건 주의로 바꿔줘"
- "이건 빼줘"
- "메이저 버전으로 올려줘"

### 8. 승인 시 실행

사용자가 "확인", "배포해줘" 등으로 승인하면:

1. **버전 파일 생성**
   - `/Users/juneui/Documents/ids2/changelog/v{버전}.md` 생성

2. **CHANGELOG.md 업데이트**
   - `/Users/juneui/Documents/ids2/changelog/CHANGELOG.md` 상단에 새 버전 행 추가
   - 형식: `| [v{버전}](./v{버전}.md) | {날짜} | {영향도 이모지} {요약} |`

3. **스냅샷 업데이트**
   - `/Users/juneui/Documents/ids2/snapshots/latest.json`을 현재 상태로 교체

4. **Git push** (Git 저장소 연결된 경우)
   - 변경사항 커밋: "v{버전}: {요약}"
   - 원격 저장소에 푸시

5. **Slack 전송** (SLACK_WEBHOOK_URL 설정된 경우)
   - 요약 메시지 전송

### 9. 완료 메시지

```
✅ changelog/v{버전}.md 생성
✅ changelog/CHANGELOG.md 업데이트
✅ snapshots/latest.json 업데이트
✅ Git push 완료 (또는 "Git 미설정")
✅ Slack 전송 완료 (또는 "Slack 미설정")
```

---

## 변수 참조 체인 추론

MCP는 최종 값만 반환. 값 매칭 + 스코프 규칙으로 참조 추론.

| 속성 | 검색 스코프 |
|------|------------|
| fill, background, stroke | `bg/`, `fg/`, `border/`, `solid/` |
| padding, gap, margin | `spacing-` |
| cornerRadius | `radius-` |
| width, height | `xs`, `s`, `m`, `l` |
| font-family | `font/family` |
| font-size | `font-size/` |
| font-weight | `font-weight/` |

---

## CHANGELOG.md 형식

```markdown
# IDS 2.0 Changelog

| 버전 | 날짜 | 요약 |
|------|------|------|
| [v1.2.0](./v1.2.0.md) | 2026-01-27 | 🟢 Button xl, checkbox 신규 |
| [v1.1.0](./v1.1.0.md) | 2026-01-26 | 🟡 spacing 값 수정 |
| [v1.0.0](./v1.0.0.md) | 2026-01-25 | 초기 버전 |
```

---

## 상세 변경사항 순서

1. 변수 (토큰) ← 기반
2. 스타일 ← 중간
3. 컴포넌트 ← 결과 (Figma 링크 포함)
