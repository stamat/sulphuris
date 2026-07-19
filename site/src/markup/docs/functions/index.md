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

Sets placeholder text color across all vendor prefixes (`::placeholder`, `:-ms-input-placeholder`, etc.).

```scss
input {
  @include helpers.placeholder(muted);
}
```

---

## Background & icon image helpers

### `bg-image($filename, $ext: png)` mixin

Sets `background-image` to `config.$image_dir + filename + .ext`.

```scss
.hero { @include helpers.bg-image('hero-bg'); }
// → background-image: url('/images/hero-bg.png');
```

### `bg-image-retina($filename, $ext: png)` mixin

Same as `bg-image` but also adds a high-DPI media query that swaps in a `@2x` variant.

```scss
.logo { @include helpers.bg-image-retina('logo'); }
```

### `icon($filename, $w, $h, $ext: png)` mixin

Renders an inline icon via `background-image`. Sets `width`, `height`, `background-size`, `display: inline-block`, `vertical-align: middle`, and centers the image.

```scss
.icon-close { @include helpers.icon('close', 16px, 16px); }
```

### `icon-retina($filename, $w, $h, $ext: png)` mixin

Same as `icon` but swaps in a `@2x` file on high-DPI displays.

```scss
.icon-close { @include helpers.icon-retina('close', 16px, 16px); }
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

---

## Browser fixes (`_fixes.scss`)

Three mixins for targeted rendering quirks. Include only where needed.

| Mixin | Effect |
|---|---|
| `rounded-container-fix()` | Fixes `overflow: hidden` clipping with `border-radius` in WebKit via `-webkit-mask-image` |
| `animate-scale-fix()` | Prevents jank on `transform: scale()` animations by forcing GPU compositing layer (`backface-visibility: hidden`, `transform-style: preserve-3d`) |
| `clearfix()` | Classic `::after` float-clearing pattern |

```scss
.card {
  @include gen.rounded-container-fix();
}
```

---

## Normalize (`_normalize.scss`)

A verbatim copy of [normalize.css v8.0.1](https://github.com/necolas/normalize.css) (MIT). Included automatically when you import the Sulphuris core. It corrects browser inconsistencies without stripping all defaults — box model, font inheritance for form controls, `display: block` for `main`/`details`, sub/sup line-height, and more. No configuration; just let it load.
