---
layout: poops-docs-theme/docs
title: Getting Started
navTitle: Getting Started
description: Install Sulphuris, pull the utilities into your SCSS, and override the config so the generated classes fit your project.
order: 1
keywords: ["install", "getting started", "setup", "use", "forward", "override", "scss"]
---

# Getting Started

Sulphuris is distributed as SCSS source. You install it, `@use` it from your
main stylesheet, and — the important part — override its config *before* you use
it so the generated utilities match your design system.

## Install

```bash
npm install sulphuris
```

## Pull in the utilities

In your main SCSS file:

```scss
@use "sulphuris";
```

That single line emits the whole utility set (spacing, display, flex, grid,
colours, typography, borders, …) plus a normalize/reset. Compile it with any
Dart Sass toolchain (Vite, Poops, `sass` CLI, webpack, esbuild, …).

> [!NOTE]
> Sulphuris v2 uses the modern Sass module system (`@use` / `@forward`). Make
> sure you are on **Dart Sass** — LibSass and `node-sass` are dead and do not
> support modules.

## Override the config

Almost every class Sulphuris emits comes from the variables in
[`core/_config.scss`](../configuration/). Every variable is declared with
`!default`, so you override it by **forwarding the config with your values
before** the `@use "sulphuris"` line:

```scss
@forward "sulphuris/core/config" with (
  $colors: (
    black: #000000,
    white: #ffffff,
    primary: #824f2d,
    brownish: #dcc8ac,
    muted: #6d6d6d,
  ),
  $sizes: (0, 4, 8, 16, 24, 32, 48, 64),
  $breakpoints: (
    'xl': 1440px,
    'lg': 1024px,
    'md': 768px,
    'sm': 480px,
  )
);

@use "sulphuris";
```

Rebuild, and the whole utility set adapts: your spacing scale, your colours,
your breakpoints. You only list the variables you want to change — everything
you omit keeps its default.

> [!IMPORTANT]
> The `@forward … with (…)` block **must come before** `@use "sulphuris"`. Sass
> only lets you configure a module the first time it is loaded; once
> `@use "sulphuris"` has pulled the config in, it is locked.

See [Configuration](../configuration/) for the full list of variables and their
defaults.

## A first example

<!-- demo -->

```html
<div class="container">
  <div class="d-flex justify-space-between align-center p-24">
    <h1 class="h3 mb-0 text-primary">🜍 Hello</h1>
    <button class="btn">Click me</button>
  </div>
</div>
```

- `.container` — centred, max-width wrapper.
- `.d-flex`, `.justify-space-between`, `.align-center` — flexbox layout.
- `.p-24` — `padding: 1.5rem` (24px at the default root).
- `.h3` — heading-3 typography without an `<h3>` tag.
- `.mb-0` — `margin-bottom: 0`.
- `.text-primary` — your `primary` colour.
- `.btn` — the one button primitive.

Every one of those maps to plain CSS. If you know CSS, you can read the markup.

## Responsive variants

Most utilities also emit breakpoint variants derived from your `$breakpoints`
map. The pattern is `.{utility}-{breakpoint}-{value}`:

```html
<!-- full width on mobile, half from md up, one-third from lg up -->
<div class="col-12 col-md-6 col-lg-4">…</div>

<!-- hidden below md, flex from md up -->
<nav class="d-none d-md-flex">…</nav>
```

Breakpoints are **min-width**: `.d-md-flex` applies at `md` *and every wider
breakpoint*, exactly like Bootstrap/Primer.

## Local development of Sulphuris itself

If you are hacking on the library (not just consuming it):

```bash
npm install       # install dev deps (Poops)
script/server     # library + this site (landing at /, docs at /docs/), :4041
```

One command runs everything: it rebuilds `dist/sulphuris.css` from the Sass and
serves this site with live reload, so library edits hot-swap the CSS in the
open page. `script/server -b` builds everything once, with no server.

The [Class Reference](../reference/) page is generated from the built CSS by
`script/gen-reference.mjs` — `script/server` refreshes it on every rebuild.
