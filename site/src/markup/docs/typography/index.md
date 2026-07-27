---
layout: docs
title: Typography
navTitle: Typography
description: Type scale, responsive heading sizes, font-size and line-height utilities, font-family utilities, and text decoration/alignment helpers generated from the $typography config map.
order: 10
keywords: ["typography", "heading", "font", "text", "h1", "paragraph", "rem", "text-align", "list", "truncate", "ellipsis", "font-size", "line-height", "text-wrap", "balance"]
---

# Typography

## Foundations

`html` is set to `font-size: 16px` (`$base-font-size`). All font sizes in this system output in **rem**, relative to that 16 px root. Letter-spacing values defined in px are also converted to rem via `toRem()`.

Default fonts:

| Variable | Default |
|---|---|
| `$heading-font` | `'Roboto', sans-serif` |
| `$paragraph-font` | `'Nunito', sans-serif` |
| `$mono-font` | `monospace` |

`body` uses `$paragraph-font`. `h1`–`h6` elements override to `$heading-font`.

Default line-heights:

| Variable | Value |
|---|---|
| `$line-height` | `1.2` (html root) |
| `$heading-line-height` | `1` |
| `$paragraph-line-height` | `1.5` |

---

## Type scale

### Headings

Headings have two size sets: **mobile** (default, no media query) and **desktop** (`min-width: 1024px`, the `lg` breakpoint). The semantic tag and its class equivalent share identical rules — `.h1` gives heading styling without the `<h1>` element.

Each heading entry: `(font-size, letter-spacing, line-height, font-weight)`. All sizes output as rem.

| Selector | Desktop size | Desktop letter-spacing | Mobile size | Mobile letter-spacing | line-height | font-weight |
|---|---|---|---|---|---|---|
| `h1, .h1` | 6rem (96px) | -0.09375rem (-1.5px) | 4rem (64px) | -0.03125rem (-0.5px) | 1 | bold |
| `h2, .h2` | 4rem (64px) | -0.03125rem (-0.5px) | 3rem (48px) | 0 | 1 | bold |
| `h3, .h3` | 3rem (48px) | 0 | 2rem (32px) | 0.015625rem (0.25px) | 1 | bold |
| `h4, .h4` | 2rem (32px) | 0.015625rem (0.25px) | 1.5rem (24px) | 0 | 1 | bold |
| `h5, .h5` | 1.5rem (24px) | 0 | 1.25rem (20px) | 0.009375rem (0.15px) | 1 | bold |
| `h6, .h6` | 1.25rem (20px) | 0.009375rem (0.15px) | 1rem (16px) | 0.009375rem (0.15px) | 1 | bold |

Heading elements also carry default bottom margins (applied to the tag, not the class):

| Element | `margin-bottom` |
|---|---|
| `h1` | `0.33em` |
| `h2` | `0.42em` |
| `h3` | `0.50em` |
| `h4` | `0.65em` |
| `h5` | `0.80em` |
| `h6` | `1.00em` |

Example — same visual output, different semantics:

```html
<h2>Section title</h2>
<div class="h2">Section title</div>
```

### Paragraph and body text

Non-heading entries use a single size set (no responsive switch). `letter-spacing` values in px are converted to rem.

| Selector | font-size | letter-spacing | line-height |
|---|---|---|---|
| `.p1` | 1.5rem (24px) | 0.01875rem (0.3px) | 1.5 |
| `.p2` | 1.25rem (20px) | 0.0125rem (0.2px) | 1.5 |
| `p` | 1rem (16px) | 0.0125rem (0.2px) | 1.5 |
| `.p3, figcaption` | 0.875rem (14px) | 0.025rem (0.4px) | 1.5 |
| `.p4, small` | 0.75rem (12px) | 0.0375rem (0.6px) | 1.5 |
| `.supertitle` | 0.875rem (14px) | 0.125rem (2px) | 1.5 |

`.supertitle` additionally sets `font-weight: 500` and `text-transform: uppercase`.

```html
<p class="p1">Large body copy</p>
<p class="p2">Medium body copy</p>
<p>Default paragraph — 1rem / 16px</p>
<figcaption>Caption text (same as .p3)</figcaption>
<small>Fine print (same as .p4)</small>
<p class="supertitle">Label / eyebrow text</p>
```

---

## Font size utilities — `.fs-*`

Generated from `$font-sizes`. **px in the class name, rem in the output** — same
convention as `.pt-32`, same `toRem()` conversion the type scale uses, so
`.fs-24` and `.p1` land on exactly the same size.

| Class | `font-size` | Matches |
|---|---|---|
| `.fs-12` | 0.75rem (12px) | `.p4`, `small` |
| `.fs-14` | 0.875rem (14px) | `.p3`, `figcaption` |
| `.fs-16` | 1rem (16px) | `p` |
| `.fs-20` | 1.25rem (20px) | `.p2`, `h6` desktop |
| `.fs-24` | 1.5rem (24px) | `.p1`, `h5` desktop |
| `.fs-32` | 2rem (32px) | `h4` desktop |
| `.fs-48` | 3rem (48px) | `h3` desktop |
| `.fs-64` | 4rem (64px) | `h2` desktop |
| `.fs-96` | 6rem (96px) | `h1` desktop |

This is the nudge that does not need a new component class — the type scale
still owns letter-spacing, line-height and weight, `.fs-*` changes size only.
Responsive variants included:

```html
<h2 class="fs-32 fs-md-64">Smaller on phones</h2>
```

---

## Line height utilities — `.lh-*`

