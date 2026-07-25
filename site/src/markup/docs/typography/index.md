---
layout: docs
title: Typography
navTitle: Typography
description: Type scale, responsive heading sizes, font-family utilities, and text decoration/alignment helpers generated from the $typography config map.
order: 10
keywords: ["typography", "heading", "font", "text", "h1", "paragraph", "rem", "text-align", "list"]
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
| `.font-lighter` | `lighter` |
| `.font-bolder` | `bolder` |

> [!WARNING]
> The `.text-*` weight aliases (`.text-bold`, `.text-heavy`, …) were removed in `3.0.0`. `text-*` is reserved for real `text-` properties — `text-align`, `text-transform`, `text-decoration`. Rename to the `font-*` form; `.text-heavy` becomes `.font-black`.

> [!NOTE]
> `font-weight: lighter | bolder` resolves against the **parent's** weight, so `.font-lighter` / `.font-bolder` give different results depending on where you apply them. Prefer a numeric class.

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
.text-transform-none     → text-transform: none
```

Responsive variants available for all breakpoints.

---

## Font style

```
.text-italic / .font-italic     → font-style: italic
```

---

## Whitespace

```
.text-nowrap            → white-space: nowrap
```

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
