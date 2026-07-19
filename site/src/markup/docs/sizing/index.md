---
layout: docs
title: Sizing
navTitle: Sizing
description: Width and height utility classes generated from the pixel size scale, percentage sizes, viewport units, and keyword values.
order: 4
keywords: ["width", "height", "min-width", "max-width", "size", "w", "h", "vh", "vw"]
---

# Sizing

Width and height utilities are generated from
[`core/layout/_dimension.scss`](https://github.com/sulphuris/sulphuris/blob/main/src/core/layout/_dimension.scss).
All classes are responsive by default.

## Class naming

```
.{prefix}[-{bp}]-{key}{suffix}  →  {property}: {value}{unit}
```

- **prefix** — `w`, `h`, `w-max`, `h-max`
- **bp** — omitted for base styles; one of `sm`, `md`, `lg`, `xl`, `xxl` for responsive variants
- **key** — the numeric value (e.g. `32`, `50`, `100`)
- **suffix** — empty for `px` values; `p` for percent; `vw` for viewport width; `vh` for viewport height

## Width — `.w-*`

Property: `width`.

### Pixel scale

Values from `$sizes`: `0, 1, 2, 3, 4, 6, 8, 12, 14, 16, 24, 32, 40, 48, 56, 64, 80, 96, 128, 256`.
No suffix; unit is `px`.

```css
.w-0   { width: 0px; }
.w-16  { width: 16px; }
.w-64  { width: 64px; }
.w-256 { width: 256px; }
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

Same `$percent-sizes` values. Suffix: `vw`. Only emitted for `width` (not `height`).

```css
.w-5vw   { width: 5vw; }
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
.h-0   { height: 0px; }
.h-16  { height: 16px; }
.h-64  { height: 64px; }
.h-256 { height: 256px; }
```

### Percent scale

```css
.h-5p   { height: 5%; }
.h-50p  { height: 50%; }
.h-100p { height: 100%; }
```

### Viewport height scale

```css
.h-5vh   { height: 5vh; }
.h-50vh  { height: 50vh; }
.h-100vh { height: 100vh; }
```

### Keywords

```css
.h-auto    { height: auto; }
.h-inherit { height: inherit; }
```

## Max-width — `.w-max-*`

Property: `max-width`. Two values only.

```css
.w-max-none { max-width: none; }
.w-max-100p { max-width: 100%; }
```

## Max-height — `.h-max-*`

Property: `max-height`. Same two values.

```css
.h-max-none { max-height: none; }
.h-max-100p { max-height: 100%; }
```

## Responsive variants

Every `w-*`, `h-*`, `w-max-*`, and `h-max-*` class is also generated inside a
`min-width` media query for each breakpoint. The breakpoint token is inserted
after the prefix:

```
.{prefix}-{bp}-{key}{suffix}
```

Breakpoints (min-width):

| Token | Min-width |
|-------|-----------|
| `sm`  | 420px     |
| `md`  | 768px     |
| `lg`  | 1024px    |
| `xl`  | 1366px    |
| `xxl` | 1680px    |

Examples:

```css
/* at 768px and up */
@media only screen and (min-width: 768px) {
  .w-md-50p  { width: 50%; }
  .h-md-100p { height: 100%; }
  .w-md-auto { width: auto; }
}

/* at 1024px and up */
@media only screen and (min-width: 1024px) {
  .w-lg-100vw  { width: 100vw; }
  .h-lg-100vh  { height: 100vh; }
  .w-max-lg-none { max-width: none; }
}
```
