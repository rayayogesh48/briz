"use client";

import { memo } from "react";
import { BrizFace } from "./briz-face";
import { BrizShopper } from "./briz-shopper";
import { BrizSprite, SPRITE_HAS_EXPRESSIONS } from "./briz-sprite";
import styles from "./request-product-widget.module.css";

const SHOPPER_SIZE = 76;
const FACE_SIZE = 76;

// The sprite cell keeps a margin around the character, so the box is a little
// larger than the character it shows.
const SPRITE_SIZE = 88;

export type LauncherCharacter = "shopper" | "face" | "seller" | "sprite";

/**
 * Contents of the "shopper" launcher: the character and its thought bubble.
 *
 * Both poses and the bubble are always mounted. The parent button only flips a
 * CSS state (:hover, :focus-visible or data-hint), and CSS transitions cross-fade
 * between them — so hovering never re-renders React or restarts an animation,
 * and rapid in/out simply retargets the transitions.
 */
export const ShopperLauncherContent = memo(function ShopperLauncherContent({
  character = "shopper",
}: {
  /** Which mascot to show. The interaction is identical for both. */
  character?: LauncherCharacter;
}) {
  return (
    <>
      <span className={styles.shopperStage}>
        <span className={styles.shopperIdle}>
          {character === "sprite" ? (
            // Idle: follows the cursor through the nine head directions.
            <BrizSprite size={SPRITE_SIZE} />
          ) : character !== "shopper" ? (
            <BrizFace size={FACE_SIZE} persona={character === "seller" ? "seller" : "shopper"} expression="searching" hideMark />
          ) : (
            <BrizShopper crop="body" size={SHOPPER_SIZE} expression="searching" hideMark />
          )}
        </span>
        <span className={styles.shopperActive}>
          {character === "sprite" ? (
            // Engaged: the puzzled face, or a glance up at the thought bubble until
            // the character's expressions sheet exists.
            SPRITE_HAS_EXPRESSIONS ? (
              <BrizSprite size={SPRITE_SIZE} expression="confused" />
            ) : (
              <BrizSprite size={SPRITE_SIZE} direction="up-left" />
            )
          ) : character !== "shopper" ? (
            <BrizFace size={FACE_SIZE} persona={character === "seller" ? "seller" : "shopper"} expression="confused" hideMark />
          ) : (
            <BrizShopper crop="body" size={SHOPPER_SIZE} expression="confused" hideMark />
          )}
        </span>
      </span>

      <span className={styles.thoughtDotSmall} />
      <span className={styles.thoughtDotLarge} />

      <span className={styles.thought}>
        <span className={styles.contentBlock}>
          <span className={`${styles.headline} ${styles.thoughtLine}`}>
            <span className={styles.desktopText}>Can’t find a product?</span>
            <span className={styles.mobileText}>Can’t find it?</span>
          </span>
          <span className={`${styles.description} ${styles.thoughtLine}`}>
            Send product request to nearby sellers
          </span>
        </span>
        <span className={`${styles.thoughtArrow} ${styles.thoughtLine}`}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </span>
    </>
  );
});
