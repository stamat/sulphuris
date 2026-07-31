---
layout: poops-docs-theme/docs
title: Colours
navTitle: Colours
description: CSS custom property–backed text, background, and border colour utilities generated from a flat colour map and an 11-palette, 100–900 perceptual lightness ladder.
order: 9
keywords: ["color", "colour", "text-color", "background", "bg", "palette", "dark mode", "custom properties", "oklch", "contrast"]
---

# Colours

Colour utilities are driven by three config maps: `$colors` (named single values), `$palettes` (seed colours, each expanded to a 100–900 scale) and `$palette-grades` (the ladder they are expanded onto). The first two are emitted as CSS custom properties on `:root` and consumed by utility classes via `var()`.

## CSS custom properties

Every colour key becomes `--color-{name}` on `:root`.

**From `$colors`:**

```css
--color-foreground: #1a1a1d;
--color-background: #ffffff;
--color-black:      #1a1a1d;
--color-white:      #ffffff;
--color-primary:    #f6c026;
--color-link:       #0f4eb3;
--color-danger:     #e41328;
--color-success:    #0a691c;
--color-warning:    #925719;
--color-info:       #0f4eb3;
```

`link` is separate from `primary` because it carries a contrast floor a brand
colour does not: `primary` only ever sits behind text, `link` has to stay
readable *as* text on `background` (8.6:1 light, 8:1 dark). It is what
[`.prose`](../prose/) colours anchors with, and `.text-link` puts the same
colour on a link the rest of the app owns.

### Status colours

`danger`, `success`, `warning` and `info` are roles, not hues. Every one of
them is a grade `$palettes` already generates, so they name a step on an
existing ladder rather than introducing a colour. Retune `red` and re-pick
`danger` from the new ladder, and the whole system stays in one palette.

