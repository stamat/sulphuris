---
layout: poops-docs-theme/docs
title: Flexbox
navTitle: Flexbox
description: Utility classes for flex direction, wrapping, alignment, justification, grow, and shrink.
order: 6
keywords: ["flex", "flexbox", "justify-content", "align-items", "flex-direction", "flex-wrap", "gap", "order", "flex-1", "baseline"]
---

# Flexbox

Single-property utility classes generated from `src/core/layout/_flex.scss`. All classes follow the pattern `.{prefix}-{value}` with optional responsive variants `.{prefix}-{bp}-{value}`.

---

## Flex Direction

**Prefix:** `flex`  **Property:** `flex-direction`

| Class | CSS |
|---|---|
| `.flex-row` | `flex-direction: row` |
| `.flex-row-reverse` | `flex-direction: row-reverse` |
| `.flex-column` | `flex-direction: column` |
| `.flex-column-reverse` | `flex-direction: column-reverse` |

---

## Flex Wrap

**Prefix:** `flex`  **Property:** `flex-wrap`

| Class | CSS |
|---|---|
| `.flex-wrap` | `flex-wrap: wrap` |
| `.flex-nowrap` | `flex-wrap: nowrap` |
| `.flex-wrap-reverse` | `flex-wrap: wrap-reverse` |

---

## Flex shorthand

**Prefix:** `flex`  **Property:** `flex`

| Class | CSS |
|---|---|
| `.flex-1` | `flex: 1 1 0%` |
| `.flex-auto` | `flex: 1 1 auto` |
| `.flex-none` | `flex: none` |

> [!NOTE]
> `.flex-1` is not `.flex-grow-1`. `flex-grow` on its own leaves
> `flex-basis: auto`, so children still start from their content width and come
> out unequal. `.flex-1` sets the `0%` basis that makes siblings share the space
> evenly regardless of content. `.flex-auto` is the "grow, but respect my
> content" middle ground; `.flex-none` freezes an item at its content size.

---

## Flex Grow

**Prefix:** `flex-grow`  **Property:** `flex-grow`

| Class | CSS |
|---|---|
| `.flex-grow-0` | `flex-grow: 0` |
| `.flex-grow-1` | `flex-grow: 1` |
| `.flex-grow-2` | `flex-grow: 2` |
| `.flex-grow-3` | `flex-grow: 3` |

---

## Flex Shrink

**Prefix:** `flex-shrink`  **Property:** `flex-shrink`

| Class | CSS |
|---|---|
| `.flex-shrink-0` | `flex-shrink: 0` |
| `.flex-shrink-1` | `flex-shrink: 1` |

---

## Align Items

**Prefix:** `align`  **Property:** `align-items`

| Class | CSS |
|---|---|
| `.align-normal` | `align-items: normal` |
| `.align-center` | `align-items: center` |
| `.align-start` | `align-items: start` |
| `.align-end` | `align-items: end` |
| `.align-baseline` | `align-items: baseline` |
| `.align-stretch` | `align-items: stretch` |

`.align-baseline` lines children up on their **text** baselines rather than their
boxes — the right choice for a row mixing type sizes (a heading next to a
label), where `.align-center` visibly staggers them.

---

## Justify Content

**Prefix:** `justify`  **Property:** `justify-content`

| Class | CSS |
|---|---|
| `.justify-normal` | `justify-content: normal` |
| `.justify-center` | `justify-content: center` |
| `.justify-start` | `justify-content: start` |
| `.justify-end` | `justify-content: end` |
| `.justify-space-between` | `justify-content: space-between` |
| `.justify-space-around` | `justify-content: space-around` |
| `.justify-space-evenly` | `justify-content: space-evenly` |

---

## Align Self

**Prefix:** `align-self`  **Property:** `align-self`

| Class | CSS |
|---|---|
| `.align-self-normal` | `align-self: normal` |
| `.align-self-center` | `align-self: center` |
| `.align-self-start` | `align-self: start` |
| `.align-self-end` | `align-self: end` |
| `.align-self-baseline` | `align-self: baseline` |
| `.align-self-stretch` | `align-self: stretch` |

---

## Justify Self

**Prefix:** `justify-self`  **Property:** `justify-self`

| Class | CSS |
|---|---|
| `.justify-self-normal` | `justify-self: normal` |
| `.justify-self-center` | `justify-self: center` |
| `.justify-self-start` | `justify-self: start` |
| `.justify-self-end` | `justify-self: end` |
| `.justify-self-stretch` | `justify-self: stretch` |

---

## Order

**Prefix:** `order`  **Property:** `order`

Visual order of flex **and** grid children, independent of source order.

| Class | CSS |
|---|---|
| `.order--1` | `order: -1` |
| `.order-0` … `.order-6` | `order: 0` … `order: 6` |
| `.order-first` | `order: -9999` |
| `.order-last` | `order: 9999` |

`.order-first` / `.order-last` are the escape hatch for "before/after
everything" when you do not know the sibling count. The sentinel numbers are
arbitrary but conventional — same values Tailwind uses.

```html
<!-- source order keeps the heading first for screen readers,
     visual order puts the image on top below md -->
<div class="d-flex flex-column flex-md-row">
  <h2 class="order-1 order-md-0">Title</h2>
  <img class="order-0 order-md-1" src="…" alt="">
</div>
```

> [!WARNING]
> `order` moves the painted box, not the DOM. Focus order, screen-reader order,
> and `Tab` still follow source order — which is the feature above, and a bug if
> you use `order` to fix markup you could have written in the right sequence.

---

## Example

A centered card row that stacks vertically on small screens:

```html
<div class="flex-row flex-sm-column align-center justify-space-between gap-16">
  <div class="flex-grow-1">Card A</div>
  <div class="flex-grow-1">Card B</div>
  <div class="flex-shrink-0">Fixed</div>
</div>
```

Spacing between flex children comes from the `.gap-*` family (`.gap-16`, axis
variants `.gap-x-*` / `.gap-y-*`), documented under
[Spacing](/docs/spacing/#gap).

---

## Responsive Variants

Every class above has responsive variants using the breakpoint infixes below. Breakpoints are **min-width** (mobile-first).

| Infix | Min-width |
|---|---|
| `sm` | 420px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1366px |
| `xxl` | 1680px |

**Pattern:** `.{prefix}-{bp}-{value}`

```html
<!-- column by default, row at md and up -->
<div class="flex-column flex-md-row align-md-center">
  ...
</div>
```

All prefixes (`flex`, `flex-grow`, `flex-shrink`, `align`, `justify`, `align-self`, `justify-self`, `order`) generate the full set of responsive variants.
