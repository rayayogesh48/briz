"use client";

import { useEffect, useRef } from "react";

/** Distance (px) at which the look vector reaches full strength. */
const FULL_REACH = 280;
/** How far off-centre the look must be before the sprite turns to the next cell. */
const TURN_THRESHOLD = 0.34;

const cell = (value: number) => (value < -TURN_THRESHOLD ? 0 : value > TURN_THRESHOLD ? 2 : 1);

/**
 * Points an element's --look-col / --look-row custom properties (0, 1 or 2) at
 * the pointer, plus --look-x / --look-y (−1…1). BrizMascot reads the first pair
 * to pick which of its nine head directions to show.
 *
 * Writes straight to the element's style inside a requestAnimationFrame, so
 * pointer movement never re-renders React. Off for touch devices and for
 * prefers-reduced-motion (the mascot then faces forward).
 */
export function useCursorLook<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    if (window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const handleMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        const distance = Math.hypot(dx, dy) || 1;
        const strength = Math.min(1, distance / FULL_REACH);
        const x = (dx / distance) * strength;
        const y = (dy / distance) * strength;
        element.style.setProperty("--look-x", x.toFixed(3));
        element.style.setProperty("--look-y", y.toFixed(3));
        element.style.setProperty("--look-col", String(cell(x)));
        element.style.setProperty("--look-row", String(cell(y)));
      });
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handleMove);
    };
  }, [enabled]);

  return ref;
}
