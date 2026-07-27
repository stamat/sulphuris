# Sulphuris — Review Findings & Suggested Improvements

*Reviewed 2026-07-27 against `main` (0335f14). Numbers measured from the built `dist/sulphuris.min.css`: **368 KB minified, ~48 KB gzipped, 9,858 rules, 403 media blocks.***

*Current, after §2's trims landed in `3b495f8` and §3 and §4 shipped: **255 KB minified, 37.8 KB gzipped**.*

---

## 1. Bugs (fix first)

### 1.1 Invalid CSS shipped: `font-size: em(16px)`

`dist/sulphuris.min.css` contains:

```css
pre,code,kbd,samp{font-family:monospace,monospace;font-size:em(16px)}
```

[_normalize.scss](src/core/layout/_normalize.scss) calls a global `em()` function that no longer exists under the `@use` module system, so Sass passes it through as an unknown function and browsers discard the declaration. Fix — restore the original normalize.css value:

```scss
font-size: 1em; /* 2 */
```

### 1.2 `.btn-outline` padding silently dropped

[_button.scss](src/core/style/_button.scss) has the subtraction *inside* the `map.get()` key argument:

```scss
padding: map.get(config.$button, padding-y - map.get(config.$button, border-width)) ...
```

`padding-y - 2px` evaluates to the string `padding-y-2px`, which isn't a key, so `map.get` returns `null` and the whole `padding` declaration vanishes. Confirmed in dist: `.btn-outline` has no padding, so outline buttons are 4px smaller than `.btn`. Fix:

```scss
padding:
  (map.get(config.$button, padding-y) - map.get(config.$button, border-width))
  (map.get(config.$button, padding-x) - map.get(config.$button, border-width));
```

