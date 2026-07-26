#!/usr/bin/env node
// Generates docs/reference/ from the built CSS, so the class list can never
// drift from what Sass actually emits. Every hand-written docs page lists a
// curated subset; this one is the exhaustive index.
//
// Two axes are collapsed instead of enumerated, because listing them costs
// ~10x the rows and says nothing new:
//   - breakpoints: responsive rules live inside @media, so they are folded
//     back onto their base class as a `Bp` flag plus one legend table.
//   - directions: `.mt-16` / `.mx-16` are folded onto `.m-16` as a `Dir` flag.
//     A candidate only counts as a direction variant if its declarations are
//     the base property fanned out over exactly that token's sides — name
//     shape alone would swallow things like `.text-left`.
//
// Grouping is by CSS property. The source map is not usable for this: rules
// come out of mixins, so 1671 of 1788 of them trace back to _generators.scss.
import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import postcss from 'postcss'
import { generatorCalls } from './lib/scss-generators.mjs'

const cssFile = process.argv[2] ?? 'dist/sulphuris.css'
const configFile = 'src/core/_config.scss'
const sourceDir = 'src/core'
const outFile = 'site/src/markup/docs/reference/index.md'

/* ---------------------------------------------------------------- config -- */

const config = await readFile(configFile, 'utf8')

// `$name: ( … ) !default` — non-greedy stops at the `)` that carries !default,
// so nested value lists like ('right', 'left') survive.
function sassMap (name) {
  const body = config.match(new RegExp(`\\$${name}:\\s*\\(([\\s\\S]*?)\\)\\s*!default`))
  assert.ok(body, `$${name} not found in ${configFile}`)
  return body[1]
}

// token => ['top'] | ['right', 'left']
const orientations = new Map(
  [...sassMap('orientations').matchAll(/'([\w-]+)':\s*\(([^)]*)\)/g)]
    .map(([, token, props]) => [token, [...props.matchAll(/'([\w-]+)'/g)].map((m) => m[1])])
)

// token => px, sorted ascending (config lists them largest-first)
const breakpoints = new Map(
  [...sassMap('breakpoints').matchAll(/'([\w-]+)':\s*(\d+)px/g)]
    .map(([, token, px]) => [token, Number(px)])
    .sort((a, b) => a[1] - b[1])
)

const bpByWidth = new Map([...breakpoints].map(([token, px]) => [px, token]))

// Every `!default` in declaration order, so the per-section `<!-- config: … -->`
// markers list their variables consistently. The values behind those markers are
// gen-config-docs.mjs's job.
const configVars = [...config.matchAll(/^\$([\w-]+):/gm)].map((m) => m[1])

assert.ok(orientations.size, 'no orientations parsed')
assert.ok(breakpoints.size, 'no breakpoints parsed')
assert.ok(configVars.length, `no variables parsed from ${configFile}`)

/* ------------------------------------------------------------------- css -- */

// The map is loaded for hand-written rules only: mixin output all resolves to
// _generators.scss, so generated sections get their origin from the call sites
// parsed further down instead.
const root = postcss.parse(await readFile(cssFile, 'utf8'), {
  from: cssFile,
  map: { prev: await readFile(`${cssFile}.map`, 'utf8').catch(() => false) }
})

const base = new Map() // class name => [{ prop, value }]
const sourceOf = new Map() // class name => scss file it is literally written in
const complex = [] // selectors that are not a single bare class
const responsive = new Map() // base class name => Set(breakpoint token)

const isBareClass = /^\.(-?[\w-]+)$/

function bucket (map, key, empty) {
  if (!map.has(key)) map.set(key, empty)
  return map.get(key)
}

function declsOf (rule) {
  return rule.nodes.filter((n) => n.type === 'decl').map((n) => ({ prop: n.prop, value: n.value }))
}

// The breakpoint token sits between prefix and value: `.m-md-16` => `.m-16`.
function stripBreakpoint (name, bp) {
  return name.replace(`-${bp}-`, '-')
}

