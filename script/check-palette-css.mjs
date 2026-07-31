#!/usr/bin/env node
// Guards the palette ladder. `color-palette-generator` projects every seed in
// $palettes onto the lightness ladder in $palette-grades, and the whole point
// of doing it that way is that a grade means the same thing in every palette —
// `blue-600` and `green-600` land on the same contrast against `background`,
// so a role can be defined once as "grade 600" instead of hand-picked per hue.
// Nothing in Sass enforces that. A tweak to the ladder, to a seed, or to the
// gamut fit produces valid CSS that quietly breaks the invariant, and the first
// sign would be a status colour failing WCAG in someone's shipped site.
//
// So: assert the ladder is flat across hues, that it descends, and that the
// grades the status roles are cut from actually clear 4.5:1 in their own mode.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import postcss from 'postcss'

const file = process.argv[2] ?? 'dist/sulphuris.css'
const root = postcss.parse(await readFile(file, 'utf8'))

// --color-{palette}-{grade} off :root, and the dark-mode :root overrides.
const light = new Map()
const dark = new Map()
root.walkDecls(/^--color-/, (decl) => {
  const target = decl.parent.selector.includes('color-scheme') ? dark : light
  target.set(decl.prop.replace('--color-', ''), decl.value)
})
assert.ok(light.size > 0, `no --color-* custom properties in ${file}`)

const srgb = (value) => {
  const rgb = value.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
  if (rgb) return rgb.slice(1, 4).map(Number)

  const hex = value.match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1]
  assert.ok(hex, `palette value is not a plain sRGB colour: ${value}`)

  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
}

const toLinear = (c) => (c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4)

// WCAG 2.x relative luminance.
const luminance = (rgb) => {
  const [r, g, b] = rgb.map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// OkLab lightness — the axis $palette-grades is written in, so it is the one
// the ladder has to be checked against. CSS Color 4 matrices.
const okLightness = (rgb) => {
  const [r, g, b] = rgb.map(toLinear)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
}

// Mirrors $palette-grades in src/core/_config.scss. Duplicated on purpose: a
// check that reads its expectations out of the thing it checks proves nothing.
const grades = { 100: 96, 200: 90, 300: 82, 400: 72, 500: 62, 600: 52, 700: 42, 800: 32, 900: 22 }

const palettes = new Set()
for (const key of light.keys()) {
  const m = key.match(/^([a-z]+)-(\d00)$/)
  if (m) palettes.add(m[1])
}
assert.ok(palettes.size >= 11, `expected the 11 shipped palettes, found ${palettes.size}`)

// Dark mode reads the same seeds bottom-up, so its ladder is the light one
// with the lightnesses swapped end for end. Written out rather than derived:
// the point is to pin the mirror, and a check that computes the reverse of
// what it is checking would pass however the config drifts.
const darkGrades = { 100: 22, 200: 32, 300: 42, 400: 52, 500: 62, 600: 72, 700: 82, 800: 90, 900: 96 }

// The ladder itself: every palette hits every grade's lightness. The gamut fit
// trades a little lightness to hold on to chroma at the edges, so allow 2
// points — enough for that, far too tight for a step that has actually moved.
for (const [map, ladder, mode, ordered] of [
  [light, grades, 'light', (a, b) => a < b],
  [dark, darkGrades, 'dark', (a, b) => a > b]
]) {
  for (const palette of palettes) {
    let previous = null
    for (const [grade, target] of Object.entries(ladder)) {
      const value = map.get(`${palette}-${grade}`)
      assert.ok(value, `${mode} --color-${palette}-${grade} is missing`)

      const lightness = okLightness(srgb(value)) * 100
      assert.ok(
        Math.abs(lightness - target) <= 2,
        `${mode} --color-${palette}-${grade} sits at ${lightness.toFixed(1)}% OkLCh lightness, ladder says ${target}%`
      )
      assert.ok(
        previous === null || ordered(lightness, previous),
        `${mode} --color-${palette}-${grade} does not continue the ladder's direction`
      )
      previous = lightness
    }
  }
}

// What the ladder is for. A grade has to mean the same *role* in both modes,
// which is the whole reason dark mode inverts rather than re-picking: grade
// 600 is the AA text grade on either ground, and grade 100 the faint fill.
// Assert that across every palette, not just the four wired up as status
// roles today — otherwise retuning a seed silently ships an inaccessible one.
for (const [map, ground, mode] of [
  [light, light.get('background'), 'light'],
  [dark, dark.get('background'), 'dark']
]) {
  assert.ok(ground, `no --color-background for ${mode} mode`)
  for (const palette of palettes) {
    if (palette === 'gray') continue // a grey ladder is not a status hue

    const text = contrast(srgb(map.get(`${palette}-600`)), srgb(ground))
    assert.ok(text >= 4.5, `${mode} ${palette}-600 is ${text.toFixed(2)}:1 on the background, AA text needs 4.5:1`)

    const fill = contrast(srgb(map.get(`${palette}-100`)), srgb(ground))
    assert.ok(fill <= 1.6, `${mode} ${palette}-100 is ${fill.toFixed(2)}:1 on the background, too loud for a faint fill`)
  }
}

// And the roles wired up in $colors resolve to grade 600 of their own mode —
// they are written as hex literals, so compare channels, not spelling.
const roles = [['danger', 'red'], ['success', 'green'], ['warning', 'orange'], ['info', 'blue']]
for (const [map, mode] of [[light, 'light'], [dark, 'dark']]) {
  for (const [role, palette] of roles) {
    assert.deepEqual(
      srgb(map.get(role)),
      srgb(map.get(`${palette}-600`)),
      `${mode} --color-${role} should be ${mode} ${palette}-600`
    )
  }
}

console.log(
  `[check] palette ok: ${palettes.size} palettes × ${Object.keys(grades).length} grades, light ladder and its dark mirror`
)
