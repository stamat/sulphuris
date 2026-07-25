---
layout: docs
title: Effects
navTitle: Effects
description: Utility classes for box shadows, CSS filters and z-index, plus a SCSS transition mixin backed by configurable custom easings.
order: 13
keywords: ["shadow", "box-shadow", "filter", "blur", "opacity", "z-index", "transition", "easing"]
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

Generated from `$z-index: -1, 0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 100`.

| Class | CSS |
|---|---|
| `.z--1` | `z-index: -1` |
| `.z-0` | `z-index: 0` |
| `.z-1` | `z-index: 1` |
| `.z-2` | `z-index: 2` |
| `.z-3` | `z-index: 3` |
| `.z-4` | `z-index: 4` |
| `.z-5` | `z-index: 5` |
| `.z-10` | `z-index: 10` |
| `.z-15` | `z-index: 15` |
| `.z-20` | `z-index: 20` |
| `.z-25` | `z-index: 25` |
| `.z-50` | `z-index: 50` |
| `.z-100` | `z-index: 100` |

Responsive pattern: `.z-{bp}-{value}`

```
.z-md-10   → z-index: 10  (min-width: 768px)
.z-lg-50   → z-index: 50  (min-width: 1024px)
```

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
