"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

export const SHOPPER_EXPRESSIONS = [
  "greeting",
  "searching",
  "thinking",
  "found",
  "excited",
  "confused",
  "no-results",
  "waiting",
  "success",
] as const;

export type ShopperExpression = (typeof SHOPPER_EXPRESSIONS)[number];

interface BrizShopperProps {
  expression?: ShopperExpression;
  /**
   * "full" leaves room around the character for the floating marks; "body" trims that
   * margin so the character fills the box; "bust" crops to head and shoulders.
   */
  crop?: "full" | "body" | "bust";
  size?: number;
  className?: string;
  /** Accessible name. Leave empty when the mascot is decorative. */
  title?: string;
  /** Hide the floating mark (?, !, dots…) — e.g. when a real thought bubble sits beside the character. */
  hideMark?: boolean;
}

const INK = "#2a2433";
const SKIN = "#f2c6a0";
const HAIR = "#33283a";
const BLUE = "#3e63dd";
const BLUE_DARK = "#3354c7";
const PANTS = "#23242e";
const WHITE = "#ffffff";

type EyeStyle = "open" | "wide" | "happy" | "wink" | "half";
type ArmPose = "down" | "wave" | "chin";
type PhonePose = "hold" | "raise";
type Extra = "sparkles" | "dots" | "exclaim" | "question" | "sweat" | "check" | "none";

type Face = {
  eyes: EyeStyle;
  /** Pupil offset — where the character is looking. */
  look: [number, number];
  /** Brow endpoints: [left outer y, left inner y, right inner y, right outer y]. */
  brows: [number, number, number, number];
  mouth: ReactNode;
  arm: ArmPose;
  phone: PhonePose;
  extra: Extra;
  /** What the phone screen shows. */
  screen: "search" | "empty" | "check";
};

const smile = <path d="M54 57.5 Q60 62.5 66 57.5" stroke={INK} strokeWidth="1.8" strokeLinecap="round" fill="none" />;
const openSmile = (
  <path d="M53.5 56.5 Q60 66 66.5 56.5 Z" fill="#7a2f3c" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
);

const FACES: Record<ShopperExpression, Face> = {
  greeting: { eyes: "open", look: [0, 0], brows: [37, 36, 36, 37], mouth: openSmile, arm: "wave", phone: "hold", extra: "none", screen: "search" },
  searching: { eyes: "open", look: [1.8, 1.2], brows: [37, 36.5, 35.5, 36], mouth: smile, arm: "down", phone: "hold", extra: "none", screen: "search" },
  thinking: {
    eyes: "open",
    look: [-1.6, -1.6],
    brows: [36, 37, 35, 34],
    mouth: <path d="M56 59 Q60 58 64 59.5" stroke={INK} strokeWidth="1.8" strokeLinecap="round" fill="none" />,
    arm: "chin",
    phone: "hold",
    extra: "dots",
    screen: "search",
  },
  found: {
    eyes: "wide",
    look: [1.4, 0.6],
    brows: [35, 34, 34, 35],
    mouth: <ellipse cx="60" cy="59.5" rx="3.4" ry="4" fill="#7a2f3c" stroke={INK} strokeWidth="1.6" />,
    arm: "down",
    phone: "raise",
    extra: "exclaim",
    screen: "check",
  },
  excited: { eyes: "happy", look: [0, 0], brows: [35, 34, 34, 35], mouth: openSmile, arm: "wave", phone: "raise", extra: "sparkles", screen: "check" },
  confused: {
    eyes: "open",
    look: [0, 0],
    brows: [38, 36, 33.5, 34.5],
    mouth: <path d="M54.5 59 Q57 56.5 60 59 T65.5 59" stroke={INK} strokeWidth="1.8" strokeLinecap="round" fill="none" />,
    arm: "chin",
    phone: "hold",
    extra: "question",
    screen: "empty",
  },
  "no-results": {
    eyes: "open",
    look: [1.2, 2],
    brows: [38.5, 35.5, 35.5, 38.5],
    mouth: <path d="M55 60.5 Q60 56.5 65 60.5" stroke={INK} strokeWidth="1.8" strokeLinecap="round" fill="none" />,
    arm: "down",
    phone: "hold",
    extra: "sweat",
    screen: "empty",
  },
  waiting: {
    eyes: "half",
    look: [1.4, 1],
    brows: [37.5, 37.5, 37.5, 37.5],
    mouth: <path d="M56 59 H64" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />,
    arm: "down",
    phone: "hold",
    extra: "dots",
    screen: "search",
  },
  success: { eyes: "wink", look: [0, 0], brows: [36, 35, 35, 36], mouth: openSmile, arm: "wave", phone: "raise", extra: "check", screen: "check" },
};

