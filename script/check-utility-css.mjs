#!/usr/bin/env node
// Guards the utility families whose output is computed rather than copied, so a
// bad edit produces wrong CSS instead of a build error.
//
// `.fs-*` runs px through `toRem()`, `.order-*` relies on a numeric map key
// rendering as a `--` class name, and the transform families use the standalone
// `translate`/`rotate`/`scale` properties (not the `transform` shorthand) so
// they compose. All three are silent when they break.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import postcss from 'postcss'

const file = process.argv[2] ?? 'dist/sulphuris.css'
const root = postcss.parse(await readFile(file, 'utf8'))

const rules = new Map()
root.walkRules((rule) => {
  const decls = rule.nodes.filter((n) => n.type === 'decl')
  if (decls.length === 1) rules.set(rule.selector, `${decls[0].prop}: ${decls[0].value}`)
})

const expected = {
  // px name in, rem value out, at $base-font-size: 16px
  '.fs-12': 'font-size: 0.75rem',
  '.fs-16': 'font-size: 1rem',
  '.fs-96': 'font-size: 6rem',
  '.lh-1': 'line-height: 1',
  '.lh-tight': 'line-height: 1.2',
  // `flex-grow` alone leaves basis auto — the shorthand is the point
  '.flex-1': 'flex: 1 1 0%',
  '.flex-auto': 'flex: 1 1 auto',
  '.flex-none': 'flex: none',
  '.align-baseline': 'align-items: baseline',
  '.justify-space-evenly': 'justify-content: space-evenly',
  '.flex-wrap-reverse': 'flex-wrap: wrap-reverse',
  '.order--1': 'order: -1',
  '.order-first': 'order: -9999',
  '.order-last': 'order: 9999',
  '.overflow-clip': 'overflow: clip',
  '.overflow-x-scroll': 'overflow-x: scroll',
  '.text-balance': 'text-wrap: balance',
  // standalone properties, never `transform:` — that is what makes them compose
  '.translate-x--50': 'translate: -50%',
  '.translate-y--50': 'translate: 0 -50%',
  '.scale-110': 'scale: 1.1',
  '.rotate--45': 'rotate: -45deg',
  // one responsive variant per generator: breakpoint sits before the value
  '.fs-md-24': 'font-size: 1.5rem',
  '.lh-lg-loose': 'line-height: 1.75',
  '.flex-xl-1': 'flex: 1 1 0%',
  '.order-sm-first': 'order: -9999',
  '.rotate-xxl-90': 'rotate: 90deg'
}

for (const [selector, decl] of Object.entries(expected)) {
  assert.equal(rules.get(selector), decl, `${selector} should be \`${decl}\``)
}

// `.text-nowrap` is `white-space`; a `text-wrap: nowrap` class one character
// away from it would be indistinguishable in markup.
assert.equal(rules.get('.text-nowrap'), 'white-space: nowrap', '.text-nowrap must stay the white-space one')
assert.ok(!rules.has('.text-wrap-nowrap'), 'no text-wrap: nowrap class — it collides with .text-nowrap')

const transforms = [...rules].filter(([s]) => /^\.(translate-[xy]|scale|rotate)-/.test(s))
const shorthand = transforms.filter(([, d]) => d.startsWith('transform:')).map(([s]) => s)
assert.deepStrictEqual(shorthand, [], 'transform families must use the standalone properties so they compose')

console.log(`[check] utilities ok: ${Object.keys(expected).length} assertions, ${transforms.length} transform selectors`)