// Source file a rule is literally written in, or null when it came out of a
// mixin — the map points those at the mixin body, which names nothing useful.
function origin (rule) {
  const start = rule.source.start
  const resolved = rule.source.input.origin?.(start.line, start.column)
  if (!resolved?.file) return null
  const relative = path.relative(process.cwd(), resolved.file)
  return relative.endsWith('_generators.scss') ? null : relative
}

root.walkRules((rule) => {
  const media = rule.parent.type === 'atrule' && rule.parent.name === 'media' ? rule.parent : null
  const decls = declsOf(rule)
  if (!decls.length) return

  if (media) {
    const width = media.params.match(/min-width:\s*(\d+)px/)
    const bp = width && bpByWidth.get(Number(width[1]))
    if (!bp) return // container/typography queries, not a utility breakpoint
    for (const selector of rule.selectors) {
      const match = selector.match(isBareClass)
      if (!match) continue
      const stripped = stripBreakpoint(match[1], bp)
      // No token to strip means the class itself is restyled at the breakpoint
      // (`.h1`, `.container`) rather than having a `.h1-md` sibling.
      if (stripped !== match[1]) bucket(responsive, stripped, new Set()).add(bp)
    }
    return
  }

  const from = origin(rule)

  for (const selector of rule.selectors) {
    const match = selector.match(isBareClass)
    if (!match) {
      complex.push({ selector, decls })
      continue
    }
    if (from) sourceOf.set(match[1], from)
    const existing = base.get(match[1])
    if (existing) existing.push(...decls)
    else base.set(match[1], [...decls])
  }
})

assert.ok(base.size > 100, `only ${base.size} base classes parsed — is ${cssFile} built?`)

/* ------------------------------------------------------------ directions -- */

const trimEnd = (str, char) => (str.endsWith(char) ? str.slice(0, -1) : str)
const same = (a, b) => a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|')

// class name => Set(orientation token), for the classes that are a base
const directions = new Map()
const directionVariants = new Set() // folded-away names, dropped from the tables

for (const [name, decls] of base) {
  for (const [token, sides] of orientations) {
    // The token is glued to the prefix, so scan every `<token>-` boundary.
    for (let i = name.indexOf(`${token}-`); i !== -1; i = name.indexOf(`${token}-`, i + 1)) {
      const candidate = `${trimEnd(name.slice(0, i), '-')}-${name.slice(i + token.length + 1)}`
      const parent = base.get(candidate)
      if (!parent || parent.length !== 1) continue

      const expected = sides.map((side) => `${parent[0].prop}-${side}`)
      if (!same(decls.map((d) => d.prop), expected)) continue
      if (!decls.every((d) => d.value === parent[0].value)) continue

      bucket(directions, candidate, new Set()).add(token)
      directionVariants.add(name)
    }
  }
}

/* ------------------------------------------------------------- grouping -- */

// `margin-top` and `margin` are one section; `-webkit-*` folds into its root.
function group (prop) {
  const bare = prop.replace(/^-\w+-/, '')
  for (const sides of orientations.values()) {
    for (const side of sides) {
      if (bare.endsWith(`-${side}`)) return bare.slice(0, -side.length - 1)
    }
  }
  return bare
}

const COMPOSITE = 'multi-property'
const VARIABLES = 'css-variables'

// A class belongs to the deepest property root all its declarations share:
// `.border` (border-color/style/width) is `border`, `.btn` shares nothing and
// falls through to its own section.
function section (decls) {
  const parts = decls.map((d) => group(d.prop).split('-'))
  const common = parts.reduce((a, b) => a.filter((part, i) => b[i] === part))
  return common.length ? common.join('-') : COMPOSITE
}

// Rules merge when a class appears in more than one block (reset group +
// its own rule). Last declaration wins, as it would in the cascade.
function dedupe (decls) {
  const last = new Map()
  for (const decl of decls) last.set(decl.prop, decl)
  return [...last.values()]
}

const sections = new Map()
for (const [name, decls] of base) {
  if (directionVariants.has(name)) continue
  bucket(sections, section(decls), []).push({ name, decls: dedupe(decls) })
}

