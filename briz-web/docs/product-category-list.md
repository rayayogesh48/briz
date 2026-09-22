# Product Category List

A horizontal, scrollable pill navigation component for filtering product categories with smooth scrolling, overflow gradient fades, and interactive edge-case handling.

Implemented from Figma design [946:103107](https://www.figma.com/design/WBxilPJIVmVdEMutum6eXp/Briz-Web?node-id=946-103107&m=dev).

---

## Default

Standard horizontal scrollable category pills with automatic 152px gradient fade masks and navigation chevrons.

---

## Long Category Names

Unselected categories with long labels are clamped with an ellipsis (maximum 160px width) to maintain clean visual density. When selected, the category expands to 100% width so the full label is visible without clipping.

---

## Compact (Few Categories)

When all categories fit within the container width, gradient fades and navigation chevrons are automatically hidden for an uncluttered appearance.

---

## Selected Item Out of View

When a category is selected either through direct interaction or programmatically, the component smoothly scrolls the active pill into the visible viewport.

---

## Keyboard & Touch Navigation

Fully accessible with standard tablist semantics, roving tabIndex, left and right arrow key navigation, and smooth 60fps momentum swipe on touch and trackpad devices.
