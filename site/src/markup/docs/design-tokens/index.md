---
layout: docs
title: Design Tokens
navTitle: Design Tokens
description: How Sulphuris expresses design tokens — the config maps are your compile-time tokens, and colours are additionally emitted as runtime CSS custom properties you can consume anywhere.
order: 15
keywords: ["design tokens", "tokens", "css variables", "custom properties", "config", "style dictionary", "figma", "poops"]
---

# Design Tokens

A *design token* is a named design decision — a colour, a spacing step, a font
size — stored once and referenced everywhere. Sulphuris is built around exactly
this idea: the maps in [`core/_config.scss`](../configuration/) **are** your
token set. You declare them once and the whole utility layer is generated from
them.

There are two flavours of token in Sulphuris, and the distinction matters:

- **Compile-time tokens** — sizes, spacing, breakpoints, typography, borders.
  These are baked into the generated class values at build time. `.p-16` ships
  as `padding: 16px`, not `padding: var(--space-16)`.
- **Runtime tokens** — colours. Every colour key is *also* emitted as a
  `--color-*` CSS custom property on `:root`, so it can be re-themed live (dark
  mode, per-section overrides) without recompiling. See [[color]].

## The config maps are the tokens

Everything a project needs to brand Sulphuris lives in a handful of maps:

```scss
$sizes:        0, 4, 8, 16, 24, 32, 48, 64;     // spacing / sizing scale
$breakpoints:  ('lg': 1024px, 'md': 768px, 'sm': 480px);
$colors:       (foreground: #1a1a1d, background: #fff, primary: #824f2d);
$palettes:     (blue: #0f4eb3, gray: #8c8c8e);  // each expands to 100–900
$typography:   ( 'h1, .h1': (desktop: (96px, -1.5px, 1, bold)), … );
$border-radiuses: 0, 4, 6, 8, 16, 24, 32;
```

Override them **before** `@use "sulphuris"` and every generated class follows
your tokens — see [Getting Started](../getting-started/) and
[Configuration](../configuration/) for the full list.

```scss
@forward "sulphuris/core/config" with (
  $sizes: (0, 4, 8, 16, 24, 32, 48, 64),
  $colors: (
    foreground: #111111,
    background: #ffffff,
    primary:    #0057ff,
  )
);

@use "sulphuris";
```

## Runtime colour tokens

Colours are the one token family exposed as live CSS custom properties. Each
key in `$colors` and each generated palette grade becomes a `--color-*` variable
on `:root`:

```css
:root {
  --color-foreground: #1a1a1d;
  --color-background:  #ffffff;
  --color-primary:     #f6c026;
  --color-blue-500:    #0f4eb3;
  /* …100–900 for every palette… */
}
```

Because the utilities reference them through `var()`, you can consume the same
tokens in your own hand-written CSS — no SCSS import required:

```css
.callout {
  color: var(--color-foreground);
  background: var(--color-blue-100);
  border: 2px solid var(--color-primary);
}
```

And you can retheme them at runtime by re-declaring the variables under any
scope. This is exactly how dark mode works — `[data-color-scheme="dark"]`
re-emits the `--color-*` set (see [[color]]):

```css
[data-color-scheme="dark"] { --color-background: #1a1a1d; }
.brand-section         { --color-primary: #ff3366; }
```

> [!NOTE]
> Only colours are runtime tokens today. Spacing, sizing, typography and
> breakpoints are compile-time — if you need those as live CSS variables, emit
> your own `--space-*` set alongside Sulphuris (see below).

## Consuming tokens in your SCSS

Inside SCSS, reach for the config maps and helpers rather than repeating raw
values, so your components stay tied to the same tokens as the utilities:

```scss
@use "sulphuris/core/config" as config;
@use "sulphuris/core/utils/helpers" as helpers;
@use "sass:list";

.card {
  color: helpers.color(primary);          // → var(--color-primary)
  padding: list.nth(config.$sizes, 5);    // → 16px, from the shared scale
}
```

`helpers.color($name)` returns the `var(--color-*)` reference (with the raw
value as fallback); `helpers.get-color($name, $mode)` returns the raw compile-time
value. See [Functions & Mixins](../functions/).

## Overriding & supplementing tokens with poops

Sulphuris is transpiled with [poops](https://stamat.info/poops/), which has a
[design-tokens step](https://stamat.info/poops/docs/quick-start/transpiling-css.html#design-tokens)
of its own: you author tokens once as JSON and `@use` them straight from SCSS via
the `token:` prefix (both W3C DTCG and Style Dictionary formats are auto-detected).
Because it runs at transpile time, you can feed those tokens into — or extend — the
Sulphuris config, keeping a single JSON source of truth for the build.

Author the tokens as JSON, e.g. `src/tokens/colors.json`:

```json
{
  "color": {
    "$type": "color",
    "primary":   { "$value": "#0057ff" },
    "secondary": { "$value": "#ff6600" },
    "link":      { "$value": "{color.primary}" }
  }
}
```

Point poops' `tokenPaths` at that directory in `poops.json`:

```json
{
  "styles": [
    { "in": "src/scss/index.scss", "out": "dist/css/styles.css",
      "options": { "tokenPaths": ["src/tokens"] } }
  ]
}
```

poops exposes each file as `token:<filename>`, flattened to `$color-*` variables.

**Override** — feed those tokens into the config forward so they win for the
build, rebranding the whole utility layer per target/theme without hand-editing
`_config.scss`:

```scss
@use "token:colors" as c;

@forward "sulphuris/core/config" with (
  $colors: (primary: c.$color-primary, foreground: #111, background: #fff)
);

@use "sulphuris";
```

Prefer a single map to spread? Set `"tokenOutput": "map"` in the poops options
and read it with `map.get(c.$color, primary)`.

**Supplement** — emit token families Sulphuris bakes in at compile time
(spacing, sizing, typography) as live custom properties *alongside* the
`--color-*` set, straight from the same JSON. This is the poops-driven way to
get the `--space-*` / `--font-*` variables the
[note above](#runtime-colour-tokens) says Sulphuris does not emit itself:

```scss
@use "token:spacing" as s;

:root {
  --space-16: #{s.$space-16};
  --space-24: #{s.$space-24};
}
```

The integration point on the Sulphuris side is unchanged — the config maps in
[`core/_config.scss`](../configuration/) remain the source of truth; poops just
lets you feed and extend them from a shared JSON source instead of the stylesheet.

## Bringing in external token sources

If your tokens are authored elsewhere — Style Dictionary, Figma Tokens,
Tokens Studio, a design-system JSON — you don't hand them to Sulphuris directly.
Export them to SCSS variables/maps and feed those into the config forward. The
config map is the single integration point:

```scss
// tokens.generated.scss  (produced by Style Dictionary et al.)
$brand-primary: #0057ff;
$space-scale: (0, 4, 8, 16, 24, 32, 48, 64);

// your entry stylesheet
@use "tokens.generated" as t;

@forward "sulphuris/core/config" with (
  $colors: (primary: t.$brand-primary, foreground: #111, background: #fff),
  $sizes: t.$space-scale
);

@use "sulphuris";
```

Keep the token export as the source of truth; Sulphuris becomes the layer that
turns those tokens into utility classes and `--color-*` custom properties.
