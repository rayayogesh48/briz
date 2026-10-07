# Briz request mascot v2 — developer handoff

A floating "Request a Product" launcher built around the Briz mascot: a blue
shopping-bag character with a white face panel, whose eyes follow the cursor and
who shows a thinking face, with a thought bubble, when hovered. It also speaks up on its own when the visitor
goes quiet. This folder is a self-contained copy of the prototype: drop it into
a React project and it runs.

v1 (the full-body SVG shopper) is in `mascot-handoff/` and at the git tag
`mascot-v1`. v2 keeps the same hover interaction and adds the new character,
eyes that follow the cursor, unprompted hints and a larger hit area.

## Files

| File | What it is |
| --- | --- |
| `RequestMascotLauncher.tsx` | The launcher: fixed button, hover/focus/touch behaviour, `onOpen` callback. |
| `request-mascot-launcher.module.css` | All launcher styles and the whole interaction (CSS module). |
| `BrizMascot.tsx` | The character: shows one cell of a sprite atlas. Usable on its own. |
| `useCursorLook.ts` | Hook that points the mascot's eyes at the pointer. |
| `useAttentionHint.ts` | Hook that decides when the thought shows without hovering. |
| `assets/briz-v2-directions.webp` | 3×3 atlas, nine eye directions (169 KB). |
| `assets/briz-v2-reactions.webp` | 3×3 atlas, nine faces (180 KB). |
| `preview-directions.png`, `preview-reactions.png` | The two atlases on a plain background, for reference. |
| `source/` | The cleaned source sheets and the script used to prepare them. Only needed to rebuild the art. |

## Setup

1. Copy the five code files into the project.
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
| Idle | Default | The bag alone. His eyes follow the pointer across nine directions (the movement in this artwork is subtle). |
| Engaged | Pointer hover (including a 22px halo around him), or keyboard focus | Cross-fade to the thinking face (three dots); two thought dots pop; bubble grows from its lower-right corner; headline, description and arrow rise in. Whole launcher lifts 3px. |
| Leave | Pointer out / blur | Everything reverses from wherever it is. No exit delay. |
| Press | Mouse down / touch | Bubble scales to 0.96, launcher to 0.985. |
| Activate | Click, Enter, Space | `onOpen()` |
| Idle hint | No pointer, key, touch, wheel or scroll activity for 8s | Engaged state shown for 4.5s. Repeats every 25s of continued inactivity. |
| Scroll hint | Touch devices only: 0.9s after first scrolling past 120px | Engaged state shown for 4.5s. Once. |

Hints (idle + scroll together) are capped at **three per page load**; after that
the mascot waits to be hovered or tapped. No hint shows while the tab is hidden.
Pass `false` to `useAttentionHint` while the request flow is open.

On touch devices and with reduced motion the eyes do not follow anything; he
looks straight ahead.

## Copy

| | Desktop | Phone (< 640px) |
| --- | --- | --- |
| Headline | Can’t find a product? | Can’t find it? |
| Description | Send product request to nearby sellers | same (wraps to two lines) |

## Layout

| | Desktop | Phone (< 640px) |
| --- | --- | --- |
| Launcher position | `right: 24px; bottom: 24px` | `right: 9px; bottom: max(20px, safe-area)` |
| Where the artwork lands | about 32px from the right, 21px from the bottom | 16px from the right, 16px from the bottom |
| Character box | 88 × 88px (the bag is about 71 × 76px inside it) | 76 × 76px (bag about 61 × 65px) |
| Hover / tap halo | 22px beyond the box on every side | 14px |
| Bubble | up and to the left of the bag, 18px from the box | same at 14px, wraps, never wider than the viewport allows |
| Bubble radius / padding | 26px / 14px 14px 14px 20px | 20px / 10px 10px 10px 14px |
| Headline | 15/20px, 600 | 14/18px, 600 |
| Description | 12.5/16px, 450 | 12/15px, 450 |
| Arrow chip | 30px circle | 26px circle |
| z-index | 900 | 900 |

