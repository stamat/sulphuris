---
layout: poops-docs-theme/docs
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

Two switches, neither of which moves a class name — flip either and the rest of
the API stays where it is.

<!-- config: logical-properties, rem-units -->

```scss
// src/core/_config.scss:9
$logical-properties: false;

// src/core/_config.scss:16
$rem-units: true;
```

`$logical-properties: true` adds the writing-direction-aware pairs:
`.m-inline-*`, `.m-block-*`, `.p-inline-*`, `.p-block-*`, `.inset-inline-*`,
`.inset-block-*`. Turn it on for RTL or vertical-writing layouts; the physical
`.mx-*` / `.px-*` / `.t-*` families cover everything else.

`$rem-units` emits the size families in `rem`: `.pt-32` is
`padding-top: 2rem`. At the default 16px root that is the same 32px, so nothing
shifts visually — what it buys is that spacing scales with the reader's browser
font-size setting, which px ignores (zoom scales px; the font-size preference
does not). That is WCAG 1.4.4 territory, which is why it is on.

The class names stay px-named on purpose: `32` is a design-token label, the same
way Tailwind's `p-8` means 2rem. Set `$rem-units: false` to put every size family
back in px — no class name moves either way.

**Breakpoints convert too**, so the layout switch moves with the reader instead
of firing at a fixed viewport width — `md` emits `min-width: 48rem`. In a media
query `rem` resolves against the browser's font-size setting, not against the
document's own `font-size`, which is the whole point. Tailwind made the same move
in v4, for the same WCAG 1.4.4 argument; Bootstrap still ships px.

**So do the container and grid metrics** — `$container-max-width`,
both offsets, both gutters, and the computed `.col-N-max` caps. Left in px they
would be the one thing that doesn't move: `$container-max-width` and the `xxl`
breakpoint are the same width, and they have to stay that way as the root
font-size changes or the container stops lining up with the breakpoint it was
sized against.

Everything above is still **written in px** and converted at the point the value
is emitted. That is deliberate: gutter halves, offsets-minus-halves and
breakpoint range math all have to happen in one unit, and mixing px with a
relative unit is a hard Sass error. Overriding any of it stays a px job.

**Border widths** are the one size family that stays px: 2px at a 20px root is
2.5px, straddling a device pixel, so it renders fuzzy or drops out. Radii convert
— a curve is antialiased, so nothing snaps. Font sizes were already rem.

## Sizes

Spacing utilities (margin, padding, `top`/`right`/…, gaps) are generated from
these lists. Values are unitless numbers read as px, emitted as rem under
`$rem-units` above — `16` is `1rem`, the same 16px at the default root — or as
`%` where noted.

<!-- config: sizes, negative-sizes, percent-sizes, negative-percent-sizes, viewport-sizes, z-index, size-aliases, border-sizes, border-radiuses -->

```scss
// src/core/_config.scss:21
$sizes:          0,1,2,3,4,6,8,12,14,16,24,32,40,48,56,64,80,96,128,256;
$negative-sizes: -1,-2,-3,-4,-8,-12,-14,-16,-24,-32,-40,-48,-56,-64;
$percent-sizes:  5,10,15,20,25,50,75,100;

// src/core/_config.scss:29
$negative-percent-sizes: -25,-50,-75,-100;

// src/core/_config.scss:33
$viewport-sizes: 25,50,75,100;

// src/core/_config.scss:37
$z-index: -1,0,1,2,10,20,50,100;

// src/core/_config.scss:47
$size-aliases: null;

// src/core/_config.scss:67
$border-sizes:    2,3,4,6,8;
$border-radiuses: 0,4,6,8,16,24,32;
```

A negative value renders as a double dash in the class name: `-32` → `.mt--32`
(`margin-top: -2rem`).

### Size aliases — opt-in

`$size-aliases` gives steps of `$sizes` a t-shirt name in the margin, padding and
gap families, so `.pt-sm` and `.pt-8` are the same rule. Off by default; an alias
has to point at a value the scale already carries, or the build warns.

```scss
@forward 'sulphuris/core/config' with (
  $size-aliases: ('xs': 4, 'sm': 8, 'md': 16, 'lg': 32, 'xl': 64, 'xxl': 96)
);
```

Numeric aliases are deliberately not offered: `.pt-2` already means 2px here and
8px in Bootstrap and Tailwind, so the same class name in copied markup would
mean three different paddings. The names overlap the breakpoints, so the `md`
variant of `.gap-md` reads `.gap-md-md`. See [Spacing](../spacing/).

## Z-layers

Named stacking levels resolved by the `z()` helper (see
[Functions & Mixins](../functions/)). Separate from the numeric `$z-index`
scale used by the `.z-*` utility classes.

<!-- config: z-layers -->

```scss
// src/core/_config.scss:53
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
// src/core/_config.scss:73
$orientations: (
  't': ('top'),
  'r': ('right'),
  'b': ('bottom'),
  'l': ('left'),
  'x': ('right', 'left'),
  'y': ('top', 'bottom')
);
```

