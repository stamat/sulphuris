---
layout: docs
title: Design Tokens
navTitle: Design Tokens
description: How Sulphuris expresses design tokens — the config maps are your compile-time tokens, and colours are additionally emitted as runtime CSS custom properties you can consume anywhere.
order: 15
keywords: ["design tokens", "tokens", "css variables", "custom properties", "config", "style dictionary", "figma"]
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