The character box is larger than the bag because each sprite cell keeps empty
room around the artwork: about 10% left and right, 8% underneath and 6% above,
which is also where the floating symbols (`!`, hearts, dots) sit, beside the
handle. That is why the phone position is not simply 16px (`right: 9px`,
`bottom: 20px`): it offsets the launcher by those margins so the visible bag
sits 16px from the edges. Desktop has not been corrected the
same way. If the art changes, retune `.wrapper` (phones), `.dotSmall`,
`.dotLarge` and `.thought`.

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
| Eye-follow | full strength at 280px from the character; moves to a neighbouring direction past 34% of that |
| Hints | idle 8s, repeat 25s, visible 4.5s, max 3; touch scroll hint 0.9s after 120px |

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

- With `expression`, it shows a face from the reactions atlas.
- With `direction`, it shows that cell of the directions atlas.
- With neither, it reads `--look-col` / `--look-row` (0, 1 or 2) from an
  ancestor, which is how the idle eyes follow the cursor.

`useCursorLook` writes those two variables onto the button in a
`requestAnimationFrame`, so pointer movement never re-renders React.

Cell order — directions: up-left, up, up-right / left, center, right /
down-left, down, down-right. Faces: smile, wink, laugh / surprised, love,
puzzled / cool, sleepy, happy.

### Faces and expression names

The bag was drawn with its own nine faces, which are not the nine expression
names the app uses. `BrizMascot` accepts either, and maps the app names onto the
closest face:

| App name | Face shown |
| --- | --- |
| greeting | smile |
| searching | happy |
| thinking | puzzled |
| found | surprised |
| excited | laugh |
| confused | puzzled |
| no-results | puzzled |
| waiting | sleepy |
| success | wink |

`love` and `cool` are only reachable by their own names. There is **no sad face
and no question-mark face**, so thinking, confused and no-results look the same.
The face labelled `puzzled` is in fact cheerful in this artwork: a small smile,
eyes glancing up, three dots. It reads as "let me think", not as confusion.
A real "no results" screen needs a new sheet with a sad face; update
`MASCOT_FACES` and `EXPRESSION_FACE` in `BrizMascot.tsx` to match it.

### Unprompted hints

`useAttentionHint` returns a boolean that the launcher writes to `data-hint`,
which turns the CSS state on exactly like hover. It listens for activity
(pointer, key, wheel, touch, scroll) to restart an idle timer, and on touch
devices arms a single timer the first time the page is scrolled past the
threshold. The scroll hint uses a fixed delay on purpose: waiting for scrolling
to stop never fired in testing, because momentum and layout shifts keep emitting
scroll events.

### Other details worth keeping

- The hidden bubble has `visibility: hidden` and `pointer-events: none`, so it
  cannot be hovered or clicked while invisible.
- `.thought::after` is an invisible bridge so the pointer can move from the
  character onto the bubble without losing hover.
- `.launcher::before` is the invisible halo that enlarges the hit area.
- Hover rules are inside `@media (hover: hover)` so a tap on a phone cannot
  leave the bubble stuck open.
- `.wrapper` on phones is offset for the artwork's margins (see Layout).
- React only re-renders when a hint turns on or off, and once after the entrance.
  Hover and pointer movement never re-render.

## The mascot on its own