function Eye({ cx, style, look }: { cx: number; style: EyeStyle; look: [number, number] }) {
  if (style === "happy") {
    return <path d={`M${cx - 4.5} 48.5 Q${cx} 42.5 ${cx + 4.5} 48.5`} stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none" />;
  }
  const wide = style === "wide";
  const [dx, dy] = look;
  return (
    <g>
      <ellipse cx={cx + dx} cy={47 + dy} rx={wide ? 4.6 : 4} ry={wide ? 5.8 : 5} fill={INK} />
      <circle cx={cx + dx + 1.4} cy={45 + dy} r={wide ? 1.7 : 1.4} fill={WHITE} />
      <circle cx={cx + dx - 1.3} cy={49 + dy} r="0.7" fill={WHITE} fillOpacity="0.8" />
      {style === "half" && <rect x={cx - 6} y="39" width="12" height="7.5" fill={SKIN} />}
      {style === "half" && <path d={`M${cx - 5} 46.5 H${cx + 5}`} stroke={INK} strokeWidth="1.8" strokeLinecap="round" />}
    </g>
  );
}

const ARMS: Record<ArmPose, { d: string; hand: [number, number] }> = {
  down: { d: "M43.5 81 Q36 90 37.5 99", hand: [37.5, 101] },
  wave: { d: "M43.5 81 Q30 78 27 65", hand: [26.5, 61.5] },
  chin: { d: "M44 84 Q35 95 48.5 77", hand: [50, 70] },
};

const PHONE_ARMS: Record<PhonePose, { d: string; hand: [number, number]; phone: [number, number] }> = {
  hold: { d: "M76.5 81 Q86 92 89 85", hand: [89.5, 83], phone: [84.5, 65] },
  raise: { d: "M76.5 81 Q92 82 97 67", hand: [97.5, 63.5], phone: [93, 44] },
};

function Sleeve({ d }: { d: string }) {
  return (
    <>
      <path d={d} stroke={INK} strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d={d} stroke={BLUE} strokeWidth="9" strokeLinecap="round" fill="none" />
    </>
  );
}