So `.pt-16` is `padding-top: 1rem`, `.px-16` sets left **and** right, `.my-24`
sets top and bottom margin.

## Breakpoints

Responsive variants are min-width and derived from this map. Add or remove keys
freely — the class variants follow. Write them in **px**: the range math and the
container arithmetic depend on it, and [`$rem-units`](#feature-flags) converts
them to `rem` when the query is emitted (`768px` → `48rem`).

<!-- config: breakpoints -->

```scss
// src/core/_config.scss:85
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
// src/core/_config.scss:96
$container-max-width:     1680px;
$container-offset:        56px;
$container-offset-mobile: 16px;
$container-breakpoint:    'lg';

// src/core/_config.scss:101
$grid-gutter:        32px;
$grid-gutter-mobile: 16px;
$columns:            12;

// src/core/_config.scss:108
$rows: 6;
```

`$container-offset` / `$container-offset-mobile` are the horizontal gutters,
switching at `$container-breakpoint`. `$columns` is the grid column count
(`.col-1` … `.col-12`), `$rows` the native grid row count (`.grid-rows-1` … `-6`).

Change `$columns` and the whole `.col-*` / `.col-offset-*` set regenerates, along with `.grid-cols-*` and `.grid-column-span-*`.

`$rows` only drives the native grid — `.grid-rows-*` and `.grid-row-span-*`. It is deliberately smaller than `$columns`: `grid-template-rows` only does visible work on a container with a definite height, so deep row templates are rare. Raise it if a layout needs them.

## Colours

Three maps. `$colors` are the named, semantic colours emitted as CSS custom
properties (`--color-primary`) and used by `.text-*` / `.bg-*`. `$palettes` are
seeds, each expanded into a 100–900 scale. `$palette-grades` is the ladder they
are expanded onto — a perceived lightness and a chroma weight per grade, shared
by every palette, which is what makes `blue-600` and `green-600` land on the
same contrast. See [Colours](../color/#how-a-palette-is-generated).

<!-- config: colors, palettes, palette-grades -->

```scss
// src/core/_config.scss:113
$colors: (
  foreground: #1a1a1d,
  background: #fff,
  black: #1a1a1d,
  white: #fff,
  primary: #f6c026,
  // Its own token rather than `primary`, because a link has a contrast floor a
  // brand color does not: `primary` is free to be a yellow that only ever sits
  // behind text, while this has to stay readable as text on `background`.
  // 8.6:1 here, 8:1 on the dark counterpart below.
  link: #0f4eb3,
  // Status roles. Every value is a grade that $palettes already generates —
  // these name one, they do not add a hue, so a project that retunes `red`
  // and re-picks `danger` from the new ladder stays in one palette.
  // They are label and body text on `background`, not just a border on a
  // tinted callout, so each clears 4.5:1 in its own mode. Since $palette-grades
  // pins every palette to the same lightness ladder, that is now one grade for
  // all four rather than four hand-picked ones: 600 on white, and 400 on the
  // dark background — see the `dark` entry in $color-modes below.
  danger: #c40d20,   // red-600,    6.1:1
  success: #077f1e,  // green-600,  5.2:1
  warning: #98560e,  // orange-600, 5.7:1
  info: #2563ca      // blue-600,   5.7:1
);

// src/core/_config.scss:178
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
$palette-grades: (
  100: (96%, 0.5),
  200: (90%, 0.7),
  300: (82%, 0.85),
  400: (72%, 0.95),
  500: (62%, 1),
  600: (52%, 1),
  700: (42%, 0.95),
  800: (32%, 0.85),
  900: (22%, 0.7)
);
```

Each palette entry generates `.text-gray-100` … `.text-gray-900` (and matching
`.bg-*`), with `-500` being the base colour. See [Colours](../color/).

### Colour aliases

<!-- config: color-aliases -->

```scss
// src/core/_config.scss:214
$color-aliases: (
  danger: danger,
  success: success,
  warning: warning,
  info: info
);
```

An alias emits a second, unprefixed custom property for a colour that already
exists — `--danger` alongside `--color-danger` — so a stylesheet that reaches
for bare names can be fed without the colour being written twice. The left side
is the property to emit, the right side the key it reads from, and that key can
be a `$colors` name or a palette grade: `(brand: primary, edge: blue-500)`.

Aliases are `var()` indirection on `:root`, not copies, so they resolve through
`--color-{key}` and follow `$color-modes` into dark mode without being
re-emitted per mode. Pointing one at a key that does not exist warns at build
time. `()` emits nothing.

### Colour modes (dark mode)

<!-- config: color-modes-selector, color-modes -->

```scss
// src/core/_config.scss:221
$color-modes-selector: '[data-color-scheme="VALUE"]';
$color-modes: (
  dark: (
    colors: (
      foreground: #fff,
      background: #1a1a1d,
      black: #1a1a1d,
      white: #fff,
      primary: #3f00ff,
      link: #8ab4ff,
      // Same roles, same ladders, mirrored across the ladder for the dark
      // background: 4.5:1 on #1a1a1d instead of on #fff. One grade again,
      // 400 to the light set's 600.
      danger: #fd746c,   // red-400,    6.5:1
      success: #2bc53f,  // green-400,  7.6:1
      warning: #e78b30,  // orange-400, 6.7:1
      info: #83a6df      // blue-400,   7.0:1
    )
    // palettes: ( ... )
  )
);
```

Each mode re-emits the colour custom properties under its selector — e.g.
`[data-color-scheme="dark"]` — so toggling the attribute on `<html>` switches the
palette. `VALUE` in `$color-modes-selector` is replaced with the mode name.

## Typography

<!-- config: base-font-size, heading-font, paragraph-font, mono-font, line-height, heading-line-height, paragraph-line-height, line-clamps, font-sizes, line-heights -->

```scss
// src/core/_config.scss:253
$base-font-size: 16px;

// src/core/_config.scss:255
$heading-font:   'Roboto', sans-serif;
$paragraph-font: 'Nunito', sans-serif;
$mono-font:      monospace;

// src/core/_config.scss:279
$line-height:           map.get($line-heights, 'normal') or 1.6;
$heading-line-height:   map.get($line-heights, 'tight') or 1.25;
$paragraph-line-height: map.get($line-heights, 'normal') or 1.6;

// src/core/_config.scss:284
$line-clamps: 1,2,3,4,5,6;

// src/core/_config.scss:290
$font-sizes: 12,14,16,20,24,32,48,64,96;
$line-heights: (
  1: 1,
  'tight': 1.25,
  'normal': 1.6,
  'loose': 1.75
);
```

`$base-font-size` is the `1rem` reference the px→rem conversion divides by. It is
**not** written to the document as a root `font-size` — an author `font-size` on
`html` overrides the reader's browser default-size setting, which would pin every
rem in the stylesheet back to a fixed px and undo the point of emitting rem. Left
alone, the root *is* the reader's preference. Change `$base-font-size` and the
baseline shifts as a **percentage** (`18px` → `font-size: 112.5%`), which moves
the scale while still tracking that setting.

`$line-clamps` is the line counts behind
the `.line-clamp-*` family. `$font-sizes` and `$line-heights` drive the `.fs-*`
and `.lh-*` utilities — the per-element nudge that does not need a new component
class. `$font-sizes` is px in, rem out, so it stays readable next to `.pt-32`
while the emitted value still respects the user's root font-size.

The `$typography` map defines the type scale — every heading and paragraph
class. Each entry is
`(font-size, letter-spacing, line-height, font-weight, text-transform)`, and
headings may carry separate `desktop` / `mobile` values that switch at
`$container-breakpoint`:

<!-- config: typography -->

```scss
// src/core/_config.scss:319
$typography: (
  'h1, .h1': (
    desktop: (48px, null, $heading-line-height, bold),
    mobile: (32px, null, $heading-line-height, bold)
  ),
  'h2, .h2': (
    desktop: (32px, null, $heading-line-height, bold),
    mobile: (24px, null, $heading-line-height, bold)
  ),
  'h3, .h3': (
    desktop: (24px, null, $heading-line-height, bold),
    mobile: (20px, null, $heading-line-height, bold)
  ),
  'h4, .h4': (
    desktop: (20px, null, $heading-line-height, bold),
    mobile: (18px, null, $heading-line-height, bold)
  ),
  'h5, .h5': ($base-font-size, null, $heading-line-height, bold),
  'h6, .h6': (14px, null, $heading-line-height, bold),
  '.p1': (24px, null, $paragraph-line-height),
  '.p2': (20px, null, $paragraph-line-height),
  'p': ($base-font-size, null, $paragraph-line-height),
  '.p3, figcaption': (14px, null, $paragraph-line-height),
  '.p4, small': (12px, null, $paragraph-line-height),
  '.supertitle': (14px, 2px, $paragraph-line-height, 500, uppercase)
);
```

The config is written in px throughout; font sizes and — under
[`$rem-units`](#feature-flags) — the size families are output in `rem`, relative
to `$base-font-size`. See [Typography](../typography/).

`$prose-measure` is the reading width of the `.prose` block — the tag-level
defaults for markup you cannot put classes on. See [Prose](../prose/):

<!-- config: prose-measure -->

```scss
// src/core/_config.scss:348
$prose-measure: 720px;
```

## Transitions & easings

<!-- config: custom-easings, default-transition-duration, default-transition-easing -->

```scss
// src/core/_config.scss:350
$custom-easings: (
  'ease-in-out-quint': cubic-bezier(0.86, 0, 0.07, 1)
);

// src/core/_config.scss:354
$default-transition-duration: 250ms;
$default-transition-easing:   'ease-in-out-quint';
```

Used by the `transition()` mixin. See [Effects](../effects/).

## Shadows

<!-- config: shadows -->

```scss
// src/core/_config.scss:360
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
// src/core/_config.scss:368
$button: (
  height: 56px,
  padding-x: 32px,
  padding-y: 16px,
  border-width: 2px,
  border-radius: 4px
);
```

See [Buttons](../buttons/).
