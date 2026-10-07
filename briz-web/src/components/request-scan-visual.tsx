"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

interface RequestScanVisualProps {
  className?: string;
  size?: number;
  /** Plays the one-time stronger scan used right after the launcher expands. */
  isScanning?: boolean;
}

// Variant labels are driven by the parent launcher's hover/tap gestures.
const boxVariants: Variants = {
  hover: { rotate: -4, scale: 1.05, transition: { type: "spring", stiffness: 350, damping: 20 } },
  tap: { scale: 0.95, transition: { type: "spring", stiffness: 500, damping: 22 } },
};

const bracketVariants: Variants = {
  hover: { scale: 1.08, transition: { type: "spring", stiffness: 380, damping: 18 } },
};

/**
 * "Product box being scanned" visual: a parcel inside viewfinder brackets with a
 * scan beam that sweeps across it. Drawn in white for use on the Briz blue tile.
 */
export function RequestScanVisual({ className, size = 44, isScanning = false }: RequestScanVisualProps) {
  const shouldReduceMotion = useReducedMotion();

  const boxAnimation = shouldReduceMotion
    ? undefined
    : isScanning
    ? { scale: [1, 1.06, 1], transition: { duration: 0.9, ease: "easeInOut" as const } }
    : {
        y: [0, -2, 0],
        rotate: [0, -1, 1, 0],
        transition: { duration: 4, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" as const },
      };

  // The beam rests invisible, then sweeps down and back across the parcel.
  const beamAnimation = shouldReduceMotion
    ? undefined
    : isScanning
    ? {
        y: [0, 22, 0, 22, 11],
        opacity: [0, 1, 1, 1, 0],
        transition: { duration: 0.9, ease: "easeInOut" as const },
      }
    : {
        y: [0, 22, 0],
        opacity: [0, 0.9, 0],
        transition: { duration: 1.8, repeat: Infinity, repeatDelay: 3.6, ease: "easeInOut" as const },
      };

  const sparkleAnimation = shouldReduceMotion
    ? undefined
    : isScanning
    ? { opacity: [0, 0, 1, 0], scale: [0.6, 0.6, 1.2, 0.8], transition: { duration: 1.1, ease: "easeInOut" as const } }
    : {
        opacity: [0, 1, 0],
        scale: [0.6, 1, 0.8],
        transition: { duration: 1.4, repeat: Infinity, repeatDelay: 6.5, ease: "easeInOut" as const },
      };

  return (
    <div className={className} style={{ width: size, height: size, display: "flex" }} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 52 52" fill="none" style={{ overflow: "visible" }}>
        {/* Layer 1: viewfinder brackets */}
        <motion.g
          variants={bracketVariants}
          style={{ originX: "26px", originY: "26px" }}
          stroke="#ffffff"
          strokeOpacity="0.7"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 15 V11 A3 3 0 0 1 11 8 H15" />
          <path d="M37 8 H41 A3 3 0 0 1 44 11 V15" />
          <path d="M44 37 V41 A3 3 0 0 1 41 44 H37" />
          <path d="M15 44 H11 A3 3 0 0 1 8 41 V37" />
        </motion.g>

        {/* Layer 2: the product box */}
        <motion.g variants={boxVariants} animate={boxAnimation} style={{ originX: "26px", originY: "27px" }}>
          <path
            d="M26 14 L37 19.5 V32.5 L26 38 L15 32.5 V19.5 Z"
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M15 19.5 L26 25 L37 19.5" stroke="#3e63dd" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M26 25 V38" stroke="#3e63dd" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M20.5 16.75 L31.5 22.25" stroke="#3e63dd" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
        </motion.g>

        {/* Layer 3: scan beam */}
        <motion.g animate={beamAnimation} initial={{ opacity: 0 }}>
          <rect x="10" y="14" width="32" height="2.5" rx="1.25" fill="#ffffff" />
          <rect x="10" y="16.5" width="32" height="5" fill="#ffffff" fillOpacity="0.22" />
        </motion.g>

        {/* Layer 4: sparkle */}
        <motion.path
          animate={sparkleAnimation}
          initial={{ opacity: 0 }}
          style={{ originX: "41px", originY: "11px" }}
          d="M41 6.5 C41 9 43 11 45.5 11 C43 11 41 13 41 15.5 C41 13 39 11 36.5 11 C39 11 41 9 41 6.5 Z"
          fill="#ffffff"
        />
      </svg>
    </div>
  );
}
