#!/usr/bin/env node
// Guards the utility families whose output is computed rather than copied, so a
// bad edit produces wrong CSS instead of a build error.
//
// `.fs-*` runs px through `toRem()`, `.order-*` relies on a numeric map key
// rendering as a `--` class name, and the transform families use the standalone
// `translate`/`rotate`/`scale` properties (not the `transform` shorthand) so
// they compose. `$rem-units` is the same shape of risk: it runs every size
// family through `toRem()` while the class names stay px-named, so a break
// shows up as a wrong value under a right-looking selector. All silent
// otherwise.
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
  '.rotate-xxl-90': 'rotate: 90deg',
  // $rem-units: px class name, rem value, same rendered size at a 16px root
  '.p-32': 'padding: 2rem',
  '.pt-16': 'padding-top: 1rem',
  '.p-0': 'padding: 0',
  '.m--16': 'margin: -1rem',
  '.m-auto': 'margin: auto',
  '.gap-24': 'gap: 1.5rem',
  '.t-8': 'top: 0.5rem',
  '.max-w-256': 'max-width: 16rem',
  '.p-md-24': 'padding: 1.5rem',
  // values carrying their own unit are never touched
  '.w-50p': 'width: 50%',
  '.h-100vh': 'height: 100vh',
  // opted out of rem: border widths go fuzzy at fractional sizes, and a corner
  // radius is a fixed detail rather than something that scales with text
  '.border-2': 'border-width: 2px',
  '.rounded-8': 'border-radius: 8px'
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

// The class names are the contract: `$rem-units` changes values only, so a px
// name that stopped resolving means the conversion ate the name too.
const strayRem = [...rules].filter(([s]) => /rem\b/.test(s)).map(([s]) => s)
assert.deepStrictEqual(strayRem, [], 'size class names stay px-named under $rem-units')

console.log(`[check] utilities ok: ${Object.keys(expected).length} assertions, ${transforms.length} transform selectors`)
