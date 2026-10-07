"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal, RevealHeading } from "./motion";
import styles from "./about.module.css";

const STATEMENTS = [
  { lead: "Less", rest: "searching across stores." },
  { lead: "Less", rest: "uncertainty about what’s available." },
  { lead: "More", rest: "visibility for local businesses." },
  { lead: "More", rest: "demand staying local." },
];

export function Closing() {
  return (
    <section className={styles.closing} aria-labelledby="about-closing">
      <div className={styles.container}>
        <Reveal>
          <p className={styles.eyebrow}>Where this is going</p>
        </Reveal>
        <RevealHeading
          id="about-closing"
          className={styles.closingTitle}
          text="We want finding something locally to feel effortless."
          accent={["effortless."]}
        />

        <ul className={styles.statements}>
          {STATEMENTS.map((statement, index) => (
            <li key={statement.rest} data-more={statement.lead === "More"}>
              <Reveal delay={index * 0.07}>
                <strong>{statement.lead}</strong> {statement.rest}
              </Reveal>
            </li>
          ))}
        </ul>

        <div className={styles.closingEnd}>
          <Reveal>
            <p className={styles.closingBrand}>
              Find it nearby. <strong>Or request it.</strong>
            </p>
          </Reveal>
          <Reveal delay={0.1} className={styles.ctas}>
            <Link href="/search" className={styles.ctaPrimary}>
              Explore Briz <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/search?type=stores" className={styles.ctaSecondary}>
              Sell on Briz <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </div>
      <p className={styles.wordmark} aria-hidden="true">
        briz
      </p>
    </section>
  );
}
