#!/usr/bin/env node
// Rewrites `scss` blocks in the docs pages from src/core/_config.scss, so
// documented defaults cannot drift from the shipped ones — they used to be
// retyped by hand and had already gone stale (hex casing, an abridged
// $typography map).
//
// Any page under site/src/markup/docs/ can opt in with a
// `<!-- config: name, name -->` marker naming the variables it wants, in the
// order they should appear. The marker is the whole contract: the `scss` fence
// below it is written if missing and overwritten if present. Unmarked blocks are
// left alone — pages deliberately show overrides and extensions that differ from
// the defaults. Prose stays hand-written; source comments are not copied over,
// the page explains instead. Each group does get a `// file:line` origin line,
// the same way script/gen-reference.mjs tags the call sites it quotes.
//
// `<!-- generators: m, p -->` works the same way for the other direction: it
// quotes the `@include generators.…()` call sites that emit a prefix's classes,
// so a page can show what produces the utilities it documents. Generators that
// take no prefix (grid-column-generator and friends) are named by mixin instead.
import assert from 'node:assert/strict'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { generatorCalls } from './lib/scss-generators.mjs'

// Paths are repo-relative for display, resolved against the repo root for I/O:
// poops runs this from site/, npm scripts from the root.
const root = path.resolve(import.meta.dirname, '..')
const abs = (file) => path.join(root, file)

const configFile = 'src/core/_config.scss'
const sourceDir = 'src/core'
const pagesDir = 'site/src/markup/docs'

// The page that claims to document every variable: it must cover all of them,
// and may not carry a hand-typed declaration outside a generated block. Other
// pages quote whatever subset their topic needs.
const configPage = path.join(pagesDir, 'configuration', 'index.md')

const lines = (await readFile(abs(configFile), 'utf8')).split('\n')

// name => { text, start, end }. Declarations only: a value spans until the `;`
// that closes it at paren depth 0, so multi-line maps survive intact.
const vars = new Map()

for (let i = 0; i < lines.length; i++) {
  const name = lines[i].match(/^\$([\w-]+):/)?.[1]
  if (!name) continue

  let depth = 0
  let end = i
  for (; end < lines.length; end++) {
    for (const char of lines[end]) {
      if (char === '(') depth++
      else if (char === ')') depth--
    }
    if (depth === 0 && lines[end].trimEnd().endsWith(';')) break
  }
  assert.ok(end < lines.length, `$${name} is never terminated in ${configFile}`)

  vars.set(name, {
    text: lines.slice(i, end + 1).join('\n').replace(/\s*!default;$/, ';').replace(/[ \t]+$/gm, ''),
    start: i,
    end
  })
  i = end
}

assert.ok(vars.size > 20, `only ${vars.size} variables parsed from ${configFile}`)

/* ---------------------------------------------------------------- render -- */

// Values line up in the docs the way they do not in the config, where the names
// vary too much in length to be worth maintaining by hand.
function align (group) {
  if (group.some((text) => text.includes('\n'))) return group
  const width = Math.max(...group.map((text) => text.indexOf(':')))
  return group.map((text) => {
    const colon = text.indexOf(':')
    return `${text.slice(0, colon + 1)}${' '.repeat(width - colon + 1)}${text.slice(colon + 1).trimStart()}`
  })
}

function block (names, page) {
  const out = []
  let group = []
  let start = 0
  let previous = null

  // Each group is a contiguous run in the config, so one `file:line` for the
  // line it opens on points at the whole thing.
  const flush = () => {
    if (group.length) out.push(`// ${configFile}:${start + 1}`, ...align(group))
    group = []
  }

  for (const name of names) {
    const entry = vars.get(name)
    assert.ok(entry, `${page} documents $${name}, which is not declared in ${configFile}`)
    // A gap in the source — a blank line or a comment block — becomes a blank
    // line here, so the page inherits the config's own grouping.
    if (previous && entry.start > previous.end + 1) {
      flush()
      out.push('')
    }
    if (!group.length) start = entry.start
    group.push(entry.text)
    previous = entry
  }

  flush()
  return out.join('\n')
}