Generated from `$line-heights`. Unitless values on purpose: a unitless
line-height inherits as a **ratio**, so children scale with their own font-size;
a px one inherits as a frozen box and collapses nested type.

| Class | `line-height` |
|---|---|
| `.lh-1` | `1` |
| `.lh-tight` | `1.2` |
| `.lh-normal` | `1.5` |
| `.lh-loose` | `1.75` |

Pairs with `.fs-*` — bumping size usually means loosening or tightening leading:

```html
<p class="fs-32 lh-tight">Display text needs less leading than body copy.</p>
```

---

## Font family utilities

Override the font family on any element. All use `!important`.

| Class | CSS |
|---|---|
| `.font-heading` | `font-family: 'Roboto', sans-serif` |
| `.font-paragraph` | `font-family: 'Nunito', sans-serif` |
| `.font-mono` | `font-family: monospace` |

---

## Font weight utilities

Weight lives under `font-`, matching the CSS property. All use `!important`.

| Class | `font-weight` |
|---|---|
| `.font-thin` | `100` |
| `.font-ultra-light` | `200` |
| `.font-light` | `300` |
| `.font-normal` | `400` |
| `.font-medium` | `500` |
| `.font-semi-bold` | `600` |
| `.font-bold` | `700` |
| `.font-ultra-bold` | `800` |
| `.font-black` | `900` |

> [!WARNING]
> The `.text-*` weight aliases (`.text-bold`, `.text-heavy`, …) were removed in `3.0.0`. `text-*` is reserved for real `text-` properties — `text-align`, `text-transform`, `text-decoration`. Rename to the `font-*` form; `.text-heavy` becomes `.font-black`.
>
> The relative `lighter` / `bolder` classes are gone too. They resolved against the **parent's** weight, so the same class produced a different weight depending on where it landed — the one thing a utility class must not do. Pick the numeric class you actually want.

---

## Text alignment

Generated with responsive variants (all breakpoints). Base classes apply at all widths; breakpoint-infixed variants apply at `min-width`.

```
.text-left          → text-align: left
.text-center        → text-align: center
.text-right         → text-align: right
```

Responsive examples:

```
.text-md-center     → text-align: center  (min-width: 768px)
.text-lg-left       → text-align: left    (min-width: 1024px)
```

---

## Text decoration

```
.text-underline          → text-decoration: underline
.text-overline           → text-decoration: overline
.text-line-through       → text-decoration: line-through
.text-decoration-none    → text-decoration: none
```

Responsive variants follow the same breakpoint-infix pattern as alignment.

---

## Text transform

```
.text-uppercase          → text-transform: uppercase
.text-lowercase          → text-transform: lowercase
.text-capitalize         → text-transform: capitalize
.text-full-width         → text-transform: full-width
.text-full-size-kana     → text-transform: full-size-kana
.text-transform-none     → text-transform: none
```

Responsive variants available for all breakpoints.

> [!NOTE]
> `full-width` and `full-size-kana` are CJK typographic values — `full-width`
> converts halfwidth latin and kana to their fullwidth forms, `full-size-kana`
> converts small kana to full-size (a ruby-text convention). Both are no-ops on
> latin-only text.

---

## Font style

```
.font-italic     → font-style: italic
```

`.text-italic` was removed in `3.0.0` — `font-style` is a `font-` property, so it belongs in the `font-*` namespace with the weights.

---

## Whitespace

```
.text-nowrap            → white-space: nowrap
```

## Text wrapping

```
.text-balance           → text-wrap: balance
.text-pretty            → text-wrap: pretty
```

`balance` evens out line lengths across a block — the fix for a heading whose
last line is one orphaned word. Browsers cap it at a handful of lines
(4–6), so it is a **headline** tool, not a body-copy one. `pretty` is the body-copy
counterpart: it only prevents orphans, with no line limit.

Not responsive, and there is no `text-wrap: nowrap` class — `.text-nowrap` above
is the `white-space` one, and two classes a character apart is a trap.

## Truncation

```
.truncate               → overflow: hidden; white-space: nowrap; text-overflow: ellipsis
```

Single-line ellipsis. The element needs a width to overflow against — a block
element inherits one from its parent, but a flex or grid child does not shrink
below its content by default, so pair it with `.min-w-0` there:

```html
<div class="d-flex">
  <span class="truncate min-w-0">A very long label that gets cut off…</span>
</div>
```

For more than one line, use `.line-clamp-{n}` — generated from `$line-clamps`
(`1, 2, 3, 4, 5, 6`), not responsive.

```
.line-clamp-3           → display: -webkit-box; -webkit-box-orient: vertical;
                          -webkit-line-clamp: 3; line-clamp: 3; overflow: hidden
```

The clamp is implemented with `display: -webkit-box`, which is still the only
form every supported browser understands — the unprefixed `line-clamp` is
emitted alongside it for the ones that do. Two consequences:

- `display` is part of the mechanism, so putting `.d-block` or `.d-flex` on the
  same element switches the clamp off. Clamp the inner element instead.
- There is no `.line-clamp-none`. Removing the class is the way to unclamp; if
  you need to undo it at a breakpoint, swap in a `.d-*` class there.

---

## List utilities

From `_list.scss`. Strips default list styling.

```css
ul.reset,
ol.reset {
  list-style: none;
  margin: 0;
  padding: 0;
  text-indent: 0;
}
```

The `.reset` class must be applied directly on the `<ul>` or `<ol>` element (qualified selector).

```html
<ul class="reset">
  <li>No bullets, no indent</li>
</ul>
```
