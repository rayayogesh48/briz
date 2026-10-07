"use client";

import { motion, useReducedMotion } from "motion/react";
import { memo, type CSSProperties, type ReactNode } from "react";
import type { ShopperExpression } from "./briz-shopper";

export type FacePersona = "shopper" | "seller";

interface BrizFaceProps {
  expression?: ShopperExpression;
  /**
   * Who the face is. "shopper": the young customer in a hoodie. "seller": the same
   * drawing aged a little — combed hair greying at the temples, a neat moustache,
   * smile lines, and a shirt with a Briz-blue shop apron.
   */
  persona?: FacePersona;
  size?: number;
  className?: string;
  /** Accessible name. Leave empty when the mascot is decorative. */
  title?: string;
  /** Hide the floating mark (?, !, dots…). */
  hideMark?: boolean;
}

const INK = "#2b1d1a";
const SKIN = "#c98f63";
const SKIN_LIGHT = "#d9a377";
const SKIN_SHADE = "#b0764c";
const HAIR = "#1c1a22";
const HAIR_SHINE = "#454050";
const HAIR_GREY = "#8d8894";
const SHIRT = "#f6f1e7";
const EYE = "#24160f";
const BLUE = "#3e63dd";
const BLUE_DARK = "#3354c7";
const WHITE = "#ffffff";

type EyeStyle = "open" | "wide" | "happy" | "wink" | "half";
type Mark = "sparkles" | "dots" | "exclaim" | "question" | "sweat" | "check" | "none";

type Face = {
  eyes: EyeStyle;
  /** Pupil offset — where the eyes point, on top of any cursor tracking. */
  look: [number, number];
  /** Brow y positions: [left outer, left inner, right inner, right outer]. */
  brows: [number, number, number, number];
  mouth: ReactNode;
  mark: Mark;
};

const stroke = { stroke: INK, strokeWidth: 2, strokeLinecap: "round" as const, fill: "none" };
const smile = <path d="M52 78 Q60 85 68 78" {...stroke} />;
const openSmile = (
  <>
    <path d="M50.5 76.5 Q60 90 69.5 76.5 Z" fill="#7a2a2f" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M55 83.5 Q60 87.5 65 83.5 Q60 81 55 83.5 Z" fill="#e2716d" />
  </>
);

const FACES: Record<ShopperExpression, Face> = {
  greeting: { eyes: "open", look: [0, 0], brows: [44, 43, 43, 44], mouth: openSmile, mark: "none" },
  searching: { eyes: "open", look: [2.4, -0.6], brows: [44, 43.5, 41, 42], mouth: smile, mark: "none" },
  thinking: {
    eyes: "open",
    look: [-2, -2.2],
    brows: [43, 44.5, 41.5, 40.5],
    mouth: <path d="M55 80 Q61 78 66 80.5" {...stroke} />,
    mark: "dots",
  },
  found: {
    eyes: "wide",
    look: [0, 0],
    brows: [40.5, 39.5, 39.5, 40.5],
    mouth: <ellipse cx="60" cy="81" rx="4.4" ry="5.2" fill="#7a2a2f" stroke={INK} strokeWidth="1.8" />,
    mark: "exclaim",
  },
  excited: { eyes: "happy", look: [0, 0], brows: [41, 40, 40, 41], mouth: openSmile, mark: "sparkles" },
  confused: {
    eyes: "open",
    look: [0, 0],
    brows: [45.5, 43, 39.5, 41],
    mouth: <path d="M53 80.5 Q56.5 77 60 80.5 T67 80.5" {...stroke} />,
    mark: "question",
  },
  "no-results": {
    eyes: "open",
    look: [0, 2.2],
    brows: [46, 42, 42, 46],
    mouth: <path d="M53.5 82.5 Q60 77 66.5 82.5" {...stroke} />,
    mark: "sweat",
  },
  waiting: {
    eyes: "half",
    look: [1.6, 1],
    brows: [44.5, 44.5, 44.5, 44.5],
    mouth: <path d="M55 80.5 H65" {...stroke} />,
    mark: "dots",
  },
  success: { eyes: "wink", look: [0, 0], brows: [43, 42, 42, 43], mouth: openSmile, mark: "check" },
};

