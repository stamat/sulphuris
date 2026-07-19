---
layout: docs
title: Spacing
navTitle: Spacing
description: Margin and padding utility classes generated from the $sizes scale, with per-side, axis, and responsive variants.
order: 3
keywords: ["margin", "padding", "spacing", "gap", "m", "p", "mt", "px"]
---

# Spacing

Margin and padding utilities are generated from the `$sizes` scale. Both support per-side and axis shorthands across all breakpoints. Margin additionally includes negative values and `auto`.

## Scale

`$sizes`: `0, 1, 2, 3, 4, 6, 8, 12, 14, 16, 24, 32, 40, 48, 56, 64, 80, 96, 128, 256` (px)

## Margin

Prefix: `m`. Property: `margin`.

**All sides**

```
.m-{size}          → margin: {size}px
.m-auto            → margin: auto
```

**Per side / axis**

| Class pattern | CSS property |
|---|---|
| `.mt-{size}` | `margin-top` |
| `.mr-{size}` | `margin-right` |
| `.mb-{size}` | `margin-bottom` |
| `.ml-{size}` | `margin-left` |
| `.mx-{size}` | `margin-left` + `margin-right` |
| `.my-{size}` | `margin-top` + `margin-bottom` |

Per-side variants also accept `auto`: `.mt-auto`, `.mx-auto`, etc.

**Negatives**

Negative scale: `-1, -2, -3, -4, -8, -12, -14, -16, -24, -32, -40, -48, -56, -64` (px). The leading `-` in the key becomes a second dash in the class name.

```
.m--32             → margin: -32px
.mt--16            → margin-top: -16px
.mx--8             → margin-left: -8px; margin-right: -8px
```

## Padding

Prefix: `p`. Property: `padding`. Same `$sizes` scale. No negatives, no `auto`.

**All sides**

```
.p-{size}          → padding: {size}px
```

**Per side / axis**

| Class pattern | CSS property |
|---|---|
| `.pt-{size}` | `padding-top` |
| `.pr-{size}` | `padding-right` |
| `.pb-{size}` | `padding-bottom` |
| `.pl-{size}` | `padding-left` |
| `.px-{size}` | `padding-left` + `padding-right` |
| `.py-{size}` | `padding-top` + `padding-bottom` |

## Quick reference

```
.pt-16             → padding-top: 16px
.pb-0              → padding-bottom: 0px
.px-24             → padding-left: 24px; padding-right: 24px
.py-8              → padding-top: 8px; padding-bottom: 8px
.m-32              → margin: 32px
.mt--32            → margin-top: -32px
.mx-auto           → margin-left: auto; margin-right: auto
```

## Responsive

Insert a breakpoint name between the prefix+orientation and the size value.

```
.p-md-24           → padding: 24px  (min-width: 768px)
.mt-lg-48          → margin-top: 48px  (min-width: 1024px)
.mx-xl-auto        → margin-left/right: auto  (min-width: 1366px)
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
