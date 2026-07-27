---
layout: docs
title: Introduction
navTitle: Introduction
description: Sulphuris is an adaptable, self-generating CSS utility library that sits between old Primer/Bootstrap and Tailwind.
order: 0
keywords: ["sulphuris", "css", "utility", "scss", "sass", "utility classes"]
---

# 🜍 Sulphuris

**Sulphuris is an adaptable, self-generating CSS utility library.** You describe your
design system once — sizes, breakpoints, colours, typography — in a single SCSS config
map, and Sulphuris generates the utility classes for you: `.p-16`, `.d-flex`,
`.text-primary`, `.col-6`, `.rounded-8`, and so on.

It sits deliberately between two worlds:

- **Old Primer / Bootstrap** — human-readable class names that map to CSS properties
  (`.pt-16` is `padding-top: 16px`), so your markup stays legible and portable.
- **Tailwind** — but _without_ authoring your styles inside `class="…"` soup, and without
  a bespoke DSL. Sulphuris is plain SCSS and plain CSS. The classes are generated from a
  config, not hand-written one by one.

> [!NOTE]
> Sulphuris does not invent a new language. Utilities read like the CSS they produce.
> If you know CSS, you already know Sulphuris.

## Philosophy

- **Config-driven generation.** Almost every class comes out of
  [`src/core/_config.scss`](configuration/). Change a value there (or override it from your
  project), rebuild, and the whole utility set adapts.
- **Pixels for spacing, rem only for type.** `.pt-32` is `padding-top: 32px`. Font sizes
  use `rem` so they respect the user's root font-size.
- **Restrained `!important`.** Utilities avoid `!important` wherever the cascade allows,
  so they stay overridable.
- **Responsive by default.** Most utilities also emit breakpoint variants
  (`.d-md-none`, `.p-lg-24`) derived from your `$breakpoints` map — including an optional
  XXL breakpoint.

## What it is not

- Not a component framework. There are a couple of primitives (`.btn`, `.container`,
  a grid), but Sulphuris is mostly low-level utilities and resets.
- Not an atomic-CSS DSL. There is no `class="[padding-top:16px]"` arbitrary-value syntax.
- Not a state-variant system. There is no `hover:`, `focus:` or `group-hover:` prefix.
- Not zero-config magic. You get the most out of it by overriding the config for your
  project.

## Install

```bash
npm install sulphuris
```

Then, in your main SCSS file:

```scss
@use "sulphuris";
```

Ready? Head to [Getting Started](getting-started/) to wire it up and override the config,
or jump straight to a category in the sidebar.
