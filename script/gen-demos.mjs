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

/* ----------------------------------------------------------------- pages -- */

// The marker owns the fence directly below it, and may carry the width to open at.
const marker = /<!-- demo(?: +(\d+))? -->\s*(<pre><code class="hljs language-html">[\s\S]*?<\/code><\/pre>)/g
const anyMarker = /<!-- demo(?: +\d+)? -->/g

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

  let after = before.replace(marker, (_, width, fence) => {
    const open = width ? ` viewport-width="${width}"` : ''
    return `<!-- demo${width ? ` ${width}` : ''} --><code-preview css="${styles}"` +
      ` theme-attribute="${THEME_ATTR}" viewport-widths="${WIDTHS}"${open}>${fence}</code-preview>`
  })

  // A marker the pattern did not consume is one that isn't sitting on an `html`
  // fence — a silent no-op otherwise, and the page still claims a preview.
  const stray = after.replace(/<!-- demo(?: +\d+)? --><code-preview/g, '').match(anyMarker)
  assert.equal(stray, null, `${page}: <!-- demo --> not followed by an \`html\` code fence`)

  // Only pages that have a demo pay for the editor bundle. The stylesheet goes last
  // in head so it outranks the theme's `.prose iframe` rule, which the two selectors
  // tie with on specificity.
  if (after !== before && !after.includes(SCRIPT)) {
    assert.ok(after.includes('</head>'), `${page}: no </head> to add the preview stylesheet to`)
    assert.ok(after.includes('</body>'), `${page}: no </body> to add the preview script to`)
    after = after
      .replace('</head>', `<link rel="stylesheet" href="${prefix}${STYLES}">\n</head>`)
      .replace('</body>', `<script src="${prefix}${SCRIPT}"></script>\n</body>`)
  }

  if (after !== before) await writeFile(path.join(root, page), after)
  written.push(page)
}

assert.ok(demos, `no <!-- demo --> markers found under ${distDir} — did the markup stage run?`)

console.log(`[docs] live previews wired: ${demos}, across ${written.length} page(s)`)