```tsx
import { BrizMascot } from "./BrizMascot";

<BrizMascot expression="success" size={160} title="Request sent" />
<BrizMascot expression="love" size={120} />
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
the two atlases with new ones in the same 3×3 layout, bump `ASSET_VERSION` in
`BrizMascot.tsx`, update the face list and mapping if the faces differ, and
retune the offsets listed under Layout if the character sits differently in its
cell.

### Rebuilding the art (optional)

The atlases were made from two AI-drawn sheets on a green background:

1. Remove the green: `key.py` from the page-mascot skill
   (github.com/nilbuild/page-mascot).
2. `source/prepare_sheet.py <in> <out> --scale-file scale.txt` — cleans green
   spill and re-grids the nine drawings into even cells. Process the
   expressions sheet first, then the directions sheet with the same scale file.
3. page-mascot's `build.py <name> --anchor content --no-vignette` builds both
   atlases, then `verify.py <name>` checks they line up. The flags matter for
   this character: it is full-body, and the default bottom fade erases the feet.

`source/directions.png` and `source/reactions.png` are already at step 2, so
only step 3 is needed to rebuild them. Requires Python with Pillow, NumPy, SciPy.

## Accessibility

- A real `<button>`; works with Tab, Enter and Space.
- The button's accessible name includes the prompt, so screen-reader users get
  the message without needing hover.
- Visible focus ring (2px, 8px offset). Keyboard focus shows the bubble.
- `prefers-reduced-motion`: states still switch, but nothing moves and the eyes
  do not follow the pointer. Unprompted hints still appear.
- The mascot is decorative inside the launcher (`aria-hidden`); pass `title`
  when using it on its own.

## Browser support

Uses individual transform properties (`scale`, `translate`), `:focus-visible`
and WebP: Chrome/Edge 104+, Safari 14.1+, Firefox 85+.

## Known gaps — this is a prototype

- **Checked in the prototype app, at the previous 108px size:** idle and hover
  states at desktop width; on a 375px touch viewport, the scroll hint appearing
  with the bubble on screen and the bag landing 17px from the right and 19px
  from the bottom.
- **Checked earlier with the previous bag artwork:** the idle hint firing at
  about 8s, and the scroll hint appearing after 0.9s and hiding 4.5s later.
- **Checked in this standalone copy:** it type-checks, lints and serves.
- **Not checked:** the current 88px / 76px sizing on screen (positions were
  scaled from the verified 108px layout); the hover and hint animations in this
  standalone copy; the 25s repeat and the three-hint cap; keyboard focus; a
  real phone.
- **No automated tests** for this component.
- **Three app expressions share one face** (see Faces and expression names).
- **Hints are per page load**, not per visitor or session. Whether they should
  be remembered, and how often they may repeat, is a product decision; the
  original brief warned against a widget that feels like it is begging.
- **Reduced motion does not disable hints**, only movement.
- **Eye movement is barely visible** in this artwork: the pupils shift only
  slightly between the nine poses, so "follows the cursor" is easy to miss.
- **The halo blocks clicks** on anything directly underneath its 22px ring, and
  on phones it extends past the screen edge.
- **Both atlases load on first render** (about 350 KB together), including the
  faces sheet that is only seen on hover or hint. Preload or lazy-load as fits.
- **Touch detection** uses `matchMedia("(hover: none)")`. Hybrid devices report
  hover and get the desktop behaviour.
- **Desktop spacing** still places the image box, not the artwork, 24px from
  the edges.
- **No dark mode**, **no localisation**, and **the request panel is not
  included** — wire `onOpen` to the real flow.
- **The artwork is AI-generated.** Confirm it is cleared for brand use.
- **z-index 900** was chosen to sit below Briz's dialogs; confirm against the
  real stacking order.

## Where this lives in the prototype repo

Branch `feat/mascot-v2` of `rayayogesh48/briz`:

- `briz-web/src/components/briz-sprite.tsx` (here: `BrizMascot.tsx`)
- `briz-web/src/components/use-cursor-look.ts`
- `briz-web/src/components/use-attention-hint.ts`
- `briz-web/src/components/request-shopper-launcher.tsx`
- `briz-web/src/components/request-product-widget.tsx` (the `sprite` variant)
- `briz-web/src/components/request-product-widget.module.css`
- `briz-web/public/mascots/`, `briz-web/characters/`
- Gallery: `/dev/mascot`

In the repo the launcher is one variant of a larger widget that also holds other
launcher looks and the request panel. This folder is the v2 mascot extracted on
its own; class names differ, behaviour and values match.
