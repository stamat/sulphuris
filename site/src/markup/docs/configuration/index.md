---
layout: docs
title: Configuration
navTitle: Configuration
description: Every Sulphuris utility is generated from the variables in core/_config.scss. This is the full reference of those variables and their defaults.
order: 2
keywords: ["config", "configuration", "variables", "sizes", "breakpoints", "colors", "override", "defaults"]
---

# Configuration

Sulphuris generates almost every class from the variables in
[`core/_config.scss`](https://github.com/sulphuris/sulphuris/blob/main/src/core/_config.scss).
Change a value there — or, in your own project, override it with
`@forward "sulphuris/core/config" with (…)` (see
[Getting Started](../getting-started/)) — rebuild, and the utility set adapts.

Every variable below is declared with `!default`, so you only override the ones
you care about.

## Sizes

Spacing utilities (margin, padding, `top`/`right`/…, gaps) are generated from
these lists. Values are unitless numbers; the emitting utility appends the unit
(`px` for spacing, `%` where noted).

```scss
$sizes:                  0,1,2,3,4,6,8,12,14,16,24,32,40,48,56,64,80,96,128,256;
$negative-sizes:         -1,-2,-3,-4,-8,-12,-14,-16,-24,-32,-40,-48,-56,-64;
$percent-sizes:          5,10,15,20,25,50,75,100;
$negative-percent-sizes: -5,-10,-15,-20,-25,-50,-75,-100;
$z-index:                -1,0,1,2,3,4,5,10,15,20,25,50,100;

$border-sizes:           2,3,4,6,8;
$border-radiuses:        0,4,6,8,16,24,32;
```

A negative value renders as a double dash in the class name: `-32` → `.mt--32`
(`margin-top: -32px`).

## Z-layers

Named stacking levels resolved by the `z()` helper (see
[Functions & Mixins](../functions/)). Separate from the numeric `$z-index`
scale used by the `.z-*` utility classes.

```scss
$z-layers: (
  base:     0,
  dropdown: 10,
  sticky:   20,
  overlay:  30,
  modal:    40,
  popover:  50,
  toast:    60,
  tooltip:  70
);
```

## Orientations

The per-side suffixes shared by margin, padding, border, position, etc.

```scss
$orientations: (
  't': ('top'),
  'r': ('right'),
  'b': ('bottom'),
  'l': ('left'),
  'x': ('right', 'left'),   // horizontal
  'y': ('top', 'bottom')    // vertical
);
```

So `.pt-16` is `padding-top: 16px`, `.px-16` sets left **and** right, `.my-24`
sets top and bottom margin.

## Breakpoints

Responsive variants are min-width and derived from this map. Add or remove keys
freely — the class variants follow.

```scss
$breakpoints: (
  'xxl': 1680px,
  'xl':  1366px,
  'lg':  1024px,
  'md':  768px,
  'sm':  420px
);
```

Internally the map is expanded into min/max ranges, and the base (`''`) range
covers everything below the smallest breakpoint. A utility variant like
`.d-md-none` applies from `md` (768px) upward.

## Container & grid

```scss
$container-max-width:     1680px;
$container-offset:        56px;    // horizontal gutter, desktop
$container-offset-mobile: 16px;    // horizontal gutter, mobile
$container-breakpoint:    'lg';    // breakpoint the container switches at

$grid-gutter:             32px;
$grid-gutter-mobile:      16px;
$columns:                 12;      // grid column count → .col-1 … .col-12
```

Change `$columns` and the whole `.col-*` / `.col-offset-*` set regenerates.

## Colours

Two maps. `$colors` are the named, semantic colours emitted as CSS custom
properties (`--color-primary`) and used by `.text-*` / `.bg-*`. `$palettes` are
expanded into 100–900 tint/shade scales.

```scss
$colors: (
  foreground: #1a1a1d,
  background: #ffffff,
  black:      #1a1a1d,
  white:      #ffffff,
  primary:    #f6c026
);

$palettes: (
  gray:   #8c8c8e,
  yellow: #f6c026,
  orange: #F4912A,
  red:    #E41328,
  violet: #752A6F,
  purple: #472573,
  indigo: #3F00FF,
  blue:   #0F4EB3,
  teal:   #00A4A4,
  green:  #10AF2E,
  lime:   #A4C400,
);
```

Each palette entry `gray: #8c8c8e` generates `.text-gray-100` … `.text-gray-900`
(and matching `.bg-*`), with `-500` being the base colour. See
[Colours](../color/).

### Colour modes (dark mode)

```scss
$color-modes-selector: '[data-color-scheme="VALUE"]';
$color-modes: (
  dark: (
    colors: (
      foreground: #ffffff,
      background: #1a1a1d,
      black:      #1a1a1d,
      white:      #ffffff,
      primary:    #3F00FF
    )
  )
);
```

Each mode re-emits the colour custom properties under its selector — e.g.
`[data-color-scheme="dark"]` — so toggling the attribute on `<html>` switches the
palette. `VALUE` in `$color-modes-selector` is replaced with the mode name.

## Typography

```scss
$base-font-size: 16px;         // 1rem reference

$heading-font:   'Roboto', sans-serif;
$paragraph-font: 'Nunito', sans-serif;
$mono-font:      monospace;

$line-height:           1.2;
$heading-line-height:   1;
$paragraph-line-height: 1.5;
```

The `$typography` map defines the type scale — every heading and paragraph
class. Each entry is
`(font-size, letter-spacing, line-height, font-weight, text-transform)`, and
headings may carry separate `desktop` / `mobile` values that switch at
`$container-breakpoint`:

```scss
$typography: (
  'h1, .h1': (
    desktop: (96px, -1.5px, $heading-line-height, bold),
    mobile:  (64px, -0.5px, $heading-line-height, bold)
  ),
  // … h2–h6 …
  '.p1': (24px, 0.3px, $paragraph-line-height),
  '.p2': (20px, 0.2px, $paragraph-line-height),
  'p':   ($base-font-size, 0.2px, $paragraph-line-height),
  '.p3, figcaption': (14px, 0.4px, $paragraph-line-height),
  '.p4, small':      (12px, 0.6px, $paragraph-line-height),
  '.supertitle':     (14px, 2px, $paragraph-line-height, 500, uppercase)
);
```

Font sizes are output in `rem` (relative to `$base-font-size`); everything else
in the config uses pixels. See [Typography](../typography/).

## Transitions & easings

```scss
$custom-easings: (
  'ease-in-out-quint': cubic-bezier(0.86, 0, 0.07, 1)
);
$default-transition-duration: 250ms;
$default-transition-easing:   'ease-in-out-quint';
```

Used by the `transition()` mixin. See [Effects](../effects/).

## Button

The single button primitive (`.btn`) is sized from this map:

```scss
$button: (
  height:        56px,
  padding-x:     32px,
  padding-y:     16px,
  border-width:  2px,
  border-radius: 4px
);
```

See [Buttons](../buttons/).
