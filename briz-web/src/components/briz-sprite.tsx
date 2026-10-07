"use client";

import { memo, type CSSProperties } from "react";
import { SHOPPER_EXPRESSIONS, type ShopperExpression } from "./briz-shopper";

/** The nine head directions, in the order they sit in the 3×3 atlas. */
export const SPRITE_DIRECTIONS = [
  "up-left", "up", "up-right",
  "left", "center", "right",
  "down-left", "down", "down-right",
] as const;

export type SpriteDirection = (typeof SPRITE_DIRECTIONS)[number];

interface BrizSpriteProps {
  /** Show one of the nine expressions (facing the viewer). Takes priority over direction. */
  expression?: ShopperExpression;
  /** Fixed head direction. Omit both to follow --look-col / --look-row (see useCursorLook). */
  direction?: SpriteDirection;
  size?: number;
  className?: string;
  /** Accessible name. Leave empty when the mascot is decorative. */
  title?: string;
}

// Two 3×3 atlases built with the page-mascot skill and verified to line up
// (0px shift between them). Expressions are in SHOPPER_EXPRESSIONS order.
// Bump the version when the artwork changes, so browsers drop the cached sheet.
const DIRECTIONS_ATLAS = "/mascots/briz-v2-directions.webp?v=3";
const REACTIONS_ATLAS = "/mascots/briz-v2-reactions.webp?v=3";
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
    ? SHOPPER_EXPRESSIONS.indexOf(expression)
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
