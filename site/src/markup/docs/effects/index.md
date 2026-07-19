---
layout: docs
title: Effects
navTitle: Effects
description: Utility classes for CSS filters and z-index, plus a SCSS transition mixin backed by configurable custom easings.
order: 13
keywords: ["filter", "blur", "opacity", "z-index", "transition", "easing"]
---

# Effects

## Filter

Prefix: `filter`. Property: `filter`. Not responsive.

| Class | CSS |
|---|---|
| `.filter-invert` | `filter: invert(1)` |

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