*(Suggestion: `check-grid-css.mjs` could grow one extra check — grep dist for `[a-z]+\(` functions that aren't valid CSS functions. It would have caught 1.1.)*

---

## 2. What to drop

The out-of-the-box build is heavier than full Bootstrap (~26 KB gzip) while being "just utilities". Three families dominate:

| Family | Cost in dist | Verdict |
|---|---|---|
| Responsive color variants (`.text-md-primary`, `.bg-xl-red-300`, …) | **83.8 KB min (~23% of the file)** | **Drop.** Changing *color* per breakpoint is a fringe need; every color × every palette grade × 5 breakpoints × 3 properties (text/bg/border) is the single biggest bloat source. Set `responsive: false` in [_color.scss](src/core/style/_color.scss) — one-line change, nothing else in the API moves. |
| `inset`, `inset-inline`, `inset-block` full sets (sizes + negatives + percents + negative percents, all responsive) | ~714 rules / 22 KB+ | **Trim.** Keep `inset` (the shorthand pulls its weight), but the logical `inset-inline`/`inset-block` with full negative-percent responsive sets is speculative. Suggest: logical variants get `$sizes` + `auto` only, or become opt-in via a `$logical-properties: false !default` flag (same flag can gate `m-inline`/`m-block`/`p-inline`/`p-block`, ~400 more rules). |
| `vw` variants on `min-w`/`max-w` and `vh` on `min-h`/`max-h` | ~840 rules across the four families | **Trim.** `.h-100vh` / `.min-h-100vh` earn their keep; `.min-w-15vw` does not. Consider limiting viewport-unit variants to `25, 50, 75, 100`. |

Smaller candidates:

- `$negative-percent-sizes` on all four offsets — real usage is almost entirely `-50` (centering) and `-100`. Halving that list is free space.
- `.filter-invert` is the lone filter utility — either grow the family (grayscale, blur for overlays) or drop the generator ceremony and write one class.

**Deliberate non-drop:** `t/r/b/l` offset families are big (280 rules each) but they're the library's identity — keep.

## 3. What to add — ✅ done

All shipped. `+12.1 KB` minified / `+1.9 KB` gzip (35.7 → 37.7 KB).

| Addition | Shipped as | Where |
|---|---|---|
| `align-items: baseline` | `.align-baseline`, `.align-self-baseline` | [_flex.scss](src/core/layout/_flex.scss) |
| `justify-content: space-evenly` | `.justify-space-evenly` | [_flex.scss](src/core/layout/_flex.scss) |
| `flex-wrap: wrap-reverse` | `.flex-wrap-reverse` | [_flex.scss](src/core/layout/_flex.scss) |
| `.flex-1` / `.flex-auto` / `.flex-none` | `flex: 1 1 0%` / `1 1 auto` / `none` | [_flex.scss](src/core/layout/_flex.scss) |
| `.order-*` | `-1, 0…6, first (-9999), last (9999)` | [_flex.scss](src/core/layout/_flex.scss) |
| **Font-size utilities** | `.fs-12`…`.fs-96` from `$font-sizes`, px names → rem values via `toRem()`, matching the `$typography` scale exactly | [_typography.scss](src/core/style/_typography.scss) |
| Line-height utilities | `.lh-1` / `.lh-tight` / `.lh-normal` / `.lh-loose` from `$line-heights`. Responsive after all — leading tracks size, and `.fs-md-64` without `.lh-md-tight` is half a change | [_typography.scss](src/core/style/_typography.scss) |
| `overflow: clip` (and `scroll`) | on all three axes | [_overflow.scss](src/core/layout/_overflow.scss) |
| `text-wrap: balance` / `pretty` | `.text-balance`, `.text-pretty`, not responsive. No `nowrap` value — it would sit one character from the existing `.text-nowrap` (`white-space`) | [_typography.scss](src/core/style/_typography.scss) |
| Transforms | `.translate-x-*`, `.translate-y-*`, `.scale-*`, `.rotate-*` | [_transform.scss](src/core/style/_transform.scss) |

Two implementation notes worth keeping:

- **Transforms use the standalone `translate` / `rotate` / `scale` properties, not the `transform` shorthand.** Three separate properties means `.rotate-45.scale-110` keeps both, where a `transform`-based family would silently drop one — the composition problem Tailwind solves with per-axis custom properties, solved instead by the platform. They also apply *before* `transform`, so stacking onto `.absolute-center` still works. Remaining ceiling: `translate` is one property for both axes, so `.translate-x-50` + `.translate-y-50` is last-wins (documented, `ponytail:` comment in the file).
- **New check: [check-utility-css.mjs](script/check-utility-css.mjs)**, wired into `npm test` next to the grid one. Covers the three families whose output is computed rather than copied — the `toRem()` conversion behind `.fs-*`, the `--` class naming behind `.order--1`, and an assertion that no transform class ever emits `transform:`. All silent failures otherwise.

Already on the README ToDo and worth keeping there: forms, inline links, animations/transitions, reactive resets.

**Non-goal, now written down** (see §6): state variants (`hover:`, `focus:`) and arbitrary values.

---

## 4. Should sizes be converted to rem in the generator? — ✅ done

**Yes — emit rem, keep the px class names.** `.pt-32` → `padding-top: 2rem` (at `$base-font-size: 16px`).

Shipped as `$rem-units`, **on by default** — not behind an off-by-default flag as sketched below. The accessibility argument doesn't get better by waiting for 4.0, and since no class name moves, the upgrade is a rebuild. `$rem-units: false` reverts every size family to px.

Cost: **255 KB minified / 37.8 KB gzipped**, from 246 / 37.7. rem values are longer strings drawn from a smaller alphabet, so +9.1 KB minified compresses down to +0.14 KB. The breakpoint and container/grid passes are +0.3 KB minified between them.

Where it landed:

- `utility-value()` in [_generators.scss](src/core/utils/_generators.scss) — one function, called from the two emit points (generic + orientated). Converts only unitless numbers under `$unit: 'px'`, so `%`, `vw`, `vh` and keywords (`auto`, `inherit`) pass through untouched.
- A `$rem` parameter threaded down the four generator mixins (and a `rem:` key on the map form) is the opt-out. [_border.scss](src/core/style/_border.scss) is the only caller that uses it: `border-width` and `border-radius` stay px.
- **Breakpoints convert too**, via `query-width()` in the same file, called from `generate-breakpoint()`. Emit-time only: the map stays px, because the `- 1` range math in `helpers.breakpoints()` is unit-naive (`26.25em - 1` is a 16px hole, not 1px) and `grid-column-max-generator` mixes breakpoint values with px offsets and gutters — em there is a hard "incompatible units" error. Consumers keep overriding `$breakpoints` in px.
- **Container and grid metrics convert too** — `$container-max-width`, both offsets, both gutters, and the computed `.col-N-max` caps, via `helpers.emit-length()` (the same function the media queries use). Left in px they would have been the one thing that doesn't move: `$container-max-width` and the `xxl` breakpoint are the same 1680px, and they have to stay the same width as the root font-size changes or the container stops lining up with the breakpoint it was sized against. Arithmetic stays in px throughout — gutter halves, offsets-minus-halves — and only the finished value converts, so a row's negative margin and its children's padding can never round to different units.
- [check-utility-css.mjs](script/check-utility-css.mjs) grew 13 value assertions — one per family, the two opt-outs, the pass-through units — plus two guards: no class name ever contains `rem` (names staying put is the whole premise), and no emitted media query carries a px width.

Reasoning:

- **Accessibility:** px values ignore the user's browser font-size preference (distinct from zoom, which scales px too). rem-based spacing scales the whole layout with it — this is why Bootstrap and Tailwind both use rem everywhere. WCAG 1.4.4 territory.
- **Nothing visually changes** at the default root size — `.pt-32` still renders 32px. The name stays a design-token label ("the 32 step"), which is exactly how Tailwind names work (`p-8` = 2rem = "32px at default").
- **The plumbing exists:** `helpers.toRem()` is already written and unit conversion is already config-aware via `$base-font-size`.

**The one that nearly cancelled all of it:** `_typography.scss` shipped `html { font-size: 16px }`. An author `font-size` on the root overrides the reader's browser default-size setting, so every rem declaration resolved against a fixed 16px — px behaviour under a rem spelling. Worse than a no-op, because media-query `rem` resolves against the browser default rather than `html`, so breakpoints already moved with the reader while the content stayed pinned. Removed; `$base-font-size` keeps its real job as the `toRem()` divisor and now reaches the document only when it differs from 16px, as a percentage (`18px` → `112.5%`), which shifts the baseline while still tracking the reader's setting. `check-utility-css.mjs` rejects any absolute `font-size` on `html`.

Kept in px:

- **Border widths** (`$border-sizes`) — 2px at a 20px root is 2.5px, straddling a device pixel, so it renders fuzzy or drops out. [Tailwind ships px widths](https://tailwindcss.com/docs/border-width) for the same reason.
- ~~Border radii — either is fine; px is simpler, leave it.~~ **Reversed.** The pixel-snapping argument is about hairlines; a curve is antialiased, and a corner on a box whose padding and text grew should grow with them. [Tailwind ships rem radii](https://tailwindcss.com/docs/border-radius) (`--radius-sm: 0.25rem`). `.rounded-full`'s `9999px` stays literal — it is a shape cap, not a step on the scale.
- **The `$button` map** (`min-height: 56px`, `padding: 16px 32px`) is the last px component metric. Left alone deliberately — the component itself is up for removal.

~~**Breakpoints** — px media queries are predictable; converting them to em/rem is a separate decision with its own quirks. Don't bundle it into this change.~~ **Reversed.** rem sizes with px breakpoints is half the change: at a 20px browser default the type and spacing grow 25% but the column switch still fires at 768px, so the wider text meets the same cramped grid. And the survey behind "keep px" was wrong — [Tailwind moved its defaults to rem in v4](https://tailwindcss.com/docs/responsive-design) (`--breakpoint-md: 48rem`) on [exactly this WCAG 1.4.4 argument](https://github.com/tailwindlabs/tailwindcss/issues/8378); only Bootstrap still [instructs px](https://getbootstrap.com/docs/5.3/layout/grid/), without publishing a reason.

The two "revise" notes in the README highlights are now answered rather than open, and the px-spacing claims in the docs (index, spacing, sizing, position, getting-started, configuration) were rewritten to match the output.

---

## 5. Should sizes get aliases like Bootstrap/Tailwind? — ✅ done

Option 1 shipped as `$size-aliases`, `null` by default — **0 bytes in the default build**.

Where it landed:

- `helpers.with-aliases()` in [_helpers.scss](src/core/utils/_helpers.scss) — list in, map out, because a generator only takes a class name from a map key. Merges the alias names after the numbers, so both spellings emit and no step is replaced. An alias pointing at a value the list doesn't carry warns.
- Called from [_padding.scss](src/core/layout/_padding.scss), [_margin.scss](src/core/layout/_margin.scss) and [_gap.scss](src/core/layout/_gap.scss) — spacing only. `.t-md` was left out: on the offsets a t-shirt name sits one segment from the breakpoint infix and reads as one.
- The generalization of the per-value `alias:` key sketched below turned out to be the wrong mechanism — that key appends a literal second selector, so it never picks up the breakpoint infix (`.pt-md-sm` could not exist) and the orientated generator reads it but never emits it. A map key goes through the same path as every other value instead.
- [check-utility-css.mjs](script/check-utility-css.mjs) compiles [script/fixtures/size-aliases.scss](script/fixtures/size-aliases.scss) with the flag on — the only way to assert output that ships off — and asserts alias and px classes are the same declaration, that responsive variants keep breakpoint-then-value order, and that the shipped `dist` carries no alias class at all. `sass` moved to an explicit devDependency for it; `skipLibCheck` came with that, since `tsc` type-checks the scripts.

**Known sharp edge:** the alias names are the breakpoint names, so the `md` variant of `.gap-md` is `.gap-md-md`. Documented rather than designed around — renaming the aliases would cost the Bootstrap/Tailwind muscle memory that is the whole point.

Original reasoning:

**Yes, but not numeric ones — there's a collision.** `$sizes` already contains `1,2,3,4,6,8,12…`, so `.pt-2` *means 2px* in Sulphuris while it means 8px in Bootstrap and 8px (0.5rem) in Tailwind. Adding numeric aliases would make `.pt-2` ambiguous across projects — the worst possible outcome for the "reusable HTML components" concern the README itself raises.

Two clean options:

1. **T-shirt aliases (recommended):** opt-in config map, no collision possible, self-documenting:

   ```scss
   $size-aliases: (
     'xs': 4, 'sm': 8, 'md': 16, 'lg': 32, 'xl': 64, 'xxl': 96
   ) !default; // or null to disable
   ```

   → `.pt-sm`, `.mx-lg`, `.gap-md`, resolving through the same generators (the per-value `alias:` mechanism in `generic-utility-class-generator` already exists — this generalizes it). Aliases are *additions*, so px names keep working; cost is ~6 extra values per spacing family, modest after gzip.

2. **Replacement mode:** a `$size-naming: 'px' | 'scale'` flag that swaps px names for Bootstrap-style `0–5` entirely. No ambiguity within one project, but it forks the ecosystem into two dialects — every snippet in the docs works in only one mode. Not recommended.

Default `$size-aliases` to `null` (off) so the default build doesn't grow. This closes the README ToDo item ("Aliases: Optional numerical utilities…") with a safer design than the ToDo's own `pt-2 = 8px` example.

---

## 6. Comparison vs. the most popular Tailwind utilities — ✅ documented

Coverage of the utilities that dominate real-world Tailwind usage (from public class-frequency scans of production sites). Statuses updated after §3 shipped.

The user-facing version of this table now lives in the README under **Coming from Tailwind**, with the non-goals spelled out; the docs site's *What it is not* list carries the same non-goal in short form.

| Tailwind | Sulphuris | Status |
|---|---|---|
| `flex`, `hidden`, `block`, `inline-flex`, `grid` | `.d-flex`, `.d-none`, `.d-block`, `.d-inline-flex`, `.d-grid` | ✅ |
| `items-center`, `justify-between` | `.align-center`, `.justify-space-between` | ✅ |
| `items-baseline` | `.align-baseline`, `.align-self-baseline` | ✅ added |
| `flex-col`, `flex-wrap` | `.flex-column`, `.flex-wrap`, `.flex-wrap-reverse` | ✅ |
| `flex-1` | `.flex-1`, `.flex-auto`, `.flex-none` | ✅ added |
| `gap-*` | `.gap-*`, `.gap-x-*`, `.gap-y-*` | ✅ |
| `space-x-*` / `space-y-*` | — | ✅ skip — `gap` superseded it; Tailwind itself now steers to `gap` |
| `p-*`, `m-*`, `-m-*`, `mx-auto` | full px families incl. negatives + `auto` | ✅ richer than Tailwind (logical props too) |
| `w-*`, `h-*`, `max-w-*`, `min-h-screen` | `.w-*`, `.h-100vh`, `.min-h-*`, `.max-w-*` | ✅ |
| `text-sm` … `text-4xl` (font-size) | `.fs-12` … `.fs-96` alongside semantic `$typography` (`.h1–.h6`, `.p1–.p4`) | ✅ added |
| `font-bold`, `font-medium` | `.font-bold`, `.font-medium` | ✅ |
| `leading-*` | `.lh-1`, `.lh-tight`, `.lh-normal`, `.lh-loose` | ✅ added |
| `tracking-*` | — | ⚠️ skip — low usage outside `$typography`, which already handles it |
| `text-{color}`, `bg-{color}`, `border-{color}` | `.text-*`, `.bg-*`, `.border-*` + generated 100–900 palettes + dark-mode CSS variables | ✅ richer (runtime color modes; Tailwind needs `dark:` variants) |
| `rounded-*`, `rounded-full` | `.rounded-*`, `.rounded-full`, `.round` | ✅ |
| `border`, `border-t` | `.border`, `.border-t` | ✅ |
| `shadow-*` | `.shadow-sm/md/lg/xl/none` (same values) | ✅ |
| `relative`, `absolute`, `top-*`, `z-*` | `.position-*`, `.t-*/r-*/b-*/l-*`, `.z-*` + named `z()` layers | ✅ richer |
| `overflow-hidden`, `truncate`, `line-clamp-*` | `.overflow-hidden`, `.overflow-clip`, `.overflow-scroll`, `.truncate`, `.line-clamp-1–6` | ✅ |
| `whitespace-nowrap`, `text-balance`, `text-pretty` | `.text-nowrap`, `.text-balance`, `.text-pretty` | ✅ |
| `cursor-pointer`, `select-none`, `pointer-events-none` | `.cursor-pointer`, `.no-select`, `.events-none` | ✅ |
| `opacity-*` | `.opacity-0/25/50/75/100` | ✅ |
| `transition`, `duration-*` | `.transition`, `.transition-colors/transform/opacity` (reduced-motion-aware — Tailwind's aren't by default) | ✅ partial; no duration/delay modifiers |
| `container` | `.container` (+ gutter-aware grid integration) | ✅ |
| `grid-cols-*`, `col-span-*` | `.grid-cols-*`, `.grid-column-span-*` + a flex 12-col grid with offsets Tailwind lacks | ✅ |
| `order-*` | `.order--1`, `.order-0–6`, `.order-first`, `.order-last` | ✅ added |
| `aspect-video`, `object-cover` | `.aspect-16x9`, `.object-cover` | ✅ |
| `sr-only` | `.sr-only` | ✅ |
| `translate-*`, `scale-*`, `rotate-*` | `.translate-x-*`, `.translate-y-*`, `.scale-*`, `.rotate-*` — standalone properties, so they compose | ✅ added |
| `ring-*`, `divide-*` | — | ✅ skip — border/outline and gap cover the need |
| `hover:*`, `focus:*`, `group-hover:*` | — | 🚫 non-goal by architecture — documented in README + docs index |
| arbitrary values `w-[347px]` | — | 🚫 non-goal — documented alongside it; the config *is* the escape hatch |

**Summary:** every ❌ in this table is closed. Layout coverage is genuinely competitive with Tailwind's top tier — spacing, positioning, and the dual grid systems are stronger than Bootstrap's. The structural difference — no state variants, no JIT — is a positioning fact, not a defect, and it is now stated as one in the README rather than left for a reader to discover; the trade is a zero-build drop-in stylesheet, which is exactly the "between Bootstrap and Tailwind" pitch.

The remaining credibility risk is weight, not features: **37.8 KB gzip** after §2's trims and §3/§4's additions, against Bootstrap's ~26 KB. §2's untaken trims (`vw`/`vh` variants, `$negative-percent-sizes`) are what close the rest of that gap.

---

## 7. Minor / housekeeping — ✅ done

- **`"exports"` map added** to `package.json`, with `"main"`, `"sass"` and `"style"` all left in place for older tooling. Turned out to be more than cosmetics: `@forward "sulphuris/core/config"` — the line the README tells every consumer to write — had no way to resolve before, since node resolution maps it to `sulphuris/core/config` while the file is at `src/core/_config.scss`. The `"./core/*": { "sass": "./src/core/*" }` pattern bridges that, and Sass's package-exports resolution tries the partial/extension variants of the subpath against the map, so `core/config` finds `_config.scss`. `"./src/*"` and `"./dist/*"` stay open so nothing that reached in by real path breaks — an `"exports"` map is a whitelist, and omitting them would have been the actual regression. Verified with `sass --pkg-importer=node` against a symlinked `node_modules/sulphuris`: both `pkg:sulphuris` and `pkg:sulphuris/core/config` resolve and compile.
- **`.text-inherit` / `.text-current`** now carry the values; `.text-color-inherit` / `.text-color-current` are aliases on the same rules, so the diff is two selector lines and no one's markup breaks. Docs updated with the alias note.
- `.DS_Store` was already in `.gitignore` and nothing matching is tracked — no change needed.
- **README highlight added** for the generated Class Reference (`gen-reference.mjs` parsing real dist output), alongside the existing longer note in the docs-development section.
