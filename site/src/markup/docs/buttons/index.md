---
layout: poops-docs-theme/docs
title: Buttons
navTitle: Buttons
description: A minimal button primitive with filled, inverted, and outline variants — compose with utilities for everything else.
order: 13
keywords: ["button", "btn", "component"]
---

# Buttons

`.btn` is one of the very few component primitives in Sulphuris. Most styling in Sulphuris is done with utilities; `.btn` exists because a button has enough stateful and interactive complexity (hover, motion, color inversion) that generating it from utilities alone would be verbose. Compose freely with utilities for anything the modifier classes don't cover.

## Base: `.btn`

Resets `<button>` appearance, then applies:

| Property | Value (from `$button`) | Emitted |
|---|---|---|
| `min-height` | `56px` | `3.5rem` |
| `padding` | `16px 32px` | `1rem 2rem` |
| `border-radius` | `4px` | `0.25rem` |
| `background-color` | `primary` (`#f6c026` light / `#3F00FF` dark) |
| `color` | `foreground` (`#1a1a1d` light / `#ffffff` dark) |
| `display` | `inline-flex` |
| `justify-content` | `center` |
| `align-items` | `center` |

**Hover** (pointer devices only — applied inside `$container-breakpoint` / `lg` min-width media query):

```
background-color → foreground (#1a1a1d light / #ffffff dark)
color            → background (#ffffff light / #1a1a1d dark)
```

The label is restated on hover because the two surfaces want opposite text.
`primary` carries no contrast floor — it is a brand colour, free to be a yellow
— so the only label guaranteed to be readable on it is `foreground`, while
`foreground` as a fill wants `background`. Both pairs clear WCAG AA: 10.3:1 and
17.4:1 light, 7.9:1 and 17.4:1 dark.

**Motion** — `color` and `background-color` transitions are added when `prefers-reduced-motion: no-preference` is true. No transition is applied when the user has requested reduced motion.

> [!NOTE]
> `.btn` also doubles as a reset when applied to a `<button>` element. The same reset rules (no border, no background, no padding, `color: inherit`) fire on both `button.reset` and `.btn` before the component styles kick in.

## Usage

<!-- demo -->

```html
<!-- On an anchor -->
<a href="/start" class="btn">Get started</a>

<!-- On a native button -->
<button type="submit" class="btn">Submit</button>
```

## Modifier: `.btn-inverted`

Swaps fill to `foreground` with hover reverting to `primary`. The label swaps
with it, for the same reason `.btn`'s does.

```
background-color: foreground  →  hover: primary
color:            background   →  hover: foreground
```

<!-- demo -->

```html
<a href="#" class="btn btn-inverted">Inverted</a>
```

## Modifier: `.btn-outline`

Transparent background with a `2px` solid border. The padding is reduced by the border width so the button stays the same overall height as `.btn`.

Exactly so at the default root. The padding converts under [`$rem-units`](../configuration/#feature-flags) and the border width does not — border widths stay px everywhere, being fuzzy at fractional sizes — so at a reader font-size other than 16px the two variants differ by under a pixel.

| Property | Value |
|---|---|
| `background` | `transparent` |
| `border` | `2px solid foreground` |
| `color` | `foreground` |

Hover fills with `foreground` and flips `color` to `background`.

<!-- demo -->

```html
<a href="#" class="btn btn-outline">Outline</a>
```

### Combined: `.btn-outline.btn-inverted`

Border and text use `background` color (white on dark surfaces). Hover fills with `background` and sets `color` to `foreground`.

<!-- demo -->

```html
<a href="#" class="btn btn-outline btn-inverted">Outline inverted</a>
```

## Composing with utilities

`.btn` intentionally provides no typography, width, icon spacing, or shadow utilities — use the Sulphuris utility set for those:

<!-- demo -->

```html
<!-- Rounded pill shape -->
<a href="#" class="btn rounded-32">Pill</a>

<!-- Full-width on mobile -->
<a href="#" class="btn d-block d-lg-inline-flex">Full width mobile</a>

<!-- Custom background via utility (overrides .btn fill) -->
<a href="#" class="btn bg-primary">Primary fill</a>
```

> [!NOTE]
> Because `.btn` sets `background-color` directly, a utility like `.bg-primary` will override it — that is intentional. Sulphuris utilities avoid `!important` so the cascade is your control.

## Retuning via `$button`

Override any key in the `$button` map before importing Sulphuris:

```scss
// _config-overrides.scss  (loaded before @use "sulphuris")
@use "sulphuris/src/core/config" with (
  $button: (
    height: 48px,
    padding-x: 24px,
    padding-y: 12px,
    border-width: 2px,
    border-radius: 0
  )
);
```

| Key | Default | Effect |
|---|---|---|
| `height` | `56px` | `min-height` on `.btn` |
| `padding-x` | `32px` | horizontal padding |
| `padding-y` | `16px` | vertical padding |
| `border-width` | `2px` | border on `.btn-outline`, inset padding compensation |
| `border-radius` | `4px` | `border-radius` on `.btn` |

Written in px, emitted in rem under [`$rem-units`](../configuration/#feature-flags) — `border-width` excepted, with every other border width. The label is already rem, so the box has to convert with it or a reader at a larger font-size gets scaled text in a fixed 56px frame.
