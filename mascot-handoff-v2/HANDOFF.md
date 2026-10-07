# Briz request mascot v2 — developer handoff

A floating "Request a Product" launcher built around the Briz mascot: an
illustrated character whose head follows the cursor and who looks puzzled, with
a thought bubble, when hovered. This folder is a self-contained copy of the
prototype: drop it into a React project and it runs.

v1 (the full-body SVG shopper) is in `mascot-handoff/` and at the git tag
`mascot-v1`. The interaction is the same in both; v2 changes the character and
adds the head-follow and a larger hit area.

## Files

| File | What it is |
| --- | --- |
| `RequestMascotLauncher.tsx` | The launcher: fixed button, hover/focus/touch behaviour, `onOpen` callback. |
| `request-mascot-launcher.module.css` | All launcher styles and the whole interaction (CSS module). |
| `BrizMascot.tsx` | The character: shows one cell of a sprite atlas. Usable on its own. |
| `useCursorLook.ts` | Hook that points the mascot's head at the pointer. |
| `assets/briz-v2-directions.webp` | 3×3 atlas, nine head directions (131 KB). |
| `assets/briz-v2-reactions.webp` | 3×3 atlas, nine expressions (140 KB). |
| `preview-directions.png`, `preview-reactions.png` | The two atlases on a plain background, for reference. |
| `source/` | The cleaned source sheets and the script used to prepare them. Only needed to rebuild the art. |

## Setup

1. Copy the four code files into the project.
2. Copy both files in `assets/` to wherever static files are served, under
   `/mascots/` (for Next.js: `public/mascots/`). To use another folder, pass
   `assetBase`.
3. `npm i motion` (Motion for React; prototype used `motion@13`).

Needs React 18 or 19 with CSS Modules. All code files are client components.

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
| `assetBase` | `string` | `"/mascots"` | Folder the two atlases are served from. |
| `layoutId` | `string` | `"briz-request-widget"` | Give the request panel the same Motion `layoutId` and it grows out of the launcher. |

## Behaviour

| State | Trigger | What the user sees |
| --- | --- | --- |
| Entrance | Page load, after 0.4s | Launcher springs in (opacity 0→1, scale 0.85→1, y 12→0). Once only. |
| Idle | Default | The character alone. His head turns toward the pointer, snapping between nine directions. |
| Engaged | Pointer hover (including a 22px halo around him), or keyboard focus | Cross-fade to the confused face; two thought dots pop; bubble grows from its lower-right corner; headline, description and arrow rise in. Whole launcher lifts 3px. |
| Leave | Pointer out / blur | Everything reverses from wherever it is. No exit delay. |
| Press | Mouse down / touch | Bubble scales to 0.96, launcher to 0.985. |
| Activate | Click, Enter, Space | `onOpen()` |
| Touch hint | Touch device, first scroll past 120px | Engaged state shown for 4.5s, then hides. Once per page load. |

Scrolling does nothing on pointer devices; the thought appears on hover/focus only.
On touch devices and with reduced motion the head does not follow anything; he faces forward.

## Copy

| | Desktop | Phone (< 640px) |
| --- | --- | --- |
| Headline | Can’t find a product? | Can’t find it? |
| Description | Request it from nearby sellers. | Request it from local sellers. |

## Layout

| | Desktop | Phone (< 640px) |
| --- | --- | --- |
| Position | `right: 24px; bottom: 24px` | `right: 16px; bottom: max(16px, safe-area)` |
| Character box | 128 × 128px (the head fills roughly the middle 55%) | 104 × 104px |
| Hover / tap halo | 22px beyond the box on every side | 14px |
| Bubble | to the left of the head, overlapping the empty part of the character box | same, wraps, never wider than the viewport allows |
| Bubble radius / padding | 26px / 14px 14px 14px 20px | 20px / 10px 10px 10px 14px |
| Headline | 15/20px, 600 | 14/18px, 600 |
| Description | 12.5/16px, 450 | 12/15px, 450 |
| Arrow chip | 30px circle | 26px circle |
| z-index | 900 | 900 |

The character box is larger than the character because each sprite cell keeps
empty room above the head for the floating symbols (`?`, `!`, dots). The dots and
bubble are positioned against the head, not the box edge; if the art changes,
those offsets (`.dotSmall`, `.dotLarge`, `.thought`) are what to retune.

## Colours

The CSS reads these custom properties and falls back to the Briz values:

| Variable | Fallback | Used for |
| --- | --- | --- |
| `--primary` | `#3e63dd` | Arrow chip, focus ring |
| `--foreground` | `#202020` | Headline |
| `--muted-foreground` | `#646464` | Description |
| `--card` | `#ffffff` | Thought dots |
| `--border` | `#ebebeb` | Thought dots border |

The bubble's gradient, border and shadow are fixed values in the CSS.
The character's colours are in the artwork.

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
| Head-follow | full strength at 280px from the character; turns to a neighbouring direction past 34% of that |

## How it is built (read this before changing it)

### Hover is CSS, not React state

1. The button owns one custom property, `--on`. It is `0` by default and `1`
   while the button is `:hover` (inside `@media (hover: hover)`),
   `:focus-visible`, or has `data-hint="true"`.
2. Every moving part computes its opacity, scale and offset from `--on`
   with `calc()`, and has a CSS **transition**.
3. Both poses and the bubble are **always mounted**. Nothing is added to or
   removed from the DOM on hover.

