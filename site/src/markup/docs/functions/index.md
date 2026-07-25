---
layout: docs
title: Functions & Mixins
navTitle: Functions & Mixins
description: SCSS functions and mixins for unit conversion, color lookups, breakpoints, transitions, and utility-class generation.
order: 14
keywords: ["functions", "mixins", "scss", "toRem", "color", "breakpoint", "transition", "api"]
---

# Functions & Mixins

This is the SCSS-authoring reference for Sulphuris. Everything here is callable from your own stylesheets once you import the relevant partial.

## Importing

```scss
@use "sulphuris/core/utils/helpers" as helpers;
@use "sulphuris/core/utils/generators" as gen;
```

The `utils/index.scss` re-forwards both `fixes` and `generators` (which itself imports `helpers`), so `@use "sulphuris/core/utils"` gives you both.

---

## Unit conversion

### `toRem($value)`

Converts a `px` value to `rem` relative to `config.$base-font-size`. If the value has no `px` unit it is returned unchanged.

```scss
// _config.scss: $base-font-size: 16px
font-size: helpers.toRem(24px); // → 1.5rem
margin:    helpers.toRem(0);    // → 0
```

### `toEm($value, $unit: 'em')`

Same conversion but returns `em` by default. `toRem` delegates to this internally with `$unit: 'rem'`.

```scss
padding: helpers.toEm(8px); // → 0.5em
```

---

## Fluid sizing

### `fluid($min, $max, $min-vw: 420px, $max-vw: 1680px)`

Returns a `clamp()` expression that scales a `px` value linearly with the viewport between `$min-vw` and `$max-vw`, clamped at both ends. px in, rem out.

```scss
font-size: helpers.fluid(16px, 24px);
// → clamp(1rem, 0.8333333333rem + 0.6349206349vw, 1.5rem)
```

---

## Color

### `color($name)`

Returns a CSS custom property reference for a named color. If the name is in `config.$colors` it emits `var(--color-<name>)`; otherwise it falls back to `var(--color-<name>, <name>)` so raw values still work.

```scss
background: helpers.color(primary);   // → var(--color-primary)
border-color: helpers.color(#ff0000); // → var(--color-#ff0000, #ff0000)
```

### `get-color($name, $mode: '')`

Pulls the raw SCSS value from `config.$colors` (or a named color mode map) at compile time. Use when you need the actual value, not a CSS variable reference.

```scss
$brand: helpers.get-color(primary);         // raw value from $colors
$dark:  helpers.get-color(primary, 'dark'); // raw value from $color-modes.dark
```

### `z($name)`

Returns a named stacking level from the `config.$z-layers` map. Warns and returns `auto` for an unknown name.

```scss
z-index: helpers.z(modal); // → 40
```

The map ships as: `base` 0, `dropdown` 10, `sticky` 20, `overlay` 30, `modal` 40, `popover` 50, `toast` 60, `tooltip` 70.

---

## Breakpoints

### `breakpoint($size, $explicit: false)` mixin

Wraps `@content` in a `@media` query built from the configured breakpoint map. Named sizes match your `config.$breakpoints` keys (e.g. `sm`, `md`, `lg`, `xl`, `xxl`).

| `$size`          | `$explicit` | Result |
|------------------|-------------|--------|
| `''`             | `false`     | no media query — content emitted directly |
| `md`             | `false`     | `min-width` only |
| `md`             | `true`      | `min-width` and `max-width` (explicit range) |
| `min` / `minimal`| —           | forces `$size: ''` + `$explicit: true` (smallest range) |

```scss
@include gen.breakpoint(md) {
  .sidebar { display: block; }
}
// → @media only screen and (min-width: 768px) { .sidebar { display: block; } }

@include gen.breakpoint(sm, true) {
  .mobile-only { display: flex; }
}
// → @media only screen and (min-width: 420px) and (max-width: 767px) { ... }

@include gen.breakpoint(min) {
  .tiny { font-size: 12px; }
}
// → @media only screen and (max-width: 419px) { ... }
```

---

## Transitions

### `transition($properties, $durations, $easings)` mixin

Generates a `transition` declaration. All parameters accept a single value or a list (one entry per property). `$durations` and `$easings` default to `config.$default-transition-duration` and `config.$default-transition-easing`. Easing names from `config.$custom-easings` are resolved automatically.

```scss
@include gen.transition(opacity);
// → transition: opacity 250ms cubic-bezier(0.86, 0, 0.07, 1);
// (defaults: 250ms + the 'ease-in-out-quint' custom easing)

@include gen.transition((opacity, transform), (200ms, 400ms), (ease-in, ease-out));
// → transition: opacity 200ms ease-in, transform 400ms ease-out;
```

---

## Selection & form helpers

### `selection($color: primary)` mixin

Sets `::selection` background to the named color (resolved via `color()`).

