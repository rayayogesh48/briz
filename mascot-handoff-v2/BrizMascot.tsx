"use client";

import { memo, type CSSProperties } from "react";

/** The nine faces the bag was drawn with, in the order they sit in the reactions atlas. */
export const MASCOT_FACES = [
  "smile", "wink", "laugh",
  "surprised", "love", "puzzled",
  "cool", "sleepy", "happy",
] as const;

/** App-level expression names. Each maps onto the closest face (see EXPRESSION_FACE). */
export const MASCOT_EXPRESSIONS = [
  "greeting", "searching", "thinking",
  "found", "excited", "confused",
  "no-results", "waiting", "success",
] as const;

/** The nine eye directions, in the order they sit in the directions atlas. */
export const MASCOT_DIRECTIONS = [
  "up-left", "up", "up-right",
  "left", "center", "right",
  "down-left", "down", "down-right",
] as const;

export type MascotFace = (typeof MASCOT_FACES)[number];
export type MascotExpression = (typeof MASCOT_EXPRESSIONS)[number];
export type MascotDirection = (typeof MASCOT_DIRECTIONS)[number];

// The art has no sad face and no question-mark face, so thinking, confused and
// no-results all show "puzzled" — which in this sheet is a cheerful thinking face
// with three dots. Replace the sheet to give them their own faces.
const EXPRESSION_FACE: Record<MascotExpression, MascotFace> = {
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

const isFace = (value: string): value is MascotFace => (MASCOT_FACES as readonly string[]).includes(value);

export interface BrizMascotProps {
  /**
   * Show a face: an app-level expression name, or one of the bag's own faces
   * (MASCOT_FACES, which adds "love" and "cool"). Takes priority over `direction`.
   */
  expression?: MascotExpression | MascotFace;
  /** Show one fixed eye direction. Omit both to follow --look-col / --look-row. */
  direction?: MascotDirection;
  /** Width and height in px. The bag fills about 81% of the width and 86% of the height. */
  size?: number;
  /** Folder the two atlases are served from. */
  assetBase?: string;
  className?: string;
  /** Accessible name. Leave empty when the mascot is decorative. */
  title?: string;
}

// Bump when the artwork changes, so browsers drop the cached sheets.
const ASSET_VERSION = "7";

/**
 * Briz mascot v2: the shopping bag. One character in two 3×3 sprite atlases, nine
 * eye directions and nine faces, verified to line up (0px shift between them). Showing a
 * cell is a background-position change, so following the cursor costs no re-render.
 */
export const BrizMascot = memo(function BrizMascot({
  expression,
  direction,
  size = 88,
  assetBase = "/mascots",
  className,
  title,
}: BrizMascotProps) {
  const index = expression
    ? MASCOT_FACES.indexOf(isFace(expression) ? expression : EXPRESSION_FACE[expression])
    : direction
    ? MASCOT_DIRECTIONS.indexOf(direction)
    : -1;
  // In a 300% background, 0% / 50% / 100% select the first, middle and last cell.
  const column = index < 0 ? "var(--look-col, 1)" : String(index % 3);
  const row = index < 0 ? "var(--look-row, 1)" : String(Math.floor(index / 3));
  const atlas = `${assetBase}/briz-v2-${expression ? "reactions" : "directions"}.webp?v=${ASSET_VERSION}`;
  const style: CSSProperties = {
    display: "block",
    width: size,
    height: size,
    backgroundImage: `url(${atlas})`,
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