They carry a text contrast floor, not a border's: the assumption is that a
status colour ends up as label and body text, not only as the edge of a tinted
callout. Each clears 4.5:1 on `background` *in its own mode*. Because
[every palette shares one lightness ladder](#how-a-palette-is-generated), that
is a single grade for all four rather than four hand-picked ones — **600** on
white, **400** on the dark ground:

| Role | Light | on `#fff` | Dark | on `#1a1a1d` |
|---|---|---|---|---|
| `danger` | `#c40d20` (`red-600`) | 6.1:1 | `#fd746c` (`red-400`) | 6.5:1 |
| `success` | `#077f1e` (`green-600`) | 5.2:1 | `#2bc53f` (`green-400`) | 7.6:1 |
| `warning` | `#98560e` (`orange-600`) | 5.7:1 | `#e78b30` (`orange-400`) | 6.7:1 |
| `info` | `#2563ca` (`blue-600`) | 5.7:1 | `#83a6df` (`blue-400`) | 7.0:1 |

Swapping one for another hue is a one-word change and cannot quietly fail the
floor: `violet-600` and `teal-600` clear it too, because the grade is what
carries the contrast. `link` stays a flat `$colors` entry rather than a grade —
it holds a higher floor than the roles do (8.6:1 light, 8:1 dark).

For the tinted background that usually sits behind one of these, mix it down at
use site rather than adding a token — `background: color-mix(in srgb, var(--color-danger) 8%, var(--color-background))`.

## Aliases

`$color-aliases` emits a second, unprefixed custom property for a colour that
already exists. The status roles ship aliased, because the stylesheets most
likely to want them are themes, and themes tend not to namespace:

```css
:root {
  --danger:  var(--color-danger);
  --success: var(--color-success);
  --warning: var(--color-warning);
  --info:    var(--color-info);
}
```

The left side is the property to emit, the right side the key it reads from —
and that key can be a `$colors` name or a palette grade:

```scss
$color-aliases: (
  brand: primary,      // --brand: var(--color-primary)
  error: danger,       // rename a role
  edge:  blue-500      // or point at a palette grade
);
```

They are `var()` indirection, not copies, and emitted only on `:root`. That is
the whole trick: an alias resolves through `--color-{key}`, so it follows
[dark mode](#dark-mode) without being re-emitted under every mode selector.
Pointing one at a key that does not exist warns at build time; `()` emits
nothing.

**From `$palettes` (example: `blue`):**

```css
--color-blue-100: #eff2f7;  /* lightest */
--color-blue-200: #d5dfee;
--color-blue-300: #b1c5e6;
--color-blue-400: #83a6df;
--color-blue-500: #5485d8;
--color-blue-600: #2563ca;
--color-blue-700: #0d46a1;
--color-blue-800: #042d71;
--color-blue-900: #05183c;  /* darkest */
```

## How a palette is generated

A grade is a **lightness**, not a mix. All eleven palettes are projected onto
the one ladder in `$palette-grades`, so `blue-600` and `green-600` sit at the
same perceived lightness and therefore land on the same contrast against
`background`. That is what lets a role be defined once as "grade 600" instead
of hand-picked per hue.

Three rules produce a grade, all in [OkLCh](https://bottosson.github.io/posts/oklab/) —
a perceptual space, so equal steps look equal:

1. **Lightness** comes from `$palette-grades`, never from the seed. Steps are
   10 points through the working range and tighter at the pale end, where a
   tint has to stay subtle enough to sit under body text.
2. **Hue** comes from the seed, unchanged.
3. **Chroma** is the fraction of gamut the seed uses at its own lightness,
   scaled by the grade's weight. A muted seed gives a muted ladder and a vivid
   one stays vivid — and the weight tapers toward both ends so a tint reads as
   a tint in every hue. Anything still outside sRGB is gamut-mapped by chroma
   reduction, which preserves hue instead of clipping it.

Rule 1 is the one with teeth. Grade is lightness, so **the seed is not grade
500** — `yellow-500` is a dark mustard, because a light yellow is `yellow-200`.
The punchy version of a hue lives wherever that hue is punchy: around 200–300
for yellow and lime, 500–600 for blue and purple. That is the sRGB gamut, not
a bug, and it is the price of a grade meaning the same thing everywhere.

### Contrast by grade

Because lightness is shared, contrast is a property of the grade rather than of
the palette. Across all eleven shipped palettes:

| Grade | on `#fff` | on `#1a1a1d` | Use |
|---|---|---|---|
| `100` | 1.1:1 | 15.4–15.7:1 | tinted ground, table stripe |
| `200` | 1.3–1.4:1 | 12.6–13.6:1 | hovered ground, subtle fill |
| `300` | 1.6–1.8:1 | 9.5–10.7:1 | border; **AAA text on dark** |
| `400` | 2.3–2.7:1 | 6.3–7.6:1 | strong border; **AA text on dark** |
| `500` | 3.4–4.1:1 | 4.2–5.1:1 | solid fill, UI edge (3:1), AA large |
| `600` | 5.2–6.4:1 | 2.7–3.4:1 | **AA text on light**, solid hover |
| `700` | 8.0–9.7:1 | 1.8–2.2:1 | **AAA text on light** |
| `800` | 12.2–13.6:1 | 1.3–1.4:1 | headings on light |
| `900` | 17.1–17.7:1 | 1.0:1 | deepest |

Read it as a mirror: 600/700 are the text grades on a light ground, 300/400 the
text grades on a dark one, and `npm test` asserts both floors hold for every
palette — retune a seed past them and the build fails.

## Palettes

Seeds in `$palettes`, and the ladder each one produces:

| Palette | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|
| `gray` | `#f2f2f2` | `#dedede` | `#c4c4c5` | `#a4a4a6` | `#868688` | `#69696b` | `#4d4d4f` | `#333334` | `#1a1a1b` |
| `yellow` | `#fef1d2` | `#fcda8b` | `#eabe4f` | `#c99e2c` | `#a68015` | `#82640e` | `#604a0f` | `#3f310e` | `#211a09` |
| `orange` | `#fcefe5` | `#f8d7bc` | `#f8b47a` | `#e78b30` | `#c06f19` | `#98560e` | `#703f0d` | `#4a2a0b` | `#271607` |
| `red` | `#faefed` | `#f7d5d1` | `#f9aea7` | `#fd746c` | `#f6192d` | `#c40d20` | `#901119` | `#5f1213` | `#320b0a` |
| `violet` | `#f9eef7` | `#f3d2ee` | `#efa9e6` | `#eb6adf` | `#c64ebc` | `#9c3b94` | `#732c6d` | `#4b1f47` | `#281125` |
| `purple` | `#f2f0f7` | `#e1daef` | `#cabce8` | `#af94e1` | `#976adb` | `#7b45c2` | `#5a348e` | `#3b245d` | `#1f1331` |
| `indigo` | `#eff1f9` | `#d6ddf6` | `#b3c1f8` | `#899cfd` | `#6272ff` | `#4639ff` | `#3404d9` | `#20138d` | `#0f0f4a` |
| `blue` | `#eff2f7` | `#d5dfee` | `#b1c5e6` | `#83a6df` | `#5485d8` | `#2563ca` | `#0d46a1` | `#042d71` | `#05183c` |
| `teal` | `#d0fcfb` | `#7ff4f4` | `#50dcdb` | `#24bbbb` | `#009a9a` | `#007979` | `#0a5958` | `#0e3a3a` | `#091f1e` |
| `green` | `#e0fbdf` | `#9bf99c` | `#53e75f` | `#2bc53f` | `#0ea22a` | `#077f1e` | `#0e5e19` | `#0f3e13` | `#0a200b` |
| `lime` | `#e7fdab` | `#d0ed74` | `#b5d447` | `#97b31f` | `#7a9200` | `#5f7300` | `#465407` | `#2e380b` | `#181d08` |

Each palette produces nine keys: `{name}-100` through `{name}-900`. `gray` is
achromatic — its seed uses almost none of the gamut, so the whole ladder stays
neutral without a special case.

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
  --color-link:       #8ab4ff;
  --color-danger:     #ef717e;
  --color-success:    #10af2e;
  --color-warning:    #f4912a;
  --color-info:       #6f95d1;
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

A seed contributes hue and saturation; its lightness is replaced by the grade's,
so `brand-500` is not `#0057ff`. Pick the seed for how *saturated* the family
should be — `#0057ff` is near the edge of sRGB, so the ladder comes out vivid;
a duller blue gives a duller ladder at the same lightnesses. If a specific hex
has to survive verbatim, that is what a `$colors` entry is for.

To shift the whole system rather than one palette, override `$palette-grades` —
the ladder is shared, so every palette moves together and the contrast table
above moves with it:

```scss
@use 'sulphuris/config' with (
  // grade: (OkLCh lightness, chroma weight)
  $palette-grades: (
    100: (97%, 0.4),   // paler, calmer tints
    200: (92%, 0.6),
    // …
    900: (18%, 0.7)    // deeper floor
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
