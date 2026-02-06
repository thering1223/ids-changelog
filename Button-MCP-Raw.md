# Button Component - MCP 원본 데이터

## 1. get_design_context 응답

```tsx
const imgVector = "https://www.figma.com/api/mcp/asset/abddacce-2d43-4afd-b12c-2c0de832820d";

function Plus({ className }: { className?: string }) {
  return (
    <div className={className} data-name="plus" data-node-id="600:3378">
      <div className="absolute inset-[12.5%]" data-name="vector" data-node-id="617:5614">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(28, 32, 36, 1)" } as React.CSSProperties}>
          <img alt="" className="block max-w-none size-full" src={imgVector} />
        </div>
      </div>
    </div>
  );
}
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

export default function Button({ showPrefixIcon = false, showSuffixIcon = false, text = "label", swapPrefixIcon = null, swapSuffixIcon = null, type = "neutral", state = "enabled", size = "xs" }: ButtonProps) {
  const isBrandAndDisabled = type === "brand" && state === "disabled";
  const isBrandAndDisabledAndL = type === "brand" && state === "disabled" && size === "l";
  const isBrandAndDisabledAndM = type === "brand" && state === "disabled" && size === "m";
  const isBrandAndDisabledAndS = type === "brand" && state === "disabled" && size === "s";
  const isBrandAndDisabledAndXs = type === "brand" && state === "disabled" && size === "xs";
  const isBrandAndEnabled = type === "brand" && state === "enabled";
  const isBrandAndEnabledAndL = type === "brand" && state === "enabled" && size === "l";
  const isBrandAndEnabledAndM = type === "brand" && state === "enabled" && size === "m";
  const isBrandAndEnabledAndS = type === "brand" && state === "enabled" && size === "s";
  const isBrandAndEnabledAndXs = type === "brand" && state === "enabled" && size === "xs";
  const isBrandAndHover = type === "brand" && state === "hover";
  const isBrandAndHoverAndL = type === "brand" && state === "hover" && size === "l";
  const isBrandAndHoverAndM = type === "brand" && state === "hover" && size === "m";
  const isBrandAndHoverAndS = type === "brand" && state === "hover" && size === "s";
  const isBrandAndHoverAndXs = type === "brand" && state === "hover" && size === "xs";
  const isBrandAndPressed = type === "brand" && state === "pressed";
  const isBrandAndPressedAndL = type === "brand" && state === "pressed" && size === "l";
  const isBrandAndPressedAndM = type === "brand" && state === "pressed" && size === "m";
  const isBrandAndPressedAndS = type === "brand" && state === "pressed" && size === "s";
  const isBrandAndPressedAndXs = type === "brand" && state === "pressed" && size === "xs";
  const isDisabledAndLAndNeutralOrNeutralWeakOrBrand = (type === "neutral" && state === "disabled" && size === "l") || (type === "neutral weak" && state === "disabled" && size === "l") || (type === "brand" && state === "disabled" && size === "l");
  const isNeutralAndDisabled = type === "neutral" && state === "disabled";
  const isNeutralAndDisabledAndL = type === "neutral" && state === "disabled" && size === "l";
  const isNeutralAndDisabledAndM = type === "neutral" && state === "disabled" && size === "m";
  const isNeutralAndDisabledAndS = type === "neutral" && state === "disabled" && size === "s";
  const isNeutralAndDisabledAndXs = type === "neutral" && state === "disabled" && size === "xs";
  const isNeutralAndEnabled = type === "neutral" && state === "enabled";
  const isNeutralAndEnabledAndL = type === "neutral" && state === "enabled" && size === "l";
  const isNeutralAndEnabledAndM = type === "neutral" && state === "enabled" && size === "m";
  const isNeutralAndEnabledAndS = type === "neutral" && state === "enabled" && size === "s";
  const isNeutralAndEnabledAndXs = type === "neutral" && state === "enabled" && size === "xs";
  const isNeutralAndHover = type === "neutral" && state === "hover";
  const isNeutralAndHoverAndL = type === "neutral" && state === "hover" && size === "l";
  const isNeutralAndHoverAndM = type === "neutral" && state === "hover" && size === "m";
  const isNeutralAndHoverAndS = type === "neutral" && state === "hover" && size === "s";
  const isNeutralAndHoverAndXs = type === "neutral" && state === "hover" && size === "xs";
  const isNeutralAndPressed = type === "neutral" && state === "pressed";
  const isNeutralAndPressedAndL = type === "neutral" && state === "pressed" && size === "l";
  const isNeutralAndPressedAndM = type === "neutral" && state === "pressed" && size === "m";
  const isNeutralAndPressedAndS = type === "neutral" && state === "pressed" && size === "s";
  const isNeutralAndPressedAndXs = type === "neutral" && state === "pressed" && size === "xs";
  const isNeutralGhostAndDisabled = type === "neutral ghost" && state === "disabled";
  const isNeutralGhostAndDisabledAndL = type === "neutral ghost" && state === "disabled" && size === "l";
  const isNeutralGhostAndDisabledAndM = type === "neutral ghost" && state === "disabled" && size === "m";
  const isNeutralGhostAndDisabledAndS = type === "neutral ghost" && state === "disabled" && size === "s";
  const isNeutralGhostAndDisabledAndXs = type === "neutral ghost" && state === "disabled" && size === "xs";
  const isNeutralGhostAndEnabled = type === "neutral ghost" && state === "enabled";
  const isNeutralGhostAndEnabledAndL = type === "neutral ghost" && state === "enabled" && size === "l";
  const isNeutralGhostAndEnabledAndM = type === "neutral ghost" && state === "enabled" && size === "m";
  const isNeutralGhostAndEnabledAndS = type === "neutral ghost" && state === "enabled" && size === "s";
  const isNeutralGhostAndEnabledAndXs = type === "neutral ghost" && state === "enabled" && size === "xs";
  const isNeutralGhostAndHover = type === "neutral ghost" && state === "hover";
  const isNeutralGhostAndHoverAndL = type === "neutral ghost" && state === "hover" && size === "l";
  const isNeutralGhostAndHoverAndM = type === "neutral ghost" && state === "hover" && size === "m";
  const isNeutralGhostAndHoverAndS = type === "neutral ghost" && state === "hover" && size === "s";
  const isNeutralGhostAndHoverAndXs = type === "neutral ghost" && state === "hover" && size === "xs";
  const isNeutralGhostAndPressed = type === "neutral ghost" && state === "pressed";
  const isNeutralGhostAndPressedAndL = type === "neutral ghost" && state === "pressed" && size === "l";
  const isNeutralGhostAndPressedAndM = type === "neutral ghost" && state === "pressed" && size === "m";
  const isNeutralGhostAndPressedAndS = type === "neutral ghost" && state === "pressed" && size === "s";
  const isNeutralGhostAndPressedAndXs = type === "neutral ghost" && state === "pressed" && size === "xs";
  const isNeutralOutlineAndDisabled = type === "neutral outline" && state === "disabled";
  const isNeutralOutlineAndDisabledAndL = type === "neutral outline" && state === "disabled" && size === "l";
  const isNeutralOutlineAndDisabledAndM = type === "neutral outline" && state === "disabled" && size === "m";
  const isNeutralOutlineAndDisabledAndS = type === "neutral outline" && state === "disabled" && size === "s";
  const isNeutralOutlineAndDisabledAndXs = type === "neutral outline" && state === "disabled" && size === "xs";
  const isNeutralOutlineAndEnabled = type === "neutral outline" && state === "enabled";
  const isNeutralOutlineAndEnabledAndL = type === "neutral outline" && state === "enabled" && size === "l";
  const isNeutralOutlineAndEnabledAndM = type === "neutral outline" && state === "enabled" && size === "m";
  const isNeutralOutlineAndEnabledAndS = type === "neutral outline" && state === "enabled" && size === "s";
  const isNeutralOutlineAndEnabledAndXs = type === "neutral outline" && state === "enabled" && size === "xs";
  const isNeutralOutlineAndHover = type === "neutral outline" && state === "hover";
  const isNeutralOutlineAndHoverAndL = type === "neutral outline" && state === "hover" && size === "l";
  const isNeutralOutlineAndHoverAndM = type === "neutral outline" && state === "hover" && size === "m";
  const isNeutralOutlineAndHoverAndS = type === "neutral outline" && state === "hover" && size === "s";
  const isNeutralOutlineAndHoverAndXs = type === "neutral outline" && state === "hover" && size === "xs";
  const isNeutralOutlineAndPressed = type === "neutral outline" && state === "pressed";
  const isNeutralOutlineAndPressedAndL = type === "neutral outline" && state === "pressed" && size === "l";
  const isNeutralOutlineAndPressedAndM = type === "neutral outline" && state === "pressed" && size === "m";
  const isNeutralOutlineAndPressedAndS = type === "neutral outline" && state === "pressed" && size === "s";
  const isNeutralOutlineAndPressedAndXs = type === "neutral outline" && state === "pressed" && size === "xs";
  const isNeutralWeakAndDisabled = type === "neutral weak" && state === "disabled";
  const isNeutralWeakAndDisabledAndL = type === "neutral weak" && state === "disabled" && size === "l";
  const isNeutralWeakAndDisabledAndM = type === "neutral weak" && state === "disabled" && size === "m";
  const isNeutralWeakAndDisabledAndS = type === "neutral weak" && state === "disabled" && size === "s";
  const isNeutralWeakAndDisabledAndXs = type === "neutral weak" && state === "disabled" && size === "xs";
  const isNeutralWeakAndEnabled = type === "neutral weak" && state === "enabled";
  const isNeutralWeakAndEnabledAndL = type === "neutral weak" && state === "enabled" && size === "l";
  const isNeutralWeakAndEnabledAndM = type === "neutral weak" && state === "enabled" && size === "m";
  const isNeutralWeakAndEnabledAndS = type === "neutral weak" && state === "enabled" && size === "s";
  const isNeutralWeakAndEnabledAndXs = type === "neutral weak" && state === "enabled" && size === "xs";
  const isNeutralWeakAndHover = type === "neutral weak" && state === "hover";
  const isNeutralWeakAndHoverAndL = type === "neutral weak" && state === "hover" && size === "l";
  const isNeutralWeakAndHoverAndM = type === "neutral weak" && state === "hover" && size === "m";
  const isNeutralWeakAndHoverAndS = type === "neutral weak" && state === "hover" && size === "s";
  const isNeutralWeakAndHoverAndXs = type === "neutral weak" && state === "hover" && size === "xs";
  const isNeutralWeakAndPressed = type === "neutral weak" && state === "pressed";
  const isNeutralWeakAndPressedAndL = type === "neutral weak" && state === "pressed" && size === "l";
  const isNeutralWeakAndPressedAndM = type === "neutral weak" && state === "pressed" && size === "m";
  const isNeutralWeakAndPressedAndS = type === "neutral weak" && state === "pressed" && size === "s";
  const isNeutralWeakAndPressedAndXs = type === "neutral weak" && state === "pressed" && size === "xs";
  const isXsAndTypeAndEnabledOrHoverOrPressedOrDisabled = (type === "neutral ghost" && state === "enabled" && size === "xs") || (type === "neutral ghost" && state === "hover" && size === "xs") || (type === "neutral ghost" && state === "pressed" && size === "xs") || (type === "neutral ghost" && state === "disabled" && size === "xs") || (type === "neutral" && state === "enabled" && size === "xs") || (type === "neutral" && state === "hover" && size === "xs") || (type === "neutral" && state === "pressed" && size === "xs") || (type === "neutral" && state === "disabled" && size === "xs") || (type === "neutral weak" && state === "enabled" && size === "xs") || (type === "neutral weak" && state === "hover" && size === "xs") || (type === "neutral weak" && state === "pressed" && size === "xs") || (type === "neutral weak" && state === "disabled" && size === "xs") || (type === "brand" && state === "enabled" && size === "xs") || (type === "brand" && state === "hover" && size === "xs") || (type === "brand" && state === "pressed" && size === "xs") || (type === "brand" && state === "disabled" && size === "xs") || (type === "neutral outline" && state === "enabled" && size === "xs") || (type === "neutral outline" && state === "hover" && size === "xs") || (type === "neutral outline" && state === "pressed" && size === "xs") || (type === "neutral outline" && state === "disabled" && size === "xs");
  return (
    <div id={isNeutralGhostAndEnabledAndXs ? "node-812_4353" : isNeutralGhostAndHoverAndXs ? "node-812_4386" : ...} className={`content-stretch flex gap-[var(--spacing-1,4px)] items-center justify-center overflow-clip relative rounded-[var(--radius-2,8px)] ${...}`}>
      {/* ... 컴포넌트 내부 렌더링 로직 (생략) ... */}
    </div>
  );
}
```

