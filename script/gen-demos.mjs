#!/usr/bin/env node
// Turns the `html` samples in the docs into live previews, so a page that
// documents a utility also shows what it does.
//
// A page opts a sample in with a `<!-- demo -->` marker on the line above its
// fence — the same shape of contract as the `<!-- config: … -->` markers in
// script/gen-config-docs.mjs. The sample is the only source: the preview is
// built from the fence's own markup, so the two cannot drift.
//
// The preview is an `<iframe srcdoc>` rather than markup inlined into the page,
// because sulphuris cannot be loaded into the docs shell. Most of its tag-level
// CSS sits in `@layer base` and would lose to the theme, but `html`, `body`,
// `h1`–`h6`, `p`, `small` and `* { box-sizing }` are unlayered — loading the
// stylesheet would restyle the docs themselves. Scoping the CSS under a wrapper
// selector is no better: `:root` goes with it and the custom properties die.
// An iframe is the isolation, and for a CSS library it is also the honest
// demo — the preview is a real page using the real dist/sulphuris.css.
//
// This runs on the built HTML (poops' `exec.markup` fires after the stage
// compiles), not on the markdown, so the iframes stay out of the sources, the
// search index and llms-full.txt — where a serialised copy of every sample
// would be noise. Injection puts the iframe between the marker and its fence,
// which is exactly what the marker pattern requires to be absent, so a re-run
// over an already-patched file is a no-op.
import assert from 'node:assert/strict'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

// poops runs this from site/, npm scripts from the repo root.
const root = path.resolve(import.meta.dirname, '..')
const distDir = 'site/dist'

// The preview's own script. Same-origin (srcdoc inherits the parent's origin),
// so it can both read the docs' theme and size its own frame.
//
// Height: an iframe has no intrinsic one. Rather than have the parent listen
// for a postMessage, the frame sets its own `frameElement` height — the parent
// side of the contract is then just the CSS in site/src/scss/docs.scss, and a
// `max-height` there is what keeps a `100vh`-tall sample from feeding its own
// growth back through `scrollHeight`.
//
// Theme: sulphuris reads `[data-color-scheme]`, poops-docs-theme writes
// `[data-theme]`. Mirroring the one onto the other is the whole integration.
const frameScript = `(function () {
  var root = document.documentElement
  var top = parent.document.documentElement
  var sync = function () { root.dataset.colorScheme = top.dataset.theme || 'light' }
  var fit = function () { frameElement.style.height = root.scrollHeight + 'px' }
  sync()
  addEventListener('load', fit)
  addEventListener('resize', fit)
  document.fonts.ready.then(fit)
  new MutationObserver(function () { sync(); fit() }).observe(top, { attributes: true, attributeFilter: ['data-theme'] })
})()`

// highlight.js wraps every token in a `<span>`; the sample's own markup is what
// is left once those come off and the entities go back.
function sample (highlighted) {
  return highlighted
    .replace(/<span[^>]*>|<\/span>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Last: an unescaped `&` must not re-arm the entities above.
    .replace(/&amp;/g, '&')
}

// srcdoc is an attribute, so the document inside it is escaped as attribute
// text. Double quotes delimit it, single ones are free for the markup.
const attribute = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')

// A srcdoc document's base URL is the parent's, so the stylesheet is addressed
// the way the page itself would address it.
function preview (markup, prefix) {
  const document = [
    '<!DOCTYPE html><meta charset="utf-8">',
    // The same two families the landing page loads — without them the
    // typography and button previews fall back and misrepresent the library.
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Nunito|Roboto:400,700">',
    `<link rel="stylesheet" href="${prefix}dist/sulphuris.css">`,
    '<style>body{margin:0;padding:16px}</style>',
    `<script>${frameScript}</script>`,
    markup.trim()
  ].join('')

  return `<iframe class="demo" title="Rendered preview" loading="lazy" srcdoc="${attribute(document)}"></iframe>`
}

/* ----------------------------------------------------------------- pages -- */

// The marker owns the fence directly below it. Anchoring the two together is
// what makes injection idempotent — afterwards the iframe sits between them.
const marker = /<!-- demo -->\s*(<pre><code class="hljs language-html">([\s\S]*?)<\/code><\/pre>)/g

const pages = (await readdir(path.join(root, distDir), { recursive: true }))
  .filter((entry) => entry.endsWith('.html'))
  .map((entry) => path.join(distDir, entry))
  .sort()

let demos = 0
const written = []

for (const page of pages) {
  const before = await readFile(path.join(root, page), 'utf8')
  const markers = before.match(/<!-- demo -->/g)
  if (!markers) continue
  // Counted from the markers, not the substitutions, so the total holds on a
  // re-run over a file that is already patched.
  demos += markers.length

  // `docs/grid/index.html` is two levels down, so its assets are two levels up.
  const depth = path.relative(distDir, page).split(path.sep).length - 1
  const prefix = '../'.repeat(depth)

  const after = before.replace(marker, (_, fence, code) => `<!-- demo -->${preview(sample(code), prefix)}${fence}`)

  // A marker the pattern did not consume is one that isn't sitting on an `html`
  // fence — a silent no-op otherwise, and the page still claims a preview.
  const stray = after.replace(/<!-- demo --><iframe/g, '').match(/<!-- demo -->/g)
  assert.equal(stray, null, `${page}: <!-- demo --> not followed by an \`html\` code fence`)

  if (after !== before) await writeFile(path.join(root, page), after)
  written.push(page)
}

assert.ok(demos, `no <!-- demo --> markers found under ${distDir} — did the markup stage run?`)

console.log(`[docs] live previews rendered: ${demos}, across ${written.length} page(s)`)
