#!/usr/bin/env node
// Strips comments from the unminified build. Poops has no PostCSS hook, so this
// runs as a post-build pass. Kept: the Poops banner (first node in the file) and
// `/*! */` licence comments — the same ones esbuild keeps in the minified build.
//
// Removes comment nodes only. postcss-discard-comments also rewrites every
// node's `raws.between`, which collapses `.foo {` to `.foo{` and `a: b` to
// `a:b` — unacceptable in the file that exists to be read.
import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { basename } from 'node:path'
import postcss from 'postcss'

const css = process.argv[2] ?? 'dist/sulphuris.css'
const map = `${css}.map`

const stripComments = {
  postcssPlugin: 'strip-comments',
  OnceExit: (root) => {
    root.walkComments((comment) => {
      if (comment !== root.first && !comment.text.startsWith('!')) comment.remove()
    })
  }
}

const result = await postcss([stripComments]).process(await readFile(css, 'utf8'), {
  from: css,
  to: css,
  map: { inline: false, prev: await readFile(map, 'utf8').catch(() => false) }
})

const kept = result.css.match(/\/\*[\s\S]*?\*\//g) ?? []
const unexpected = kept.filter((c, i) => i !== 0 && !c.startsWith('/*!') && !c.startsWith('/*#'))
assert.ok(kept[0]?.startsWith('/*'), 'banner missing from stripped output')
assert.deepStrictEqual(unexpected, [], 'comments survived the strip pass')

await writeFile(css, result.css)
if (result.map) await writeFile(map, result.map.toString())

console.log(`[postcss] comments stripped: ${basename(css)} (kept ${kept.length})`)
