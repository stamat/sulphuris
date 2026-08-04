# Contributing to Sulphuris

Issues and pull requests are welcome. Taking part means keeping to the
[Code of Conduct](CODE_OF_CONDUCT.md).

Sulphuris is a utility library that generates itself: one config map in
`src/core/_config.scss`, and Sass generators that fan it out into classes. That
is the shape to keep. A utility that has to be written out by hand, or an option
that cannot be expressed as a config value, is a sign the change belongs in the
generator rather than beside it.

## Getting set up

```bash
git clone https://github.com/stamat/sulphuris.git
cd sulphuris
npm install
```

```bash
script/server    # dev server for the docs site, with live reload
script/build     # compiles dist/sulphuris.css and regenerates the docs it feeds
script/lint      # stylelint over src/
script/test      # typecheck, build, and the CSS checks
script/a11y      # axe over the built demos, in Chromium — build the site first
```

`script/test` is not a unit suite: it compiles the library and runs
`script/check-grid-css.mjs`, `check-utility-css.mjs` and `check-palette-css.mjs`
over the output, asserting that what Sass emitted is what the config asked for.
That is where a generator bug shows up.

## Reporting a bug

[Open an issue](../../issues/new/choose) — the form asks for the markup, the
config override, the version, and which browsers show it. Say whether you import
the SCSS source or the built CSS; the two take different paths.

## Pull requests

- **Fix the generator, not the class.** If one utility is wrong, the others it
  is generated with are usually wrong too.
- **Extend the checks.** A new generator gets an assertion in the matching
  `script/check-*.mjs` — that is this project's version of a test.
- **Rebuild `dist/`.** It is committed, because the package ships it. A source
  change without its compiled CSS is half a change.
- **Let the docs regenerate.** The class reference and the config tables are
  written by `script/gen-*.mjs` on every build; review that diff rather than
  editing the generated pages.
- **Run `script/lint`.** stylelint is the authority, and CI runs it.
- **Run `script/a11y`** when you touch a colour, a component or a demo. It
  builds nothing itself — `script/server -b` first — then opens every live
  preview in Chromium and runs axe inside it, once light and once dark. It is
  the only check that sees a class rendered rather than emitted:
  `check-palette-css.mjs` proves a grade clears its contrast floor, this proves
  the pair a sample puts on screen does. It audits the previews and not the
  pages around them, so a violation it prints is Sulphuris' and not the docs
  theme's, and a rule it cannot decide is listed as needing review rather than
  failing the run.
- **Add a changelog entry** under `## [Unreleased]` in
  [CHANGELOG.md](CHANGELOG.md) — that file explains the format, including which
  changes count as breaking here.

Commit messages are freeform, write something that says what changed.

## How a release works

`script/publish [version]` bumps `package.json`, runs `script/changelog` to cut
`[Unreleased]` into a released entry, builds, tags and pushes. Pushing the tag
triggers [publish.yml](.github/workflows/publish.yml), which publishes to npm
via trusted publishing — OIDC, no tokens stored anywhere. The changelog entry
becomes the body of the GitHub release verbatim.