An earlier version mounted/unmounted the bubble and re-rendered the character on
each hover with keyframe animations, and broke when hovered repeatedly.
Transitions retarget mid-flight; keyframes do not. Keep interactive state on
transitions.

### The character is two sprite atlases

Each atlas is a 3×3 grid of 360px cells. `BrizMascot` shows one cell by setting
`background-position` on a 300%-sized background.

- With `expression`, it shows that cell of the reactions atlas.
- With `direction`, it shows that cell of the directions atlas.
- With neither, it reads `--look-col` / `--look-row` (0, 1 or 2) from an
  ancestor, which is how the idle head follows the cursor.

`useCursorLook` writes those two variables onto the button in a
`requestAnimationFrame`, so pointer movement never re-renders React.

Cell order — directions: up-left, up, up-right / left, center, right /
down-left, down, down-right. Expressions: greeting, searching, thinking /
found, excited, confused / no-results, waiting, success.

### Other details worth keeping

- The hidden bubble has `visibility: hidden` and `pointer-events: none`, so it
  cannot be hovered or clicked while invisible.
- `.thought::after` is an invisible bridge so the pointer can move from the
  character onto the bubble without losing hover.
- `.launcher::before` is the invisible halo that enlarges the hit area.
- Hover rules are inside `@media (hover: hover)` so a tap on a phone cannot
  leave the bubble stuck open.
- React only re-renders for the touch hint (twice per page load) and once after
  the entrance.

## The mascot on its own

```tsx
import { BrizMascot } from "./BrizMascot";

<BrizMascot expression="no-results" size={160} title="No results found" />
<BrizMascot direction="left" size={96} />
```

To make a standalone mascot follow the cursor, put it inside any element that
uses the hook:

```tsx
const ref = useCursorLook<HTMLDivElement>();
<div ref={ref}><BrizMascot size={160} /></div>
```

## Swapping the character later

The interaction does not depend on this artwork. To change the character, replace
the two atlases with new ones in the same 3×3 layout and cell order, bump
`ASSET_VERSION` in `BrizMascot.tsx`, and retune the dot and bubble offsets if the
head sits differently in its cell.

### Rebuilding the art (optional)

The atlases were made from two AI-drawn sheets on a green background:

1. Remove the green: `key.py` from the page-mascot skill
   (github.com/nilbuild/page-mascot).
2. `source/prepare_sheet.py <in> <out> --scale-file scale.txt` — cleans green
   spill and re-grids the nine drawings into even cells. Process the
   expressions sheet first, then the directions sheet with the same scale file.
3. page-mascot's `mascot.py <name> --skip-generate` builds and verifies both
   atlases (it uses the shoulder anchor; the default face anchor misreads this
   3D style and resizes heads unevenly).

`source/directions.png` and `source/reactions.png` are already at step 2, so
only step 3 is needed to rebuild them. Requires Python with Pillow, NumPy, SciPy.

## Accessibility

- A real `<button>`; works with Tab, Enter and Space.
- The button's accessible name includes the prompt, so screen-reader users get
  the message without needing hover.
- Visible focus ring (2px, 8px offset). Keyboard focus shows the bubble.
- `prefers-reduced-motion`: states still switch, but nothing moves and the head
  does not follow the pointer.
- The mascot is decorative inside the launcher (`aria-hidden`); pass `title`
  when using it on its own.

## Browser support

Uses individual transform properties (`scale`, `translate`), `:focus-visible`
and WebP: Chrome/Edge 104+, Safari 14.1+, Firefox 85+.

## Known gaps — this is a prototype

- **Checked:** at desktop width the standalone copy type-checks, lints, renders,
  follows the pointer, shows the confused face and bubble on hover, and calls
  `onOpen` on click.
- **Not checked:** phones, keyboard focus, and how the head-follow feels in motion.
  Timing was tuned from code and stills, not user-tested.
- **No automated tests** for this component.
- **Head turns snap** between nine poses; there are no in-between frames.
- **Only two of the nine expressions are used** by the launcher (the
  directions when idle, `confused` when engaged). The others are ready for
  empty states, success screens and so on.
- **Art quirks:** "excited" has one eye closed and reads close to a wink;
  "waiting" is a calm near-neutral face.
- **The halo blocks clicks** on anything directly underneath its 22px ring.
- **Both atlases load on first render** (about 270 KB together), including the
  expressions sheet that is only seen on hover. Preload or lazy-load as fits.
- **Touch detection** uses `matchMedia("(hover: none)")`. Hybrid devices report
  hover and get the desktop behaviour.
- **The hint is once per page load**, not once per user.
- **No dark mode**, **no localisation**, and **the request panel is not
  included** — wire `onOpen` to the real flow.
- **The artwork is AI-generated.** Confirm it is cleared for brand use.
- **z-index 900** was chosen to sit below Briz's dialogs; confirm against the
  real stacking order.

## Where this lives in the prototype repo

Branch `feat/mascot-v2` of `rayayogesh48/briz`:

- `briz-web/src/components/briz-sprite.tsx` (here: `BrizMascot.tsx`)
- `briz-web/src/components/use-cursor-look.ts`
- `briz-web/src/components/request-shopper-launcher.tsx`
- `briz-web/src/components/request-product-widget.tsx` (the `sprite` variant)
- `briz-web/src/components/request-product-widget.module.css`
- `briz-web/public/mascots/`, `briz-web/characters/`
- Gallery: `/dev/mascot`

In the repo the launcher is one variant of a larger widget that also holds other
launcher looks and the request panel. This folder is the v2 mascot extracted on
its own; class names differ, behaviour and values match.
