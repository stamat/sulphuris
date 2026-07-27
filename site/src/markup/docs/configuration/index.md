---
layout: docs
title: Configuration
navTitle: Configuration
description: Every Sulphuris utility is generated from the variables in core/_config.scss. This is the full reference of those variables and their defaults.
order: 2
keywords:
  [
    "config",
    "configuration",
    "variables",
    "sizes",
    "breakpoints",
    "colors",
    "override",
    "defaults",
  ]
---

# Configuration

Sulphuris generates almost every class from the variables in
[`core/_config.scss`](https://github.com/stamat/sulphuris/blob/main/src/core/_config.scss).
Change a value there — or, in your own project, override it with
`@forward "sulphuris/core/config" with (…)` (see
[Getting Started](../getting-started/)) — rebuild, and the utility set adapts.

Every variable below is declared with `!default`, so you only override the ones
you care about.

## Feature flags

One family is off by default because it multiplies out into thousands of rules
for a narrow win. Flip it to `true` to get it back — nothing else in the API
moves.

<!-- config: logical-properties -->

```scss
// src/core/_config.scss:7
$logical-properties: false;
```

`$logical-properties: true` adds the writing-direction-aware pairs:
`.m-inline-*`, `.m-block-*`, `.p-inline-*`, `.p-block-*`, `.inset-inline-*`,
`.inset-block-*`. Turn it on for RTL or vertical-writing layouts; the physical
`.mx-*` / `.px-*` / `.t-*` families cover everything else.

## Sizes

Spacing utilities (margin, padding, `top`/`right`/…, gaps) are generated from
these lists. Values are unitless numbers; the emitting utility appends the unit
(`px` for spacing, `%` where noted).

<!-- config: sizes, negative-sizes, percent-sizes, negative-percent-sizes, viewport-sizes, z-index, border-sizes, border-radiuses -->

```scss
// src/core/_config.scss:12
$sizes:          0,1,2,3,4,6,8,12,14,16,24,32,40,48,56,64,80,96,128,256;
$negative-sizes: -1,-2,-3,-4,-8,-12,-14,-16,-24,-32,-40,-48,-56,-64;
$percent-sizes:  5,10,15,20,25,50,75,100;

// src/core/_config.scss:20
$negative-percent-sizes: -25,-50,-75,-100;

// src/core/_config.scss:24
$viewport-sizes: 25,50,75,100;

// src/core/_config.scss:28
$z-index: -1,0,1,2,10,20,50,100;

// src/core/_config.scss:48
$border-sizes:    2,3,4,6,8;
$border-radiuses: 0,4,6,8,16,24,32;
```

A negative value renders as a double dash in the class name: `-32` → `.mt--32`
(`margin-top: -32px`).

## Z-layers

Named stacking levels resolved by the `z()` helper (see
[Functions & Mixins](../functions/)). Separate from the numeric `$z-index`
scale used by the `.z-*` utility classes.

<!-- config: z-layers -->

```scss
// src/core/_config.scss:34
$z-layers: (
  // Decorative pseudo-elements sitting under their own content. One negative
  // level is enough — a second means the stacking context is wrong.
  'behind': -1,
  'base': 0,
  'dropdown': 10,
  'sticky': 20,
  'overlay': 30,
  'modal': 40,
  'popover': 50,
  'toast': 60,
  'tooltip': 70
);
```

## Orientations

The per-side suffixes shared by margin, padding, border, position, etc.

<!-- config: orientations -->

```scss
// src/core/_config.scss:54
$orientations: (
  't': ('top'),
  'r': ('right'),
  'b': ('bottom'),
  'l': ('left'),
  'x': ('right', 'left'),
  'y': ('top', 'bottom')
);
```

So `.pt-16` is `padding-top: 16px`, `.px-16` sets left **and** right, `.my-24`
sets top and bottom margin.

## Breakpoints

Responsive variants are min-width and derived from this map. Add or remove keys
freely — the class variants follow.

<!-- config: breakpoints -->

```scss
// src/core/_config.scss:66
$breakpoints: (
  'xxl': 1680px,
  'xl': 1366px,
  'lg': 1024px,
  'md': 768px,
  'sm': 420px
);
```

Internally the map is expanded into min/max ranges, and the base (`''`) range
covers everything below the smallest breakpoint. A utility variant like
`.d-md-none` applies from `md` upward.

## Container & grid

<!-- config: container-max-width, container-offset, container-offset-mobile, container-breakpoint, grid-gutter, grid-gutter-mobile, columns, rows -->

```scss
// src/core/_config.scss:77
$container-max-width:     1680px;
$container-offset:        56px;
$container-offset-mobile: 16px;
$container-breakpoint:    'lg';

// src/core/_config.scss:82
$grid-gutter:        32px;
$grid-gutter-mobile: 16px;
$columns:            12;

// src/core/_config.scss:89
$rows: 6;
```

`$container-offset` / `$container-offset-mobile` are the horizontal gutters,
switching at `$container-breakpoint`. `$columns` is the grid column count
(`.col-1` … `.col-12`), `$rows` the native grid row count (`.grid-rows-1` … `-6`).

Change `$columns` and the whole `.col-*` / `.col-offset-*` set regenerates, along with `.grid-cols-*` and `.grid-column-span-*`.

`$rows` only drives the native grid — `.grid-rows-*` and `.grid-row-span-*`. It is deliberately smaller than `$columns`: `grid-template-rows` only does visible work on a container with a definite height, so deep row templates are rare. Raise it if a layout needs them.

## Colours

Two maps. `$colors` are the named, semantic colours emitted as CSS custom
properties (`--color-primary`) and used by `.text-*` / `.bg-*`. `$palettes` are
expanded into 100–900 tint/shade scales.

<!-- config: colors, palettes -->

```scss
// src/core/_config.scss:94
$colors: (
  foreground: #1a1a1d,
  background: #fff,
  black: #1a1a1d,
  white: #fff,
  primary: #f6c026
);

// src/core/_config.scss:102
$palettes: (
  gray: #8c8c8e,
  yellow: #f6c026,
  orange: #f4912a,
  red: #e41328,
  violet: #752a6f,
  purple: #472573,
  indigo: #3f00ff,
  blue: #0f4eb3,
  teal: #00a4a4,
  green: #10af2e,
  lime: #a4c400,
);
```

Each palette entry generates `.text-gray-100` … `.text-gray-900` (and matching
`.bg-*`), with `-500` being the base colour. See [Colours](../color/).

### Colour modes (dark mode)

<!-- config: color-modes-selector, color-modes -->

```scss
// src/core/_config.scss:116
$color-modes-selector: '[data-color-scheme="VALUE"]';
$color-modes: (
  dark: (
    colors: (
      foreground: #fff,
      background: #1a1a1d,
      black: #1a1a1d,
      white: #fff,
      primary: #3f00ff
    )
    // palettes: ( ... )
  )
);
```

Each mode re-emits the colour custom properties under its selector — e.g.
`[data-color-scheme="dark"]` — so toggling the attribute on `<html>` switches the
palette. `VALUE` in `$color-modes-selector` is replaced with the mode name.

## Typography

<!-- config: base-font-size, heading-font, paragraph-font, mono-font, line-height, heading-line-height, paragraph-line-height, line-clamps -->

```scss
// src/core/_config.scss:140
$base-font-size: 16px;

// src/core/_config.scss:142
$heading-font:          'Roboto', sans-serif;
$paragraph-font:        'Nunito', sans-serif;
$mono-font:             monospace;
$line-height:           1.2;
$heading-line-height:   1;
$paragraph-line-height: 1.5;

// src/core/_config.scss:150
$line-clamps: 1,2,3,4,5,6;
```

`$base-font-size` is the `1rem` reference; `$line-clamps` the line counts behind
the `.line-clamp-*` family.

The `$typography` map defines the type scale — every heading and paragraph
class. Each entry is
`(font-size, letter-spacing, line-height, font-weight, text-transform)`, and
headings may carry separate `desktop` / `mobile` values that switch at
`$container-breakpoint`:

<!-- config: typography -->

```scss
// src/core/_config.scss:157
$typography: (
  'h1, .h1': (
    desktop: (96px, -1.5px, $heading-line-height, bold),
    mobile: (64px, -0.5px, $heading-line-height, bold)
  ),
  'h2, .h2': (
    desktop: (64px, -0.5px, $heading-line-height, bold),
    mobile: (48px, 0, $heading-line-height, bold)
  ),
  'h3, .h3': (
    desktop: (48px, 0, $heading-line-height, bold),
    mobile: (32px, 0.25px, $heading-line-height, bold)
  ),
  'h4, .h4': (
    desktop: (32px, 0.25px, $heading-line-height, bold),
    mobile: (24px, 0, $heading-line-height, bold)
  ),
  'h5, .h5': (
    desktop: (24px, 0, $heading-line-height, bold),
    mobile: (20px, 0.15px, $heading-line-height, bold)
  ),
  'h6, .h6': (
    desktop: (20px, 0.15px, $heading-line-height, bold),
    mobile: (16px, 0.15px, $heading-line-height, bold)
  ),
  '.p1': (24px, 0.3px, $paragraph-line-height),
  '.p2': (20px, 0.2px, $paragraph-line-height),
  'p': ($base-font-size, 0.2px, $paragraph-line-height),
  '.p3, figcaption': (14px, 0.4px, $paragraph-line-height),
  '.p4, small': (12px, 0.6px, $paragraph-line-height),
  '.supertitle': (14px, 2px, $paragraph-line-height, 500, uppercase)
);
```

Font sizes are output in `rem` (relative to `$base-font-size`); everything else
in the config uses pixels. See [Typography](../typography/).

## Transitions & easings

<!-- config: custom-easings, default-transition-duration, default-transition-easing -->

```scss
// src/core/_config.scss:190
$custom-easings: (
  'ease-in-out-quint': cubic-bezier(0.86, 0, 0.07, 1)
);

// src/core/_config.scss:194
$default-transition-duration: 250ms;
$default-transition-easing:   'ease-in-out-quint';
```

Used by the `transition()` mixin. See [Effects](../effects/).

## Shadows

<!-- config: shadows -->

```scss
// src/core/_config.scss:200
$shadows: (
  'sm': 0 1px 2px rgb(0 0 0 / 5%),
  'md': 0 4px 6px -1px rgb(0 0 0 / 10%),
  'lg': 0 10px 15px -3px rgb(0 0 0 / 10%),
  'xl': 0 20px 25px -5px rgb(0 0 0 / 10%),
  'none': none
);
```

Map keys become class names: `.shadow-sm` … `.shadow-none`. Add a key, get a
class. See [Effects](../effects/).

## Button

The single button primitive (`.btn`) is sized from this map:

<!-- config: button -->

```scss
// src/core/_config.scss:208
$button: (
  height: 56px,
  padding-x: 32px,
  padding-y: 16px,
  border-width: 2px,
  border-radius: 4px
);
```

See [Buttons](../buttons/).