/* ------------------------------------------------------------ generators -- */

// handle => [{ file, line, text }]. A call is addressed by the prefix it emits,
// which is what the docs pages already head their sections with; the handful of
// generators that take no prefix are addressed by mixin name. Two call sites can
// share a prefix (`flex` sets both flex-direction and flex-wrap), so a handle
// holds a list and the marker quotes all of it.
const generators = new Map()

for (const { file, calls } of await generatorCalls(sourceDir, root)) {
  for (const { mixin, prefix, text, line } of calls) {
    const handle = prefix ?? mixin
    if (!generators.has(handle)) generators.set(handle, [])
    generators.get(handle).push({ file, line, text })
  }
}

assert.ok(generators.size > 20, `only ${generators.size} generator handles parsed from ${sourceDir}`)

function calls (handles, page) {
  const out = []
  for (const handle of handles) {
    const found = generators.get(handle)
    assert.ok(found, `${page} documents the '${handle}' generator, which no @include in ${sourceDir} carries`)
    for (const { file, line, text } of found) out.push(`// ${file}:${line}`, text)
  }
  return out.join('\n')
}

/* ----------------------------------------------------------------- pages -- */

// The fence is optional: a bare marker gets one inserted, an existing one is
// replaced. Its closing line is anchored with `^…$` so an empty block cannot
// let the match run on to the next section's fence.
const fence = '(?:\\n+```scss\\n[\\s\\S]*?^```$)?'
const marker = new RegExp(`<!-- config: ([^>]*?) -->${fence}`, 'gm')
const generatorMarker = new RegExp(`<!-- generators: ([^>]*?) -->${fence}`, 'gm')

const pages = (await readdir(abs(pagesDir), { recursive: true }))
  .filter((entry) => entry.endsWith('.md'))
  .map((entry) => path.join(pagesDir, entry))
  .sort()

const documented = new Set()
const written = []
let blocks = 0
let origins = 0

for (const page of pages) {
  const before = await readFile(abs(page), 'utf8')
  let found = 0

  let after = before.replace(marker, (_, list) => {
    const names = list.split(',').map((name) => name.trim().replace(/^\$/, ''))
    // Coverage is tracked for the Configuration page alone — a variable quoted
    // on a topic page is not the same as one the page-of-record documents.
    if (page === configPage) for (const name of names) documented.add(name)
    found++
    blocks++
    return `<!-- config: ${list} -->\n\n\`\`\`scss\n${block(names, page)}\n\`\`\``
  })

  after = after.replace(generatorMarker, (_, list) => {
    const handles = list.split(',').map((handle) => handle.trim())
    found++
    origins++
    return `<!-- generators: ${list} -->\n\n\`\`\`scss\n${calls(handles, page)}\n\`\`\``
  })

  if (!found) continue

  // Only the Configuration page is held to listing nothing by hand: elsewhere a
  // declaration outside a generated block is an override or extension example,
  // which is supposed to differ from the default.
  if (page === configPage) {
    const prose = after.replace(/```[\s\S]*?```/g, '')
    const copied = [...prose.matchAll(/^\$[\w-]+:.*/gm)].map((m) => m[0])
    assert.deepEqual(copied, [], `${page}: hand-copied declarations outside a generated block: ${copied.join(' ')}`)
  }

  if (after !== before) await writeFile(abs(page), after)
  written.push(page)
}

assert.ok(blocks, `no <!-- config: … --> markers found under ${pagesDir}`)

// The Configuration page claims to list every variable, so a new one has to land
// in a block there rather than quietly go undocumented.
assert.ok(written.includes(configPage), `${configPage} has no <!-- config: … --> markers`)
const missing = [...vars.keys()].filter((name) => !documented.has(name))
assert.deepEqual(missing, [], `undocumented in ${configPage}: ${missing.map((n) => `$${n}`).join(', ')}`)

console.log(`[docs] config blocks generated: ${blocks}, generator blocks: ${origins}, across ${written.length} page(s) — ${vars.size} variables, ${generators.size} generator handles`)
