---
layout: docs
title: Colours
navTitle: Colours
description: CSS custom property–backed text, background, and border colour utilities generated from a flat colour map and an 11-palette, 100–900 tint/shade scale.
order: 9
keywords: ["color", "colour", "text-color", "background", "bg", "palette", "dark mode", "custom properties"]
---

# Colours

Colour utilities are driven by two config maps: `$colors` (named single values) and `$palettes` (names expanded to a 100–900 scale). Both are emitted as CSS custom properties on `:root` and consumed by utility classes via `var()`.

## CSS custom properties

Every colour key becomes `--color-{name}` on `:root`.

**From `$colors`:**

```css
--color-foreground: #1a1a1d;
--color-background: #ffffff;
--color-black:      #1a1a1d;
--color-white:      #ffffff;
--color-primary:    #f6c026;
```

**From `$palettes` (example: `blue`):**

```css
--color-blue-100: …;  /* lightest — 80% tint toward white */
--color-blue-200: …;
--color-blue-300: …;
--color-blue-400: …;
--color-blue-500: #0F4EB3;  /* base */
--color-blue-600: …;
--color-blue-700: …;
--color-blue-800: …;
--color-blue-900: …;  /* darkest — 80% mix toward black */
```

Grade 500 is the unmodified base colour. Grades 600–900 mix increasing amounts of black (20 / 40 / 60 / 80 %). Grades 100–400 mix increasing amounts of white in the same steps, in reverse order (100 = 80 % white mix, 400 = 20 % white mix).

## Palettes

Default palettes in `$palettes`:

| Name | Base |
|---|---|
| `gray` | `#8c8c8e` |
| `yellow` | `#f6c026` |
| `orange` | `#F4912A` |
| `red` | `#E41328` |
| `violet` | `#752A6F` |
| `purple` | `#472573` |
| `indigo` | `#3F00FF` |
| `blue` | `#0F4EB3` |
| `teal` | `#00A4A4` |
| `green` | `#10AF2E` |
| `lime` | `#A4C400` |

Each palette produces nine keys: `{name}-100` through `{name}-900`.

## Text colour

Prefix: `text`. Property: `color`. Accepts any key from `$colors` or any palette grade.

```
.text-{name}           → color: var(--color-{name})
.text-{palette}-{grade}→ color: var(--color-{palette}-{grade})
```

**Examples:**

```
.text-foreground       → color: var(--color-foreground)
.text-primary          → color: var(--color-primary)
.text-blue-500         → color: var(--color-blue-500)
.text-red-200          → color: var(--color-red-200)
```

**Special text utilities** (not backed by a custom property):

```
.text-transparent      → color: transparent
.text-inherit          → color: inherit
.text-current          → color: currentColor
```

`.text-color-inherit` and `.text-color-current` are the pre-3.0 spellings and still
work — they are aliases of the two above.

## Background colour

Prefix: `bg`. Property: `background-color`. Same key set as text colour.

```
.bg-{name}             → background-color: var(--color-{name})
.bg-{palette}-{grade}  → background-color: var(--color-{palette}-{grade})
```

**Examples:**

```
.bg-background         → background-color: var(--color-background)
.bg-primary            → background-color: var(--color-primary)
.bg-gray-100           → background-color: var(--color-gray-100)
.bg-violet-700         → background-color: var(--color-violet-700)
```

## Border colour

Prefix: `border`. Property: `border-color`. Same key set.

```
.border-{name}         → border-color: var(--color-{name})
.border-{palette}-{grade} → border-color: var(--color-{palette}-{grade})
```

**Examples:**

```
.border-primary        → border-color: var(--color-primary)
.border-red-500        → border-color: var(--color-red-500)
```

## Colour does not vary by breakpoint

None of the three sets (`text-*`, `bg-*`, `border-*`) has responsive variants — `.text-md-primary` and `.bg-xl-red-300` do not exist. Every colour × every palette grade × every breakpoint × three properties was ~23% of the shipped stylesheet, for a need that barely comes up.

Colours that change with the viewport are rare; colours that change with a theme are not. For those, override the CSS variables under a [colour mode](#dark-mode) — utilities read `var(--color-*)`, so they follow along with no rebuild. If one component genuinely needs a viewport-dependent colour, that is a media query in your own SCSS.

## Dark mode

`$color-modes` defines colour overrides keyed by mode name. The selector template is `$color-modes-selector: '[data-color-scheme="VALUE"]'` — `VALUE` is replaced with the mode key.

The built-in `dark` mode re-emits `$colors` overrides under `[data-color-scheme="dark"]`:

```css
[data-color-scheme="dark"] {
  --color-foreground: #ffffff;
  --color-background: #1a1a1d;
  --color-black:      #1a1a1d;
  --color-white:      #ffffff;
  --color-primary:    #3F00FF;
}
```

Because utilities reference `var(--color-*)`, they respond to the attribute automatically — no extra classes needed.

```html
<body data-color-scheme="dark">
  <!-- .text-foreground now reads --color-foreground: #ffffff -->
</body>
```

Dark mode can also carry a `palettes` key to override specific palette grades.

## SCSS helpers

Two functions in `_helpers.scss` let you reference colours inside your own SCSS:

```scss
// Returns var(--color-{name}), with the raw value as fallback if the key
// is not found in $colors.
color($name)

// Returns the raw Sass colour value from $colors (or a mode's colors map).
// $mode is optional; omit for the default (light) values.
get-color($name, $mode: '')
```

**Usage:**

```scss
.my-component {
  color: color(primary);              // → var(--color-primary)
  background: color(blue-100);        // → var(--color-blue-100, #0F4EB3)
  border-color: get-color(foreground, dark); // → #ffffff (Sass compile-time)
}
```

## Extending colours

Override `$colors` and `$palettes` in your own config before importing Sulphuris.

```scss
@use 'sulphuris/config' with (
  $colors: (
    foreground: #111111,
    background: #fafafa,
    black:      #111111,
    white:      #fafafa,
    primary:    #0057ff,
    accent:     #ff3366,   // extra named colour
  ),
  $palettes: (
    // keep built-ins by merging, or list only what you need
    gray:   #888888,
    brand:  #0057ff,       // custom palette → brand-100…brand-900
  )
);
```

To override only dark mode colours, supply a `colors` map (and optionally `palettes`) inside the `dark` entry of `$color-modes`:

```scss
@use 'sulphuris/config' with (
  $color-modes: (
    dark: (
      colors: (
        foreground: #f0f0f0,
        background: #0d0d0d,
        black:      #0d0d0d,
        white:      #f0f0f0,
        primary:    #7c83ff,
      )
    )
  )
);
```

To use a custom selector instead of the `data-color-scheme` attribute, override `$color-modes-selector`:

```scss
@use 'sulphuris/config' with (
  $color-modes-selector: '.theme-VALUE'
);
// produces: .theme-dark { --color-*: … }
```
