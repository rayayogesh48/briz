"use client";

import { memo } from "react";
import { BrizShopper } from "./briz-shopper";
import styles from "./request-product-widget.module.css";

const SHOPPER_SIZE = 76;

/**
 * Contents of the "shopper" launcher: the character and its thought bubble.
 *
 * Both poses and the bubble are always mounted. The parent button only flips a
 * CSS state (:hover, :focus-visible or data-hint), and CSS transitions cross-fade
 * between them — so hovering never re-renders React or restarts an animation,
 * and rapid in/out simply retargets the transitions.
 */
export const ShopperLauncherContent = memo(function ShopperLauncherContent() {
  return (
    <>
      <span className={styles.shopperStage}>
        <span className={styles.shopperIdle}>
          <BrizShopper crop="body" size={SHOPPER_SIZE} expression="searching" hideMark />
        </span>
        <span className={styles.shopperActive}>
          <BrizShopper crop="body" size={SHOPPER_SIZE} expression="confused" hideMark />
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
            <span className={styles.desktopText}>Request it from nearby sellers.</span>
            <span className={styles.mobileText}>Request it from local sellers.</span>
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
