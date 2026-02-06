# Button Component Props

## Props 정의

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showPrefixIcon` | `boolean` | `false` | 버튼 앞에 아이콘 표시 여부 |
| `showSuffixIcon` | `boolean` | `false` | 버튼 뒤에 아이콘 표시 여부 |
| `text` | `string` | `"label"` | 버튼 텍스트 |
| `swapPrefixIcon` | `React.ReactNode \| null` | `null` | 커스텀 prefix 아이콘 컴포넌트 |
| `swapSuffixIcon` | `React.ReactNode \| null` | `null` | 커스텀 suffix 아이콘 컴포넌트 |
| `type` | `ButtonType` | `"neutral"` | 버튼 스타일 타입 |
| `state` | `ButtonState` | `"enabled"` | 버튼 상태 |
| `size` | `ButtonSize` | `"xs"` | 버튼 크기 |

---

## Type 옵션

| Value | Description |
|-------|-------------|
| `"brand"` | 브랜드 컬러 버튼 (주황색 배경, 흰색 텍스트) |
| `"neutral"` | 중립 버튼 (어두운 배경, 흰색 텍스트) |
| `"neutral weak"` | 약한 중립 버튼 (밝은 회색 배경, 어두운 텍스트) |
| `"neutral ghost"` | 고스트 버튼 (배경 없음, 어두운 텍스트) |
| `"neutral outline"` | 아웃라인 버튼 (테두리만 있음) |

---

## State 옵션

| Value | Description |
|-------|-------------|
| `"enabled"` | 기본 활성 상태 |
| `"hover"` | 마우스 호버 상태 |
| `"pressed"` | 클릭/눌림 상태 |
| `"disabled"` | 비활성화 상태 |

---

## Size 옵션

| Value | Height | Padding X | Icon Size |
|-------|--------|-----------|-----------|
| `"xs"` | 28px | 8px (spacing-2) | 14px |
| `"s"` | 32px | 12px (spacing-3) | 16px |
| `"m"` | 40px | 16px (spacing-4) | 20px |
| `"l"` | 48px | 20px (spacing-5) | 20px |

---

## 스타일 토큰

### 배경색 (Background)

| Type | State | Token |
|------|-------|-------|
| brand | enabled | `--bg/brand` (#ff5b1a) |
| brand | hover | `--bg/brand-hover` (#f24b00) |
| brand | pressed | `--bg/brand-pressed` (#db3b00) |
| neutral | enabled | `--bg/neutral` (#1c2024) |
| neutral | hover | `--bg/neutral-hover` (#60646c) |
| neutral | pressed | `--bg/neutral-pressed` (#80838d) |
| neutral weak | enabled | `--bg/neutral-weak` (#e0e1e6) |
| neutral weak | hover | `--bg/neutral-weak-hover` (#cdced6) |
| neutral weak | pressed | `--bg/neutral-weak-pressed` (#b9bbc6) |
| neutral ghost | hover | `--bg/neutral-weak-hover` (#cdced6) |
| neutral ghost | pressed | `--bg/neutral-weak-pressed` (#b9bbc6) |
| neutral outline | hover | `--bg/neutral-weak-hover` (#cdced6) |
| neutral outline | pressed | `--bg/neutral-weak-pressed` (#b9bbc6) |
| * | disabled | `--bg/disabled` (#e0e1e6) |

### 텍스트 색상 (Foreground)

| Condition | Token |
|-----------|-------|
| brand, neutral (enabled/hover/pressed) | `--solid/static/white` (white) |
| neutral weak, neutral ghost, neutral outline (enabled/hover/pressed) | `--fg/default` (#1c2024) |
| * (disabled) | `--fg/disabled` (#b9bbc6) |

### 테두리 (Border)

| Type | Token |
|------|-------|
| neutral outline | `--border/secondary` (rgba(0,9,50,0.12)) |

---

## Typography

| Size | Font Style | Font Size | Line Height | Letter Spacing |
|------|------------|-----------|-------------|----------------|
| xs, s, m | label-m-emphasis (SemiBold) | fontSize/3 (13px) | 1 | -0.26px |
| l | label-l-emphasis (Bold) | fontSize/5 (15px) | 1 | 0 |

---

## 사용 예시

```tsx
// 기본 버튼
<Button text="확인" />

// 브랜드 버튼 (Large)
<Button type="brand" size="l" text="제출하기" />

// 아이콘이 있는 버튼
<Button
  showPrefixIcon={true}
  text="추가"
  type="neutral weak"
  size="m"
/>

// 비활성화 버튼
<Button text="비활성화" state="disabled" />

// 아웃라인 버튼
<Button type="neutral outline" text="취소" size="s" />
```
