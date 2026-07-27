---
layout: docs
title: Effects
navTitle: Effects
description: Utility classes for box shadows, CSS filters, z-index and transforms, plus a SCSS transition mixin backed by configurable custom easings.
order: 13
keywords: ["shadow", "box-shadow", "filter", "blur", "opacity", "z-index", "transition", "easing", "transform", "translate", "rotate", "scale"]
---

# Effects

## Box shadow

Prefix: `shadow`. Property: `box-shadow`. Not responsive.

Generated from the `$shadows` map in `_config.scss`.

| Class | CSS |
|---|---|
| `.shadow-sm` | `box-shadow: 0 1px 2px rgb(0 0 0 / 5%)` |
| `.shadow-md` | `box-shadow: 0 4px 6px -1px rgb(0 0 0 / 10%)` |
| `.shadow-lg` | `box-shadow: 0 10px 15px -3px rgb(0 0 0 / 10%)` |
| `.shadow-xl` | `box-shadow: 0 20px 25px -5px rgb(0 0 0 / 10%)` |
| `.shadow-none` | `box-shadow: none` |

Override or extend the scale in your config — the class names follow the map keys:

```scss
$shadows: (
  'sm': 0 1px 2px rgb(0 0 0 / 5%),
  'md': 0 4px 6px -1px rgb(0 0 0 / 10%),
  'lg': 0 10px 15px -3px rgb(0 0 0 / 10%),
  'xl': 0 20px 25px -5px rgb(0 0 0 / 10%),
  'inner': inset 0 2px 4px rgb(0 0 0 / 5%),
  'none': none
);
// → adds .shadow-inner
```

Safe to pair with `.rounded-*` — since `3.0.0` those classes no longer set `overflow: hidden`, so shadows are not clipped on rounded elements.

## Filter

Prefix: `filter`. Property: `filter`. Not responsive.

| Class | CSS |
|---|---|
| `.filter-invert` | `filter: invert(1)` |

## Opacity

Prefix: `opacity`. Property: `opacity`. Not responsive.

| Class | CSS |
|---|---|
| `.opacity-0` | `opacity: 0` |
| `.opacity-25` | `opacity: 0.25` |
| `.opacity-50` | `opacity: 0.5` |
| `.opacity-75` | `opacity: 0.75` |
| `.opacity-100` | `opacity: 1` |

## Cursor

Prefix: `cursor`. Property: `cursor`. Not responsive.

| Class | CSS |
|---|---|
| `.cursor-auto` | `cursor: auto` |
| `.cursor-default` | `cursor: default` |
| `.cursor-pointer` | `cursor: pointer` |
| `.cursor-wait` | `cursor: wait` |
| `.cursor-text` | `cursor: text` |
| `.cursor-move` | `cursor: move` |
| `.cursor-grab` | `cursor: grab` |
| `.cursor-grabbing` | `cursor: grabbing` |
| `.cursor-not-allowed` | `cursor: not-allowed` |
| `.cursor-help` | `cursor: help` |
| `.cursor-progress` | `cursor: progress` |
| `.cursor-none` | `cursor: none` |

## Z-index

Prefix: `z`. Property: `z-index`. Responsive.

Generated from `$z-index: -1, 0, 1, 2, 10, 20, 50, 100`.

| Class | CSS |
|---|---|
| `.z--1` | `z-index: -1` |
| `.z-0` | `z-index: 0` |
| `.z-1` | `z-index: 1` |
| `.z-2` | `z-index: 2` |
| `.z-10` | `z-index: 10` |
| `.z-20` | `z-index: 20` |
| `.z-50` | `z-index: 50` |
| `.z-100` | `z-index: 100` |

For named stacking (`behind`, `dropdown`, `modal`, …) use the
[`z()` helper](../functions/) with `$z-layers` instead of a magic number.

Responsive pattern: `.z-{bp}-{value}`

```
.z-md-10   → z-index: 10  (min-width: 768px)
.z-lg-50   → z-index: 50  (min-width: 1024px)
```

## Transform

Prefixes: `translate-x`, `translate-y`, `scale`, `rotate`. Responsive.

