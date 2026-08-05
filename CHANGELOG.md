# Changelog

All notable changes to Sulphuris are recorded here. Releases up to 4.0.0
predate this file and are in the
[git tags](https://github.com/stamat/sulphuris/tags).

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
Sulphuris uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Contributing an entry

Write your change under `## [Unreleased]`, grouped under `### Added`,
`### Changed`, `### Fixed`, `### Deprecated`, `### Removed` or `### Security`.
Give the heading a short title after an em dash and open with one paragraph
saying what was wrong before:

```markdown
## [Unreleased] — gap utilities follow the spacing scale

`.gap-*` was generated from its own hardcoded list, so a project that changed
`$spacing` got spacing everywhere except between grid children.

### Fixed

- ...
```

Write it for the person upgrading. This is a CSS library, so the public API is
the emitted CSS: call out **a class that was renamed or removed**, **a
declaration that changed**, and **a config variable whose name, shape or
default moved** — none of those show up as a function signature, and all of
them break somebody's markup.

On `script/publish`, `script/changelog` cuts this section into a released entry
in the same commit as the version bump, and the entry becomes the body of the
GitHub release verbatim.

## [Unreleased] — a dropped-in component picks up the palette

An embedded element has no palette of its own. It reads bare names off the page
or it ships a second look, and Sulphuris answered `--danger` but not `--bg`,
`--fg` or `--border` — so a component landed half-themed, on a background it
had guessed. Dark mode missed it entirely: Sulphuris keys off
`[data-color-scheme]`, most everything else off `[data-theme]`, and a page
toggling one left anything watching the other in light mode. The colour that
should have answered `--accent` was called `link`, which is one of its uses and
not the role.

### Added

- Five more entries in the default `$color-aliases`: `bg`, `fg`, `fg-muted`,
  `border` and `accent`, alongside the four status roles. `fg-muted` and
  `border` point at `gray-600` and `gray-300` rather than at seeds of their own,
  so `$palette-grades` carries them into dark mode unaided.

- `helpers.svg-uri($svg)` — an inline SVG wrapped in a `url()` data URI, with
  `%`, `<`, `>`, `#` and `"` percent-encoded on the way, so an icon in your own
  stylesheet stays readable as SVG instead of being pasted in pre-escaped. Emits
  nothing on its own; `dist/` is unchanged. Markup only, never a file path —
  Sass cannot read a file. See
  [Functions & Mixins](https://stamat.github.io/sulphuris/docs/functions/).

### Changed

- **The `$colors` key `link` is now `accent`**, in `$colors` and in the `dark`
  entry of `$color-modes`. Same hexes, same contrast floor — the old name
  described a hyperlink while the colour is what every focus ring and active
  control takes, which left `primary` looking like the accent it cannot be.
  `.prose a` follows it.

  Nothing breaks yet: `--color-link` is emitted as `var(--color-accent)` and
  `.text-link`, `.bg-link` and `.border-link` still resolve through it, so a
  `$color-modes` override of `accent` moves both. **Rename your uses to
  `accent` — the `link` spellings go in the next major.** A project that set
  its own `$colors` without an `accent` key loses `--color-link` along with it.

- The docs site is on **poops-docs-theme 3.0.0**, whose topbar, theme switch,
  sidebar drawer and code-block copy button are now
  [book-of-elementals](https://github.com/stamat/book-of-elementals)
  custom elements. Nothing shipped in the package changes — `dist/` and `src/`
  are untouched — but the site build gained
  `includePaths: ["../node_modules"]` in [site/poops.json](site/poops.json),
  because the theme's own sheets reach for `book-of-elementals/…` as a bare
  specifier and the docs build runs from `site/`, where poops' default bare
  `node_modules` resolves to nothing. The `.prose code-preview > :is(pre,
  .code-wrap)` reset dropped out of [site/src/scss/docs.scss](site/src/scss/docs.scss);
  2.0.0 ships it, so keeping a copy here was two places to keep in step. The
  docs topbar gained an **npm button** beside the GitHub one, through 2.0.0's
  new `site.iconLinks` — the landing page had linked the package since forever
  and the docs had no way to. 3.0.0 then took the copy button's own click
  handler out of the theme and gave it to `<copy-elemental>`, so a copy that
  lands or fails now says which through a live region rather than only swapping
  an icon, and the button removes itself where `navigator.clipboard` is not
  there to be asked; it also stops a code block or a search field from being
  under the 16px iOS Safari zooms below, and gives `<kbd>` a key cap.
  `script/a11y` reads 0 violations across 40 audits either way.

- `$color-modes-selector` takes a list, and defaults to
  `('[data-color-scheme="VALUE"]', '[data-theme="VALUE"]')` — every mode now
  emits under both names. A bare string still works and still emits one
  selector, so a project that set its own is untouched. **Rules under
  `$color-modes` gain a second selector**: if you match on the emitted CSS,
  match on the list.

### Fixed

Three places the reader's font-size setting stopped being answered. `$rem-units`
converts every size family, so a reader who runs their browser at 20px gets a
layout that grew with them — except at the button, which was the one component
reading raw px off a config map, and it kept a 56px frame around a label that
had already grown. Tracking converted the wrong way round, to rem, which pins it
to the root instead of to the text it is correcting. And a `$base-font-size`
other than 16px pulled the breakpoints away from the widths they were sized
against, because a media query resolves `rem` against the browser setting and
cannot see the percentage that baseline writes onto `html`.

- **`.btn` converts under `$rem-units`.** `min-height` is `3.5rem` where it was
  `56px`, `padding` `1rem 2rem`, `border-radius` `0.25rem`; `.btn-outline`
  padding follows. Same rendered button at a 16px root. `border-width` stays px
  with every other border width, which leaves the two variants a sub-pixel apart
  at other roots — the alternative was a fuzzy hairline.

- **Letter-spacing is emitted in `em`, against its own rule's `font-size`.**
  `.supertitle` is `0.1428571429em` where it was `0.125rem` — the same 2px at
  14px, and now still 2px-worth under `.fs-32` instead of frozen. Only
  `.supertitle` carries tracking in the default `$typography`; a project that
  set its own in px will see every one of them move.

- **Breakpoints divide by a literal 16px, not `$base-font-size`.** At the
  default 16px nothing moves. At `$base-font-size: 20px` the `xxl` query was
  firing at 1344px against a container still 1680px wide; it now emits `105rem`
  against the container's `84rem`, both landing on 1680px, both still scaling
  with the reader. New `helpers.query-width()` does the media-query conversion,
  `helpers.emit-length()` keeps the document one, and `helpers.toEm()` takes an
  optional third argument for the reference to divide by.

- `.prose` code and `pre` radii convert with every other radius, instead of
  being the two hardcoded px corners in the file.

- **The button's label is readable on its fill.** `.btn` set `color: background`
  over `background-color: primary` — white on `#f6c026`, **1.68:1**, and
  `#1a1a1d` on `#3f00ff` in dark mode, **2.2:1**. Both are below the 4.5:1 WCAG
  AA floor for body text, so the library's one component primitive shipped
  unreadable by default. `.btn-inverted:hover` reverts the fill to `primary` and
  had the same pair.

  `primary` is why, and it is not a bug in the colour: a brand colour carries no
  contrast floor by design — that is what `accent` exists for — so nothing but
  `foreground` is guaranteed to read on it. **`.btn` now takes
  `color: foreground`, and every rule that changes the fill restates the label
  with it**: `.btn:hover` and `.btn-inverted` take `color: background` over the
  `foreground` fill, `.btn-inverted:hover` takes `color: foreground` over
  `primary`. 10.3:1 and 17.4:1 light, 7.9:1 and 17.4:1 dark.

  **A filled button's text colour flips**, dark on the brand fill where it was
  white. If you were relying on the old pair, set `color` yourself — `.btn`
  writes it directly, so a utility class or your own rule overrides it without
  `!important`.
