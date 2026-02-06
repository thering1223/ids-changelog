# 버튼 컴포넌트 분석

## 개요
Figma 디자인 시스템에서 확인된 버튼 컴포넌트는 4개의 상태(기본, 호버, 활성, 비활성화)와 다양한 크기, 스타일을 포함하는 포괄적인 디자인 시스템입니다.

## 레이아웃 구조

### 열(Columns) 구성
- **1-3열**: 활성 상태 버튼들 (기본/호버/활성 상태)
- **4열**: 비활성화(disabled) 상태 버튼들

### 행(Rows) 구성
총 16개의 행으로 구성되어 있으며, 각 행은 버튼의 타입과 크기를 나타냅니다.

## 버튼 타입별 분석

### 1. 텍스트 버튼 (1-4행)
- **특징**: 배경이나 테두리 없이 순수 텍스트만 표시
- **상태**:
  - 기본/호버/활성: 진한 회색 텍스트 (#1c2024)
  - 비활성화: 매우 밝은 회색 텍스트 (#b9bbc6)

### 2. 작은 회색 버튼 - 알약 형태 (5-8행)
- **크기**: 작은 크기 (xs: 28px 또는 s: 32px 추정)
- **모서리**: 매우 둥근 모서리 (알약 형태)
- **색상 변형**:
  - 5행, 7행: 어두운 회색 배경 (#60646c) + 흰색 텍스트
  - 6행, 8행: 중간 회색 배경 + 흰색 텍스트
- **비활성화**: 밝은 회색 배경 (#e0e1e6) + 밝은 회색 텍스트 (#b9bbc6)

### 3. 중간 크기 회색 버튼 (9-12행)
- **크기**: 중간 크기 (m: 40px 추정)
- **모서리**: 적당히 둥근 모서리 (radius-2: 8px)
- **색상 변형**:
  - 9행: 밝은 회색 배경 (#d9d9e0) + 어두운 회색 텍스트
  - 10행: 중간 회색 배경 (#80838d) + 어두운 회색 텍스트
  - 11행: 어두운 회색 배경 (#60646c) + 흰색 텍스트
  - 12행: 가장 어두운 회색 배경 + 흰색 텍스트
- **비활성화**: 밝은 회색 배경 (#e0e1e6) + 밝은 회색 텍스트 (#b9bbc6)

### 4. 주황색 버튼 (13-16행)
- **색상**: 브랜드 색상 사용
  - 기본: #ff5b1a
  - 호버: #f24b00
  - 포커스: #db3b00
- **텍스트**: 흰색 (#ffffff)
- **크기 변형**:
  - 13행: 작은 크기 (xs/s) + 둥근 모서리
  - 14행: 중간 크기 (m) + 적당히 둥근 모서리
  - 15행: 중간-큰 크기 + 적당히 둥근 모서리
  - 16행: 큰 크기 (l: 48px) + 매우 둥근 모서리 (알약 형태)
- **비활성화**: 밝은 회색 배경 (#e0e1e6) + 밝은 회색 텍스트 (#b9bbc6)

## 디자인 토큰 (Design Tokens)

### 색상
```css
/* 브랜드 색상 */
--bg-brand: #ff5b1a;
--bg-brand-hover: #f24b00;
--bg-brand-focus: #db3b00;

/* 중립 색상 */
--bg-neutral: #60646c;
--bg-neutral-hover: #80838d;
--bg-neutral-focus: #8b8d98;
--bg-neutral-weak: #d9d9e0;
--bg-neutral-weak-hover: #cdced6;
--bg-neutral-weak-focus: #b9bbc6;

/* 비활성화 */
--bg-disabled: #e0e1e6;
--fg-disabled: #b9bbc6;

/* 텍스트 */
--fg-default: #1c2024;
--solid-static-white: #ffffff;
```

### 크기
```css
--size-xs: 28px;
--size-s: 32px;
--size-m: 40px;
--size-l: 48px;
```

### 간격 (Spacing)
```css
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
```

### 모서리 반경
```css
--radius-2: 8px;
```

### 타이포그래피
```css
--font-family: "Pretendard";
--font-size-5: 15px;
--font-weight-bold: 700;
--label-l-emphasis: Font(family: "Pretendard", weight: 700, size: 15px, lineHeight: 1);
```

## 컴포넌트 속성 요약

### Props 표
| prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `type` | `"neutral" \| "neutral weak" \| "neutral ghost" \| "neutral outline" \| "brand"` | `"neutral"` | 버튼 스타일 변형 |
| `state` | `"enabled" \| "hover" \| "pressed" \| "disabled"` | `"enabled"` | 상호작용 상태 |
| `size` | `"xs" \| "s" \| "m" \| "l"` | `"xs"` | 높이·패딩·아이콘 크기 결정 |
| `text` | `string` | `"label"` | 버튼 레이블 |
| `showPrefixIcon` | `boolean` | `false` | 좌측 아이콘 노출 여부 |
| `showSuffixIcon` | `boolean` | `false` | 우측 아이콘 노출 여부 |
| `swapPrefixIcon` | `ReactNode \| null` | `null` | 기본 prefix 아이콘 대체 슬롯 |
| `swapSuffixIcon` | `ReactNode \| null` | `null` | 기본 suffix 아이콘 대체 슬롯 |

추가 메모:
- 아이콘 크기: `xs` 14px, `s` 16px, `m`/`l` 20px.
- 테두리는 `neutral outline` 타입에서만 사용.
- disabled는 텍스트 색 `--fg-disabled`, 배경 `--bg-disabled` 토큰 사용.

### 버튼 Variants
1. **텍스트 버튼** (Text Button)
2. **작은 회색 버튼** (Small Gray Button - Pill)
3. **중간 회색 버튼** (Medium Gray Button)
4. **주황색 버튼** (Brand Button) - Primary 액션용

### 크기 옵션
- xs: 28px
- s: 32px
- m: 40px
- l: 48px

### 상태
- 기본 (Default)
- 호버 (Hover)
- 활성/포커스 (Active/Focus)
- 비활성화 (Disabled)

### 모서리 스타일
- 둥근 모서리 (radius-2: 8px)
- 매우 둥근 모서리 (알약 형태 - Pill)

## 권장사항

### 사용 가이드
1. **Primary 액션**: 주황색 버튼 사용 (13-16행)
2. **Secondary 액션**: 회색 버튼 사용 (5-12행)
3. **Tertiary 액션**: 텍스트 버튼 사용 (1-4행)
4. **비활성화 상태**: 모든 버튼 타입에서 일관된 스타일 적용 (#e0e1e6 배경, #b9bbc6 텍스트)

### 접근성 고려사항
- 모든 버튼은 명확한 호버 및 포커스 상태를 가짐
- 비활성화 상태는 시각적으로 명확하게 구분됨
- 텍스트와 배경의 대비율이 충분함
