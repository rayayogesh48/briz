"use client";

import { memo, type CSSProperties } from "react";
import type { ShopperExpression } from "./briz-shopper";

/** The nine head directions, in the order they sit in the 3×3 atlas. */
export const SPRITE_DIRECTIONS = [
  "up-left", "up", "up-right",
  "left", "center", "right",
  "down-left", "down", "down-right",
] as const;

export type SpriteDirection = (typeof SPRITE_DIRECTIONS)[number];

/** The nine faces this character was drawn with, in the order they sit in the atlas. */
export const SPRITE_FACES = [
  "smile", "wink", "laugh",
  "surprised", "love", "puzzled",
  "cool", "sleepy", "happy",
] as const;

export type SpriteFace = (typeof SPRITE_FACES)[number];

// The app asks for expressions by the shared names (greeting, confused…). This
// character's sheet has a different set of faces, so each name points at the
// closest one. There is no sad face: "no-results" borrows the puzzled one.
const EXPRESSION_FACE: Record<ShopperExpression, SpriteFace> = {
  greeting: "smile",
  searching: "happy",
  thinking: "puzzled",
  found: "surprised",
  excited: "laugh",
  confused: "puzzled",
  "no-results": "puzzled",
  waiting: "sleepy",
  success: "wink",
};

const isFace = (value: string): value is SpriteFace => (SPRITE_FACES as readonly string[]).includes(value);

interface BrizSpriteProps {
  /**
   * Show a face. Accepts the shared expression names or one of this character's
   * own faces (SPRITE_FACES). Takes priority over direction.
   */
  expression?: ShopperExpression | SpriteFace;
  /** Fixed head direction. Omit both to follow --look-col / --look-row (see useCursorLook). */
  direction?: SpriteDirection;
  size?: number;
  className?: string;
  /** Accessible name. Leave empty when the mascot is decorative. */
  title?: string;
}

// Two 3×3 atlases built with the page-mascot skill and verified to line up
// (0px shift between them). Faces are in SPRITE_FACES order.
// Bump the version when the artwork changes, so browsers drop the cached sheet.
const DIRECTIONS_ATLAS = "/mascots/briz-v2-directions.webp?v=5";
const REACTIONS_ATLAS = "/mascots/briz-v2-reactions.webp?v=5";
// Set to false while a character has only its head-directions sheet: expressions
// then fall back to the face-forward direction cell.
export const SPRITE_HAS_EXPRESSIONS = true;

/**
 * Briz mascot v2 (illustrated): one character drawn in nine head directions and
 * nine expressions. Showing a cell is a background-position change, so following
 * the cursor costs no re-render.
 */
export const BrizSprite = memo(function BrizSprite({ expression, direction, size = 96, className, title }: BrizSpriteProps) {
  const showExpression = Boolean(expression) && SPRITE_HAS_EXPRESSIONS;
  const index = showExpression && expression
    ? SPRITE_FACES.indexOf(isFace(expression) ? expression : EXPRESSION_FACE[expression])
    : expression
    ? SPRITE_DIRECTIONS.indexOf("center")
    : direction
    ? SPRITE_DIRECTIONS.indexOf(direction)
    : -1;
  // In a 300% background, 0% / 50% / 100% select the first, middle and last cell.
  const column = index < 0 ? "var(--look-col, 1)" : String(index % 3);
  const row = index < 0 ? "var(--look-row, 1)" : String(Math.floor(index / 3));
  const style: CSSProperties = {
    display: "block",
    width: size,
    height: size,
    backgroundImage: `url(${showExpression ? REACTIONS_ATLAS : DIRECTIONS_ATLAS})`,
    backgroundSize: "300% 300%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: `calc(${column} * 50%) calc(${row} * 50%)`,
  };
  return (
    <span
      className={className}
      style={style}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    />
  );
});
