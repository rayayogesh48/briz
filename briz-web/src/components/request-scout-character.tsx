"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

interface RequestScoutCharacterProps {
  className?: string;
  size?: number;
  /** Plays the one-time stronger "look around" used right after the launcher expands. */
  isScanning?: boolean;
}

// Variant labels are driven by the parent launcher's hover/tap gestures.
const bodyVariants: Variants = {
  hover: { rotate: -7, scale: 1.06, transition: { type: "spring", stiffness: 340, damping: 16 } },
  tap: { scale: 0.94, rotate: 2, transition: { type: "spring", stiffness: 500, damping: 22 } },
};

const monocleVariants: Variants = {
  hover: { x: 1.5, y: -1.5, rotate: 8, transition: { type: "spring", stiffness: 380, damping: 18 } },
};

const parcelVariants: Variants = {
  hover: { y: -2.5, scale: 1.12, rotate: -6, transition: { type: "spring", stiffness: 400, damping: 15 } },
};

const EASE = "easeInOut" as const;

/**
 * "Pinu" — the Briz scout. A map-pin character (local) wearing a magnifier
 * monocle (search), looking around for the parcel floating beside it. The
 * parcel's "?" turns into a check when Pinu finds it (request → found).
 */
export function RequestScoutCharacter({ className, size = 46, isScanning = false }: RequestScoutCharacterProps) {
  const shouldReduceMotion = useReducedMotion();
  const still = shouldReduceMotion;

  // Pin hops gently; on the one-time scan it leans left, then right.
  const bodyAnimation = still
    ? undefined
    : isScanning
    ? { rotate: [0, -9, 8, 0], y: [0, -2, -2, 0], transition: { duration: 0.9, ease: EASE } }
    : { y: [0, -2.5, 0], transition: { duration: 2.6, repeat: Infinity, repeatDelay: 0.9, ease: EASE } };

  const shadowAnimation = still
    ? undefined
    : { scaleX: [1, 0.78, 1], opacity: [0.16, 0.09, 0.16], transition: { duration: 2.6, repeat: Infinity, repeatDelay: 0.9, ease: EASE } };

  // Eyes dart left, right, back to centre — then blink. This is the "searching" tell.
  const eyesAnimation = still
    ? undefined
    : isScanning
    ? { x: [0, -2.6, 2.6, 0], transition: { duration: 0.9, ease: EASE } }
    : {
        x: [0, -2.2, -2.2, 2.2, 2.2, 0, 0, 0],
        scaleY: [1, 1, 1, 1, 1, 1, 0.1, 1],
        transition: { duration: 3.4, times: [0, 0.12, 0.3, 0.42, 0.6, 0.72, 0.8, 0.88], repeat: Infinity, repeatDelay: 1.6, ease: EASE },
      };

  const monocleAnimation = still
    ? undefined
    : isScanning
    ? { rotate: [0, -10, 10, 0], transition: { duration: 0.9, ease: EASE } }
    : { rotate: [0, -3, 4, 0], transition: { duration: 3.4, repeat: Infinity, repeatDelay: 1.6, ease: EASE } };

  const parcelAnimation = still
    ? undefined
    : { y: [0, -2, 0], rotate: [-4, 3, -4], transition: { duration: 3.2, repeat: Infinity, ease: EASE } };

  // "?" (still looking) and "✓" (found it) trade places on a slow loop.
  const loop = { duration: 6.5, times: [0, 0.5, 0.58, 0.92, 1], repeat: Infinity, ease: EASE };
  const questionAnimation = still ? undefined : { opacity: [1, 1, 0, 0, 1], transition: loop };
  const foundAnimation = still ? undefined : { opacity: [0, 0, 1, 1, 0], scale: [0.6, 0.6, 1, 1, 0.6], transition: loop };

  return (
    <div className={className} style={{ width: size, height: size, display: "flex" }} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 52 52" fill="none" style={{ overflow: "visible" }}>
        {/* Layer 1: ground shadow — shrinks as the pin hops */}
        <motion.ellipse
          cx="28"
          cy="48"
          rx="8.5"
          ry="2"
          fill="#3e63dd"
          initial={{ opacity: 0.16 }}
          animate={shadowAnimation}
          style={{ originX: "28px", originY: "48px" }}
        />

        {/* Layer 2: Pinu, the map-pin scout */}
        <motion.g variants={bodyVariants} animate={bodyAnimation} style={{ originX: "28px", originY: "45px" }}>
          {/* Pin body */}
          <path d="M28 46 C28 46 13.5 34.5 13.5 23 A14.5 14.5 0 0 1 42.5 23 C42.5 34.5 28 46 28 46 Z" fill="#3e63dd" />
          <path d="M18 17 A11.5 11.5 0 0 1 28 11.5" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />

          {/* Face */}
          <circle cx="28" cy="23" r="10.5" fill="#ffffff" />

          {/* Eyes — the right one is magnified by the monocle */}
          <motion.g animate={eyesAnimation} style={{ originX: "28px", originY: "23px" }}>
            <circle cx="23.5" cy="23" r="1.8" fill="#202020" />
            <circle cx="32.2" cy="22.4" r="2.5" fill="#202020" />
            <circle cx="33" cy="21.6" r="0.75" fill="#ffffff" />
          </motion.g>

          {/* Smile */}
          <path d="M25 28.2 Q27.6 30.2 30.2 28.2" stroke="#3e63dd" strokeWidth="1.6" strokeLinecap="round" />

          {/* Magnifier monocle */}
          <motion.g variants={monocleVariants} animate={monocleAnimation} style={{ originX: "32.2px", originY: "22.4px" }}>
            <path d="M36.2 26.4 L41.5 31.8" stroke="#202020" strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="32.2" cy="22.4" r="5.6" fill="#eff4ff" fillOpacity="0.45" stroke="#202020" strokeWidth="2" />
          </motion.g>
        </motion.g>

        {/* Layer 3: the parcel Pinu is looking for */}
        <motion.g variants={parcelVariants} animate={parcelAnimation} style={{ originX: "9.5px", originY: "12.5px" }}>
          <rect x="3" y="6" width="13" height="13" rx="3.5" fill="#ffffff" stroke="#202020" strokeWidth="1.7" />
          <motion.text
            x="9.5"
            y="16"
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill="#3e63dd"
            animate={questionAnimation}
          >
            ?
          </motion.text>
          <motion.path
            d="M6.6 12.7 L8.8 14.9 L12.6 10.4"
            stroke="#30a46c"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ opacity: 0 }}
            animate={foundAnimation}
            style={{ originX: "9.5px", originY: "12.5px" }}
          />
        </motion.g>
      </svg>
    </div>
  );
}
