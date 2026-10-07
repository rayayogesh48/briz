"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { DIAGRAM_STORES } from "./about-data";
import { EASE, Reveal, RevealHeading } from "./motion";
import styles from "./about.module.css";

type Point = [number, number];
type Layout = { viewBox: string; customer: Point; briz: Point; stores: Point[]; vertical: boolean };

const WIDE: Layout = {
  viewBox: "0 0 1200 480",
  customer: [150, 240],
  briz: [540, 240],
  stores: [[850, 62], [1000, 136], [870, 212], [1020, 288], [850, 362], [990, 432]],
  vertical: false,
};

const TALL: Layout = {
  viewBox: "0 0 360 640",
  customer: [58, 52],
  briz: [58, 200],
  stores: [[150, 318], [150, 374], [150, 430], [150, 486], [150, 542], [150, 598]],
  vertical: true,
};

/** Wide: fan of curves. Tall: a trunk that branches right to each store. */
function curve([x1, y1]: Point, [x2, y2]: Point, vertical: boolean) {
  if (!vertical) {
    const midX = (x1 + x2) / 2;
    return `M${x1} ${y1} C${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  }
  if (x1 === x2) return `M${x1} ${y1} L${x2} ${y2}`;
  return `M${x1} ${y1} L${x1} ${y2 - 18} Q${x1} ${y2}, ${x1 + 18} ${y2} L${x2} ${y2}`;
}

function ConnectionMap({ layout, connected, className }: { layout: Layout; connected: boolean; className: string }) {
  const { customer, briz, stores, vertical } = layout;
  const line = (delay: number) => ({
    initial: false as const,
    animate: { pathLength: connected ? 1 : 0, opacity: connected ? 1 : 0 },
    transition: { duration: connected ? 0.9 : 0.3, delay: connected ? delay : 0, ease: EASE },
  });

  return (
    <svg className={`${styles.diagramSvg} ${className}`} viewBox={layout.viewBox} data-connected={connected} aria-hidden="true">
      <motion.path className={styles.diagramLine} d={curve(customer, briz, vertical)} {...line(0)} />
      {stores.map((store, index) => (
        <motion.path key={index} className={styles.diagramLine} d={curve(briz, store, vertical)} {...line(0.45 + index * 0.09)} />
      ))}

      <g transform={`translate(${customer[0]} ${customer[1]})`}>
        <circle className={styles.customerNode} r="30" />
        <circle className={styles.customerGlyph} cy="-6" r="7" />
        <path className={styles.customerGlyph} d="M-13 16a13 11 0 0 1 26 0z" />
        <text className={styles.nodeLabel} x={vertical ? 46 : 0} y={vertical ? -2 : 58} textAnchor={vertical ? "start" : "middle"}>
          Customer
        </text>
        <text className={styles.nodeSub} x={vertical ? 46 : 0} y={vertical ? 16 : 77} textAnchor={vertical ? "start" : "middle"}>
          needs it today
        </text>
      </g>

      <g className={styles.brizNode} transform={`translate(${briz[0]} ${briz[1]})`}>
        <rect x="-44" y="-44" width="88" height="88" rx="26" />
        <text y="8" textAnchor="middle">briz</text>
      </g>

      {stores.map(([x, y], index) => {
        const store = DIAGRAM_STORES[index];
        return (
          <g
            key={store.name}
            className={styles.storeNode}
            transform={`translate(${x} ${y})`}
            style={{ transitionDelay: connected ? `${0.9 + index * 0.09}s` : "0s" }}
          >
            <circle className={styles.storeRing} r="16" />
            <circle className={styles.storeDot} r="5" />
            <text className={styles.nodeLabel} x="28" y="-1">
              {store.name}
            </text>
            <text className={styles.nodeSub} x="28" y="17">
              {store.area}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const OBSTACLES = [
  "The store may not have a website.",
  "Its inventory may not appear online.",
  "Availability may be impossible to confirm.",
];

export function WhyBriz() {
  const diagramRef = useRef<HTMLDivElement>(null);
  const inView = useInView(diagramRef, { once: true, amount: 0.45 });
  const reduce = useReducedMotion();
  const [choice, setChoice] = useState<boolean | null>(null);
  const [auto, setAuto] = useState(false);
  const connected = choice ?? (auto || Boolean(reduce));

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setAuto(true), 700);
    return () => clearTimeout(timer);
  }, [inView]);

  return (
    <section className={styles.section} aria-labelledby="about-why">
      <div className={`${styles.container} ${styles.whyGrid}`}>
        <div className={styles.whyHeading}>
          <Reveal>
            <p className={styles.eyebrow}>Why Briz exists</p>
          </Reveal>
          <RevealHeading
            id="about-why"
            className={styles.title}
            text={"The product exists.\nFinding it is the problem."}
          />
        </div>

        <div className={styles.whyStory}>
          <Reveal>
            <p className={styles.storyLead}>
              Exactly what you need might be sitting in a shop five minutes away.
            </p>
          </Reveal>
          <ul className={styles.obstacles}>
            {OBSTACLES.map((line, index) => (
              <li key={line}>
                <Reveal delay={index * 0.08}>
                  <span className={styles.obstacleIndex}>But</span>
                  {line}
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal>
            <p className={styles.body}>
              So you end up searching Google, calling stores, messaging sellers, or walking shop to shop.
              Meanwhile, local sellers already have the products people want — and very few ways to reach
              the customers around the corner.
            </p>
          </Reveal>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.diagram} ref={diagramRef}>
          <div className={styles.diagramBar}>
            <p className={styles.diagramCaption} aria-live="polite">
              {connected
                ? "One search or request reaches the stores that actually have it."
                : "Nearby stores have it. You just can't see which ones."}
            </p>
            <div className={styles.toggle} role="group" aria-label="Compare local shopping with and without Briz">
              <button type="button" aria-pressed={!connected} onClick={() => setChoice(false)}>
                Without Briz
              </button>
              <button type="button" aria-pressed={connected} onClick={() => setChoice(true)}>
                With Briz
              </button>
            </div>
          </div>
          <ConnectionMap layout={WIDE} connected={connected} className={styles.diagramWide} />
          <ConnectionMap layout={TALL} connected={connected} className={styles.diagramTall} />
          <p className={styles.srOnly}>
            Diagram: a customer connects to Briz, and Briz connects to six nearby stores that were
            previously not discoverable.
          </p>
        </div>

        <RevealHeading as="h3" className={styles.gapLine} text="Briz exists to close that gap." accent={["gap."]} />
      </div>
    </section>
  );
}
