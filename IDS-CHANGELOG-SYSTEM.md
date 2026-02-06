# IDS 변경사항 알림 시스템

## 개요

Figma 디자인 시스템(IDS 2.0) 라이브러리 배포 시 변경사항을 자동으로 감지하고, 정리된 Changelog를 생성하여 Slack과 GitHub에 공유하는 시스템.

---

## 1. 플로우

```
Figma 배포
    ↓
Pipedream 웹훅 수신 (자동)
    ↓
"변경점 정리해줘" (Claude에게 요청)
    ↓
Claude가 웹훅 데이터 + API 조회로 분석
    ↓
미리보기 표시
    ↓
검토 & 수정 (반복 가능)
    ↓
"확인" 또는 "배포해줘"
    ↓
┌────────────────────────────────────┐
│  CHANGELOG.md  │  Git push  │  Slack  │
└────────────────────────────────────┘
```

---

## 2. 사용법

### Step 1: 요청
```
변경점 정리해줘
```

### Step 2: 미리보기 확인
Claude가 분석 결과 미리보기 표시

### Step 3: 검토 & 수정 (선택)
```
- "Button 설명 바꿔줘: ..."
- "이건 주의로 바꿔줘"
- "이건 빼줘"
- "메이저 버전으로 올려줘"
```

### Step 4: 승인
```
확인, 배포해줘
```

### Step 5: 완료
```
✅ CHANGELOG.md 업데이트
✅ Git push 완료
✅ Slack 전송 완료
```

---

## 3. 영향도 등급

| 등급 | 의미 | 기준 |
|------|------|------|
| 🔴 주의 | 영향 있을 수 있음 | 삭제됨 / 바인딩 변경 / 기본값 변경 |
| 🟡 수정 | 기존 항목 수정됨 | 값 변경 / 옵션 추가 |
| 🟢 추가 | 신규 항목 | 신규 생성 |

---

## 4. 버저닝 규칙

| 변경 유형 | 버전 증가 | 방식 |
|----------|----------|------|
| 🟢 추가 | Minor (v1.0 → v1.1) | 자동 |
| 🟡 수정 | Patch (v1.0.0 → v1.0.1) | 자동 |
| 🔴 주의 | Patch (v1.0.0 → v1.0.1) | 자동 |
| Major | Major (v1 → v2) | **수동 요청** |

---

## 5. 상세 변경사항 순서

```
1. 변수 (토큰)    ← 기반
2. 스타일         ← 중간
3. 컴포넌트       ← 결과 (Figma 링크 포함)
```

---

## 6. Changelog 템플릿

버전별 파일 생성 + 요약 목록 (하이브리드 방식)

### changelog/CHANGELOG.md (요약)
```markdown
# IDS 2.0 Changelog

| 버전 | 날짜 | 요약 |
|------|------|------|
| [v1.2.0](./v1.2.0.md) | 2026-01-27 | 🟢 Button xl, checkbox 신규 |
| [v1.1.0](./v1.1.0.md) | 2026-01-26 | 🟡 spacing 값 수정 |
| [v1.0.0](./v1.0.0.md) | 2026-01-25 | 초기 버전 |
```

### changelog/v1.2.0.md (상세)
```markdown
## v1.2.0 — 2026-01-27 14:30
**배포자:** 송준의
**배포 메모:** 버튼 사이즈 xl 추가, checkbox 신규

> Minor 업데이트: 신규 컴포넌트 추가

---

### 영향도 요약

#### 🔴 주의
| 대상 | 내용 | 확인 사항 |
|------|------|----------|
| type=neutral 아이콘버튼 | 32개 삭제됨 | 사용처 대체 필요 |
| Button/brand | fill 바인딩 변경 | 색상 확인 |

#### 🟡 수정
| 대상 | 이전 | 이후 |
|------|------|------|
| bg/neutral-hover | #60646c | #70747c |
| spacing-3 | 12 | 16 |

#### 🟢 추가
| 대상 | 내용 |
|------|------|
| checkbox | 신규 컴포넌트 |
| fg/success | #16a34a |

---

### 상세 변경사항

#### 변수

##### bg/neutral-hover
| 항목 | 이전 | 이후 |
|------|------|------|
| 값 | #60646c | **#70747c** |

##### fg/success `신규`
| 항목 | 값 |
|------|-----|
| 값 | #16a34a |

---

#### 스타일

##### heading-s
| 항목 | 이전 | 이후 |
|------|------|------|
| line-height | 1.2 | **1.5** |

---

#### 컴포넌트

##### [Button](https://figma.com/file/O1WTxthxL51pHpLrWMWAf7?node-id=812:4622)
| 항목 | 이전 | 이후 |
|------|------|------|
| size 옵션 | xs, s, m | xs, s, m, **l** |
| fill 바인딩 | fg/brand | **fg/brand-weak** |

##### [checkbox](https://figma.com/file/O1WTxthxL51pHpLrWMWAf7?node-id=979:4213) `신규`
| Prop | 옵션 |
|------|------|
| check | checked, unchecked |
| size | s, m |
```

