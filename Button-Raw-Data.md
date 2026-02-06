# Button Component - Figma 원본 데이터

## Props 타입 정의

```typescript
type ButtonProps = {
  showPrefixIcon?: boolean;
  showSuffixIcon?: boolean;
  text?: string;
  swapPrefixIcon?: React.ReactNode | null;
  swapSuffixIcon?: React.ReactNode | null;
  type?: "neutral ghost" | "brand" | "neutral" | "neutral weak" | "neutral outline";
  state?: "enabled" | "hover" | "pressed" | "disabled";
  size?: "xs" | "s" | "m" | "l";
};
```

## 기본값

```typescript
showPrefixIcon = false
showSuffixIcon = false
text = "label"
swapPrefixIcon = null
swapSuffixIcon = null
type = "neutral"
state = "enabled"
size = "xs"
```

## CSS 변수 (원본)

```css
/* Size */
--xs: 28px
--s: 32px
--m: 40px
--l: 48px

/* Spacing */
--spacing-1: 4px
--spacing-2: 8px
--spacing-3: 12px
--spacing-4: 16px
--spacing-5: 20px

/* Radius */
--radius-2: 8px

/* Background */
--bg/brand: #ff5b1a
--bg/brand-hover: #f24b00
--bg/brand-pressed: #db3b00
--bg/neutral: #1c2024
--bg/neutral-hover: #60646c
--bg/neutral-pressed: #80838d
--bg/neutral-weak: #e0e1e6
--bg/neutral-weak-hover: #cdced6
--bg/neutral-weak-pressed: #b9bbc6
--bg/disabled: #e0e1e6

/* Foreground */
--fg/default: #1c2024
--fg/disabled: #b9bbc6
--solid/static/white: white

/* Border */
--border/secondary: rgba(0,9,50,0.12)

/* Font */
--font/family: 'Pretendard:SemiBold', sans-serif
--font/family: 'Pretendard:Bold', sans-serif
--fontsize/3: 13px
--fontsize/5: 15px
--fontweight/semibold: 600
--fontweight/bold: 700
```

## 아이콘 크기 (원본 클래스)

```
size="xs" → size-[14px]
size="s" → size-[16px]
size="m" → size-[20px]
size="l" → size-[20px]
```

## Typography (원본 클래스)

```
xs, s, m:
  font-[family-name:var(--font/family,'Pretendard:SemiBold',sans-serif)]
  font-[var(--fontweight/semibold,normal)]
  text-[length:var(--fontsize/3,13px)]
  tracking-[-0.26px]

l:
  font-['Pretendard:Bold',sans-serif]
  font-[var(--fontweight/bold,normal)]
  text-[length:var(--fontsize/5,15px)]
  tracking-[-0.32px]
```

## 레이아웃 (원본 클래스)

```
공통:
  content-stretch
  flex
  gap-[var(--spacing-1,4px)]
  items-center
  justify-center
  overflow-clip
  relative
  rounded-[var(--radius-2,8px)]

xs: h-[var(--xs,28px)] px-[var(--spacing-2,8px)]
s:  h-[var(--s,32px)] px-[var(--spacing-3,12px)]
m:  h-[var(--m,40px)] px-[var(--spacing-4,16px)]
l:  h-[var(--l,48px)] px-[var(--spacing-5,20px)]
```

## 배경색 조합 (원본 클래스)

```
brand + enabled:  bg-[var(--bg/brand,#ff5b1a)]
brand + hover:    bg-[var(--bg/brand-hover,#f24b00)]
brand + pressed:  bg-[var(--bg/brand-pressed,#db3b00)]

neutral + enabled:  bg-[var(--bg/neutral,#1c2024)]
neutral + hover:    bg-[var(--bg/neutral-hover,#60646c)]
neutral + pressed:  bg-[var(--bg/neutral-pressed,#80838d)]

neutral weak + enabled:  bg-[var(--bg/neutral-weak,#e0e1e6)]
neutral weak + hover:    bg-[var(--bg/neutral-weak-hover,#cdced6)]
neutral weak + pressed:  bg-[var(--bg/neutral-weak-pressed,#b9bbc6)]

neutral ghost + enabled:  (배경 없음)
neutral ghost + hover:    bg-[var(--bg/neutral-weak-hover,#cdced6)]
neutral ghost + pressed:  bg-[var(--bg/neutral-weak-pressed,#b9bbc6)]

neutral outline + enabled:  (배경 없음) + border border-[var(--border/secondary,rgba(0,9,50,0.12))] border-solid
neutral outline + hover:    bg-[var(--bg/neutral-weak-hover,#cdced6)] + border
neutral outline + pressed:  bg-[var(--bg/neutral-weak-pressed,#b9bbc6)] + border

disabled (all types): bg-[var(--bg/disabled,#e0e1e6)]
```

## 텍스트 색상 조합 (원본 클래스)

```
brand, neutral (enabled/hover/pressed):
  text-[color:var(--solid/static/white,white)]

neutral weak, neutral ghost, neutral outline (enabled/hover/pressed):
  text-[color:var(--fg/default,#1c2024)]

disabled (all types):
  text-[color:var(--fg/disabled,#b9bbc6)]
```
