"use client";

import { memo, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { BrizMascot } from "./BrizMascot";
import { useAttentionHint } from "./useAttentionHint";
import { useCursorLook } from "./useCursorLook";
import styles from "./request-mascot-launcher.module.css";

/** Delay (s) before the launcher first appears, so the page can settle. */
export const ENTRANCE_DELAY = 0.4;

const MASCOT_SIZE = 88;

export interface RequestMascotLauncherProps {
  /** Fired on click, Enter or Space — open the Request a Product flow here. */
  onOpen?: () => void;
  className?: string;
  /** Folder the two mascot atlases are served from. */
  assetBase?: string;
  /** Shared layout id: a panel rendered with the same id grows out of the launcher. */
  layoutId?: string;
}

const launcherVariants: Variants = {
  initial: { opacity: 0, scale: 0.85, y: 12 },
  // `custom` carries the entrance delay; it is 0 once the launcher has entered.
  animate: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 24, mass: 0.8, delay },
  }),
  hover: { y: -3, scale: 1.012, transition: { type: "spring", stiffness: 380, damping: 24 } },
  tap: { scale: 0.985 },
};

const REDUCED_TAP = { scale: 0.985 };

/**
 * Character + thought bubble. Both poses and the bubble are always mounted; the
 * button only flips a CSS state (:hover, :focus-visible or data-hint) and CSS
 * transitions cross-fade between them. Hovering therefore never re-renders React
 * or restarts an animation, and rapid in/out simply retargets the transitions.
 */
const LauncherContent = memo(function LauncherContent({ assetBase }: { assetBase: string }) {
  return (
    <>
      <span className={styles.stage}>
        {/* Idle: the eyes follow the cursor through nine directions. */}
        <span className={styles.poseIdle}>
          <BrizMascot size={MASCOT_SIZE} assetBase={assetBase} />
        </span>
        {/* Engaged: the puzzled face. */}
        <span className={styles.poseActive}>
          <BrizMascot size={MASCOT_SIZE} assetBase={assetBase} expression="confused" />
        </span>
      </span>

      <span className={styles.dotSmall} />
      <span className={styles.dotLarge} />

      <span className={styles.thought}>
        <span className={styles.copy}>
          <span className={`${styles.headline} ${styles.line}`}>
            <span className={styles.desktopText}>Can’t find a product?</span>
            <span className={styles.mobileText}>Can’t find it?</span>
          </span>
          <span className={`${styles.description} ${styles.line}`}>
            Send product request to nearby sellers
          </span>
        </span>
        <span className={`${styles.arrow} ${styles.line}`}>
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

/**
 * Floating "Request a Product" launcher with the Briz mascot (v2).
 *
 * Idle: the bag's eyes follow the cursor.
 * Hover / keyboard focus: puzzled face + thought bubble with the prompt.
 * Unprompted: the thought also shows when the visitor goes quiet, and on touch
 * devices shortly after the first scroll (see useAttentionHint).
 * Activate: calls onOpen.
 */
export function RequestMascotLauncher({
  onOpen,
  className,
  assetBase = "/mascots",
  layoutId = "briz-request-widget",
}: RequestMascotLauncherProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hasEntered, setHasEntered] = useState(false);
  const launcherRef = useCursorLook<HTMLButtonElement>();
  // Pass false while the request flow is open so the mascot stays quiet.
  const showHint = useAttentionHint(true);

  const handleEntered = () => setHasEntered(true);

  return (
    <aside className={`${styles.wrapper} ${className ?? ""}`.trim()} aria-label="Product Request Assistant">
      <motion.button
        ref={launcherRef}
        type="button"
        layoutId={layoutId}
        className={styles.launcher}
        data-hint={showHint}
        variants={shouldReduceMotion ? undefined : launcherVariants}
        custom={hasEntered ? 0 : ENTRANCE_DELAY}
        initial={shouldReduceMotion ? false : "initial"}
        animate={shouldReduceMotion ? undefined : "animate"}
        whileHover={shouldReduceMotion ? undefined : "hover"}
        whileTap={shouldReduceMotion ? REDUCED_TAP : "tap"}
        onAnimationComplete={handleEntered}
        onClick={onOpen}
        aria-label="Request a product. Can’t find a product? Send product request to nearby sellers."
      >
        <LauncherContent assetBase={assetBase} />
      </motion.button>
    </aside>
  );
}

export default RequestMascotLauncher;