---

## 7. 파일 구조

```
ids2/
├── .env                         ← 토큰 (Git 제외)
├── .gitignore                   ← .env 제외
├── .claude/
│   └── commands/
│       └── ids-changelog.md     ← 스킬
├── snapshots/
│   └── latest.json              ← 최신 스냅샷
└── changelog/
    ├── CHANGELOG.md             ← 요약 목록
    └── v1.0.0.md                ← 버전별 상세
```

---

## 8. 설정 정보

### Figma
- **팀 ID:** 906359570537155524
- **팀 이름:** ABZ
- **파일 키:** O1WTxthxL51pHpLrWMWAf7
- **파일 이름:** IDS 2.0
- **플랜:** Professional

### 웹훅
- **ID:** 3757776
- **event_type:** LIBRARY_PUBLISH
- **status:** ACTIVE
- **저장 endpoint:** https://eos1k6ojcpr4ygr.m.pipedream.net (ids-webhook-save)
- **읽기 endpoint:** https://eogqtkwflyib6eq.m.pipedream.net (ids-webhook-read)
- **Data Store:** ids-webhook (키: latest)

### Figma 토큰
- **토큰:** .env에 저장
- **만료일:** 2026-04-27 (90일)
- **권한:** file_content:read, webhooks:read/write 등 (file_variables:read 없음)

---

## 9. 웹훅 Payload 예시

```json
{
  "event_type": "LIBRARY_PUBLISH",
  "file_key": "O1WTxthxL51pHpLrWMWAf7",
  "file_name": "IDS 2.0",
  "timestamp": "2026-01-27T05:37:28Z",
  "triggered_by": {
    "handle": "송준의",
    "email": "juneui@ab-z.com"
  },
  "created_components": [],
  "modified_components": [],
  "deleted_components": [],
  "created_variables": [
    { "key": "...", "name": "bg/success" }
  ],
  "modified_variables": [],
  "deleted_variables": [],
  "created_styles": [],
  "modified_styles": [],
  "deleted_styles": [],
  "passcode": "ids2-changelog-webhook"
}
```

---

## 10. 추적 가능한 상세 정보

### 컴포넌트
| 항목 | 추적 | 방법 |
|------|------|------|
| 생성/삭제 | ✅ | 웹훅 |
| Variant 옵션 변경 | ✅ | API + 스냅샷 |
| Variant 기본값 변경 | ✅ | API + 스냅샷 |
| 변수 바인딩 변경 | ✅ | API + 스냅샷 |
| Boolean prop 변경 | ✅ | API + 스냅샷 |

### 변수
| 항목 | 추적 | 방법 |
|------|------|------|
| 생성/삭제 | ✅ | 웹훅 |
| 값 변경 | ✅ | 웹훅 + API |

### 스타일
| 항목 | 추적 | 방법 |
|------|------|------|
| 생성/삭제 | ✅ | 웹훅 |
| 값 변경 | ✅ | 웹훅 + API |

### 컴포넌트 key로 상세 정보 조회

웹훅에서 컴포넌트는 variant 이름만 제공 (`variant=success`).
컴포넌트 정식 이름과 nodeId는 API로 조회:

```bash
curl -H "X-Figma-Token: {TOKEN}" \
  "https://api.figma.com/v1/components/{COMPONENT_KEY}"
```

**응답에서 얻는 정보:**
| 필드 | 설명 |
|------|------|
| `meta.name` | variant 이름 |
| `meta.node_id` | variant nodeId |
| `meta.containing_frame.containingComponentSet.name` | **컴포넌트 정식 이름** |
| `meta.containing_frame.containingComponentSet.nodeId` | **컴포넌트 nodeId** |

