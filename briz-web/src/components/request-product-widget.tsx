"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { RequestMascot } from "./request-mascot";
import styles from "./request-product-widget.module.css";

/**
 * Scroll threshold (in pixels) required to trigger one-way widget expansion.
 */
export const EXPAND_SCROLL_THRESHOLD = 120;

export interface RequestProductWidgetProps {
  /**
   * Callback fired when user activates the launcher.
   * Prepares hooks for the future 360–400px request popover dialog.
   */
  onOpen?: () => void;
  /**
   * Optional custom CSS class for positioning or style overrides.
   */
  className?: string;
  /**
   * Shared layout identifier for seamless transition into the future popover.
   * Defaults to "briz-request-widget".
   */
  layoutId?: string;
  /**
   * Optional initial expansion state override (useful for testing or demos).
   */
  initialExpanded?: boolean;
  /**
   * Optional scroll threshold in pixels (defaults to EXPAND_SCROLL_THRESHOLD = 120).
   */
  scrollThreshold?: number;
}

// Initial entrance spring animation variants
export const widgetEntranceVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.86,
    y: 8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 340,
      damping: 26,
      mass: 0.8,
    },
  },
};

// Action arrow affordance micro-motion variant
export const arrowVariants: Variants = {
  initial: { x: 0 },
  animate: { x: 0 },
  hover: {
    x: 3,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
  tap: {
    x: 1,
  },
};

/**
 * Floating "Request a Product" launcher widget for the Briz marketplace.
 *
 * Mental model: "Can't find what you need? Tell Briz. Local sellers may have it."
 *
 * Lifecycle:
 * 1. Page load -> small 56x56px animated icon only in bottom-right corner.
 * 2. User scrolls > 120px -> expands smoothly leftward to reveal explanatory copy.
 * 3. Expansion is one-way -> remains expanded for the session even when scrolling back up.
 * 4. User clicks -> fires onOpen() hook prepared for future request popover.
 */
export function RequestProductWidget({
  onOpen,
  className,
  layoutId = "briz-request-widget",
  initialExpanded = false,
  scrollThreshold = EXPAND_SCROLL_THRESHOLD,
}: RequestProductWidgetProps) {
  const shouldReduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(initialExpanded);
  const [isScanning, setIsScanning] = useState(false);
  const hasTriggeredRef = useRef(initialExpanded);

  // Motion scroll listener
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > scrollThreshold && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      setExpanded(true);
      setIsScanning(true);
    }
  });

  // Handle page load when browser restores to an already-scrolled position
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.scrollY > scrollThreshold &&
      !hasTriggeredRef.current
    ) {
      hasTriggeredRef.current = true;
      setExpanded(true);
    }
  }, [scrollThreshold]);

  // Settle one-time scan animation back to gentle idle after expansion
  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        setIsScanning(false);
      }, 850);
      return () => clearTimeout(timer);
    }
  }, [isScanning]);

  const handleClick = () => {
    if (onOpen) {
      onOpen();
    }
  };

  return (
    <aside
      className={`${styles.widgetWrapper} ${className || ""}`.trim()}
      aria-label="Product Request Assistant"
      data-testid="briz-request-widget"
    >
      <motion.button
        type="button"
        layout
        layoutId={layoutId}
        className={`${styles.widgetButton} ${
          expanded ? styles.widgetButtonExpanded : styles.widgetButtonCollapsed
        }`}
        variants={shouldReduceMotion ? undefined : widgetEntranceVariants}
        initial={shouldReduceMotion ? { opacity: 1, scale: 1, y: 0 } : "initial"}
        animate={shouldReduceMotion ? { opacity: 1, scale: 1, y: 0 } : "animate"}
        whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.012 }}
        whileTap={{ scale: 0.985 }}
        transition={{
          layout: {
            type: "spring",
            stiffness: 380,
            damping: 32,
            mass: 0.8,
          },
          opacity: { duration: 0.25 },
        }}
        onClick={handleClick}
        aria-label="Request a product"
        aria-expanded={expanded}
      >
        {/* Zone 1: Animated Shopping Mascot (Bag + Magnifying Glass + Sparkle) */}
        <motion.div
          layout
          className={`${styles.mascotContainer} ${
            expanded ? "" : styles.mascotContainerCollapsed
          }`}
          data-name="RequestMascot"
        >
          <RequestMascot size={expanded ? 46 : 42} isScanning={isScanning} />
        </motion.div>

        {/* Zones 2 & 3: Revealed upon scroll expansion */}
        <AnimatePresence>
          {expanded && (
            <>
              {/* Zone 2: Informative Marketplace Copy */}
              <div className={styles.contentBlock}>
                {/* Headline: begins ~70ms after expansion starts */}
                <motion.span
                  className={styles.headline}
                  initial={
                    shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 8 }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  transition={{
                    duration: 0.28,
                    delay: shouldReduceMotion ? 0 : 0.07,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <span className={styles.desktopText}>Can’t find a product?</span>
                  <span className={styles.mobileText}>Can’t find it?</span>
                </motion.span>

                {/* Description: begins ~140ms after expansion starts */}
                <motion.span
                  className={styles.description}
                  initial={
                    shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 6 }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 4 }}
                  transition={{
                    duration: 0.28,
                    delay: shouldReduceMotion ? 0 : 0.14,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <span className={styles.desktopText}>
                    Request it from nearby sellers.
                  </span>
                  <span className={styles.mobileText}>
                    Request it from local sellers.
                  </span>
                </motion.span>
              </div>

              {/* Zone 3: Interactive Affordance Indicator (begins ~200ms) */}
              <motion.div
                className={styles.actionAffordance}
                variants={shouldReduceMotion ? undefined : arrowVariants}
                initial={
                  shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 6 }
                }
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                transition={{
                  duration: 0.25,
                  delay: shouldReduceMotion ? 0 : 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
                aria-hidden="true"
              >
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
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.button>
    </aside>
  );
}

// Re-export mascot for composability
export { RequestMascot } from "./request-mascot";
