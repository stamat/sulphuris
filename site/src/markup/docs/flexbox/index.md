---
layout: docs
title: Flexbox
navTitle: Flexbox
description: Utility classes for flex direction, wrapping, alignment, justification, grow, and shrink.
order: 6
keywords: ["flex", "flexbox", "justify-content", "align-items", "flex-direction", "flex-wrap", "gap"]
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
| `.align-stretch` | `align-items: stretch` |

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

---

## Align Self

**Prefix:** `align-self`  **Property:** `align-self`

| Class | CSS |
|---|---|
| `.align-self-normal` | `align-self: normal` |
| `.align-self-center` | `align-self: center` |
| `.align-self-start` | `align-self: start` |
| `.align-self-end` | `align-self: end` |
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

All prefixes (`flex`, `flex-grow`, `flex-shrink`, `align`, `justify`, `align-self`, `justify-self`) generate the full set of responsive variants.
