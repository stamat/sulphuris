# v4.0.0

**Major.** Nothing was renamed, but the default build no longer emits 3,006 of
the class names v3 did — responsive colours, the logical-property families, and
the fine steps of four numeric scales are now off by default. Every one of them
is a config flag away, and no class that still ships changed its name. The other
half of the release is `rem`: every size family, the breakpoint widths and the
container/grid metrics now emit `rem` instead of `px`, so a layout scales with
the reader's browser font-size setting. `.pt-32` is still `.pt-32` and still
renders 32px at the default root.

| | v3.0.0 | v4.0.0 | |
| --- | ---: | ---: | ---: |
| `dist/sulphuris.min.css` | 368.9 KB | 255.0 KB | **−30.9%** |
| gzipped | 49.6 KB | 37.8 KB | **−23.7%** |
| distinct class names | 9,713 | 7,071 | −2,642 |

---

## ⚠️ Breaking changes

### Responsive colour variants are gone

`.text-md-primary`, `.bg-lg-blue-300`, `.border-xl-gray-700` — every
breakpoint-infixed colour class, **1,560 class names**, 83.8 KB minified, ~23%
of the v3 build. The base `.text-*`, `.bg-*` and `.border-*` families and the
generated 100–900 palettes are untouched.

Changing *colour* at a breakpoint is a fringe need, and the cost was every
colour × every palette grade × 5 breakpoints × 3 properties. Theme changes go
through the CSS variables (`--color-*`), which is also how dark mode already
worked.

There is no config flag for this one — the three generator calls in
[`style/_color.scss`](src/core/style/_color.scss) pass `responsive: false`
outright. Re-emitting them means calling `utility-class-generator` yourself.

### Logical properties are opt-in — `$logical-properties: false`

Off by default: `.m-inline-*`, `.m-block-*`, `.p-inline-*`, `.p-block-*`,
`.inset-inline-*`, `.inset-block-*` — **1,176 class names**. The physical
families (`.mx-*`, `.px-*`, `.t/r/b/l-*`, `.inset-*`) cover LTR-only projects,
which is most of them.

```scss
@use 'sulphuris/core/config' with ($logical-properties: true);
```

### Four scales trimmed

| Config | v3 | v4 | Classes dropped |
| --- | --- | --- | --- |
| `$negative-percent-sizes` | `-5,-10,-15,-20,-25,-50,-75,-100` | `-25,-50,-75,-100` | 96 |
| `$z-index` | `-1,0,1,2,3,4,5,10,15,20,25,50,100` | `-1,0,1,2,10,20,50,100` | 30 |
| `$viewport-sizes` *(new)* | followed `$percent-sizes` | `25,50,75,100` | 72 |

Real use of negative percents is centering (`-50`) and full-bleed (`-100`);
nobody reaches for `.z-md-15` or `.min-w-15vw`. Viewport units now run on their
own list rather than borrowing `$percent-sizes`, so `.w-25p` and `.w-25vw` are
separately configurable. Override any of the three to get the old steps back.

Stacking that needs a name belongs in `$z-layers`, not a numeric utility — which
gained a `'behind': -1` level for decorative pseudo-elements.

### Sizes emit `rem` — `$rem-units: true`

`.pt-32` is now `padding-top: 2rem`. **Class names do not move** — the number is
a design-token label, exactly as `p-8` in Tailwind means 2rem. At the default
16px root, nothing renders differently.

What converts: all the size families, border **radii**, the breakpoint widths in
`@media`, `$container-max-width`, both container offsets, both grid gutters and
the computed `.col-N-max` caps. Arithmetic stays in px throughout — gutter
halves, offsets-minus-halves — and only the finished value converts, so a row's
negative margin and its children's padding can never round to different units.

What stays px: **border widths**. 2px at a 20px root is 2.5px, straddling a
device pixel, so it renders fuzzy or drops out. The `$button` map keeps its px
metrics. `.rounded-full`'s `9999px` stays literal — it is a shape cap, not a
step on a scale.