These emit the **standalone** `translate` / `rotate` / `scale` properties, not
the `transform` shorthand. That is the whole point: they are three separate
properties, so `.rotate-45 .scale-110` keeps both. A `transform`-based family
would have the second class silently overwrite the first.

| Class | CSS |
|---|---|
| `.translate-x--100` … `.translate-x-100` | `translate: -100%` … `translate: 100%` |
| `.translate-y--100` … `.translate-y-100` | `translate: 0 -100%` … `translate: 0 100%` |
| `.scale-0` | `scale: 0` |
| `.scale-50` / `.scale-75` / `.scale-100` | `scale: 0.5` / `0.75` / `1` |
| `.scale-110` / `.scale-125` / `.scale-150` | `scale: 1.1` / `1.25` / `1.5` |
| `.rotate--180` … `.rotate-180` | `rotate: -180deg` … `rotate: 180deg` |

Translate steps are `-100, -50, 0, 50, 100` (percent of the element's own box)
on each axis; rotate steps are `-180, -90, -45, 0, 45, 90, 180`. Coarse on
purpose — a transform step is a design decision, not a spectrum, and every value
costs six rules once responsive variants are counted.

```html
<!-- composes: both apply -->
<div class="rotate-45 scale-110">…</div>
```

> [!WARNING]
> `translate` is **one** property covering both axes, so `.translate-x-50` and
> `.translate-y-50` on the same element is last-wins, not a sum. For the
> `-50%/-50%` centering case use `.absolute-center`; for anything else, write a
> selector.

Individual transform properties apply **before** `transform`, so stacking
`.rotate-45` onto `.absolute-center` (which uses `transform: translate3d(…)`)
works — the element rotates, then gets centered.

## Transition classes

Ready-made utility classes. Not responsive. Each uses the default 250ms duration and `ease-in-out-quint` easing from the transition mixin below.

| Class | CSS |
|---|---|
| `.transition` | `transition: all …` |
| `.transition-colors` | `transition: color, background-color, border-color …` |
| `.transition-transform` | `transition: transform …` |
| `.transition-opacity` | `transition: opacity …` |
| `.transition-none` | `transition: none` |

All four animating classes are wrapped in `@media (prefers-reduced-motion: no-preference)`, so they emit nothing for visitors whose system asks for reduced motion. `.transition-none` sits outside the query and always applies — turning motion off is safe regardless of the preference.

These complement the SCSS `transition` mixin documented below.

> [!NOTE]
> The `transition` mixin itself is **not** gated — it emits a bare `transition` declaration wherever you include it. If you use it directly, add your own `prefers-reduced-motion` query, the way `.btn` does in `src/core/style/_button.scss`.

## Transition mixin (SCSS API)

Defined in `src/core/utils/_generators.scss`. Use in your own SCSS — no utility class is emitted.

```scss
@use 'sulphuris/core/utils/generators';

.my-element {
  @include generators.transition(opacity);
}
// → transition: opacity 250ms cubic-bezier(0.86, 0, 0.07, 1)
```

**Signature**

```scss
@mixin transition(
  $properties,                                    // string or space-separated list
  $durations: config.$default-transition-duration, // default: 250ms
  $easings:   config.$default-transition-easing    // default: 'ease-in-out-quint'
)
```

Multiple properties with per-property duration and easing:

```scss
@include generators.transition(
  (opacity, transform),
  (200ms, 300ms),
  ('ease-in-out-quint', ease-out)
);
// → transition: opacity 200ms cubic-bezier(0.86, 0, 0.07, 1), transform 300ms ease-out
```

### Custom easings

Defined in `$custom-easings` in `_config.scss`. Pass the name as a string; `get-transition-fn` resolves it to the `cubic-bezier` value.

| Name | Value |
|---|---|
| `'ease-in-out-quint'` | `cubic-bezier(0.86, 0, 0.07, 1)` |

Any standard CSS easing keyword (`ease`, `ease-in`, `ease-out`, `linear`, etc.) passes through unchanged.

Override defaults in your config:

```scss
$default-transition-duration: 200ms;
$default-transition-easing: ease-out;
```
