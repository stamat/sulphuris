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
import path from 'node:path'
import postcss from 'postcss'
import { compile } from 'sass'

// selector => declaration text, for single-declaration utility rules
function singleDeclRules (root) {
  const found = new Map()
  root.walkRules((rule) => {
    const decls = rule.nodes.filter((n) => n.type === 'decl')
    if (decls.length === 1) found.set(rule.selector, `${decls[0].prop}: ${decls[0].value}`)
  })
  return found
}

const file = process.argv[2] ?? 'dist/sulphuris.css'
const root = postcss.parse(await readFile(file, 'utf8'))

const rules = singleDeclRules(root)

const expected = {
  // px name in, rem value out, at $base-font-size: 16px
  '.fs-12': 'font-size: 0.75rem',
  '.fs-16': 'font-size: 1rem',
  '.fs-96': 'font-size: 6rem',
  '.lh-1': 'line-height: 1',
  '.lh-tight': 'line-height: 1.25',
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
  // radii convert — a curve is antialiased, so nothing snaps
  '.rounded-8': 'border-radius: 0.5rem',
  // border widths are the one size family opted out: 2px at a 20px root is
  // 2.5px, straddling a device pixel
  '.border-2': 'border-width: 2px'
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

// The cascade split: tag defaults (`.prose`, normalize, heading margins) live in
// `@layer base`, every utility class stays unlayered. An unlayered rule beats a
// layered one at any specificity, so `.bg-white` overrides `.prose thead th`
// without an `!important` — and that holds however deep a `.prose` selector
// gets. A utility that slipped into the layer would lose to the tag rules it is
// meant to override.
function layered (rule) {
  for (let node = rule.parent; node; node = node.parent) {
    if (node.type === 'atrule' && node.name === 'layer') return true
  }
  return false
}

const unlayeredProse = []
const layeredUtilities = []

root.walkRules((rule) => {
  const isProse = rule.selectors.some((s) => s.startsWith('.prose'))
  if (isProse) {
    if (!layered(rule)) unlayeredProse.push(rule.selector)
    return
  }
  if (layered(rule) && rule.selectors.some((s) => /^\.[\w-]+$/.test(s))) layeredUtilities.push(rule.selector)
})

assert.deepStrictEqual(unlayeredProse, [], '.prose rules must stay inside @layer base')
assert.deepStrictEqual(layeredUtilities, [], 'utility classes must stay unlayered — a layered one loses to every tag default')

// Heading margins are the one place a tag default and `.prose` touch the same
// property: `.prose > :last-child` zeroes the bottom margin of a trailing
// heading, which it can only do from inside the same layer.
const headingMargins = []
root.walkRules('h1', (rule) => rule.walkDecls('margin-bottom', () => headingMargins.push(layered(rule))))
assert.deepStrictEqual(headingMargins, [true], 'h1 margin-bottom belongs in @layer base')

// The load-bearing one. An author `font-size` on `html` overrides the reader's
// browser default-size setting, which pins every rem in the stylesheet back to a
// fixed px and silently cancels everything above. A percentage is fine — it
// still scales — so only absolute units are rejected.
const rootFontSize = []
root.walkRules(/^html$/, (rule) => rule.walkDecls('font-size', (d) => rootFontSize.push(d.value)))
const rootAbsolute = rootFontSize.filter((v) => /(px|pt|cm|in)$/.test(v))
assert.deepStrictEqual(rootAbsolute, [], 'html must not set an absolute font-size — it pins every rem in the file')

// The class names are the contract: `$rem-units` changes values only, so a px
// name that stopped resolving means the conversion ate the name too.
const strayRem = [...rules].filter(([s]) => /rem\b/.test(s)).map(([s]) => s)
assert.deepStrictEqual(strayRem, [], 'size class names stay px-named under $rem-units')

// Breakpoints convert on the way into the query, so the layout switch moves
// with the reader's font-size setting instead of firing at a fixed viewport px.
// The `$breakpoints` map itself stays px — a px width reaching a query means
// `query-width()` was bypassed.
const queries = new Set()
root.walkAtRules('media', (at) => queries.add(at.params.replace(/\s+/g, '')))

assert.ok(queries.has('onlyscreenand(min-width:48rem)'), 'md must emit `min-width: 48rem` (768px)')
assert.ok(queries.has('onlyscreenand(min-width:26.25rem)'), 'sm must emit `min-width: 26.25rem` (420px)')

const pxQueries = [...queries].filter((q) => /width:[\d.]+px/.test(q))
assert.deepStrictEqual(pxQueries, [], 'media queries must not emit px widths under $rem-units')

// `$container-max-width` and the `xxl` breakpoint are the same 1680px. They have
// to stay the same width as the root font-size moves, or the container stops
// lining up with the breakpoint it was sized against.
const containerMax = []
root.walkRules('.container', (rule) => rule.walkDecls('max-width', (d) => containerMax.push(d.value)))
assert.deepStrictEqual(containerMax, ['105rem'], '.container max-width must track the xxl breakpoint')

// Gutters are halved in px and converted once, so the row's negative margin and
// its children's padding can never end up in different units.
const gutters = []
root.walkRules('.grid-gutter', (rule) => rule.walkDecls('margin-left', (d) => gutters.push(d.value)))
assert.deepStrictEqual(gutters, ['-0.5rem', '-1rem'], 'grid gutters convert as finished values (8px mobile, 16px desktop)')

// Column caps are px arithmetic (breakpoint minus offsets plus gutter, scaled)
// converted at the end, not per operand — mobile offsets are narrower, so the
// mobile cap is the wider of the two.
const colMax = []
root.walkRules('.col-6-max', (rule) => rule.walkDecls('max-width', (d) => colMax.push(d.value)))
assert.deepStrictEqual(colMax, ['52rem', '50rem'], '.col-6-max: 832px mobile, 800px from the container breakpoint')

// `$size-aliases` is off by default, so the shipped file is the proof it costs
// nothing and the fixture build is the only place its output exists.
const strayAliases = [...rules].filter(([s]) => /^\.(m|p|gap)[trblxy]?-(sm|lg)$/.test(s)).map(([s]) => s)
assert.deepStrictEqual(strayAliases, [], '$size-aliases defaults to null — the shipped build carries no alias classes')

// An alias is a second name for a step that already exists, so the alias class
// and the px class have to be the same declaration, and the px name has to
// survive. The fixture maps sm => 8, lg => 32.
const aliased = singleDeclRules(postcss.parse(compile(path.join(import.meta.dirname, 'fixtures/size-aliases.scss')).css))

const aliasExpected = {
  '.p-sm': 'padding: 0.5rem',
  '.p-8': 'padding: 0.5rem',
  '.pt-lg': 'padding-top: 2rem',
  '.pt-32': 'padding-top: 2rem',
  '.m-lg': 'margin: 2rem',
  '.mt-sm': 'margin-top: 0.5rem',
  '.gap-lg': 'gap: 2rem',
  '.gap-y-sm': 'row-gap: 0.5rem',
  // responsive: the breakpoint still sits before the value, alias or not
  '.p-md-lg': 'padding: 2rem',
  '.gap-xxl-sm': 'gap: 0.5rem'
}

for (const [selector, decl] of Object.entries(aliasExpected)) {
  assert.equal(aliased.get(selector), decl, `${selector} should be \`${decl}\` under $size-aliases`)
}

// Aliases are additive: nothing outside margin/padding/gap takes them, and no
// step of the scale is replaced by one.
assert.ok(!aliased.has('.t-sm'), 'position offsets take no aliases')
assert.equal(aliased.get('.m-auto'), 'margin: auto', 'keywords survive the alias merge')

// `$color-aliases` emits a bare `--danger` pointing at `--color-danger`. The
// indirection is the whole design: it is why one declaration on `:root` covers
// every colour mode. Copy the value in instead and light mode's red silently
// survives the switch to dark, so both halves are asserted — the pointer here,
// and its absence from the mode block below.
const customProps = (selector) => {
  const found = new Map()
  root.walkRules(selector, (rule) => rule.walkDecls(/^--/, (d) => found.set(d.prop, d.value)))
  return found
}

const rootProps = customProps(':root')
assert.equal(rootProps.get('--color-danger'), '#e41328', '--color-danger is the light-mode red')
assert.equal(rootProps.get('--danger'), 'var(--color-danger)', '$color-aliases emits a pointer, not a copy')
assert.equal(rootProps.get('--info'), 'var(--color-info)', 'every alias resolves through its --color-* source')

// Regex, not the literal from $color-modes-selector: the quotes around `dark`
// do not survive the compile.
const darkProps = customProps(/data-color-scheme=["']?dark/)
assert.equal(darkProps.get('--color-danger'), '#ef717e', 'dark mode re-picks the colour the alias points at')
assert.ok(!darkProps.has('--danger'), 'aliases track a colour mode through var(), so they are never re-emitted per mode')

console.log(`[check] utilities ok: ${Object.keys(expected).length} assertions, ${Object.keys(aliasExpected).length} alias assertions, ${transforms.length} transform selectors, ${queries.size} media queries`)
