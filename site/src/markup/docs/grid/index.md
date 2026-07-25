---
layout: docs
title: Grid & Container
navTitle: Grid & Container
description: Twelve-column flexbox grid with responsive column widths, offsets and a max-width container, plus native CSS grid track templates, item spans and auto-flow.
order: 8
keywords: ["grid", "columns", "col", "container", "offset", "gutter", "row", "place-items", "place-content", "grid-cols", "grid-rows", "span", "grid-column-span", "grid-row-span", "auto-flow", "grid-flow", "dense", "css grid"]
---

# Grid & Container

## Which grid

Sulphuris ships two. **`.grid` + `.col-*` is the default** — flexbox, twelve columns, responsive widths, offsets and gutters. Use it for page layout and anything column-shaped.

Reach for [native CSS grid](#native-css-grid) (`.d-grid` + `.grid-cols-*` + `.gap-*`) when you need two-dimensional control: equal-height rows, row templates, item spanning.

They compose — a `.col-6` can be a `.d-grid`.

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

Flex-only — `flex-direction` does nothing on a `.d-grid` container. Native grid reverses with `direction: rtl` or explicit line placement.

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

Every class in this section spells out the axis as `column` / `row`, never `col` — matching `.flex-column` in [Flexbox](/docs/flexbox/), and keeping the flex grid's `.col-*` namespace clear.

All of them generate responsive variants, with the breakpoint before the value: `.grid-cols-md-3`, `.grid-column-span-lg-4`, `.grid-flow-md-column`.

### Track templates

| Class | CSS |
|---|---|
| `.grid-cols-{n}` | `grid-template-columns: repeat({n}, minmax(0, 1fr))` |
| `.grid-rows-{n}` | `grid-template-rows: repeat({n}, minmax(0, 1fr))` |

Columns run 1–12 (`$columns`), rows 1–6 (`$rows`). Rows stop at 6 on purpose: `grid-template-rows` only does visible work on a container with a definite height, and templates that deep are rare. Raise `$rows` if you need more.

The `minmax(0, 1fr)` — rather than plain `1fr` — is what stops a long word or a wide `<pre>` from blowing a track past its share.

Pair with the `.gap-*` utilities for gutters.

```html
<div class="d-grid grid-cols-1 grid-cols-md-3 gap-16">
  <div>Cell A</div>
  <div>Cell B</div>
  <div>Cell C</div>
</div>
```

Rows need a height to divide, so give the container one:

```html
<div class="d-grid grid-rows-3 gap-8 h-100vh">
  <header>Fixed third</header>
  <main>Fixed third</main>
  <footer>Fixed third</footer>
</div>
```

### Item spans

| Class | CSS |
|---|---|
| `.grid-column-span-{n}` | `grid-column: span {n} / span {n}` |
| `.grid-column-span-full` | `grid-column: 1 / -1` |
| `.grid-row-span-{n}` | `grid-row: span {n} / span {n}` |
| `.grid-row-span-full` | `grid-row: 1 / -1` |

`{n}` matches the track ranges — 1–12 for columns, 1–6 for rows. `-full` spans the first line to the last regardless of how many tracks the container has, which is the one that survives a change to `.grid-cols-*`.

```html
<div class="d-grid grid-cols-3 gap-16">
  <div class="grid-column-span-full">Full-width heading</div>
  <div class="grid-column-span-2">Two thirds</div>
  <div>One third</div>
</div>
```

### Auto-flow — `.grid-flow-*`

Controls where items land when they have no explicit placement.

| Class | CSS |
|---|---|
| `.grid-flow-row` | `grid-auto-flow: row` |
| `.grid-flow-column` | `grid-auto-flow: column` |
| `.grid-flow-dense` | `grid-auto-flow: dense` |
| `.grid-flow-row-dense` | `grid-auto-flow: row dense` |
| `.grid-flow-column-dense` | `grid-auto-flow: column dense` |

`row` is the CSS default — the class exists to undo a `column` set at a narrower breakpoint. `dense` backfills holes left by spanning items instead of leaving gaps, at the cost of items appearing out of source order (which is also what it does to keyboard and screen-reader order, so use it for galleries, not for content that has to be read in sequence).

`.grid-flow-dense` on its own is `row dense`. The two combined forms exist because `grid-auto-flow` is one property — `.grid-flow-column.grid-flow-dense` cannot work, the second class just wins.

```html
<!-- Masonry-ish gallery: no gaps, source order not guaranteed -->
<div class="d-grid grid-cols-4 gap-8 grid-flow-row-dense">
  <img class="grid-column-span-2" src="wide.jpg" alt="">
  <img src="a.jpg" alt="">
  <img src="b.jpg" alt="">
</div>
```

### Alignment

`place-items` and `place-content` set both axes at once — the row axis (`align-*`) and the column axis (`justify-*`) — so `.place-center` is a one-class replacement for `.align-center.justify-center`.

**Prefix:** `place`  **Property:** `place-items`

| Class | CSS |
|---|---|
| `.place-normal` | `place-items: normal` |
| `.place-center` | `place-items: center` |
| `.place-start` | `place-items: start` |
| `.place-end` | `place-items: end` |
| `.place-stretch` | `place-items: stretch` |

**Prefix:** `place-content`  **Property:** `place-content`

| Class | CSS |
|---|---|
| `.place-content-normal` | `place-content: normal` |
| `.place-content-center` | `place-content: center` |
| `.place-content-start` | `place-content: start` |
| `.place-content-end` | `place-content: end` |
| `.place-content-stretch` | `place-content: stretch` |
| `.place-content-space-between` | `place-content: space-between` |
| `.place-content-space-around` | `place-content: space-around` |

`place-items` aligns each item inside its own track; `place-content` aligns the track grid as a whole inside the container. Both prefixes generate responsive variants (`.place-md-center`, `.place-content-lg-start`).

```html
<div class="d-grid grid-cols-3 gap-16 place-center">
  <div>Centered in its cell</div>
  <div>Centered in its cell</div>
  <div>Centered in its cell</div>
</div>
```
