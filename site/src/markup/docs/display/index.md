---
layout: poops-docs-theme/docs
title: Display & Visibility
navTitle: Display & Visibility
description: Utility classes for display, visibility, and overflow — all with full responsive variants.
order: 5
keywords: ["display", "d-flex", "d-grid", "d-none", "visibility", "overflow", "hidden"]
---

# Display & Visibility

## Display

Prefix: `d`. Property: `display`.

| Class | CSS |
|---|---|
| `.d-block` | `display: block` |
| `.d-inline` | `display: inline` |
| `.d-inline-block` | `display: inline-block` |
| `.d-flex` | `display: flex` |
| `.d-inline-flex` | `display: inline-flex` |
| `.d-grid` | `display: grid` |
| `.d-inline-grid` | `display: inline-grid` |
| `.d-table` | `display: table` |
| `.d-table-cell` | `display: table-cell` |
| `.d-none` | `display: none` |

> [!NOTE]
> `.d-grid` pairs with the `.grid-cols-*` and `.gap-*` families — see
> [Grid](../grid/) for the native CSS grid utilities.

## Visibility

Prefix: `v`. Property: `visibility`.

| Class | CSS |
|---|---|
| `.v-hidden` | `visibility: hidden` |
| `.v-visible` | `visibility: visible` |

> [!NOTE]
> `.v-hidden` hides the element but it still occupies space in the layout. Use `.d-none` to remove it from flow entirely.

## Overflow

Prefix: `overflow`, `overflow-x`, `overflow-y`. Properties: `overflow`, `overflow-x`, `overflow-y`.

| Class | CSS |
|---|---|
| `.overflow-hidden` | `overflow: hidden` |
| `.overflow-visible` | `overflow: visible` |
| `.overflow-auto` | `overflow: auto` |
| `.overflow-clip` | `overflow: clip` |
| `.overflow-scroll` | `overflow: scroll` |
| `.overflow-x-hidden` | `overflow-x: hidden` |
| `.overflow-x-visible` | `overflow-x: visible` |
| `.overflow-x-auto` | `overflow-x: auto` |
| `.overflow-x-clip` | `overflow-x: clip` |
| `.overflow-x-scroll` | `overflow-x: scroll` |
| `.overflow-y-hidden` | `overflow-y: hidden` |
| `.overflow-y-visible` | `overflow-y: visible` |
| `.overflow-y-auto` | `overflow-y: auto` |
| `.overflow-y-clip` | `overflow-y: clip` |
| `.overflow-y-scroll` | `overflow-y: scroll` |

> [!NOTE]
> `clip` is usually what `hidden` was reached for: it crops the overflow without
> turning the element into a scroll container, so nothing can scroll it
> programmatically or by focusing a clipped child. `hidden` still creates that
> container — pick it only when you intend to scroll it from script.
>
> `auto` shows scrollbars only when there is overflow; `scroll` reserves the
> gutter permanently, which is the one that stops a layout jumping as content
> grows past the box.

## Responsive

All three groups generate responsive variants. Insert a breakpoint name after the prefix.

Pattern: `.{prefix}-{bp}-{key}`

```
.d-md-flex         → display: flex         (min-width: 768px)
.d-lg-none         → display: none         (min-width: 1024px)
.v-md-hidden       → visibility: hidden    (min-width: 768px)
.overflow-lg-auto  → overflow: auto        (min-width: 1024px)
.overflow-x-md-hidden → overflow-x: hidden (min-width: 768px)
```

**Show/hide at breakpoints**

A common pattern: hide by default, show as flex from `md` up.

```html
<div class="d-none d-md-flex">…</div>
```

Or show on mobile only:

```html
<div class="d-block d-md-none">…</div>
```

Breakpoints (all min-width):

| Name | Min-width |
|---|---|
| `sm` | 420px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1366px |
| `xxl` | 1680px |

> [!NOTE]
> Classes without a breakpoint segment apply at all viewport widths. Responsive variants layer on top via `min-width` media queries, so the base class is the mobile-first default.
