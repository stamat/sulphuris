#!/usr/bin/env node
// Turns the `html` samples in the docs into live previews, so a page that
// documents a utility also shows what it does — and lets a visitor edit the
// sample and watch the result change.
//
// A page opts a sample in with a `<!-- demo -->` marker on the line above its
// fence — the same shape of contract as the `<!-- config: … -->` markers in
// script/gen-config-docs.mjs. The sample is the only source: the preview is
// built from the fence's own markup, so the two cannot drift.
//
// An optional width after the marker — `<!-- demo 1024 -->` — is the width the
// preview opens at. It exists because a preview frame in a docs column is a ~700px
// viewport and media queries inside it read that honestly, so a responsive sample
// would only ever show its narrow layout. The element renders at the asked-for width
// and scales the result down to fit; every demo also gets buttons to switch between
// widths. Samples that are not about breakpoints can leave it off and open at the
// frame's natural width.
//
// A trailing `grid` — `<!-- demo 1024 grid -->` — lays the twelve column guides
// behind the sample, for the samples that are about the columns themselves. See
// `guideTemplate` below.
//
// All this script does is wrap the fence in a `<code-preview>` element and link the
// asset pair that defines it. Everything else — the iframe, its sizing, theme
// mirroring, editing, the width switcher — is the code-preview-element package,
// running in the browser where `code.textContent` is already the raw sample.
// Building previews here instead meant unpicking hljs's spans, re-escaping the
// result into a `srcdoc` attribute and shipping every sample twice.
//
// Two things stay server-side because this is where the information is: the per-page
// prefix for the frame's stylesheet urls — a srcdoc document's base url is the parent
// page's, so `../../dist/…` has to be right for the page the demo sits on — and the
// marker check below.
//
// This runs on the built HTML (poops' `exec.markup` fires after the stage compiles),
// not on the markdown, so the wrapper stays out of the sources, the search index and
// llms-full.txt.
//
// The marker survives into the output, and the element goes between it and the
// fence — which is exactly what the pattern below requires to be absent, so a re-run
// over an already-wrapped page is a no-op. That matters in watch mode: an incremental
// rebuild recompiles only the pages that changed, and this still walks all of them.
import assert from 'node:assert/strict'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

// poops runs this from site/, npm scripts from the repo root.
const root = path.resolve(import.meta.dirname, '..')
const distDir = 'site/dist'

// The same two families the landing page loads — without them the typography and
// button previews fall back and misrepresent the library.
const FONTS = 'https://fonts.googleapis.com/css?family=Nunito|Roboto:400,700'

// Sulphuris reads [data-color-scheme]; poops-docs-theme writes [data-theme].
const THEME_ATTR = 'data-color-scheme'

// The widths on offer are the library's own breakpoints, read from the same
// src/core/_config.scss that gen-config-docs.mjs documents — a hardcoded list here
// would quietly stop matching the day a breakpoint moves, and the whole point of the
// switcher is to show what happens at those exact widths.
const configFile = 'src/core/_config.scss'
const config = await readFile(path.join(root, configFile), 'utf8')
const map = /\$breakpoints:\s*\(([^)]*)\)/.exec(config)
assert.ok(map, `${configFile}: no $breakpoints map to read the preview widths from`)
const breakpoints = [...map[1].matchAll(/(\d+)px/g)].map((match) => Number(match[1])).sort((a, b) => a - b)
assert.ok(breakpoints.length, `${configFile}: $breakpoints has no px values`)

// Plus one width below the smallest breakpoint, so a sample's pre-breakpoint layout
// is on offer too — a frame in the docs column is ~700px, which is already past it.
const PHONE = 375
const WIDTHS = (breakpoints[0] > PHONE ? [PHONE, ...breakpoints] : breakpoints).join(' ')

// Both from code-preview-element: the script is bundled by site/poops.json, the
// stylesheet copied out of the package's own dist. Its hljs companion stylesheet is
// deliberately not linked — the docs theme already ships syntax colours.
const SCRIPT = 'js/code-preview.min.js'
const STYLES = 'code-preview.min.css'

/* ---------------------------------------------------------------- guides -- */

const GUIDES = 'grid-guides'
const CONTAINER_GUIDES = 'grid-guides-container'

// What `grid` on a marker draws: the library's own columns, laid in the frame underneath
// the sample by the element's `backdrop` attribute. They are a `.grid.grid-gutter` row of
// `.col-*` rather than a ruler of their own, so they cannot drift from the grid they are
// guiding — and because they are inside the frame they answer its width, so pressing the
// width buttons shows a `.col-lg-4` landing on four of them instead of the reader being
// told that it does.
//
// The `<style>` travels with the markup. The frame loads the fonts and
// `dist/sulphuris.css` and nothing else, so there is no docs stylesheet in there to put
// this in, and one `<style>` in the template is a smaller thing than a stylesheet to
// build, copy and link for three demos.
//
// Fixed and inset, which is the one rule `backdrop` has: scenery that is in flow
// measures as content, and the preview would grow by the height of its own backdrop.
// `padding-inline` restates the frame's default `body{padding:1rem}`, which a fixed box
// is outside of. No block padding — the bands run the frame's full height, so they read
// as the columns' territory rather than as boxes floating behind the sample, and they
// stay visible above and below cards that are opaque.
//
// The pale pink is code-preview-element's own guide colour, one value per scheme rather
// than a tint of `currentcolor`: a mix of the text colour is grey on one side of the
// switch and grey on the other, and grey behind a `.bg-gray-200` card is the sample's
// own palette pretending to be scenery. `theme-attribute` mirrors the docs switch onto
// the frame's `<html>` as `[data-color-scheme]`, which is the same hook Sulphuris' own
// dark values hang off — so the guides turn over with everything else in there.
const guideStyle = '<style>' +
  '.grid-guides{position:fixed;inset:0;z-index:-1;padding-inline:1rem}' +
  '.grid-guides>.grid{height:100%}' +
  '.grid-guides i{display:block;height:100%;background:#fbe4ef}' +
  '[data-color-scheme=dark] .grid-guides i{background:#3a1a2a}' +
  '</style>'