Breakpoints are still *written* in px in `$breakpoints` and converted on the way
into the media query: the `- 1` range math in `helpers.breakpoints()` is
unit-naive, and `grid-column-max-generator` mixes breakpoint values with px
gutters. Keep your overrides in px. `768px` now emits as `48rem`, `1680px` as
`105rem`. (`toRem()` passes non-px through untouched, so a map already written
in `em`/`rem` still works — it just skips the conversion.)

`$rem-units: false` reverts the lot without moving a class name.

**Why this matters:** px ignores the reader's browser font-size preference —
which is a different setting from zoom, and the one people with low vision
actually use. WCAG 1.4.4 territory. Both Bootstrap and Tailwind ship rem for
this reason, and [Tailwind moved its breakpoints to rem in
v4](https://github.com/tailwindlabs/tailwindcss/issues/8378) on exactly this
argument.

### No absolute `font-size` on `html`

v3 shipped `html { font-size: 16px }`, which is what nearly cancelled the
change above. An author `font-size` on the root **overrides** the reader's
browser default-size setting, so every `rem` in the stylesheet would have
resolved against a fixed 16px — px behaviour under a rem spelling. It was
already worse than a no-op in v3: media-query `rem` resolves against the browser
default rather than the document, so breakpoints moved with the reader while the
content stayed pinned.

`$base-font-size` keeps its real job as the `toRem()` divisor, and now reaches
the document only when it differs from 16px — as a percentage (`18px` →
`112.5%`), which shifts the baseline while still tracking the reader's setting.
`check-utility-css.mjs` rejects any absolute `font-size` on `html`.

If you were relying on the root being pinned to 16px, that is the behaviour that
just went away, on purpose.

---

## ✨ New utility classes

| Family | Classes | Notes |
| --- | --- | --- |
| Font size | `.fs-12` … `.fs-96` | From the new `$font-sizes`. px names like every other size family, rem values through the same `toRem()` the `$typography` scale uses — `.fs-24` and `.p1` land on the same size. The knob for nudging one element without inventing a component class. Responsive. |
| Line height | `.lh-1`, `.lh-tight`, `.lh-normal`, `.lh-loose` | From the new `$line-heights`. Unitless on purpose — a unitless line-height inherits as a ratio, a px one as a frozen box. Responsive: leading tracks size, and `.fs-md-64` without `.lh-md-tight` is half a change. |
| Transforms | `.translate-x-*`, `.translate-y-*`, `.scale-*`, `.rotate-*` | The standalone `translate` / `rotate` / `scale` properties, **not** the `transform` shorthand — three separate properties, so `.rotate-45.scale-110` keeps both where a shorthand family would silently drop one. They also apply *before* `transform`, so stacking onto `.absolute-center` still works. Responsive. |
| Flex shorthand | `.flex-1`, `.flex-auto`, `.flex-none` | `.flex-grow-1` is not the same thing — it leaves `flex-basis: auto`, so children keep their content width and never come out equal. `.flex-1` sets the `0%` basis. Responsive. |
| Order | `.order--1`, `.order-0` … `.order-6`, `.order-first`, `.order-last` | `first`/`last` are `∓9999` — the escape hatch for "before/after everything" without knowing the sibling count. Responsive. |
| Flex alignment | `.align-baseline`, `.align-self-baseline`, `.justify-space-evenly`, `.flex-wrap-reverse` | Responsive. |
| Overflow | `.overflow-clip`, `.overflow-scroll` (+ `-x` / `-y`) | `clip` is `hidden` without the scroll container — the element stops being programmatically scrollable, which is usually what `hidden` was reached for. Responsive. |
| Text wrap | `.text-balance`, `.text-pretty` | Non-responsive. No `.text-wrap-nowrap` — `.text-nowrap` (the `white-space` one) already exists and two classes that close together is a trap. |
| Colour keywords | `.text-inherit`, `.text-current` | Now carry the values; `.text-color-inherit` / `.text-color-current` stay as aliases on the same rules, so no markup breaks. |

### Size aliases — `$size-aliases`, opt-in

T-shirt names for steps of `$sizes`, added to the **margin, padding and gap**
families. `null` by default, so **0 bytes in the default build**.

```scss
@use 'sulphuris/core/config' with (
  $size-aliases: ('xs': 4, 'sm': 8, 'md': 16, 'lg': 32, 'xl': 64, 'xxl': 96)
);
```

→ `.pt-sm` emits the same declaration as `.pt-8`. An alias never introduces a
value — point one at a step the list does not carry and the build warns.

Numeric aliases are deliberately **not** on offer: `.pt-2` already means 2px
here and 8px in Bootstrap and Tailwind, so a shared numeric name would mean
three different paddings depending on which library the markup was copied from.

Two things worth knowing:

- The alias names overlap the breakpoint names, so the `md` variant of
  `.gap-md` reads **`.gap-md-md`**. Documented rather than designed around —
  renaming the aliases would cost the muscle memory that is the whole point.
- Offsets are excluded. On `.t-*` a t-shirt name sits one segment from the
  breakpoint infix and reads as one.

---

## 🧰 Config & SCSS API

New config variables:

- **`$rem-units`** `true` — the conversion above. `false` reverts everything.
- **`$logical-properties`** `false` — gates the six logical families.
- **`$viewport-sizes`** `25,50,75,100` — steps for `vw`/`vh` variants, split off from `$percent-sizes`.
- **`$size-aliases`** `null` — t-shirt names for spacing.
- **`$font-sizes`** `12,14,16,20,24,32,48,64,96` — feeds `.fs-*`.
- **`$line-heights`** `(1: 1, 'tight': 1.2, 'normal': 1.5, 'loose': 1.75)` — feeds `.lh-*`.
- **`$z-layers`** gained `'behind': -1`.

New functions and parameters:

- **`helpers.emit-length($value)`** — a px length as it should be written out: converts under `$rem-units`, passes through otherwise. The single conversion point for the container, grid and breakpoint metrics, so sources can stay px and arithmetic can stay in one unit.
- **`helpers.with-aliases($values)`** — list in, map out, with `$size-aliases` merged in as extra keys. A generator only takes a class name from a map key, so a name can only ride in that way.
- **`generators.utility-value($value, $unit, $rem)`** — the value half of one generated declaration. Converts only unitless numbers under `$unit: 'px'`, so `%`, `vw`, `vh` and keywords (`auto`, `inherit`) pass through either way.
- **`$rem: false`** — a new trailing parameter (and `rem:` map key) on the four generator mixins, opting a family out of the conversion. `border-width` is the only caller that uses it.

---

## 🐛 Fixes

- **Invalid CSS was shipping.** `normalize` called a global `em()` that no
  longer exists under the module system, so Sass passed it through and browsers
  discarded the declaration:
  `pre,code,kbd,samp{font-family:monospace,monospace;font-size:em(16px)}`.
  Restored to normalize.css's `1em`; `sub`/`sup` offsets likewise to `-0.25em` /
  `-0.5em`.
- **`.btn-outline` had no padding at all.** The subtraction sat *inside* the
  `map.get()` key argument, so `padding-y - 2px` evaluated to the string
  `padding-y-2px`, `map.get` returned `null`, and the whole declaration
  vanished. Outline buttons were 4px smaller than `.btn` in every v3 build.
- **`.filter-invert`** is a plain rule now instead of a one-value generator
  call. Identical output.

---

## 📦 Packaging & tooling

- **`"exports"` map added** to `package.json`, with `"main"`, `"sass"` and
  `"style"` left in place for older tooling. More than cosmetics:
  `@forward "sulphuris/core/config"` — the line the README tells every consumer
  to write — had no way to resolve before, since node resolution maps it to
  `sulphuris/core/config` while the file is at `src/core/_config.scss`. The
  `"./core/*"` pattern bridges that. `"./src/*"` and `"./dist/*"` stay open so
  nothing that reached in by real path breaks.
- **`script/check-utility-css.mjs`**, wired into `npm test` next to the grid
  check. Covers the families whose output is computed rather than copied: the
  `toRem()` conversion behind every size family and the two px opt-outs, the
  `--` naming behind `.order--1`, an assertion that no transform class ever
  emits `transform:`, a guard that no class name ever contains `rem`, that no
  media query carries a px width, and that nothing writes an absolute
  `font-size` to `html`. It also compiles a fixture with `$size-aliases` on —
  the only way to assert output that ships off — and asserts the shipped `dist`
  carries no alias class at all.
- `sass` is now an explicit devDependency; `skipLibCheck` came with it, since
  `tsc` type-checks the scripts.

## 📖 Docs

- **`script/gen-config-docs.mjs`** — the `scss` blocks on the docs pages are now
  written from `src/core/_config.scss`, so documented defaults cannot drift from
  shipped ones. They were retyped by hand and had already gone stale. A page
  opts in with a `<!-- config: name, name -->` marker; unmarked blocks are left
  alone. `<!-- generators: m, p -->` does the same for generator call sites.
- The docs site pulls its version from the root `package.json` rather than a
  hand-maintained copy.
- Every px-spacing claim in the docs (index, spacing, sizing, position,
  getting-started, configuration) was rewritten to match what the generator
  actually emits.
- README: a **Coming from Tailwind** coverage table, the non-goals written down
  as positioning rather than left for a reader to discover (no state variants,
  no arbitrary values — the config *is* the escape hatch), and the two open
  "revise" notes in the highlights answered.

---

## 🧭 Migration

Most upgrades are a rebuild. Work through these in order:

**1. Rebuild and diff your rendered output.** If you were on the defaults and do
not use responsive colours or logical properties, you are done — nothing renders
differently at a 16px root.

**2. Grep for the families that are now off.** Each of these is a class that
silently stops applying:

```bash
rg 'class="[^"]*\b(text|bg|border)-(sm|md|lg|xl|xxl)-'   # responsive colours
rg 'class="[^"]*\b(m|p)-(inline|block)-'                  # logical spacing
rg 'class="[^"]*\binset-(inline|block)-'                  # logical insets
rg 'class="[^"]*\b[trbl]--(5|10|15|20)p\b'                # trimmed negative percents
rg 'class="[^"]*\bz-(3|4|5|15|25)\b'                      # trimmed z-index
rg 'class="[^"]*\b(min-|max-)?[wh]-(5|10|15|20)v[wh]\b'   # trimmed viewport steps
```

**3. Turn back on what you actually use.** The last three greps are config
lists; add the steps back. Logical properties are one flag:

```scss
@use 'sulphuris/core/config' with (
  $logical-properties: true,
  $z-index: -1,0,1,2,3,4,5,10,15,20,25,50,100,
  $negative-percent-sizes: -5,-10,-15,-20,-25,-50,-75,-100,
  $viewport-sizes: 5,10,15,20,25,50,75,100
);
```

Responsive colours are the one thing no flag brings back. Prefer the CSS
variables — `--color-*` is how theming already worked and it costs nothing per
breakpoint.

**4. Check anything that pins the root font-size.** If your own stylesheet, a
JS measurement, or a test asserts against a fixed 16px root or a px computed
value, that assumption is now the reader's to make. `$rem-units: false` is the
escape hatch if you need to ship the upgrade before you can audit.

**5. Keep `$breakpoints` overrides in px.** They convert at emit time; writing
them in `rem` skips the conversion and breaks the range arithmetic.

**6. Re-check outline buttons.** `.btn-outline` has had padding restored, so it
is now 4px larger than it rendered in v3 — the size it was always meant to be.
