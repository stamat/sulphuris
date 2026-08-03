---
layout: poops-docs-theme/docs
title: Prose
navTitle: Prose
description: The .prose block — element defaults for rendered markdown and CMS output. Rhythm, tables, code blocks, quotes and media, scoped so tag rules never leak.
order: 11
keywords: ["prose", "markdown", "cms", "article", "table", "code", "pre", "blockquote", "measure", "rhythm", "figcaption"]
---

# Prose

`.prose` styles tags instead of handing out classes. It is the one block in Sulphuris that does, because it exists for markup you cannot reach: rendered markdown, a CMS body field, an editor's output, an email. There is no build step in which you can add `.mb-16` to a `<table>` a renderer emitted.

Everything is scoped under the class, so a tag rule can never reach the rest of an app.

```html
<article class="prose">
  <!-- whatever the renderer emitted -->
</article>
```

## What it sets

| Target | Rules |
|---|---|
| `.prose` | `max-width: 45rem` (`$prose-measure`, 720px), `overflow-wrap: break-word` |
| `a` | `accent` colour, `underline` — dropped on hover |
| `p, ul, ol, dl, pre, table, figure, blockquote` | `margin: 0 0 1em` |
| `h1`–`h6` | `margin-top: 1.25em` |
| `li` | `margin: 0.25em 0`, nested lists lose the bottom gap |
| first / last child | margin collapsed to `0` |
| `img, video, iframe, embed, object, svg` | `max-width: 100%` (`img`/`video` also `height: auto`) |
| `iframe` | `width: 100%`, `height: auto`, `aspect-ratio: 16 / 9` |
| `table` | `display: block`, `width: max-content`, `max-width: 100%`, `overflow-x: auto`, `border-collapse: collapse` |
| `th, td` | `padding: 0.5em 0.75em`, `1px` border, `text-align: left` |
| `thead th` | tinted background |
| `pre, code, kbd, samp` | `$mono-font` |
| `:not(pre) > code` | tinted background, `1px` border, `4px` radius, `0.875em`, `0.15em 0.4em` padding |
| `pre` | tinted background, `1px` border, `6px` radius, `1em` padding, `overflow-x: auto`, `0.875em` |
| `blockquote` | `1em` left padding, `3px` left border, muted color |
| `hr` | `2em` vertical margin, `1px` top border |

The type scale itself is not repeated here — `.prose` inherits the sizes, weights and line-heights from [Typography](../typography/). It only adds what a scale cannot: spacing between blocks, and the surfaces tables and code blocks sit on.

## Rhythm is in `em`

Every margin is `em`, so one number covers the whole scale. The gap above a 48px `h1` comes out proportionally larger than the one above a 14px `h6`, and it follows the responsive step down on mobile without a second rule.

The first and last child have their outer margins removed. The block owns its own edges — otherwise a leading `<h2>` pushes a gap the surrounding layout has to cancel.

## Tables scroll instead of overflowing

```scss
table {
  display: block;
  width: max-content;
  max-width: 100%;
  overflow-x: auto;
}
```

`display: block` plus `width: max-content` is the combination where a narrow table still shrink-wraps to its content while a wide one scrolls inside the measure. `overflow` needs a block box to act on, and there is no wrapper element to add when the HTML came from a renderer.

## Embeds scale, with a way out

`img` and `video` carry an intrinsic ratio, so a width cap plus `height: auto` scales them. An `iframe` has none: capped width alone leaves its `height` attribute in place and a narrow screen squashes the embed. `.prose` gives it `width: 100%`, `height: auto` — the attribute is a presentational hint, so any CSS height outranks it — and a 16/9 ratio, since in prose an iframe is a video far more often than anything else.

A non-video embed takes any [aspect utility](../sizing/):

```html
<iframe class="aspect-4x3" src="…"></iframe>
```