// Four columns on a phone, six from `md`, twelve from `lg`. Twelve at every width is a
// 31px column on a 375px frame — a hatch rather than a guide, and nothing a reader can
// count a `.col-6` against. The steps are the library's own responsive column classes
// and its own display utilities, so the guides answer whatever `$breakpoints` says and
// this script never names a width; the extra columns are hidden rather than narrowed
// because twelve `.col-3` would wrap into three rows and stack bands down the frame.
const guideColumn = (n) =>
  n <= 4 ? '<div class="col-3 col-md-2 col-lg-1"><i></i></div>'
    : n <= 6 ? '<div class="col-md-2 col-lg-1 d-none d-md-block"><i></i></div>'
      : '<div class="col-lg-1 d-none d-lg-block"><i></i></div>'

// `aria-hidden` because twelve empty boxes are decoration, and a screen reader reading
// the set before every sample is worse than no set at all.
const guideTemplate = (id) =>
  `<template id="${id}">${guideStyle}<div class="grid-guides" aria-hidden="true">` +
  `<div class="grid grid-gutter${id === CONTAINER_GUIDES ? ' container' : ''}">` +
  Array.from({ length: 12 }, (_, i) => guideColumn(i + 1)).join('') +
  '</div></div></template>'

/* ----------------------------------------------------------------- pages -- */

// The marker owns the fence directly below it, and may carry the width to open at and a
// request for the column guides.
const marker = /<!-- demo(?: +(\d+))?( +grid)? -->\s*(<pre><code class="hljs language-html">[\s\S]*?<\/code><\/pre>)/g
const anyMarker = /<!-- demo(?: +\d+)?(?: +grid)? -->/g

const pages = (await readdir(path.join(root, distDir), { recursive: true }))
  .filter((entry) => entry.endsWith('.html'))
  .map((entry) => path.join(distDir, entry))
  .sort()

let demos = 0
const written = []

for (const page of pages) {
  const before = await readFile(path.join(root, page), 'utf8')
  const markers = before.match(anyMarker)
  if (!markers) continue
  // Counted from the markers, not the substitutions, so the total holds on a re-run
  // over a file that is already wrapped.
  demos += markers.length

  // `docs/grid/index.html` is two levels down, so its assets are two levels up.
  const depth = path.relative(distDir, page).split(path.sep).length - 1
  const prefix = '../'.repeat(depth)
  const styles = `${FONTS} ${prefix}dist/sulphuris.css`

  // Only the guide templates a page actually asked for are written into it.
  const guides = new Set()

  let after = before.replace(marker, (_, width, grid, fence) => {
    const open = width ? ` viewport-width="${width}"` : ''
    // The guides have to be the sample's own row, because `.container` pads where a bare
    // `.grid-gutter` has negative margins — a whole gutter apart at every width. Read off
    // the fence rather than asked for again in the marker: the row is right there, and a
    // second place to say it is a second place for it to stop agreeing.
    const id = !grid ? '' : fence.includes('container') ? CONTAINER_GUIDES : GUIDES
    if (id) guides.add(id)
    return `<!-- demo${width ? ` ${width}` : ''}${grid ? ' grid' : ''} --><code-preview css="${styles}"` +
      ` theme-attribute="${THEME_ATTR}" viewport-widths="${WIDTHS}"${open}` +
      `${id ? ` backdrop="${id}"` : ''}>${fence}</code-preview>`
  })

  // A marker the pattern did not consume is one that isn't sitting on an `html`
  // fence — a silent no-op otherwise, and the page still claims a preview.
  const stray = after.replace(/<!-- demo(?: +\d+)?(?: +grid)? --><code-preview/g, '').match(anyMarker)
  assert.equal(stray, null, `${page}: <!-- demo --> not followed by an \`html\` code fence`)

  // Only pages that have a demo pay for the editor bundle. The stylesheet goes last
  // in head so it outranks the theme's `.prose iframe` rule, which the two selectors
  // tie with on specificity.
  if (after !== before && !after.includes(SCRIPT)) {
    assert.ok(after.includes('</head>'), `${page}: no </head> to add the preview stylesheet to`)
    assert.ok(after.includes('</body>'), `${page}: no </body> to add the preview script to`)
    const templates = [...guides].map(guideTemplate).join('\n')
    after = after
      .replace('</head>', `<link rel="stylesheet" href="${prefix}${STYLES}">\n</head>`)
      .replace('</body>', `${templates}\n<script src="${prefix}${SCRIPT}"></script>\n</body>`)
  }

  if (after !== before) await writeFile(path.join(root, page), after)
  written.push(page)
}

assert.ok(demos, `no <!-- demo --> markers found under ${distDir} — did the markup stage run?`)

console.log(`[docs] live previews wired: ${demos}, across ${written.length} page(s)`)
