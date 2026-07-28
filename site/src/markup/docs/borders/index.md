---
layout: poops-docs-theme/docs
title: Borders & Radius
navTitle: Borders & Radius
description: Utility classes for border width, border style, border colour, and border radius — including per-side shorthands and responsive variants.
order: 12
keywords: ["border", "border-radius", "rounded", "rounded-full", "pill", "border-color", "border-width"]
---

# Borders & Radius

## Border presence

These base classes apply a 1px solid border in `currentcolor`. All per-side variants extend `.border` and suppress the other sides.

```
.border          → border: 1px solid currentcolor
.border-t        → border-top: 1px solid currentcolor
.border-r        → border-right: 1px solid currentcolor
.border-b        → border-bottom: 1px solid currentcolor
.border-l        → border-left: 1px solid currentcolor
.border-x        → border-left + border-right (1px solid currentcolor)
.border-y        → border-top + border-bottom (1px solid currentcolor)
```

## Border width

Generated from `$border-sizes`: `2, 3, 4, 6, 8` (px). Applied to `border-width`.

```
.border-{size}   → border-width: {size}px
```

Examples:

```
.border-2        → border-width: 2px
.border-4        → border-width: 4px
.border-8        → border-width: 8px
```

> [!NOTE]
> Width classes set `border-width` only. Combine with a presence class (`.border`, `.border-t`, etc.) to also set `border-style` and `border-color`.

## Border style

Fixed set — no scale. Not responsive.

```
.border-solid    → border-style: solid
.border-dashed   → border-style: dashed
.border-dotted   → border-style: dotted
```

## Remove a border side

Set `border-{side}` to `0`. All six orientations are supported. Also responsive (insert breakpoint name after `border-`).

```
.border-t-0      → border-top: 0
.border-r-0      → border-right: 0
.border-b-0      → border-bottom: 0
.border-l-0      → border-left: 0
.border-x-0      → border-left: 0; border-right: 0
.border-y-0      → border-top: 0; border-bottom: 0
```

## Border colour

Generated from the full colour map (`$colors` + `$palettes` with tonal grades). Prefix `border`, property `border-color`, backed by CSS variables. Responsive.

Pattern: `.border-{color}` / `.border-{color}-{grade}`

**Named colours** (`$colors`):

```
.border-foreground   → border-color: var(--color-foreground)
.border-background   → border-color: var(--color-background)
.border-black        → border-color: var(--color-black)
.border-white        → border-color: var(--color-white)
.border-primary      → border-color: var(--color-primary)
```

**Palette colours** (`$palettes`) — each colour generates grades 100–900 (500 = base):

```
.border-gray-500     → border-color: var(--color-gray-500)
.border-red-300      → border-color: var(--color-red-300)   (lightened)
.border-blue-700     → border-color: var(--color-blue-700)  (darkened)
```

Available palette names: `gray`, `yellow`, `orange`, `red`, `violet`, `purple`, `indigo`, `blue`, `teal`, `green`, `lime`.

Grades: `100` (lightest) → `500` (base) → `900` (darkest).

## Border radius

Generated from `$border-radiuses`: `0, 4, 6, 8, 16, 24, 32` (px names). Prefix `rounded`. Not responsive. Radius only — these classes set `border-radius` and nothing else.

```
.rounded-{size}  → border-radius: {size} in rem  (.rounded-8 → 0.5rem)
```

Examples:

```
.rounded-0       → border-radius: 0
.rounded-4       → border-radius: 0.25rem   (4px)
.rounded-8       → border-radius: 0.5rem    (8px)
.rounded-16      → border-radius: 1rem      (16px)
.rounded-32      → border-radius: 2rem      (32px)
```

Radii convert under [`$rem-units`](../configuration/#feature-flags) — a curve is
antialiased, so the pixel-snapping problem that keeps border *widths* in px does
not apply, and a corner on a box whose padding and text grew should grow with
them. `.rounded-full` stays a literal `9999px` cap; it is a shape, not a step on
the scale.

**Full circle:**

```
.round           → border-radius: 50%
```

**Pill:**

```
.rounded-full    → border-radius: 9999px
```

`.round` is a circle — 50% of *both* axes, so a wide element becomes an ellipse.
`.rounded-full` is a stadium: the radius is capped at half the shorter side, so
the ends stay semicircular at any width. Use it for pills, tags and badges.

### Clipping child content

Rounding an element does **not** clip what's inside it. If a child reaches the
rounded corner — a full-bleed image, a filled swatch — add `.overflow-hidden`:

```html
<div class="rounded-8 overflow-hidden">
  <img src="…" alt="…">
</div>
```

> [!NOTE]
> Up to v2, every `rounded-*` class carried `overflow: hidden` implicitly, via a
> `[class*='rounded-']` selector. That clipped box-shadows, dropdowns and focus
> rings on any element with a radius, and applied even to `.rounded-tl-0`, whose
> only job is to *un*-round a corner. It is gone as of 3.0.0 — clipping is opt-in
> now.

### Per-corner and per-side zero overrides

Hard-coded classes to zero out individual corners or sides. Only `0` is available (no other values).

| Class | CSS |
|---|---|
| `.rounded-tl-0` | `border-top-left-radius: 0` |
| `.rounded-tr-0` | `border-top-right-radius: 0` |
| `.rounded-bl-0` | `border-bottom-left-radius: 0` |
| `.rounded-br-0` | `border-bottom-right-radius: 0` |
| `.rounded-t-0` | `border-top-left-radius: 0; border-top-right-radius: 0` |
| `.rounded-b-0` | `border-bottom-left-radius: 0; border-bottom-right-radius: 0` |
| `.rounded-l-0` | `border-top-left-radius: 0; border-bottom-left-radius: 0` |
| `.rounded-r-0` | `border-top-right-radius: 0; border-bottom-right-radius: 0` |

## Responsive

Border **width** classes are responsive. Insert the breakpoint name between the prefix and the value.

Pattern: `.border-{bp}-{size}`

```
.border-md-4         → border-width: 4px  (min-width: 48rem)
.border-lg-8         → border-width: 8px  (min-width: 64rem)
.border-t-md-0       → border-top: 0      (min-width: 48rem)
```

Border **colour** classes are not responsive — `.border-md-primary` does not exist. See [Color](../color/#colour-does-not-vary-by-breakpoint).

Breakpoints (all min-width):

| Name | Min-width |
|---|---|
| `sm` | 26.25rem (420px) |
| `md` | 48rem (768px) |
| `lg` | 64rem (1024px) |
| `xl` | 85.375rem (1366px) |
| `xxl` | 105rem (1680px) |

> [!NOTE]
> Classes without a breakpoint segment apply at all viewport widths. Responsive variants layer on top via `min-width` media queries.
