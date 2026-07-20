---
layout: docs
title: Grid & Container
navTitle: Grid & Container
description: Twelve-column flexbox grid with responsive column widths, offsets, and a max-width container that switches gutters at the lg breakpoint.
order: 8
keywords: ["grid", "columns", "col", "container", "offset", "gutter", "row"]
---

# Grid & Container

## Container

`.container` centers content with `max-width: 1680px` and horizontal padding that switches at the `lg` breakpoint (1024px):

| Viewport | Padding (each side) |
|---|---|
| below `lg` | 16px |
| `lg` and up | 56px |

```html
<div class="container">…</div>
```

## Grid row

`.grid` is a `display: flex; flex-flow: row wrap` wrapper. It has no gutter by itself.

Add `.grid-gutter` to apply negative side margins that cancel the column padding, producing consistent gutters between columns without extra math on the outside edges:

| Viewport | Column padding (each side) | Row negative margin (each side) |
|---|---|---|
| below `lg` | 8px | -8px |
| `lg` and up | 16px | -16px |

The full gutter values are `$grid-gutter-mobile: 16px` and `$grid-gutter: 32px` — each side gets half.

`.grid-gutter` and `.container` can be combined on the same element. When combined, the padding accounts for both the container offset and the half-gutter:

```html
<div class="grid grid-gutter container">
  <div class="col-12 col-md-6 col-lg-4">…</div>
  <div class="col-12 col-md-6 col-lg-4">…</div>
  <div class="col-12 col-md-6 col-lg-4">…</div>
</div>
```

## Columns — `.col-N`

12 columns. Width is a percentage: `100 / 12 * N`.

```
.col-1   →  8.333…%
.col-2   → 16.666…%
.col-3   → 25%
.col-4   → 33.333…%
.col-6   → 50%
.col-8   → 66.666…%
.col-9   → 75%
.col-12  → 100%
```

Classes exist for every integer 1–12.

## Responsive columns — `.col-{bp}-N`

Each column class has a breakpoint variant that applies at `min-width`. Breakpoints:

| Name | Min-width |
|---|---|
| `sm` | 420px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1366px |
| `xxl` | 1680px |

The base `.col-N` (no breakpoint) applies at all widths. Layer responsive classes on top for wider viewports:

```html
<!-- Full width on mobile, half at md, third at lg -->
<div class="col-12 col-md-6 col-lg-4">…</div>
```

Full responsive example:

```html
<div class="grid grid-gutter container">
  <div class="col-12 col-md-6 col-lg-4">Card A</div>
  <div class="col-12 col-md-6 col-lg-4">Card B</div>
  <div class="col-12 col-md-12 col-lg-4">Card C</div>
</div>
```

## Offsets — `.col-offset-N`

Pushes a column right by adding `margin-left` as a percentage of the parent. Range: `0`–`11`.

```
.col-offset-0   → margin-left: 0%
.col-offset-1   → margin-left: 8.333…%
.col-offset-6   → margin-left: 50%
.col-offset-11  → margin-left: 91.666…%
```

Responsive variants follow the same pattern: `.col-offset-{bp}-N`.

```html
<div class="grid grid-gutter">
  <div class="col-6 col-offset-3">Centered 6-column block</div>
</div>
```

## `.grid-reverse`

Add `.grid-reverse` to a `.grid` row to set `flex-direction: row-reverse`. When `.grid-reverse` is present, offset classes switch from `margin-left` to `margin-right`, so offsets keep working visually in the reversed direction.

```html
<div class="grid grid-gutter grid-reverse">
  <div class="col-4 col-offset-2">Pushed from the right</div>
</div>
```

## Max-width columns — `.col-N-max`

`.col-N-max` caps an element's `max-width` to the pixel equivalent of N columns at the largest breakpoint (`xxl`, 1680px), accounting for container offsets and gutters. Range: `1`–`11` (`.col-12-max` is not generated; use the container's full width instead).

The value is computed from the max breakpoint width minus container padding on both sides plus one gutter unit, scaled by the column fraction:

```
desktop: (1680 - 56×2 + 32) × (N/12)  →  1600 × (N/12)
mobile:  (1680 - 16×2 + 16) × (N/12)  →  1664 × (N/12)
```

Examples (desktop):

```
.col-6-max   → max-width: 800px
.col-4-max   → max-width: ~533px
.col-3-max   → max-width: 400px
```

Use `.col-N-max` when you want an element to grow freely on small screens but never exceed the proportional column width at full desktop scale.

```html
<img class="col-6-max" src="photo.jpg" alt="">
```

## Native CSS grid

Separate from the 12-column flex system above, these utilities drive a real `display: grid` container.

| Class | CSS |
|---|---|
| `.d-grid` | `display: grid` |
| `.d-inline-grid` | `display: inline-grid` |
| `.grid-cols-{n}` | `grid-template-columns: repeat({n}, minmax(0, 1fr))` |

`.grid-cols-{n}` is generated for `n` = 1–12 and has responsive variants (`.grid-cols-md-3`). Pair with the `.gap-*` utilities for gutters.

```html
<div class="d-grid grid-cols-1 grid-cols-md-3 gap-16">
  <div>Cell A</div>
  <div>Cell B</div>
  <div>Cell C</div>
</div>
```
