"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { Fragment, useRef, type ReactNode } from "react";
import type { Photo } from "./about-data";
import styles from "./about.module.css";

export const EASE = [0.22, 1, 0.36, 1] as const;
const IN_VIEW = { once: true, margin: "0px 0px -12% 0px" } as const;

type RevealProps = { children: ReactNode; className?: string; delay?: number; y?: number };

export function Reveal({ children, className, delay = 0, y = 24 }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={IN_VIEW}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const WORD: Variants = {
  hidden: { y: "110%" },
  shown: { y: "0%", transition: { duration: 0.8, ease: EASE } },
};

type HeadingProps = {
  as?: "h1" | "h2" | "h3";
  text: string;
  id?: string;
  className?: string;
  accent?: string[];
  delay?: number;
};

/** Headline that rises word by word out of a mask. `\n` forces a line break. */
export function RevealHeading({ as: Tag = "h2", text, id, className, accent = [], delay = 0 }: HeadingProps) {
  const reduce = useReducedMotion();
  return (
    <Tag id={id} className={className}>
      <motion.span
        className={styles.headingInner}
        initial={reduce ? false : "hidden"}
        whileInView="shown"
        viewport={IN_VIEW}
        transition={{ staggerChildren: 0.05, delayChildren: delay }}
      >
        {text.split("\n").map((line, lineIndex) => (
          <span key={lineIndex} className={styles.headingLine}>
            {line.split(" ").map((word, wordIndex) => (
              <Fragment key={wordIndex}>
                <span className={styles.wordMask}>
                  <motion.span className={accent.includes(word) ? styles.wordAccent : styles.word} variants={WORD}>
                    {word}
                  </motion.span>
                </span>{" "}
              </Fragment>
            ))}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

function ScrubWord({ progress, range, children }: { progress: MotionValue<number>; range: [number, number]; children: string }) {
  const opacity = useTransform(progress, range, [0.22, 1]);
  return <motion.span style={{ opacity }}>{children} </motion.span>;
}

/** Text whose words brighten one by one as the reader scrolls through it. */
export function ScrubText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.92", "start 0.38"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {reduce
        ? text
        : words.map((word, index) => (
            <ScrubWord key={index} progress={scrollYProgress} range={[index / words.length, (index + 1) / words.length]}>
              {word}
            </ScrubWord>
          ))}
    </p>
  );
}

type ParallaxProps = { photo: Photo; sizes: string; className?: string; priority?: boolean };

export function ParallaxPhoto({ photo, sizes, className, priority }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  return (
    <div ref={ref} className={`${styles.photo} ${className ?? ""}`}>
      <motion.div className={styles.photoInner} style={reduce ? undefined : { y }}>
        <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} unoptimized />
      </motion.div>
    </div>
  );
}