> 참고: 전체 코드는 매우 길어서 핵심 구조만 포함. 원본은 조건부 렌더링과 스타일 분기가 상세히 포함됨.

---

## 2. get_variable_defs 응답

```json
{
  "fg/default": "#1c2024",
  "fontSize/3": "13",
  "fontWeight/semiBold": "SemiBold",
  "font/family": "Pretendard",
  "label-m-emphasis": "Font(family: \"font/family\", style: fontWeight/semiBold, size: fontSize/3, weight: 600, lineHeight: 1, letterSpacing: -2)",
  "spacing-1": "4",
  "spacing-2": "8",
  "xs": "28",
  "radius-2": "8",
  "bg/neutral-weak-hover": "#cdced6",
  "bg/neutral-weak-pressed": "#b9bbc6",
  "fg/disabled": "#b9bbc6",
  "spacing-3": "12",
  "s": "32",
  "spacing-4": "16",
  "m": "40",
  "spacing-5": "20",
  "l": "48",
  "solid/static/white": "#ffffff",
  "bg/neutral": "#1c2024",
  "bg/neutral-hover": "#60646c",
  "bg/neutral-pressed": "#80838d",
  "bg/disabled": "#e0e1e6",
  "fontSize/5": "15",
  "fontWeight/bold": "Bold",
  "label-l-emphasis": "Font(family: \"font/family\", style: fontWeight/bold, size: fontSize/5, weight: 700, lineHeight: 1, letterSpacing: 0)",
  "bg/neutral-weak": "#e0e1e6",
  "bg/brand": "#ff5b1a",
  "bg/brand-hover": "#f24b00",
  "bg/brand-pressed": "#db3b00",
  "border/secondary": "#0009321f"
}
```
