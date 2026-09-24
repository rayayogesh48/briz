"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

interface RequestMascotProps {
  className?: string;
  size?: number;
  /**
   * When true, executes the one-time "search scan" gesture triggered upon scroll expansion:
   * magnifying glass scans left -> scans right -> settles back to idle.
   */
  isScanning?: boolean;
}

// Micro-motion variants coordinated with parent hover/tap
export const mascotVariants: Variants = {
  initial: { rotate: 0, scale: 1 },
  animate: { rotate: 0, scale: 1 },
  hover: {
    rotate: -3,
    scale: 1.04,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 20,
    },
  },
  tap: {
    scale: 0.96,
    rotate: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 22,
    },
  },
};

export const magnifyingGlassVariants: Variants = {
  initial: { x: 0, y: 0, rotate: 0 },
  animate: { x: 0, y: 0, rotate: 0 },
  hover: {
    x: 2,
    y: -1.5,
    rotate: 8,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 18,
    },
  },
};

export const sparkleVariants: Variants = {
  initial: { opacity: 0, scale: 0.6 },
  animate: { opacity: 0, scale: 0.6 },
  hover: {
    opacity: 1,
    scale: 1.15,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
    },
  },
};

/**
 * Animated "Searching shopping bag" mascot illustration.
 * Custom SVG with layered motion for the bag body, inquisitive magnifying glass,
 * and discovery sparkle. Communicates shopping discovery and product request.
 */
export function RequestMascot({ className, size = 48, isScanning = false }: RequestMascotProps) {
  const shouldReduceMotion = useReducedMotion();

  // Subtle breathing idle animation for the bag, or reactive scan pulse
  const bagAnimation = shouldReduceMotion
    ? undefined
    : isScanning
    ? {
        rotate: [-2, 2, 0],
        scale: [1, 1.03, 1],
        transition: {
          duration: 0.85,
          ease: "easeInOut" as const,
        },
      }
    : {
        y: [0, -2.5, 0],
        rotate: [0, -1.5, 0.8, 0],
        transition: {
          duration: 3.8,
          repeat: Infinity,
          repeatDelay: 1.5,
          ease: "easeInOut" as const,
        },
      };

  // Delayed searching tilt for the magnifying glass, or one-time expansion scan gesture
  const glassAnimation = shouldReduceMotion
    ? undefined
    : isScanning
    ? {
        x: [-3, 3, -1, 0],
        rotate: [-10, 12, -4, 0],
        transition: {
          duration: 0.85,
          ease: "easeInOut" as const,
        },
      }
    : {
        rotate: [-3, 4, -2, 0],
        x: [0, 1.5, -1, 0],
        transition: {
          duration: 4.2,
          repeat: Infinity,
          repeatDelay: 1.2,
          ease: "easeInOut" as const,
        },
      };

  // Infrequent sparkle gleam (every ~5 seconds), or gleam during expansion
  const sparkleAnimation = shouldReduceMotion
    ? undefined
    : isScanning
    ? {
        opacity: [0, 1, 0],
        scale: [0.6, 1.2, 0.7],
        transition: {
          duration: 0.85,
          ease: "easeInOut" as const,
        },
      }
    : {
        opacity: [0, 0.95, 0],
        scale: [0.6, 1.1, 0.7],
        transition: {
          duration: 1.6,
          repeat: Infinity,
          repeatDelay: 4.5,
          ease: "easeInOut" as const,
        },
      };

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        {/* Layer 1: Soft ground shadow */}
        <ellipse
          cx="24"
          cy="46"
          rx="14"
          ry="2.5"
          fill="#3e63dd"
          fillOpacity="0.08"
        />

        {/* Layer 2: Animated Shopping Bag Character */}
        <motion.g
          variants={mascotVariants}
          animate={bagAnimation}
          style={{ originX: "24px", originY: "40px" }}
        >
          {/* Bag Handles */}
          <path
            d="M18 16 V11 C18 8 20.2 6 24 6 C27.8 6 30 8 30 11 V16"
            stroke="#3e63dd"
            strokeWidth="2.25"
            strokeLinecap="round"
            fill="none"
          />

          {/* Bag Body - soft friendly rounded package */}
          <rect
            x="11"
            y="15"
            width="26"
            height="27"
            rx="7"
            fill="#ffffff"
            stroke="#3e63dd"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Subtle interior depth / fold line */}
          <path
            d="M12 21.5 C16 23 32 23 36 21.5"
            stroke="#eff4ff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Friendly subtle character eyes */}
          <circle cx="20" cy="26" r="1.6" fill="#202020" />
          <circle cx="28" cy="26" r="1.6" fill="#202020" />

          {/* Eye sparkle highlights */}
          <circle cx="20.5" cy="25.5" r="0.5" fill="#ffffff" />
          <circle cx="28.5" cy="25.5" r="0.5" fill="#ffffff" />

          {/* Warm discovery mouth */}
          <path
            d="M22.5 30.5 C23.5 31.8 24.5 31.8 25.5 30.5"
            stroke="#3e63dd"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>

        {/* Layer 3: Searching Magnifying Glass */}
        <motion.g
          variants={magnifyingGlassVariants}
          animate={glassAnimation}
          style={{ originX: "32px", originY: "21px" }}
        >
          {/* Handle */}
          <path
            d="M36.5 25.5 L43 32"
            stroke="#202020"
            strokeWidth="2.75"
            strokeLinecap="round"
          />
          {/* Rim connector */}
          <circle cx="36.5" cy="25.5" r="1.25" fill="#202020" />

          {/* Glass Lens (translucent with crisp border) */}
          <circle
            cx="32"
            cy="21"
            r="7.5"
            fill="#ffffff"
            fillOpacity="0.88"
            stroke="#202020"
            strokeWidth="2"
          />

          {/* Lens reflection highlight */}
          <path
            d="M28.5 17.5 C30 16 32.5 16 34 17"
            stroke="#3e63dd"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeOpacity="0.75"
            fill="none"
          />
        </motion.g>

        {/* Layer 4: Discovery Sparkle */}
        <motion.g
          variants={sparkleVariants}
          animate={sparkleAnimation}
          style={{ originX: "40px", originY: "11px" }}
        >
          {/* 4-point discovery sparkle star */}
          <path
            d="M40 7 C40 9.2 42.2 11 44.5 11 C42.2 11 40 12.8 40 15 C40 12.8 37.8 11 35.5 11 C37.8 11 40 9.2 40 7 Z"
            fill="#30a46c"
          />
          {/* Core gleam dot */}
          <circle cx="40" cy="11" r="0.75" fill="#ffffff" />
        </motion.g>
      </svg>
    </div>
  );
}
