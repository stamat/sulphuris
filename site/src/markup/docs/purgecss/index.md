---
layout: poops-docs-theme/docs
title: PurgeCSS
navTitle: PurgeCSS
description: Sulphuris generates a large utility set on purpose. Run PurgeCSS as a PostCSS plugin to strip the classes your markup never uses and ship a small stylesheet.
order: 16
keywords: ["purgecss", "postcss", "tree-shaking", "unused css", "safelist", "production", "optimization"]
---

# PurgeCSS

Sulphuris generates the full utility set — every spacing step, every colour
grade, every responsive variant — so it is intentionally large before
compression. A real project only ever uses a slice of it. Run
[PurgeCSS](https://purgecss.com/) as a **PostCSS plugin** to scan your markup
and remove every class you don't reference.

## Install

```bash
npm install --save-dev postcss @fullhuman/postcss-purgecss
```

## Configure PostCSS

Add PurgeCSS to your `postcss.config.js`. Point `content` at every file that can
contain a class name — templates, components, and any JS/TS that toggles classes.

```js
// postcss.config.js
const purgecss = require('@fullhuman/postcss-purgecss').default

module.exports = {
  plugins: [
    purgecss({
      content: [
        './**/*.html',
        './src/**/*.{js,ts,jsx,tsx,vue,svelte}',
      ],
      // Sulphuris classes use letters, digits and hyphens: p-16, col-lg-4,
      // bg-blue-500, d-md-none. This extractor keeps them intact.
      defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: {
        // Keep classes/attributes added at runtime and never seen in markup.
        standard: [/^is-/, /^has-/],
        // Dark-mode selector + the :root token block are not class-matched.
        greedy: [/data-color-scheme/],
      },
    }),
  ],
}
```

## Run it

Only run PurgeCSS for production builds — during development you want the whole
set available.

**Standalone (postcss-cli):**

```bash
npx postcss dist/sulphuris.css -o dist/sulphuris.min.css
```

**In a bundler** — Vite, webpack, and most toolchains pick up `postcss.config.js`
automatically, so importing the compiled Sulphuris CSS is enough:

```js
import 'sulphuris/dist/sulphuris.css'
```

Gate it on the environment so it never runs in dev:

```js
// postcss.config.js
const purgecss = require('@fullhuman/postcss-purgecss').default

module.exports = {
  plugins: [
    process.env.NODE_ENV === 'production' &&
      purgecss({ content: ['./**/*.html', './src/**/*.{js,ts}'] }),
  ].filter(Boolean),
}
```

## Watch out for these

PurgeCSS only keeps classes it can find **as literal strings** in your content.
Anything assembled at runtime gets removed unless you safelist it.

- **Dynamically built class names.** `'bg-' + color` or `` `col-${n}` `` are
  invisible to the extractor. Write the full class literally, or safelist the
  family: `safelist: [/^col-/, /^bg-(blue|red)-/]`.
- **Responsive & state variants.** `.d-md-none`, `.p-lg-24`, `:hover` utilities
  are ordinary classes — they survive only if the exact string appears in markup.
- **The `--color-*` tokens and dark mode.** The `:root` custom-property block and
  the `[data-color-scheme="dark"]` overrides carry no class of their own. The
  `greedy: [/data-color-scheme/]` rule above keeps the dark-mode block; the
  `:root` block is a bare selector and is preserved by default. See
  [[design-tokens]].
- **Third-party / CMS markup.** Add those templates to `content`, or safelist the
  utilities they rely on.

When in doubt, safelist a whole family with a regex rather than losing classes
at runtime — it costs a few kB, a missing utility costs a broken layout.
