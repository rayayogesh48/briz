# Briz request mascot — developer handoff

A floating "Request a Product" launcher built around the Briz shopper mascot.
This folder is a self-contained copy of the prototype: drop it into a React
project and it runs.

## Files

| File | What it is |
| --- | --- |
| `RequestMascotLauncher.tsx` | The launcher: fixed button, hover/focus/touch behaviour, `onOpen` callback. |
| `request-mascot-launcher.module.css` | All launcher styles and the whole interaction (CSS module). |
| `BrizShopper.tsx` | The mascot itself: one SVG character with nine expressions. Usable on its own. |
| `expressions.png` | Reference sheet of the nine expressions. |

## Requirements

- React 18 or 19, with CSS Modules support (Next.js, Vite and CRA all have it).
- `motion` (Motion for React): `npm i motion`. Prototype used `motion@13`.
- Both `.tsx` files are client components (`"use client"`).

## Usage

```tsx
import { RequestMascotLauncher } from "./RequestMascotLauncher";

<RequestMascotLauncher onOpen={() => setRequestPanelOpen(true)} />
```

Render it once, near the root layout. It positions itself (`position: fixed`).

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `onOpen` | `() => void` | — | Fired on click, Enter or Space. |
| `className` | `string` | — | Added to the fixed wrapper, e.g. to move it. |
| `layoutId` | `string` | `"briz-request-widget"` | Give the request panel the same Motion `layoutId` and it grows out of the launcher. |

## Behaviour

| State | Trigger | What the user sees |
| --- | --- | --- |
| Entrance | Page load, after 0.4s | Launcher springs in (opacity 0→1, scale 0.85→1, y 12→0). Once only. |
| Idle | Default | Character alone, "searching" pose. Gentle bob, a blink every ~4s, eyes glance away from the phone and back every 5s. |
| Engaged | Pointer hover, or keyboard focus | Cross-fade to the "confused" pose; two thought dots pop; bubble grows from its lower-right corner; headline, description and arrow rise in. Whole launcher lifts 3px. |
| Leave | Pointer out / blur | Everything reverses from wherever it is. No exit delay. |
| Press | Mouse down / touch | Bubble scales to 0.96, launcher to 0.985. |
| Activate | Click, Enter, Space | `onOpen()` |
| Touch hint | Touch device, first scroll past 120px | Engaged state shown for 4.5s, then hides. Once per page load. |

Scrolling does nothing on pointer devices; the thought appears on hover/focus only.

## Copy

| | Desktop | Phone (< 640px) |
| --- | --- | --- |
| Headline | Can’t find a product? | Can’t find it? |
| Description | Request it from nearby sellers. | Request it from local sellers. |

## Layout

| | Desktop | Phone (< 640px) |
| --- | --- | --- |
| Position | `right: 24px; bottom: 24px` | `right: 16px; bottom: max(16px, safe-area)` |
| Character | 76 × 112px | 60px wide |
| Bubble | to the left of the head, 34px above the character's top, 26px gap | 28px above, 20px gap, wraps, never wider than the viewport allows |
| Bubble radius / padding | 26px / 14px 14px 14px 20px | 20px / 10px 10px 10px 14px |
| Headline | 15/20px, 600 | 14/18px, 600 |
| Description | 12.5/16px, 450 | 12/15px, 450 |
| Arrow chip | 30px circle | 26px circle |
| z-index | 900 | 900 |

## Colours

The CSS reads these custom properties and falls back to the Briz values:

| Variable | Fallback | Used for |
| --- | --- | --- |
| `--primary` | `#3e63dd` | Arrow chip, focus ring |
| `--foreground` | `#202020` | Headline |
| `--muted-foreground` | `#646464` | Description |
| `--card` | `#ffffff` | Thought dots |
| `--border` | `#ebebeb` | Thought dots border |

The bubble's gradient, border and shadow are fixed values in the CSS
(`#ffffff → #f7f9ff`, border `rgba(62,99,221,.3)`). The character's colours
are constants at the top of `BrizShopper.tsx` (hoodie `#3e63dd`).

## Motion values

| What | Value |
| --- | --- |
| Ease | `cubic-bezier(0.2, 0, 0, 1)` |
| Spring-like ease | `cubic-bezier(0.2, 1.25, 0.35, 1)` |
| Pose cross-fade | 160ms |
| Dots | 200ms, large dot +40ms |
| Bubble | opacity 140ms, scale/translate 260ms, starts 60ms after trigger |
| Bubble from | scale 0.7, offset 10px right / 4px down, origin bottom-right |
| Content stagger | headline +110ms, description +160ms, arrow +210ms; each 200ms, rises 6px |
| Launcher hover | y −3, scale 1.012 (Motion spring 380/24) |
| Entrance | Motion spring 320/24, mass 0.8, delay 0.4s |

