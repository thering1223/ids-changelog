# Button

## Props

| Prop | Type | 설명 |
|------|------|------|
| `type` | `"brand"` \| `"neutral"` \| `"neutral-weak"` \| `"neutral-ghost"` \| `"neutral-outline"` | 버튼 스타일 |
| `size` | `"xs"` \| `"s"` \| `"m"` \| `"l"` | 크기 |
| `disabled` | `boolean` | 비활성화 |
| `text` | `string` | 버튼 텍스트 |
| `prefixIcon` | `ReactNode` | 앞 아이콘 |
| `suffixIcon` | `ReactNode` | 뒤 아이콘 |

## 토큰

### Background
- `bg/brand`, `bg/brand-hover`, `bg/brand-pressed`
- `bg/neutral`, `bg/neutral-hover`, `bg/neutral-pressed`
- `bg/neutral-weak`, `bg/neutral-weak-hover`, `bg/neutral-weak-pressed`
- `bg/disabled`

### Foreground
- `fg/default`
- `fg/disabled`
- `solid/static/white`

### Border
- `border/secondary`

### Spacing
- `spacing-1` (gap)
- `spacing-2` (padding-x for xs)
- `spacing-3` (padding-x for s)
- `spacing-4` (padding-x for m)
- `spacing-5` (padding-x for l)

### Size
- `xs` (height: 28)
- `s` (height: 32)
- `m` (height: 40)
- `l` (height: 48)

### Radius
- `radius-2`

### Typography
- `label-m-emphasis` (xs, s, m 사이즈)
- `label-l-emphasis` (l 사이즈)

## 참고

- `hover`, `pressed` 상태는 CSS `:hover`, `:active`로 처리
- Figma의 `state` prop은 Figma 전용, 실제 구현에서는 `disabled`만 사용
- Figma의 `swapPrefixIcon`, `swapSuffixIcon`은 Figma 전용, 실제 구현에서는 `prefixIcon`, `suffixIcon`으로 대체