```scss
@include helpers.selection(accent);
// → ::selection { background: var(--color-accent); }
```

### `placeholder($color)` mixin

Sets placeholder text color via the standard `::placeholder` selector.

```scss
input {
  @include helpers.placeholder(muted);
}
```

---

## String & map helpers

### `str-split($string, $separator)`

Splits a string into a list on each occurrence of `$separator`.

```scss
helpers.str-split('a.b.c', '.'); // → 'a' 'b' 'c'  (list of length 3)
```

### `map-deep-get($map, $keys...)`

Fetches a nested map value by a path of keys.

```scss
helpers.map-deep-get((a: (b: 42)), a, b); // → 42
```

---

## Utility class generator

### `utility-class-generator($pref, $property, $values, $unit, $suff, $orientations, $responsive, $var)` mixin

The engine behind Sulphuris's utility classes. Generates a set of classes for a CSS property across all configured breakpoints. Accepts either positional arguments or a single config map as `$pref`.

**Positional signature:**

| Param | Type | Description |
|---|---|---|
| `$pref` | string or map | Class name prefix (or full config map) |
| `$property` | string | CSS property (e.g. `padding`) |
| `$values` | list or map | Values to iterate |
| `$unit` | string | Unit appended to each value (e.g. `px`, `rem`) |
| `$suff` | string | Optional class name suffix |
| `$orientations` | bool | When `true`, also generates `-top`/`-right`/`-bottom`/`-left` variants using `config.$orientations` |
| `$responsive` | bool | When `true` (default), emits breakpoint-prefixed variants |
| `$var` | bool or string | Use CSS custom properties instead of raw values |

**Example — generate padding utilities:**

```scss
@include gen.utility-class-generator(
  $pref:         'p',
  $property:     'padding',
  $values:       (0, 4, 8, 12, 16, 24, 32),
  $unit:         'px',
  $orientations: true,
  $responsive:   true
);
```

This emits classes like `.p-0`, `.p-8`, `.pt-16`, `.pb-32`, and breakpoint variants `.p-md-8`, `.pt-lg-24`, etc.

**Map form** (equivalent, all keys optional except `prefix`, `property`, `values`):

```scss
@include gen.utility-class-generator((
  prefix:       'p',
  property:     'padding',
  values:       (0, 4, 8, 12, 16, 24, 32),
  unit:         'px',
  orientations: true,
  responsive:   true
));
```

### `grid-track-map($n)`

Returns a map keyed `1…$n` whose values are `repeat(n, minmax(0, 1fr))`. Not a
generator itself — feed it to `utility-class-generator`, which is what emits the
classes and their breakpoint variants.

```scss
@include gen.utility-class-generator('grid-cols', 'grid-template-columns', gen.grid-track-map(4));
// → .grid-cols-1 … .grid-cols-4, plus .grid-cols-sm-1 … .grid-cols-xxl-4
```

`core/layout/_grid.scss` calls it twice, with `config.$columns` and
`config.$rows`, to produce `.grid-cols-*` and `.grid-rows-*`. Overriding those
two config values is enough for the common case; call it directly only for a
third track family with a different count.

### `grid-span-map($n)`

Returns a map keyed `1…$n` plus `full`, whose values are `span n / span n` and
`1 / -1`. Same shape of use — pass it to `utility-class-generator` with
`grid-column` or `grid-row`.

```scss
@include gen.utility-class-generator('grid-column-span', 'grid-column', gen.grid-span-map(4));
// → .grid-column-span-1 … -4, .grid-column-span-full, plus breakpoint variants
```

Both are plain maps, so `map.merge` adds your own keys before generating —
`('screen': '1 / -1')` or a named area — without touching the generator.

See [Grid](../grid/) for the classes themselves.

---

## Browser fixes (`_fixes.scss`)

Two mixins for targeted rendering quirks. Include only where needed.

| Mixin | Effect |
|---|---|
| `animate-scale-fix()` | Prevents jank on `transform: scale()` animations by forcing GPU compositing layer (`backface-visibility: hidden`, `transform-style: preserve-3d`) |
| `clearfix()` | Classic `::after` float-clearing pattern |

```scss
.card {
  @include gen.animate-scale-fix();
}
```

`clearfix()` no longer backs a `.clearfix` class — the float, clear and clearfix
utilities were dropped in 3.0.0. The mixin stays for the case it is still good
for: clearing a float you set yourself, in your own CSS. Sulphuris emits no
floats.

---

## Normalize (`_normalize.scss`)

A verbatim copy of [normalize.css v8.0.1](https://github.com/necolas/normalize.css) (MIT). Included automatically when you import the Sulphuris core. It corrects browser inconsistencies without stripping all defaults — box model, font inheritance for form controls, `display: block` for `main`/`details`, sub/sup line-height, and more. No configuration; just let it load.
