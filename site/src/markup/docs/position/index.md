---
layout: docs
title: Position
navTitle: Position
description: Utility classes for position, top/right/bottom/left offsets (px and %), z-index, and related layout helpers.
order: 7
keywords: ["position", "relative", "absolute", "fixed", "sticky", "top", "left", "z-index", "inset", "inset-inline", "inset-block", "logical", "rtl"]
---

# Position

## Position

Prefix: `position`. Property: `position`.

| Class | CSS |
|---|---|
| `.position-static` | `position: static` |
| `.position-relative` | `position: relative` |
| `.position-absolute` | `position: absolute` |
| `.position-fixed` | `position: fixed` |
| `.position-sticky` | `position: sticky` |

## Offset (px)

Each side has its own single-letter prefix. Unit: `px`.

| Prefix | Property |
|---|---|
| `t` | `top` |
| `r` | `right` |
| `b` | `bottom` |
| `l` | `left` |

**Positive scale** — `$sizes`: `0, 1, 2, 3, 4, 6, 8, 12, 14, 16, 24, 32, 40, 48, 56, 64, 80, 96, 128, 256`

```
.t-0               → top: 0px
.t-16              → top: 16px
.r-32              → right: 32px
.b-8               → bottom: 8px
.l-24              → left: 24px
```

**Negative scale** — `$negative-sizes`: `-1, -2, -3, -4, -8, -12, -14, -16, -24, -32, -40, -48, -56, -64`

The key includes the minus sign, producing a double-dash in the class name.

```
.t--16             → top: -16px
.r--8              → right: -8px
.b--32             → bottom: -32px
.l--4              → left: -4px
```

## Offset (%)

Same four prefixes. Unit: `%`. A `p` suffix marks percentage classes.

**Positive %** — `$percent-sizes`: `5, 10, 15, 20, 25, 50, 75, 100`

```
.t-50p             → top: 50%
.l-100p            → left: 100%
.r-25p             → right: 25%
```

**Negative %** — `$negative-percent-sizes`: `-5, -10, -15, -20, -25, -50, -75, -100`

```
.t--50p            → top: -50%
.l--100p           → left: -100%
```

## Inset

Prefix: `inset`. Property: `inset`. Sets all four offsets at once — a shorthand that complements the single-side `t`/`r`/`b`/`l` utilities.

Uses the standard `$sizes` scale, plus `$negative-sizes`, positive percentages from `$percent-sizes` (`p` suffix), and `auto`. Responsive variants exist. Unlike the single-side `t`/`r`/`b`/`l` utilities, `inset` is **not** fed `$negative-percent-sizes` — there is no `.inset--50p`.

```
.inset-16          → inset: 16px
.inset--16         → inset: -16px
.inset-50p         → inset: 50%
.inset-auto        → inset: auto
.inset-md-16       → inset: 16px  (min-width: 768px)
```

## Logical inset (RTL-aware)

Prefixes: `inset-inline`, `inset-block`. The physical `inset` above sets all four sides; these two set a **writing-direction-aware** pair, so they flip automatically under RTL — the positioning counterpart to the logical `.m-inline-*` / `.p-block-*` spacing utilities.

| Class pattern | CSS property |
|---|---|
| `.inset-inline-{size}` | `inset-inline` (left + right in LTR) |
| `.inset-block-{size}` | `inset-block` (top + bottom) |

Same scales as `inset`: `$sizes`, `$negative-sizes`, `$percent-sizes` (`p` suffix), and `auto`. Responsive.

```
.inset-inline-0    → inset-inline: 0px
.inset-block-16    → inset-block: 16px
.inset-inline--8   → inset-inline: -8px
.inset-block-50p   → inset-block: 50%
.inset-inline-auto → inset-inline: auto
.inset-block-md-16 → inset-block: 16px  (min-width: 768px)
```

## Z-index

Prefix: `z`. Property: `z-index`.

Scale: `-1, 0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 100`

```
.z-0               → z-index: 0
.z-1               → z-index: 1
.z-10              → z-index: 10
.z--1              → z-index: -1
.z-100             → z-index: 100
```

## Helpers (_misc.scss)

Static single-purpose classes, no responsive variants.

**Absolute cover**

```
.absolute-cover    → position: absolute; top: 0; left: 0; width: 100%; height: 100%
```

**Absolute centering**

```
.absolute-center   → position: absolute; top: 50%; left: 50%; transform: translate3d(-50%, -50%, 0)
.absolute-center-vertical   → position: absolute; top: 50%; transform: translateY(-50%)
.absolute-center-horizontal → position: absolute; left: 50%; transform: translateX(-50%)
```

**Background sizing**

```
.bg-cover          → background-size: cover; background-position: center; background-repeat: no-repeat
.bg-contain        → background-size: contain; background-position: center; background-repeat: no-repeat
```

**Object fit**

```
.object-fill       → object-fit: fill
.object-contain    → object-fit: contain
.object-cover      → object-fit: cover
```

**Pointer events**

```
.events-none       → pointer-events: none
.events-all        → pointer-events: all
.events-auto       → pointer-events: auto
```

**Scrollbar**

```
.hide-native-scrollbar   → hides scrollbar (scrollbar-width: none + ::-webkit-scrollbar)
```

**Misc**

```
.appearance-none   → -webkit-appearance: none; appearance: none
.no-select         → user-select: none (plus -webkit- for older Safari)
.sr-only           → screen-reader-only accessible hide (clip + clip-path + 1px)
.content-box       → box-sizing: content-box  (overrides global border-box reset)
```

> [!NOTE]
> `[hidden]` receives `display: none !important` and `* { box-sizing: border-box }` is set globally via the misc reset — these are not utility classes.

## Responsive

All offset, position and z-index classes generate responsive variants. Insert a breakpoint name between the prefix and the size key.

Pattern: `.{prefix}-{bp}-{key}`

```
.position-md-absolute  → position: absolute   (min-width: 768px)
.t-lg-32               → top: 32px            (min-width: 1024px)
.t-md--16              → top: -16px           (min-width: 768px)
.l-xl-50p              → left: 50%            (min-width: 1366px)
.z-md-10               → z-index: 10          (min-width: 768px)
```

Breakpoints (all min-width):

| Name | Min-width |
|---|---|
| `sm` | 420px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1366px |
| `xxl` | 1680px |

> [!NOTE]
> Classes without a breakpoint segment apply at all viewport widths. Responsive variants layer on top via `min-width` media queries, so the base class is the mobile-first default.
