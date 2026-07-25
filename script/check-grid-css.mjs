#!/usr/bin/env node
// Guards the native-grid output. `grid-track-map` / `grid-span-map` build plain
// Sass maps that get interpolated straight into declaration values, so a bad
// edit produces wrong CSS rather than a build error — nothing else would catch
// it.
//
// Also locks the `col-` invariant: `.grid-gutter > [class*='col-']` in
// core/layout/_grid.scss pads flex-grid children, so any native-grid class
// carrying `col-` in its name would silently inherit 8/16px of side padding.
// That is why the classes are `.grid-column-span-*`, not `.grid-col-span-*`.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import postcss from 'postcss'

const file = process.argv[2] ?? 'dist/sulphuris.css'
const root = postcss.parse(await readFile(file, 'utf8'))

// selector => declaration text, for single-declaration utility rules
const rules = new Map()
const classNames = new Set()
root.walkRules((rule) => {
  for (const [, name] of rule.selector.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) classNames.add(name)
  const decls = rule.nodes.filter((n) => n.type === 'decl')
  if (decls.length === 1) rules.set(rule.selector, `${decls[0].prop}: ${decls[0].value}`)
})

const expected = {
  '.grid-cols-3': 'grid-template-columns: repeat(3, minmax(0, 1fr))',
  '.grid-cols-12': 'grid-template-columns: repeat(12, minmax(0, 1fr))',
  '.grid-rows-6': 'grid-template-rows: repeat(6, minmax(0, 1fr))',
  '.grid-column-span-2': 'grid-column: span 2 / span 2',
  '.grid-column-span-full': 'grid-column: 1 / -1',
  '.grid-row-span-6': 'grid-row: span 6 / span 6',
  '.grid-row-span-full': 'grid-row: 1 / -1',
  '.grid-flow-row': 'grid-auto-flow: row',
  '.grid-flow-column': 'grid-auto-flow: column',
  '.grid-flow-dense': 'grid-auto-flow: dense',
  '.grid-flow-row-dense': 'grid-auto-flow: row dense',
  '.grid-flow-column-dense': 'grid-auto-flow: column dense',
  // one responsive variant per generator: breakpoint sits before the value
  '.grid-cols-md-3': 'grid-template-columns: repeat(3, minmax(0, 1fr))',
  '.grid-rows-lg-2': 'grid-template-rows: repeat(2, minmax(0, 1fr))',
  '.grid-column-span-xl-4': 'grid-column: span 4 / span 4',
  '.grid-row-span-sm-full': 'grid-row: 1 / -1',
  '.grid-flow-xxl-column': 'grid-auto-flow: column'
}

for (const [selector, decl] of Object.entries(expected)) {
  assert.equal(rules.get(selector), decl, `${selector} should be \`${decl}\``)
}

// Ranges are config-driven, so assert the edges rather than every step.
assert.ok(!rules.has('.grid-cols-13'), '.grid-cols-* should stop at $columns')
assert.ok(!rules.has('.grid-rows-7'), '.grid-rows-* should stop at $rows')
assert.ok(!rules.has('.grid-row-span-7'), '.grid-row-span-* should stop at $rows')

// Per class token, not per selector: `.grid-reverse .col-offset-1` is fine, a
// class *named* `grid-col-span-1` is not.
const offenders = [...classNames].filter((c) => c.includes('col-') && !c.startsWith('col-'))
assert.deepStrictEqual(offenders, [], 'class name contains `col-`; .grid-gutter will pad it as a flex column')

console.log(`[check] native grid ok: ${[...rules.keys()].filter((s) => s.startsWith('.grid-')).length} selectors`)
