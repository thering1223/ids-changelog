# IDS 2.0 Variables 정리

> Figma: [IDS-2.0](https://www.figma.com/design/O1WTxthxL51pHpLrWMWAf7/IDS-2.0?node-id=1229-2829)  
> Figma Variables 패널에서 확인·수정 후 이 문서를 업데이트하세요.

---

## 1. Color (색상)

### 1.1 Brand (브랜드)
| Variable | 용도 | 값 (예시) | 비고 |
|----------|------|-----------|------|
| `bg/brand` | 브랜드 기본 배경 | `#ff5b1a` | Primary CTA |
| `bg/brand-hover` | 브랜드 호버 | `#f24b00` | |
| `bg/brand-focus` | 브랜드 포커스/활성 | `#db3b00` | |
| `fg/on-brand` | 브랜드 위 텍스트 | `#ffffff` | |

### 1.2 Neutral (중립)
| Variable | 용도 | 값 (예시) | 비고 |
|----------|------|-----------|------|
| `bg/neutral` | 중립 기본 | `#60646c` | |
| `bg/neutral-hover` | 중립 호버 | `#80838d` | |
| `bg/neutral-focus` | 중립 포커스 | `#8b8d98` | |
| `bg/neutral-weak` | 약한 중립 | `#d9d9e0` | |
| `bg/neutral-weak-hover` | 약한 중립 호버 | `#cdced6` | |
| `bg/neutral-weak-focus` | 약한 중립 포커스 | `#b9bbc6` | |

### 1.3 Disabled (비활성)
| Variable | 용도 | 값 (예시) | 비고 |
|----------|------|-----------|------|
| `bg/disabled` | 비활성 배경 | `#e0e1e6` | |
| `fg/disabled` | 비활성 전경(텍스트) | `#b9bbc6` | |

### 1.4 Text / Foreground
| Variable | 용도 | 값 (예시) | 비고 |
|----------|------|-----------|------|
| `fg/default` | 기본 텍스트 | `#1c2024` | |
| `fg/static-white` | 고정 흰색 | `#ffffff` | |

---

## 2. Spacing (간격)

| Variable | 값 | 용도 |
|----------|-----|------|
| `spacing/1` | `4px` | |
| `spacing/2` | `8px` | |
| `spacing/3` | `12px` | |
| `spacing/4` | `16px` | |
| `spacing/5` | `20px` | |

---

## 3. Size (크기)

### 3.1 컴포넌트 높이
| Variable | 값 | 용도 |
|----------|-----|------|
| `size/xs` | `28px` | 버튼 xs, 작은 콘트롤 |
| `size/s` | `32px` | 버튼 s |
| `size/m` | `40px` | 버튼 m |
| `size/l` | `48px` | 버튼 l |

### 3.2 아이콘
| Variable | 값 | 용도 |
|----------|-----|------|
| `icon/xs` | `14px` | size xs 컴포넌트 내 아이콘 |
| `icon/s` | `16px` | size s 컴포넌트 내 아이콘 |
| `icon/m` | `20px` | size m/l 컴포넌트 내 아이콘 |

---

## 4. Border Radius (모서리)

| Variable | 값 | 용도 |
|----------|-----|------|
| `radius/1` | `4px`? | 작은 요소 |
| `radius/2` | `8px` | 버튼 m, 카드 등 |
| `radius/pill` | `9999px` 또는 `50%` | 알약 형태 버튼 |

---

## 5. Typography (타이포그래피)

### 5.1 Font
| Variable | 값 | 비고 |
|----------|-----|------|
| `font/family` | `"Pretendard"` | |
| `font/size-5` | `15px` | 버튼 레이블 등 |
| `font/weight-bold` | `700` | |

### 5.2 레이블 스타일
| Variable | 스타일 | 비고 |
|----------|--------|------|
| `label/l-emphasis` | Pretendard 700, 15px, line-height 1 | 버튼 등 강조 레이블 |

---

## 6. CSS / Design Tokens (개발용)

```css
/* ===== Color ===== */
:root {
  /* Brand */
  --bg-brand: #ff5b1a;
  --bg-brand-hover: #f24b00;
  --bg-brand-focus: #db3b00;
  --fg-on-brand: #ffffff;

  /* Neutral */
  --bg-neutral: #60646c;
  --bg-neutral-hover: #80838d;
  --bg-neutral-focus: #8b8d98;
  --bg-neutral-weak: #d9d9e0;
  --bg-neutral-weak-hover: #cdced6;
  --bg-neutral-weak-focus: #b9bbc6;

  /* Disabled */
  --bg-disabled: #e0e1e6;
  --fg-disabled: #b9bbc6;

  /* Text */
  --fg-default: #1c2024;
  --fg-static-white: #ffffff;
}

/* ===== Spacing ===== */
:root {
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
}

/* ===== Size ===== */
:root {
  --size-xs: 28px;
  --size-s: 32px;
  --size-m: 40px;
  --size-l: 48px;
  --icon-xs: 14px;
  --icon-s: 16px;
  --icon-m: 20px;
}

/* ===== Radius ===== */
:root {
  --radius-2: 8px;
  --radius-pill: 9999px;
}

/* ===== Typography ===== */
:root {
  --font-family: "Pretendard", sans-serif;
  --font-size-5: 15px;
  --font-weight-bold: 700;
}
```

---

## 7. Figma에서 변수 확인·추가 방법

1. **Variables 패널**  
   - Figma 좌측 레이어 목록 위 **Variables** (또는 디자인 패널 내) 탭에서 확인  
   - 컬렉션: `Colors`, `Spacing`, `Typography` 등

2. **값 반영**  
   - 위 표의 "값 (예시)"는 `button-component-analysis.md` 등에서 추출한 참고치  
   - 실제 Figma 변수명·그룹·값은 파일 내 Variables와 맞춰 수정

3. **내보내기**  
   - Figma → Inspect → Code에서 변수 참조 확인  
   - Design Tokens 플러그인으로 JSON/CSS export 가능

---

## 8. 버전 / 수정 이력

| 날짜 | 내용 |
|------|------|
| (작성일) | button-component-analysis.md 및 IDS 2.0 구조 기준 초안 작성 |