const byName = (a, b) => a.name.localeCompare(b.name, 'en', { numeric: true })
// COMPOSITE last: it is the leftovers bucket, not a property.
const sorted = [...sections].sort((a, b) =>
  (a[0] === COMPOSITE) - (b[0] === COMPOSITE) || a[0].localeCompare(b[0]))

/* --------------------------------------------------------------- origins -- */

// The `@include` that produced a section — the line to edit to change it.
// Parsing lives in script/lib/scss-generators.mjs, shared with gen-config-docs.

// Generators that do not take a property argument, mapped to what they emit.
const emits = {
  'grid-column-generator': 'width',
  'grid-column-max-generator': 'max-width',
  'grid-offset-generator': 'margin',
  'typography-generator': COMPOSITE,
  'css-variable-generator': VARIABLES
}

const origins = new Map() // section key => [{ file, line, text }]
const feeds = new Map() // section key => Set(config variable name)

// The config variables a call site depends on. A call reaches most of them
// directly as `config.$sizes`, but some go through a local alias first
// (`$margin-sizes: list.append(config.$sizes, 'auto')`), so aliases are followed
// as far as they go.
function configRefs (text, locals, seen = new Set()) {
  const found = new Set()
  for (const [, name] of text.matchAll(/config\.\$([\w-]+)/g)) found.add(name)

  for (const [, name] of text.matchAll(/(?<!config\.)\$([\w-]+)/g)) {
    if (seen.has(name) || !locals.has(name)) continue
    seen.add(name)
    for (const nested of configRefs(locals.get(name), locals, seen)) found.add(nested)
  }
  return found
}

for (const { file, source, calls } of await generatorCalls(sourceDir)) {
  // Local aliases, indented ones included: `_margin.scss` extends its list a
  // second time inside an `@if`, and that branch carries $negative-sizes.
  const locals = new Map()
  for (const [, name, body] of source.matchAll(/^\s*\$([\w-]+):([\s\S]*?);$/gm)) {
    locals.set(name, `${locals.get(name) ?? ''}${body}`)
  }

  for (const call of calls) {
    const property = emits[call.mixin] ?? call.property
    if (!property) continue

    const key = property === COMPOSITE || property === VARIABLES ? property : group(property)
    if (!sections.has(key) && key !== VARIABLES) continue

    bucket(origins, key, []).push({ file, line: call.line, text: call.text })

    for (const name of configRefs(call.body, locals)) {
      if (configVars.includes(name)) bucket(feeds, key, new Set()).add(name)
    }
  }
}

assert.ok(origins.size > 20, `only ${origins.size} sections traced to a generator call`)
assert.ok(feeds.size > 5, `only ${feeds.size} sections traced back to a config variable`)

// The values the section's call sites read, as a marker rather than a block:
// script/gen-config-docs.mjs fills it in on the pass after this one, which keeps
// the config parsing in one place. Names follow config declaration order.
function configBlock (key) {
  const fed = feeds.get(key)
  if (!fed) return []
  return ['Config values it reads:', '', `<!-- config: ${configVars.filter((name) => fed.has(name)).join(', ')} -->`, '']
}

// Rendered under a section heading: the call sites that generate it, each
// tagged with file:line. Sections with no generator behind them (hand-written
// rules like `.round` or the resets) fall back to naming their source files.
function originBlock (key, entries = []) {
  const calls = origins.get(key)
  if (calls) {
    return [
      '```scss',
      ...calls.flatMap(({ file, line, text }) => [`// ${file}:${line}`, text]),
      '```',
      '',
      ...configBlock(key)
    ]
  }

  const files = [...new Set(entries.map(({ name }) => sourceOf.get(name)).filter(Boolean))].sort()
  if (!files.length) return []
  return [`Hand-written in ${files.map((file) => code(file)).join(', ')}.`, '']
}

/* ------------------------------------------------------------- markdown -- */

const esc = (str) => str.replace(/\|/g, '\\|')
const code = (str) => `\`${esc(str)}\``
const value = (decls) => decls.map((d) => `${d.prop}: ${d.value}`).join('; ')

const rows = sorted.reduce((n, [, entries]) => n + entries.length, 0)
const out = []