That works because `.prose` sits in a cascade layer and `.aspect-4x3` does not — see [below](#every-rule-here-loses-to-a-utility).

Borders and tinted surfaces are mixed out of the foreground color, not added as new tokens:

```scss
$line:    color-mix(in srgb, var(--color-foreground) 15%, transparent);
$surface: color-mix(in srgb, var(--color-foreground)  5%, transparent);
$muted:   color-mix(in srgb, var(--color-foreground) 65%, transparent);
```

`foreground` already flips per color mode, so the tints follow a dark mode with nothing to configure. A `$colors` entry would be a second palette to keep in sync — and one more thing for every project's dark mode to get wrong. Mixing toward `transparent` rather than a background keeps the tint composited over whatever it actually sits on, including a `.bg-*` utility.

> [!NOTE]
> `color-mix()` needs Chrome 111+, Safari 16.2+, Firefox 113+. Set the three variables in `style/_prose.scss` to flat colors if you support older browsers.

## Retuning the measure

```scss
@use "sulphuris/src/core/config" with (
  $prose-measure: 640px
);
```

720px is roughly 70 characters at `$base-font-size` — past that the eye starts losing the return sweep to the next line.

Per instance, any width utility overrides it:

```html
<article class="prose max-w-none">…</article>   <!-- full-bleed, keeps the typography -->
<article class="prose mx-auto">…</article>      <!-- measure, centred -->
```

That is also the answer to why there is no separate `.prose-container`: a second class that sets one property is what the utility set is for, and the common case would then need two classes to get the default right.

## Every rule here loses to a utility

`.prose` styles tags, so its selectors are descendant selectors — `.prose thead th` is (0,1,2) and would beat any single utility class in a straight specificity fight. It does not get one. The block is emitted inside a cascade layer, and every utility class in Sulphuris is emitted outside one:

```css
@layer base {
  /* normalize, the h1–h6 margins, and all of .prose */
}

/* every utility class — .max-w-none, .bg-white, .aspect-4x3, .mb-0 */
```

An unlayered rule beats a layered one whatever its specificity, so a single class always wins over `.prose`, however deep the selector it is overriding:

```html
<article class="prose max-w-none">…</article>
<table class="bg-white">…</table>
<iframe class="aspect-4x3" src="…"></iframe>
```

Inside the layer, ordinary specificity still applies — which is how `.prose pre` overrides normalize's `pre`, and how `.prose > :last-child` zeroes the bottom margin [Typography](../typography/) puts on a trailing heading. That is why those heading margins are in the layer too, and not next to the font-size utilities they otherwise sit beside.

> [!NOTE]
> The same rule applies to your own CSS: an unlayered `p { margin: 0 }` in your stylesheet beats `.prose p`, even though it is less specific. Put your reset in a layer of its own if you want `.prose` to keep winning inside the block. Cascade layers need Chrome 99+, Safari 15.4+, Firefox 97+.

## What it deliberately does not do

Admonitions, syntax highlighting colors, copy buttons and heading anchors are not here. Each needs markup or JavaScript shipped alongside it, which is a docs theme's job — see [poops-docs-theme](https://github.com/stamat/poops-docs-theme) for those. `.prose` covers what a plain markdown renderer already emits.

Anchors outside `.prose` are left alone. Sulphuris sets no global `a` rule — underlining every link in an app's nav is not a default a utility library gets to pick — so the link treatment below stops at the block's edge. `.text-accent` puts the same colour anywhere else.

## Links and inline code

```scss
a           { color: var(--color-accent); text-decoration: underline; }
a:hover     { text-decoration: none; }
```

Underlined *and* coloured: colour on its own fails WCAG 1.4.1, which wants a second cue for anything distinguished by hue. The underline is the cue at rest and hover takes it away, rather than the reverse — a link is never the plain-text-looking state.

Inline `code` is a tinted box with a `1px` border and `0.875em` type. The size is `em`, not `rem`, so a span inside an `h2` stays heading-sized; the reduction exists because a mono face reads visually larger than the body face beside it at the same nominal size.

Long URLs and identifiers are handled at the block level with `overflow-wrap: break-word` — an unbroken string wider than the measure wraps instead of pushing the page sideways on a phone. Normal text still breaks between words.

## Composing with utilities

`.prose` sets no colors on text and no background, so utilities still drive the surface:

```html
<article class="prose mx-auto py-48 text-gray-800">…</article>
```

Anything inside that you *can* reach still takes utilities normally — the tag rules are layered and carry no `!important`, so a class on the element wins.
