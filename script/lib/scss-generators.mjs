// Every `@include generators.…()` call site in the Sass sources, read from
// source rather than the source map: the map resolves generated rules to the
// mixin body in _generators.scss instead of the call that produced them.
//
// Shared by script/gen-reference.mjs (which groups them by CSS property) and
// script/gen-config-docs.mjs (which quotes them under a `<!-- generators: … -->`
// marker), so the argument parsing lives in one place.
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

// utility-class-generator($prefix, $property, $values, …)
const PREFIX_ARG = 0
const PROPERTY_ARG = 1

// Splits an argument list on top-level commas only, so nested lists and maps
// like `('block', 'inline')` survive as one argument.
export function args (text) {
  const out = ['']
  let depth = 0
  let quote = null
  for (const char of text) {
    if (quote) quote = char === quote ? null : quote
    else if (char === "'" || char === '"') quote = char
    else if (char === '(') depth++
    else if (char === ')') depth--
    else if (char === ',' && depth === 0) { out.push(''); continue }
    out[out.length - 1] += char
  }
  return out.map((arg) => arg.trim())
}

export const unquote = (arg) => arg.match(/^'([^']*)'$/)?.[1] ?? arg.match(/^"([^"]*)"$/)?.[1]

// Map form carries the value as a key; positional form as an argument.
function argument (body, key, position) {
  return unquote(body.match(new RegExp(`${key}:\\s*('[^']*'|"[^"]*")`))?.[1] ?? '') ??
    unquote(args(body)[position] ?? '')
}

// dir is relative to root and is kept as the display path — the scripts print
// and write these paths into the docs, where cwd means nothing.
export async function generatorCalls (dir, root = '') {
  const entries = await readdir(path.join(root, dir), { recursive: true })
  const files = entries.filter((entry) => entry.endsWith('.scss')).map((entry) => path.join(dir, entry)).sort()

  const out = []

  for (const file of files) {
    const source = await readFile(path.join(root, file), 'utf8')
    const calls = []

    for (const call of source.matchAll(/@include\s+generators\.([\w-]+)\(/g)) {
      let depth = 1
      let end = call.index + call[0].length
      while (end < source.length && depth > 0) {
        if (source[end] === '(') depth++
        else if (source[end] === ')') depth--
        end++
      }

      const body = source.slice(call.index + call[0].length, end - 1)
      calls.push({
        mixin: call[1],
        prefix: argument(body, 'prefix', PREFIX_ARG),
        property: argument(body, 'property', PROPERTY_ARG),
        body,
        text: source.slice(call.index, source[end] === ';' ? end + 1 : end),
        line: source.slice(0, call.index).split('\n').length
      })
    }

    out.push({ file, source, calls })
  }

  return out
}
