"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, type Variants } from "motion/react";
import { BrizShopper } from "./BrizShopper";
import styles from "./request-mascot-launcher.module.css";

/** Scroll distance (px) after which touch devices see the one-time hint. */
export const HINT_SCROLL_THRESHOLD = 120;
/** How long (ms) the hint stays up on touch devices. */
export const HINT_DURATION = 4500;
/** Delay (s) before the launcher first appears, so the page can settle. */
export const ENTRANCE_DELAY = 0.4;

const SHOPPER_SIZE = 76;

export interface RequestMascotLauncherProps {
  /** Fired on click, Enter or Space — open the Request a Product flow here. */
  onOpen?: () => void;
  className?: string;
  /** Shared layout id: a panel rendered with the same id grows out of the launcher. */
  layoutId?: string;
}

// The hover/tap labels also drive the character's own tilt (see BrizShopper).
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
const LauncherContent = memo(function LauncherContent() {
  return (
    <>
      <span className={styles.stage}>
        <span className={styles.poseIdle}>
          <BrizShopper crop="body" size={SHOPPER_SIZE} expression="searching" hideMark />
        </span>
        <span className={styles.poseActive}>
          <BrizShopper crop="body" size={SHOPPER_SIZE} expression="confused" hideMark />
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
            <span className={styles.desktopText}>Request it from nearby sellers.</span>
            <span className={styles.mobileText}>Request it from local sellers.</span>
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
 * Floating "Request a Product" launcher with the Briz shopper mascot.
 *
 * Idle: the character stands alone, looking around.
 * Hover / keyboard focus: confused pose + thought bubble with the prompt.
 * Touch: the thought shows once for HINT_DURATION after the first scroll.
 * Activate: calls onOpen.
 */
export function RequestMascotLauncher({
  onOpen,
  className,
  layoutId = "briz-request-widget",
}: RequestMascotLauncherProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hasEntered, setHasEntered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const hintShownRef = useRef(false);

  const { scrollY } = useScroll();

  // Touch devices cannot hover, so the thought is shown once as a hint.
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > HINT_SCROLL_THRESHOLD && !hintShownRef.current) {
      hintShownRef.current = true;
      if (window.matchMedia("(hover: none)").matches) setShowHint(true);
    }
  });

  useEffect(() => {
    if (!showHint) return;
    const timer = setTimeout(() => setShowHint(false), HINT_DURATION);
    return () => clearTimeout(timer);
  }, [showHint]);

  const handleEntered = () => setHasEntered(true);

  return (
    <aside className={`${styles.wrapper} ${className ?? ""}`.trim()} aria-label="Product Request Assistant">
      <motion.button
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
        aria-label="Request a product. Can’t find a product? Request it from nearby sellers."
      >
        <LauncherContent />
      </motion.button>
    </aside>
  );
}

export default RequestMascotLauncher;