out.push('---')
out.push('layout: docs')
out.push('title: Class Reference')
out.push('navTitle: Class Reference')
out.push('description: Every generated selector with its declarations, grouped by CSS property. Direction and breakpoint variants are collapsed into the legend tables.')
out.push('order: 17')
out.push('keywords: ["reference", "classes", "selectors", "index", "all classes", "cheatsheet"]')
out.push('---')
out.push('')
out.push('# Class Reference')
out.push('')
out.push(`Generated from \`${cssFile}\` — ${rows} base classes across ${sorted.length} properties. Rebuild with \`npm run build\` to refresh.`)
out.push('')
out.push('Direction and breakpoint variants are **not** listed row by row. A ✅ in the')
out.push('`Dir` or `Bp` column means that class also exists in the forms described below.')
out.push('')
out.push('## Directions')
out.push('')
out.push('The direction token is glued to the prefix, before the value: `.m-16` → `.mx-16`.')
out.push('')
out.push('| Token | Sets | Example |')
out.push('|---|---|---|')
for (const [token, sides] of orientations) {
  out.push(`| ${code(token)} | ${sides.map((s) => code(s)).join(', ')} | ${code(`.m${token}-16`)} |`)
}
out.push('')
out.push('## Breakpoints')
out.push('')
out.push('The breakpoint token sits between the prefix and the value: `.m-16` → `.m-md-16`.')
out.push('Combined with a direction: `.mx-md-16`. All queries are `min-width`, so the')
out.push('bare class is the mobile-first default.')
out.push('')
out.push('| Token | Media query | Example |')
out.push('|---|---|---|')
for (const [token, px] of breakpoints) {
  out.push(`| ${code(token)} | ${code(`min-width: ${px}px`)} | ${code(`.m-${token}-16`)} |`)
}
out.push('')
out.push('## Utilities')
out.push('')

for (const [prop, entries] of sorted) {
  out.push(`### ${prop}`)
  out.push('')
  out.push(...originBlock(prop, entries))
  out.push('| Class | Declarations | Dir | Bp |')
  out.push('|---|---|---|---|')
  for (const { name, decls } of entries.sort(byName)) {
    const dir = directions.get(name)
    out.push([
      '',
      code(`.${name}`),
      code(value(decls)),
      dir ? `✅ ${[...dir].map((t) => code(t)).join(' ')}` : '—',
      responsive.has(name) ? '✅' : '—',
      ''
    ].join(' | ').trim())
  }
  out.push('')
}

// Token-defining rules (`:root`, the dark-scheme override) would otherwise be
// a single unreadable table cell holding the whole palette.
const variableRules = complex.filter(({ decls }) => decls.every((d) => d.prop.startsWith('--')))

if (variableRules.length) {
  out.push('## CSS variables')
  out.push('')
  out.push('Custom properties emitted from the config maps. Override them at runtime to')
  out.push('retheme without rebuilding.')
  out.push('')
  out.push(...originBlock(VARIABLES))
  for (const { selector, decls } of variableRules) {
    out.push(`### ${code(selector)}`)
    out.push('')
    out.push('| Variable | Value |')
    out.push('|---|---|')
    for (const decl of decls) out.push(`| ${code(decl.prop)} | ${code(decl.value)} |`)
    out.push('')
  }
}

const structural = complex.filter((rule) => !variableRules.includes(rule))

if (structural.length) {
  out.push('## Structural selectors')
  out.push('')
  out.push('Rules that are not a single utility class — resets, component internals and')
  out.push('context-dependent rules.')
  out.push('')
  out.push('| Selector | Declarations |')
  out.push('|---|---|')
  for (const { selector, decls } of structural) {
    out.push(`| ${code(selector)} | ${code(value(decls))} |`)
  }
  out.push('')
}

await mkdir(new URL('.', new URL(outFile, `file://${process.cwd()}/`)), { recursive: true })
await writeFile(outFile, out.join('\n'))

console.log(`[docs] reference generated: ${rows} classes, ${sorted.length} sections, ${structural.length} structural rules`)