**예시:**
```
웹훅: key=5fa4d805d4001b2e1a28c07bb04be09bd36a866a
  ↓ API 조회
컴포넌트 이름: help
컴포넌트 nodeId: 1421:1725
```

---

## 11. 변수 참조 체인 추론

MCP API는 변수의 최종 값만 반환하고 참조 체인(alias)은 반환하지 않음.
값 매칭 + 스코프 규칙으로 참조 체인을 추론.

### 스코프 규칙

| 속성 | 검색 스코프 | 예시 |
|------|------------|------|
| fill, background, stroke | `bg/`, `fg/`, `border/`, `solid/` | #ff5b1a → bg/brand |
| padding, gap, margin | `spacing-` | 8 → spacing-2 |
| cornerRadius | `radius-` | 8 → radius-2 |
| width, height (컴포넌트 사이즈) | `xs`, `s`, `m`, `l` | 28 → xs |
| font-family | `font/family` | Pretendard → font/family |
| font-size | `font-size/` | 13 → font-size/3 |
| font-weight | `font-weight/` | SemiBold → font-weight/semiBold |

### 추론 방식

```
button 패딩 = 8
      ↓ spacing 스코프에서 검색
스냅샷: spacing-2 = 8
      ↓
button 패딩 → spacing-2 ✅
```

### 한계

| 상황 | 처리 |
|------|------|
| 같은 값 여러 개 | 네이밍 패턴으로 우선순위 결정 |
| 스냅샷에 없는 변수 | 매칭 불가 (값만 표시) |
| 컴포넌트에 미적용 변수 | 참조 추론 불가 |

---

## 12. Changelog 표시 규칙

### 토큰/스타일 표시

| 상황 | 표시 방식 |
|------|----------|
| 스타일 적용됨 | 스타일 이름 (body-xs) |
| 개별 토큰만 | 토큰 이름 (font-size/3) |

**예시 - 스타일 적용:**
```
| 속성 | 값 |
|------|------|
| typography | body-xs |
| gap | spacing-1 |
```

**예시 - 개별 토큰:**
```
| 속성 | 토큰 |
|------|------|
| font-size | font-size/3 |
| font-weight | font-weight/medium |
```

### 제외할 prop

content/text prop은 Changelog에서 제외:
- `text`, `label`, `help`, `title`, `description` 등
- 인스턴스마다 다른 콘텐츠라 디자인 시스템 변경사항으로 의미 없음

---

## 13. 현재 진행 상황

### 완료
- [x] 폴더 구조 생성 (snapshots/, changelog/)
- [x] .env 생성 (Figma 토큰)
- [x] .gitignore 설정
- [x] 첫 스냅샷 생성 (button, iconButton)
- [x] Claude 스킬 생성 (`/ids-changelog`)
- [x] Figma 웹훅 등록 (Pipedream)
- [x] 웹훅 테스트 완료 (bg/success 변수 감지됨)
- [x] Pipedream 웹훅 데이터 저장 설정
- [x] Pipedream 읽기 endpoint 설정
- [x] Claude가 Pipedream 데이터 읽기 테스트 완료

### 남은 작업
- [ ] 스냅샷 구조 개선 (참조 체인 포함)
- [ ] GitHub Private repo 연결
- [ ] Slack Incoming Webhook URL 설정
- [ ] 전체 플로우 테스트

---

## 14. 보안

| 항목 | 저장 위치 | 보안 |
|------|----------|------|
| Figma 토큰 | .env (gitignore) | ✅ |
| Slack Webhook URL | .env (gitignore) | ✅ |
| 스냅샷 | 로컬 (추후 GitHub Private) | ✅ |

---

## 15. 참고: 데이터 흐름

```
웹훅 (변경 목록)          API (상세 정보)           스냅샷 (이전 상태)
        ↓                       ↓                        ↓
created_variables         변수 실제 값              이전 변수 값
modified_components       컴포넌트 props            이전 props
        ↓                       ↓                        ↓
        └───────────────────────┴────────────────────────┘
                                ↓
                        변경사항 비교 & 분석
                                ↓
                          Changelog 생성
```
