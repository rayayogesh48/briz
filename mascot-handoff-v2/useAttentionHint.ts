"use client";

import { useEffect, useState } from "react";

/** How long (ms) the hint stays up each time. */
const HINT_DURATION = 4500;
/** Inactivity (ms) before the first automatic hint, and before each later one. */
const IDLE_FIRST = 8000;
const IDLE_REPEAT = 25000;
/** Automatic hints per page load. After this the mascot waits to be hovered or tapped. */
const MAX_HINTS = 3;
/** Touch only: scroll distance (px) that earns a hint, and how long (ms) after reaching it the hint shows. */
const SCROLL_THRESHOLD = 120;
const SCROLL_DELAY = 900;

const ACTIVITY_EVENTS = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;

/**
 * Decides when the mascot should show its thought without being hovered.
 *
 * - Any device: after the visitor has been inactive for a while (no pointer,
 *   key, touch or scroll), then again at a longer interval.
 * - Touch devices, which cannot hover: also once, shortly after the visitor
 *   first scrolls down the page.
 *
 * Capped at MAX_HINTS per page load, and never while the tab is hidden.
 */
export function useAttentionHint(enabled = true) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const isTouch = window.matchMedia("(hover: none)").matches;
    let shown = 0;
    let scrollHintUsed = false;
    let idleTimer = 0;
    let hideTimer = 0;
    let scrollTimer = 0;

    const armIdle = () => {
      window.clearTimeout(idleTimer);
      if (shown >= MAX_HINTS) return;
      idleTimer = window.setTimeout(show, shown === 0 ? IDLE_FIRST : IDLE_REPEAT);
    };

    function show() {
      if (shown >= MAX_HINTS) return;
      if (document.hidden) {
        armIdle();
        return;
      }
      shown += 1;
      setVisible(true);
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        setVisible(false);
        armIdle();
      }, HINT_DURATION);
    }

    const handleScroll = () => {
      armIdle();
      if (!isTouch || scrollHintUsed || window.scrollY < SCROLL_THRESHOLD) return;
      // One fixed delay from the moment the threshold is crossed. Waiting for the
      // scroll to settle is unreliable: momentum and layout shifts keep firing events.
      scrollHintUsed = true;
      scrollTimer = window.setTimeout(show, SCROLL_DELAY);
    };

    ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, armIdle, { passive: true }));
    window.addEventListener("scroll", handleScroll, { passive: true });
    armIdle();

    return () => {
      ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, armIdle));
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(idleTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(scrollTimer);
      // Never leave a hint up with no timer left to take it down.
      setVisible(false);
    };
  }, [enabled]);

  return visible;
}