function Eye({ cx, style, look }: { cx: number; style: EyeStyle; look: [number, number] }) {
  if (style === "happy") {
    return <path d={`M${cx - 6} 58 Q${cx} 50 ${cx + 6} 58`} stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none" />;
  }
  const wide = style === "wide";
  const [dx, dy] = look;
  if (style === "half") {
    return (
      <g>
        <path d={`M${cx - 5} 55.5 A5 5.4 0 0 0 ${cx + 5} 55.5 Z`} fill={EYE} />
        <circle cx={cx + dx} cy={57.6} r="0.9" fill={WHITE} fillOpacity="0.75" />
        <path d={`M${cx - 6.5} 55.5 H${cx + 6.5}`} stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      {/* Almond shape: a soft upper-lid line over a round eye */}
      <ellipse cx={cx + dx} cy={56 + dy} rx={wide ? 5.6 : 5} ry={wide ? 6.8 : 5.8} fill={EYE} />
      <circle cx={cx + dx + 1.8} cy={53.6 + dy} r={wide ? 2.1 : 1.8} fill={WHITE} />
      <circle cx={cx + dx - 1.7} cy={58.6 + dy} r="0.9" fill={WHITE} fillOpacity="0.75" />
      <path
        d={`M${cx - 6.8} ${53 + dy * 0.4} Q${cx} ${wide ? 46 : 48} ${cx + 6.8} ${53 + dy * 0.4}`}
        stroke={INK}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

const sparkle = (x: number, y: number, r: number) =>
  `M${x} ${y - r} C${x} ${y - r / 2.2} ${x + r / 2.2} ${y} ${x + r} ${y} C${x + r / 2.2} ${y} ${x} ${y + r / 2.2} ${x} ${y + r} C${x} ${y + r / 2.2} ${x - r / 2.2} ${y} ${x - r} ${y} C${x - r / 2.2} ${y} ${x} ${y - r / 2.2} ${x} ${y - r} Z`;

function MarkShape({ mark }: { mark: Mark }) {
  switch (mark) {
    case "sparkles":
      return (
        <g fill="#f5b400">
          <path d={sparkle(12, 30, 6)} />
          <path d={sparkle(108, 22, 5)} />
          <path d={sparkle(110, 74, 3.5)} fill={BLUE} />
        </g>
      );
    case "dots":
      return (
        <g fill={INK} fillOpacity="0.7">
          <circle cx="94" cy="14" r="2.8" />
          <circle cx="103" cy="10" r="2.8" />
          <circle cx="112" cy="14" r="2.8" />
        </g>
      );
    case "exclaim":
      return (
        <g>
          <path d="M107 4 L105.6 19" stroke="#f5b400" strokeWidth="4.6" strokeLinecap="round" />
          <circle cx="105" cy="26.5" r="2.8" fill="#f5b400" />
        </g>
      );
    case "question":
      return (
        <g>
          <path d="M98 12 Q98 4 105.5 4 Q113 4 113 11 Q113 16 106.5 18 L106.2 22" stroke={BLUE} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="106" cy="29" r="2.7" fill={BLUE} />
        </g>
      );
    case "sweat":
      return <path d="M99 22 Q104.5 31 99 34.5 Q93.5 31 99 22 Z" fill="#8fc3f5" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />;
    case "check":
      return (
        <g>
          <circle cx="104" cy="18" r="10" fill="#30a46c" stroke={INK} strokeWidth="1.6" />
          <path d="M99 18.2 L102.6 21.8 L109.2 14.2" stroke={WHITE} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      );
    default:
      return null;
  }
}

/*
 * Head turn. The parent can set --look-x / --look-y (−1…1) on any ancestor — see
 * useCursorLook. Layers shift by different amounts (features most, fringe less,
 * ears the other way), which reads as the head turning toward the pointer.
 * Without the variables everything rests at 0, i.e. facing the viewer.
 */
const shift = (x: number, y: number): CSSProperties => ({
  transform: `translate(calc(var(--look-x, 0) * ${x}px), calc(var(--look-y, 0) * ${y}px))`,
  transition: "transform 160ms cubic-bezier(0.2, 0, 0, 1)",
});
const FEATURES_SHIFT = shift(5, 3.6);
const FRINGE_SHIFT = shift(2.2, 1.6);
const EARS_SHIFT = shift(-1.8, 0);

/**
 * Briz mascot v2 — a friendly face-only Nepali shopper. One drawing, nine
 * expressions; face shape, hair, skin tone and eye shape are shared, so the
 * character stays the same across all of them.
 */
export const BrizFace = memo(function BrizFace({
  expression = "greeting",
  persona = "shopper",
  size = 96,
  className,
  title,
  hideMark = false,
}: BrizFaceProps) {
  const reduce = useReducedMotion();
  const face = FACES[expression];
  const blinks = face.eyes === "open" || face.eyes === "wide";
  const seller = persona === "seller";

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      style={{ overflow: "visible", display: "block" }}
    >
      <motion.g
        animate={reduce ? undefined : { y: [0, -1.4, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        {seller ? (
          <>
            {/* Shirt with a Briz-blue shop apron */}
            <path d="M30 120 Q32 101 48 98 L72 98 Q88 101 90 120 Z" fill={SHIRT} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <path d="M47 101 L44.5 120 M73 101 L75.5 120" stroke={BLUE_DARK} strokeWidth="3.4" strokeLinecap="round" />
            <path d="M44 109 H76 V120 H44 Z" fill={BLUE} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <path d="M54 115 H66" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Hoodie collar: the one Briz-blue accent */}
            <path d="M30 120 Q32 101 48 98 L72 98 Q88 101 90 120 Z" fill={BLUE} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <path d="M46 99 Q60 110 74 99" stroke={BLUE_DARK} strokeWidth="5" strokeLinecap="round" />
            <path d="M54 106 V114 M66 106 V114" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" />
          </>
        )}

        {/* Neck */}
        <path d="M52 88 H68 V100 Q60 106 52 100 Z" fill={SKIN_SHADE} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        {seller && (
          <path d="M48 98 L60 106 L72 98 L69 108 L60 106 L51 108 Z" fill={SHIRT} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        )}

        {/* Ears */}
        <g style={EARS_SHIFT}>
          <ellipse cx="23.5" cy="60" rx="6" ry="7.5" fill={SKIN} stroke={INK} strokeWidth="2" />
          <ellipse cx="96.5" cy="60" rx="6" ry="7.5" fill={SKIN} stroke={INK} strokeWidth="2" />
          <path d="M23 57 Q25.5 60 23 63.5 M97 57 Q94.5 60 97 63.5" stroke={SKIN_SHADE} strokeWidth="1.6" strokeLinecap="round" />
        </g>

        {/* Head: soft round face, slightly fuller at the cheeks */}
        <path
          d="M60 20 C83 20 96 36 96 57 C96 79 81 94 60 94 C39 94 24 79 24 57 C24 36 37 20 60 20 Z"
          fill={SKIN}
          stroke={INK}
          strokeWidth="2"
        />
        {/* Soft shading: light on the cheeks and brow, shade along the jaw */}
        <ellipse cx="60" cy="50" rx="24" ry="12" fill={SKIN_LIGHT} fillOpacity="0.55" />
        <path d="M30 70 Q40 90 60 92 Q80 90 90 70 Q82 85 60 87 Q38 85 30 70 Z" fill={SKIN_SHADE} fillOpacity="0.45" />

        {/* Hair. Shopper: a soft side-swept fringe. Seller: combed back from a higher
            hairline, greying at the temples. */}
        <path
          d={
            seller
              ? "M22.5 58 C19 30 36 13 60 13 C84 13 101 30 97.5 58 C97 49 94.5 42 90.5 36.5 C82 34 73 30.5 66 25.5 C57 30 45 31 35.5 29.5 C29.5 36 25 46 22.5 58 Z"
              : "M22.5 58 C19 30 36 13 60 13 C84 13 101 30 97.5 58 C96.5 50 93.5 44 89.5 40 C80 41 72 37.5 67 31 C58 37.5 45 38.5 34.5 35.5 C29 41.5 25 49 22.5 58 Z"
          }
          fill={HAIR}
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {seller && (
          <>
            <path d="M24.5 53 C25.5 46 28 40 32 35 C30.5 41 29 47 28.5 54 Z" fill={HAIR_GREY} />
            <path d="M95.5 53 C94.8 47 93 42 90 38 C91 43 91.6 48 91.8 54 Z" fill={HAIR_GREY} />
            {/* One soft forehead line */}
            <path d="M47 37.5 Q60 35 73 37.5" stroke={SKIN_SHADE} strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
          </>
        )}
        <g style={FRINGE_SHIFT}>
          <path d="M42 22 Q58 15 76 21" stroke={HAIR_SHINE} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M34 31 Q37 26 42 24" stroke={HAIR_SHINE} strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Features move together when the head turns */}
        <g style={FEATURES_SHIFT}>
          <ellipse cx="38.5" cy="71" rx="6.2" ry="3.8" fill="#e0705a" fillOpacity="0.38" />
          <ellipse cx="81.5" cy="71" rx="6.2" ry="3.8" fill="#e0705a" fillOpacity="0.38" />

          <path d={`M40.5 ${face.brows[0]} Q46 ${face.brows[1] - 2} 52.5 ${face.brows[1]}`} stroke={HAIR} strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d={`M67.5 ${face.brows[2]} Q74 ${face.brows[2] - 2} 79.5 ${face.brows[3]}`} stroke={HAIR} strokeWidth="2.8" strokeLinecap="round" fill="none" />

          {/* Blink: scales about the eyes' own centre (Motion's default origin for SVG). */}
          <motion.g
            animate={reduce || !blinks ? undefined : { scaleY: [1, 0.08, 1] }}
            transition={{ duration: 0.24, ease: "easeInOut", repeat: Infinity, repeatDelay: 3.8, delay: 1.2 }}
          >
            <motion.g
              animate={reduce || expression !== "searching" ? undefined : { x: [0, -4.6, -4.6, 0, 0] }}
              transition={{ duration: 5, times: [0, 0.1, 0.36, 0.46, 1], repeat: Infinity, ease: "easeInOut" }}
            >
              {face.eyes === "wink" ? (
                <path d="M41 58 Q47 51 53 58" stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none" />
              ) : (
                <Eye cx={47} style={face.eyes} look={face.look} />
              )}
              <Eye cx={73} style={face.eyes === "wink" ? "open" : face.eyes} look={face.look} />
            </motion.g>
          </motion.g>

          {/* Nose: one soft curve */}
          <path d="M57 68 Q60 71.5 63.5 68" stroke={SKIN_SHADE} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          {seller ? (
            <>
              {/* Smile lines and a neat moustache; the mouth sits a touch lower to make room */}
              <path d="M49 70 Q46 76 48.5 82 M71 70 Q74 76 71.5 82" stroke={SKIN_SHADE} strokeWidth="1.7" strokeLinecap="round" fill="none" />
              <path d="M50.5 75.5 Q55.5 71.5 60 73.6 Q64.5 71.5 69.5 75.5 Q64.5 77.6 60 76.2 Q55.5 77.6 50.5 75.5 Z" fill={HAIR} />
              <g transform="translate(0 2.4)">{face.mouth}</g>
            </>
          ) : (
            face.mouth
          )}
        </g>
      </motion.g>

      {!hideMark && (
        <motion.g
          key={expression}
          initial={reduce ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
        >
          <MarkShape mark={face.mark} />
        </motion.g>
      )}
    </svg>
  );
});
