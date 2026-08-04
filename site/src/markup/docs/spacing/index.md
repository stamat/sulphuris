---
layout: poops-docs-theme/docs
title: Spacing
navTitle: Spacing
description: Margin and padding utility classes generated from the $sizes scale, with per-side, axis, and responsive variants.
order: 3
keywords: ["margin", "padding", "spacing", "gap", "m", "p", "mt", "px"]
---

# Spacing

Margin and padding utilities are generated from the `$sizes` scale. Both support per-side and axis shorthands across all breakpoints. Margin additionally includes negative values and `auto`.

## Scale

<!-- config: sizes -->

```scss
// src/core/_config.scss:27
$sizes: 0,1,2,3,4,6,8,12,14,16,24,32,40,48,56,64,80,96,128,256;
```

## Margin

Prefix: `m`. Property: `margin`.

<!-- generators: m -->

```scss
// src/core/layout/_margin.scss:14
@include generators.utility-class-generator((
  prefix: 'm',
  property: 'margin',
  values: $margin-sizes,
  unit: 'px',
  orientations: config.$orientations
));
```

**All sides**

```
.m-{size}          → margin: {size} in rem  (.m-16 → 1rem)
.m-auto            → margin: auto
```

**Per side / axis**

| Class pattern | CSS property                   |
| ------------- | ------------------------------ |
| `.mt-{size}`  | `margin-top`                   |
| `.mr-{size}`  | `margin-right`                 |
| `.mb-{size}`  | `margin-bottom`                |
| `.ml-{size}`  | `margin-left`                  |
| `.mx-{size}`  | `margin-left` + `margin-right` |
| `.my-{size}`  | `margin-top` + `margin-bottom` |

Per-side variants also accept `auto`: `.mt-auto`, `.mx-auto`, etc.

**Negatives**

<!-- config: negative-sizes -->

```scss
// src/core/_config.scss:28
$negative-sizes: -1,-2,-3,-4,-8,-12,-14,-16,-24,-32,-40,-48,-56,-64;
```

The leading `-` in the key becomes a second dash in the class name.

```
.m--32             → margin: -2rem
.mt--16            → margin-top: -1rem
.mx--8             → margin-left: -0.5rem; margin-right: -0.5rem
```

## Padding

Prefix: `p`. Property: `padding`. Same `$sizes` scale. No negatives, no `auto`.

**All sides**

```
.p-{size}          → padding: {size} in rem  (.p-16 → 1rem)
```

**Per side / axis**

| Class pattern | CSS property                     |
| ------------- | -------------------------------- |
| `.pt-{size}`  | `padding-top`                    |
| `.pr-{size}`  | `padding-right`                  |
| `.pb-{size}`  | `padding-bottom`                 |
| `.pl-{size}`  | `padding-left`                   |
| `.px-{size}`  | `padding-left` + `padding-right` |
| `.py-{size}`  | `padding-top` + `padding-bottom` |

## Gap

Prefix: `gap`. Generated from the `$sizes` scale. Responsive.

| Class pattern   | CSS property |
| --------------- | ------------ |
| `.gap-{size}`   | `gap`        |
| `.gap-x-{size}` | `column-gap` |
| `.gap-y-{size}` | `row-gap`    |

```
.gap-16            → gap: 1rem
.gap-x-8           → column-gap: 0.5rem
.gap-y-24          → row-gap: 1.5rem
.gap-md-16         → gap: 1rem  (min-width: 48rem)
```

## Size aliases — opt-in

T-shirt names for steps of `$sizes`, added to margin, padding and gap only. An
alias is a second name for a step that already exists, so `.pt-sm` and `.pt-8`
are the same rule and the px names keep working. Responsive like the rest.

**Off by default.** Name the steps you want with [`$size-aliases`](../configuration/#size-aliases-opt-in):

```scss
@forward 'sulphuris/core/config' with (
  $size-aliases: ('xs': 4, 'sm': 8, 'md': 16, 'lg': 32, 'xl': 64, 'xxl': 96)
);
```

```
.p-md              → padding: 1rem      (same rule as .p-16)
.mx-lg             → margin-left: 2rem; margin-right: 2rem
.gap-sm            → gap: 0.5rem
.p-md-lg           → padding: 2rem      (min-width: 48rem)
```

The alias names overlap the breakpoint names, which is why the last one reads the
way it does: breakpoint first, value second, as everywhere else.

> [!NOTE]
> There are no numeric aliases. `.pt-2` is `padding-top: 2px` here and 8px in
> Bootstrap and Tailwind — one class name meaning three paddings is exactly what
> the px names avoid.

## Logical spacing (RTL-aware) — opt-in

The `x`/`y` axis shorthands above map to physical sides (left/right, top/bottom). The logical variants below map to **writing-direction-aware** sides, so they flip automatically under RTL. Same scales as margin/padding. Responsive.

**Off by default.** Turn them on with [`$logical-properties`](../configuration/#feature-flags):

```scss
@forward 'sulphuris/core/config' with ($logical-properties: true);
```

| Class pattern      | CSS property     |
| ------------------ | ---------------- |
| `.m-inline-{size}` | `margin-inline`  |
| `.m-block-{size}`  | `margin-block`   |
| `.p-inline-{size}` | `padding-inline` |
| `.p-block-{size}`  | `padding-block`  |

```
.m-inline-16       → margin-inline: 1rem
.p-block-24        → padding-block: 1.5rem
.m-inline-md-16    → margin-inline: 1rem  (min-width: 48rem)
```

Positioning has the same pair — `.inset-inline-{size}` / `.inset-block-{size}`, documented under [Position](/docs/position/).

## Quick reference

```
.pt-16             → padding-top: 1rem
.pb-0              → padding-bottom: 0
.px-24             → padding-left: 1.5rem; padding-right: 1.5rem
.py-8              → padding-top: 0.5rem; padding-bottom: 0.5rem
.m-32              → margin: 2rem
.mt--32            → margin-top: -2rem
.mx-auto           → margin-left: auto; margin-right: auto
```

## Responsive

Insert a breakpoint name between the prefix+orientation and the size value.

```
.p-md-24           → padding: 1.5rem  (min-width: 48rem)
.mt-lg-48          → margin-top: 3rem  (min-width: 64rem)
.mx-xl-auto        → margin-left/right: auto  (min-width: 85.375rem)
```

Breakpoints (all min-width):

| Name  | Min-width |
| ----- | --------- |
| `sm`  | 26.25rem (420px)     |
| `md`  | 48rem (768px)     |
| `lg`  | 64rem (1024px)    |
| `xl`  | 85.375rem (1366px)    |
| `xxl` | 105rem (1680px)    |

> [!NOTE]
> Classes without a breakpoint segment apply at all viewport widths. Responsive variants layer on top via `min-width` media queries, so the base class is the mobile-first default.