## How the interaction is built (read this before changing it)

The interaction is driven by CSS, not React state:

1. The button owns one custom property, `--on`. It is `0` by default and `1`
   while the button is `:hover` (inside `@media (hover: hover)`),
   `:focus-visible`, or has `data-hint="true"`.
2. Every moving part computes its opacity, scale and offset from `--on`
   with `calc()`, and has a CSS **transition**.
3. Both poses and the bubble are **always mounted**. Nothing is added to or
   removed from the DOM on hover.

This is deliberate. An earlier version mounted/unmounted the bubble and
re-rendered the character on each hover with keyframe animations, and broke when
hovered repeatedly. Transitions retarget mid-flight; keyframes do not. Keep
interactive state on transitions.

Other details worth keeping:

- The hidden bubble has `visibility: hidden` and `pointer-events: none`, so it
  cannot be hovered or clicked while invisible.
- `.thought::after` is an invisible bridge over the gap between character and
  bubble, so the pointer can move onto the bubble without losing hover.
- Hover rules are inside `@media (hover: hover)` so a tap on a phone cannot
  leave the bubble stuck open.
- `--press` handles the pressed scale so it composes with `--on`.
- React only re-renders for the touch hint (twice per page load) and once after
  the entrance.

## The mascot on its own

```tsx
import { BrizShopper } from "./BrizShopper";

<BrizShopper expression="no-results" size={160} title="No results found" />
```

| Prop | Values | Default |
| --- | --- | --- |
| `expression` | `greeting`, `searching`, `thinking`, `found`, `excited`, `confused`, `no-results`, `waiting`, `success` | `greeting` |
| `crop` | `full` (room for the floating mark), `body` (character fills the box), `bust` (head and shoulders) | `full` |
| `size` | width in px | `120` |
| `title` | accessible name; omit when decorative | — |
| `hideMark` | hide the floating `?` / `!` / check / dots | `false` |

All nine expressions share one drawing; only the face, arm pose, phone screen
and mark change. Each expression is one entry in the `FACES` table.

## Accessibility

- A real `<button>`; works with Tab, Enter and Space.
- The button's accessible name includes the prompt, so screen-reader users get
  the message without needing hover.
- Visible focus ring (2px, 8px offset). Keyboard focus shows the bubble.
- `prefers-reduced-motion`: states still switch, but nothing moves, and the
  mascot's bob, blink and glance stop.
- Text contrast: headline and description on the white bubble both pass WCAG AA.

## Browser support

Uses individual transform properties (`scale`, `translate`) and `:focus-visible`:
Chrome/Edge 104+, Safari 14.1+, Firefox 85+. In older browsers the bubble would
appear without the scale/offset motion.

## Known gaps — this is a prototype

- **Not checked:** keyboard focus after the final rewrite, the pointer bridge
  after the bubble was moved up, and the phone layout after that same move.
  Motion timing was tuned by eye from code, not user-tested.
- **No automated tests** for this component.
- **Touch detection** uses `matchMedia("(hover: none)")`. Hybrid devices (touch
  laptops) report hover and get the desktop behaviour.
- **The hint is once per page load**, not once per user. Persisting "seen" is
  a product decision.
- **No dark mode.** Briz has none; the bubble colours are fixed light values.
- **The request panel is not included.** In the prototype the launcher opens
  the existing `RequestProductPanel`; wire `onOpen` to the real flow.
- **Copy is not localised.**
- **The character is hand-drawn SVG**, flat with outlines. It reads slightly
  boyish; a more neutral hairstyle was suggested but not done.
- **z-index 900** was chosen to sit below Briz's dialogs; confirm against the
  real stacking order.

## Where this lives in the prototype repo

Branch `feat/about-feedback-request-mascot` of `rayayogesh48/briz`:

- `briz-web/src/components/briz-shopper.tsx`
- `briz-web/src/components/request-shopper-launcher.tsx`
- `briz-web/src/components/request-product-widget.tsx` (the `shopper` variant)
- `briz-web/src/components/request-product-widget.module.css`
- Expression gallery: `/dev/mascot`

In the repo the launcher is one variant of a larger widget that also contains
three other launcher looks and the request panel. This folder is the shopper
variant extracted on its own; class names differ, behaviour and values match.
