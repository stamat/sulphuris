---
layout: docs
title: Borders & Radius
navTitle: Borders & Radius
description: Utility classes for border width, border style, border colour, and border radius — including per-side shorthands and responsive variants.
order: 11
keywords: ["border", "border-radius", "rounded", "border-color", "border-width"]
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

Generated from `$border-radiuses`: `0, 4, 6, 8, 16, 24, 32` (px). Prefix `rounded`. Not responsive. All `.rounded-*` elements get `overflow: hidden` applied automatically.

```
.rounded-{size}  → border-radius: {size}px
```

Examples:

```
.rounded-0       → border-radius: 0
.rounded-4       → border-radius: 4px
.rounded-8       → border-radius: 8px
.rounded-16      → border-radius: 16px
.rounded-32      → border-radius: 32px
```

**Full circle:**

```
.round           → border-radius: 50%; overflow: hidden
```

> [!WARNING]
> Every `rounded-*` class also sets `overflow: hidden`, via a
> `[class*='rounded-']` selector. That clips box-shadows, dropdowns, tooltips
> and focus rings on any element with a radius — including `.rounded-tl-0`,
> whose only job is to *un*-round a corner. There is no opt-out short of
> `overflow: visible !important` on the element.

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

Border width and border colour classes are responsive. Insert the breakpoint name between the prefix and the value.

Pattern: `.border-{bp}-{size}` / `.border-{color}-{grade}` at breakpoint via `.border-{bp}-{color}`

```
.border-md-4         → border-width: 4px  (min-width: 768px)
.border-lg-8         → border-width: 8px  (min-width: 1024px)
.border-t-md-0       → border-top: 0      (min-width: 768px)
.border-md-primary   → border-color: var(--color-primary)  (min-width: 768px)
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
> Classes without a breakpoint segment apply at all viewport widths. Responsive variants layer on top via `min-width` media queries.
