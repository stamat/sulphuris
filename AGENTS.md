# Sulphuris — agent notes

An adaptable CSS utility library: Sass generators driven by one config map, and
a documentation site generated from what the compiler actually emits.

## Commands

```bash
script/server    # dev server for the docs site with live reload
script/build     # compiles dist/sulphuris.css, then regenerates the docs it feeds
npm run lint     # stylelint over src/**/*.scss (the authority; CI runs it)
npm test         # typecheck, build, then the three CSS checks below
script/a11y      # axe over the built demos in Chromium, both colour modes
```

`npm test` is not a unit test suite: it compiles the library and runs
`script/check-grid-css.mjs`, `check-utility-css.mjs` and `check-palette-css.mjs`
over the output. They assert that what Sass emitted matches what the config
asked for, which is the only place a generator bug shows up.

`script/a11y` is the one check that reads rendered pixels rather than emitted
CSS. It drives every `<code-preview>` in the built site and runs axe inside it,
light and dark, so a class landing on markup is measured — `check-palette-css`
proves a grade clears its floor, and this proves the pair a sample actually puts
on screen does. Build first (`script/server -b`); it reads `site/dist`, and only
the previews, since the page around them is the docs theme's markup and tokens.

## Layout

- `src/core/` is the library: `_config.scss` is the knob board, the generators
  fan it out into classes.
- `dist/sulphuris.css` is committed, because the package ships it.
- `site/` is the documentation site — its own `poops.json`, its own build.
- `script/*.mjs` are the generators and checks; `script/lib/` and
  `script/fixtures/` support them.

## Documentation

The site is Markdown in `site/src/markup/docs/`, built by
[poops](https://github.com/stamat/poops) with
[poops-docs-theme](https://github.com/stamat/poops-docs-theme) and deployed by
[pages.yml](.github/workflows/pages.yml).

Prose is hand-written; the parts that could drift from the source are not. The
`exec.styles` step in [poops.json](poops.json) runs after every CSS build:

- `script/gen-reference.mjs` writes **the whole of
  `site/src/markup/docs/reference/index.md`** from the compiled CSS. Never edit
  that file — a new utility gets into it by existing in the output.
- `script/gen-config-docs.mjs` rewrites the `scss` fence under a
  `<!-- config: name, name -->` or `<!-- generators: m, p -->` marker on any
  docs page, quoting `src/core/_config.scss` and the generator call sites.
  Marked fences are overwritten; unmarked ones are left alone, because pages
  deliberately show overrides that differ from the defaults.
- `script/gen-demos.mjs` turns an `html` fence under a `<!-- demo -->` marker
  into a live, editable preview. The fence stays the only source.

So the way to document a utility is to make the generators see it — add the
marker, run the build — not to retype what the compiler already knows.

- **Document in the same change as the code.** A new config key with no line in
  the tables is a key nobody will find.
- **Edit the page that already covers it.** No new pages, summary files or
  migration notes nobody asked for.

## Principles

- **Names track CSS.** The library exists to cut cognitive load, so a class
  name reads like the declaration it emits — property and value spelled the way
  CSS spells them (`.align-center` → `align-items: center`, `.overflow-hidden`
  → `overflow: hidden`). A name someone has to learn separately from CSS is the
  wrong name; prefer the spec's word over an invented shorthand.
- **The config is the API.** Everything is generated from `_config.scss`; a
  feature that cannot be expressed there is a feature in the wrong place.
- **YAGNI.** Build only what the task needs — no speculative options,
  abstractions, or "for later" scaffolding.
- **Native CSS first.** In order: what the platform does (`:has()`, container
  queries, logical properties, `color-mix()`) → what the library already
  generates → new code.
- **Root cause over symptom.** Fix the generator, not the one class the report
  names.
- **Delete dead code.** No commented-out blocks — git remembers.

## Boundaries

- **Always:** run `npm run lint` and `npm test` before calling work done; keep
  the checks passing, and extend them when you add a generator; add a changelog
  entry under `## [Unreleased]`.
- **Ask first:** renaming or removing a class, or changing what one emits —
  that is the public API, and someone's markup depends on it; adding a
  dependency; changing the shape of `_config.scss`.
- **Never:** edit `dist/` or the generated docs directories by hand; commit a
  `dist/` that does not match `src/`; bump the version or publish — a tag does
  that.

## Before adding a feature

Run this checklist before writing any code; stop at the first "no".

1. **Does CSS already do it?** If the platform covers it, a utility class for
   it is noise.
2. **Can the existing generators emit it from a config value?** Then it is a
   config change, not a new generator.
3. **Search for prior art.** What do Tailwind, Open Props, Bootstrap call it,
   and what do they emit? Cite what you found — a URL per fact, no guesses.
   Can we do it simpler? In a more modern manner? Is it useful and does it reduce the cognitive load?
4. **Does it survive the checks?** A new generator needs an assertion in the
   matching `script/check-*.mjs`.
5. **Still yes?** Build the smallest version that works.

## Non-obvious rules

- **The docs are downstream of the compiled CSS.** Change a generator, rebuild,
  and the reference changes with it — review that diff, it is the real one.
- **`dist/` is committed.** A source change without its rebuilt CSS is an
  incomplete change.
- **Browser support is pinned by `.browserslistrc`.** A feature the targets do
  not have needs a fallback, not an exception.