function Phone({ x, y, screen }: { x: number; y: number; screen: Face["screen"] }) {
  return (
    <g transform={`rotate(8 ${x + 5.5} ${y + 9})`}>
      <rect x={x} y={y} width="11" height="18" rx="2.6" fill={INK} />
      <rect x={x + 1.4} y={y + 1.6} width="8.2" height="14.4" rx="1.4" fill={screen === "empty" ? "#e9ebf2" : "#dfe8ff"} />
      {screen === "search" && (
        <>
          <circle cx={x + 5} cy={y + 7.6} r="2.2" stroke={BLUE} strokeWidth="1.2" fill="none" />
          <path d={`M${x + 6.6} ${y + 9.2} L${x + 8.2} ${y + 10.8}`} stroke={BLUE} strokeWidth="1.2" strokeLinecap="round" />
        </>
      )}
      {screen === "check" && (
        <path d={`M${x + 3.2} ${y + 9} L${x + 5} ${y + 10.8} L${x + 8} ${y + 7}`} stroke="#30a46c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      )}
      {screen === "empty" && <path d={`M${x + 3.4} ${y + 9} H${x + 7.6}`} stroke="#9a9ca8" strokeWidth="1.3" strokeLinecap="round" />}
    </g>
  );
}

const sparkle = (x: number, y: number, r: number) =>
  `M${x} ${y - r} C${x} ${y - r / 2.2} ${x + r / 2.2} ${y} ${x + r} ${y} C${x + r / 2.2} ${y} ${x} ${y + r / 2.2} ${x} ${y + r} C${x} ${y + r / 2.2} ${x - r / 2.2} ${y} ${x - r} ${y} C${x - r / 2.2} ${y} ${x} ${y - r / 2.2} ${x} ${y - r} Z`;

function ExtraMark({ extra }: { extra: Extra }) {
  switch (extra) {
    case "sparkles":
      return (
        <g fill="#f5b400">
          <path d={sparkle(16, 34, 5)} />
          <path d={sparkle(104, 28, 4)} />
          <path d={sparkle(100, 92, 3)} fill={BLUE} />
        </g>
      );
    case "dots":
      return (
        <g fill={INK} fillOpacity="0.75">
          <circle cx="92" cy="22" r="2.4" />
          <circle cx="100" cy="19" r="2.4" />
          <circle cx="108" cy="22" r="2.4" />
        </g>
      );
    case "exclaim":
      return (
        <g>
          <path d="M103 14 L101.8 27" stroke="#f5b400" strokeWidth="4" strokeLinecap="round" />
          <circle cx="101.2" cy="33.5" r="2.4" fill="#f5b400" />
        </g>
      );
    case "question":
      return (
        <g>
          <path d="M96 20 Q96 13 102.5 13 Q109 13 109 19 Q109 23 103.5 25 L103.2 28.5" stroke={BLUE} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="103" cy="34.5" r="2.3" fill={BLUE} />
        </g>
      );
    case "sweat":
      return <path d="M93 26 Q97.5 33 93 36 Q88.5 33 93 26 Z" fill="#8fc3f5" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />;
    case "check":
      return (
        <g>
          <circle cx="103" cy="24" r="9" fill="#30a46c" stroke={INK} strokeWidth="1.4" />
          <path d="M98.6 24.2 L101.8 27.4 L107.6 20.6" stroke={WHITE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      );
    default:
      return null;
  }
}

// Driven by a parent's hover/tap variant labels (e.g. the request launcher).
const bodyVariants: Variants = {
  hover: { rotate: -4, scale: 1.05, transition: { type: "spring", stiffness: 340, damping: 16 } },
  tap: { scale: 0.95, transition: { type: "spring", stiffness: 500, damping: 22 } },
};

/**
 * The Briz shopper — a curious chibi shopper in a Briz-blue hoodie with a phone
 * and a crossbody bag. One drawing, nine expressions; proportions, clothes and
 * colours are shared so the character stays the same across all of them.
 */
export function BrizShopper({ expression = "greeting", crop = "full", size = 120, className, title, hideMark = false }: BrizShopperProps) {
  const reduce = useReducedMotion();
  const face = FACES[expression];
  const arm = ARMS[face.arm];
  const phoneArm = PHONE_ARMS[face.phone];
  const viewBox = crop === "bust" ? "20 6 80 80" : crop === "body" ? "17 7 88 130" : "0 0 120 140";
  const height = crop === "bust" ? size : crop === "body" ? (size * 130) / 88 : (size * 140) / 120;
  const blinks = face.eyes === "open" || face.eyes === "wide";
  const freeArm = (
    <>
      <Sleeve d={arm.d} />
      <circle cx={arm.hand[0]} cy={arm.hand[1]} r="4.6" fill={SKIN} stroke={INK} strokeWidth="1.5" />
    </>
  );

  return (
    <svg
      className={className}
      width={size}
      height={height}
      viewBox={viewBox}
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      style={{ overflow: "visible", display: "block" }}
    >
      <ellipse cx="60" cy="132" rx="24" ry="3.5" fill={INK} fillOpacity="0.1" />

      <motion.g
        variants={bodyVariants}
        animate={reduce ? undefined : { y: [0, -1.6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: 0.5, originY: 1 }}
      >
        {/* Legs and sneakers */}
        <rect x="47" y="102" width="11.5" height="24" rx="4.5" fill={PANTS} stroke={INK} strokeWidth="1.5" />
        <rect x="61.5" y="102" width="11.5" height="24" rx="4.5" fill={PANTS} stroke={INK} strokeWidth="1.5" />
        <rect x="42.5" y="123" width="17" height="8.5" rx="4.2" fill={WHITE} stroke={INK} strokeWidth="1.5" />
        <rect x="60.5" y="123" width="17" height="8.5" rx="4.2" fill={WHITE} stroke={INK} strokeWidth="1.5" />
        <path d="M46 127.5 H51 M64 127.5 H69" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" />

        {/* Hood behind the neck */}
        <ellipse cx="60" cy="74" rx="23" ry="9" fill={BLUE_DARK} stroke={INK} strokeWidth="1.5" />

        {/* Free arm — behind the torso, except the hand-to-chin pose (drawn last) */}
        {face.arm !== "chin" && freeArm}

        {/* Hoodie */}
        <path d="M42 77 Q60 69 78 77 L83 105 Q60 112 37 105 Z" fill={BLUE} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M49 96.5 Q60 93 71 96.5 L70 104 Q60 106.5 50 104 Z" fill={BLUE_DARK} />
        <path d="M56 77 L55.3 87 M64 77 L64.7 87" stroke={WHITE} strokeWidth="1.5" strokeLinecap="round" />

        {/* Crossbody bag */}
        <path d="M74.5 76.5 L43.5 102" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
        <rect x="30" y="98.5" width="18" height="14.5" rx="4.5" fill={WHITE} stroke={INK} strokeWidth="1.5" />
        {/* Search emblem on the bag */}
        <circle cx="38.2" cy="105.2" r="2.7" stroke={BLUE} strokeWidth="1.5" fill="none" />
        <path d="M40.2 107.3 L42.6 109.7" stroke={BLUE} strokeWidth="1.6" strokeLinecap="round" />

        {/* Phone arm */}
        <Sleeve d={phoneArm.d} />
        <Phone x={phoneArm.phone[0]} y={phoneArm.phone[1]} screen={face.screen} />
        <circle cx={phoneArm.hand[0]} cy={phoneArm.hand[1]} r="4.6" fill={SKIN} stroke={INK} strokeWidth="1.5" />

        {/* Head */}
        <rect x="55" y="64" width="10" height="9" rx="3" fill={SKIN} stroke={INK} strokeWidth="1.5" />
        <circle cx="31.5" cy="46" r="4.4" fill={SKIN} stroke={INK} strokeWidth="1.5" />
        <circle cx="88.5" cy="46" r="4.4" fill={SKIN} stroke={INK} strokeWidth="1.5" />
        <ellipse cx="60" cy="42" rx="29" ry="27" fill={SKIN} stroke={INK} strokeWidth="1.6" />

        {/* Hair: short, side-swept */}
        <path
          d="M31.5 43 Q28 13 60 12 Q92 13 88.5 43 Q85 31 73 27.5 Q62 34 45 26.5 Q36 31 31.5 43 Z"
          fill={HAIR}
          stroke={INK}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M52 17 Q61 14.5 70 18" stroke="#5a4a63" strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* Face */}
        <ellipse cx="41.5" cy="56" rx="4.6" ry="2.8" fill="#f08a8a" fillOpacity="0.4" />
        <ellipse cx="78.5" cy="56" rx="4.6" ry="2.8" fill="#f08a8a" fillOpacity="0.4" />
        <path d={`M44.5 ${face.brows[0]} L53 ${face.brows[1]}`} stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
        <path d={`M67 ${face.brows[2]} L75.5 ${face.brows[3]}`} stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
        {/* Blink: scales about the eyes' own centre (Motion's default origin for SVG). */}
        <motion.g
          animate={reduce || !blinks ? undefined : { scaleY: [1, 0.08, 1] }}
          transition={{ duration: 0.24, ease: "easeInOut", repeat: Infinity, repeatDelay: 3.8, delay: 1.2 }}
        >
          <motion.g
            animate={reduce || expression !== "searching" ? undefined : { x: [0, -3.4, -3.4, 0, 0, 1.2, 0], y: [0, -1.4, -1.4, 0, 0, 0, 0] }}
            transition={{ duration: 5, times: [0, 0.1, 0.34, 0.44, 0.7, 0.8, 1], repeat: Infinity, ease: "easeInOut" }}
          >
            {face.eyes === "wink" ? (
              <path d="M44.5 48.5 Q49 43.5 53.5 48.5" stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none" />
            ) : (
              <Eye cx={49} style={face.eyes} look={face.look} />
            )}
            <Eye cx={71} style={face.eyes === "wink" ? "open" : face.eyes} look={face.look} />
          </motion.g>
        </motion.g>
        {face.mouth}
        {face.arm === "chin" && freeArm}
      </motion.g>

      {/* Expression mark */}
      <motion.g
        key={expression}
        initial={reduce ? false : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 18 }}
      >
        {!hideMark && <ExtraMark extra={face.extra} />}
      </motion.g>
    </svg>
  );
}
