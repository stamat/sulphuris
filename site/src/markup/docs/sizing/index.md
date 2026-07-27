---
layout: docs
title: Sizing
navTitle: Sizing
description: Width, height, min and max sizing utility classes generated from the pixel size scale, percentage sizes, viewport units, and keyword values.
order: 4
keywords: ["width", "height", "min-width", "max-width", "min-height", "max-height", "size", "w", "h", "vh", "vw"]
---

# Sizing

Width and height utilities are generated from
[`core/layout/_dimension.scss`](https://github.com/stamat/sulphuris/blob/main/src/core/layout/_dimension.scss).
All classes are responsive by default.

## Class naming

```
.{prefix}[-{bp}]-{key}{suffix}  →  {property}: {value}{unit}
```

- **prefix** — `w`, `h`, `min-w`, `max-w`, `min-h`, `max-h`
- **bp** — omitted for base styles; one of `sm`, `md`, `lg`, `xl`, `xxl` for responsive variants
- **key** — the numeric value (e.g. `32`, `50`, `100`)
- **suffix** — empty for the px-named scale (output in `rem`); `p` for percent; `vw` for viewport width; `vh` for viewport height

## Width — `.w-*`

Property: `width`.

### Pixel scale

Values from `$sizes`: `0, 1, 2, 3, 4, 6, 8, 12, 14, 16, 24, 32, 40, 48, 56, 64, 80, 96, 128, 256`.
No suffix. The key is px, the value is `rem` — see
[`$rem-units`](../configuration/#feature-flags).

```css
.w-0   { width: 0; }
.w-16  { width: 1rem; }
.w-64  { width: 4rem; }
.w-256 { width: 16rem; }
```

### Percent scale

Values from `$percent-sizes`: `5, 10, 15, 20, 25, 50, 75, 100`. Suffix: `p`.

```css
.w-5p   { width: 5%; }
.w-25p  { width: 25%; }
.w-50p  { width: 50%; }
.w-100p { width: 100%; }
```

### Viewport width scale

Values from `$viewport-sizes`: `25, 50, 75, 100`. Suffix: `vw`. Only emitted for `width` (not `height`).

Coarser than the percent scale on purpose — viewport sizing is used in quarters, not in 5% steps. Widen `$viewport-sizes` if a design needs the fine grain.

```css
.w-25vw  { width: 25vw; }
.w-50vw  { width: 50vw; }
.w-100vw { width: 100vw; }
```

### Keywords

```css
.w-auto    { width: auto; }
.w-inherit { width: inherit; }
```

## Height — `.h-*`

Property: `height`. Same value set as width, with two differences:

- The viewport unit entries use `vh` (suffix: `vh`) and are only emitted for `height`.
- `vw` entries are **not** emitted for height.

### Pixel scale

```css
.h-0   { height: 0; }
.h-16  { height: 1rem; }
.h-64  { height: 4rem; }
.h-256 { height: 16rem; }
```

### Percent scale

```css
.h-5p   { height: 5%; }
.h-50p  { height: 50%; }
.h-100p { height: 100%; }
```

### Viewport height scale

Values from `$viewport-sizes`: `25, 50, 75, 100`.

```css
.h-25vh  { height: 25vh; }
.h-50vh  { height: 50vh; }
.h-100vh { height: 100vh; }
```

### Keywords

```css
.h-auto    { height: auto; }
.h-inherit { height: inherit; }
```

## Min and max — `.min-w-*`, `.max-w-*`, `.min-h-*`, `.max-h-*`

Properties: `min-width`, `max-width`, `min-height`, `max-height`. Each family
carries the same scale as `w` / `h` — pixel, percent and the matching viewport
unit (`$viewport-sizes`) — so anything you can set as a width you can also set
as a bound.

```css
.max-w-256  { max-width: 16rem; }
.max-w-50p  { max-width: 50%; }
.max-w-100vw { max-width: 100vw; }

.min-h-0    { min-height: 0; }
.min-h-100p { min-height: 100%; }
.min-h-100vh { min-height: 100vh; }
```

The keyword differs per family, because the two are not interchangeable in CSS:

```css
.min-w-auto { min-width: auto; }   /* `min-*` takes auto */
.max-w-none { max-width: none; }   /* `max-*` takes none */
```

There is no `.min-w-none` or `.max-w-auto` — neither is valid CSS.

> [!WARNING]
> These replace `.w-max-*` / `.h-max-*`, removed in `3.0.0`. The old prefix read as `width: max-content` rather than `max-width`. Rename `.w-max-none` → `.max-w-none` and `.w-max-100p` → `.max-w-100p`, same for `h`.

## Aspect ratio — `.aspect-*`

Property: `aspect-ratio`. Not responsive.

```css
.aspect-1x1  { aspect-ratio: 1 / 1; }
.aspect-4x3  { aspect-ratio: 4 / 3; }
.aspect-3x2  { aspect-ratio: 3 / 2; }
.aspect-16x9 { aspect-ratio: 16 / 9; }
.aspect-21x9 { aspect-ratio: 21 / 9; }
.aspect-9x16 { aspect-ratio: 9 / 16; }
```

## Responsive variants

Every `w-*`, `h-*`, `min-w-*`, `max-w-*`, `min-h-*` and `max-h-*` class is also generated inside a
`min-width` media query for each breakpoint. The breakpoint token is inserted
after the prefix:

```
.{prefix}-{bp}-{key}{suffix}
```

Breakpoints (min-width). Written in px in the config, emitted in `rem` — see
[`$rem-units`](../configuration/#feature-flags):

| Token | Min-width |
|-------|-----------|
| `sm`  | 26.25rem (420px)     |
| `md`  | 48rem (768px)     |
| `lg`  | 64rem (1024px)    |
| `xl`  | 85.375rem (1366px)    |
| `xxl` | 105rem (1680px)    |

Examples:

```css
/* at 48rem — 768px at the default root — and up */
@media only screen and (min-width: 48rem) {
  .w-md-50p  { width: 50%; }
  .h-md-100p { height: 100%; }
  .w-md-auto { width: auto; }
}

/* at 64rem — 1024px at the default root — and up */
@media only screen and (min-width: 64rem) {
  .w-lg-100vw  { width: 100vw; }
  .h-lg-100vh  { height: 100vh; }
  .max-w-lg-none { max-width: none; }
}
```
