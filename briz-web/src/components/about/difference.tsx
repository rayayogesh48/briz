"use client";

import { ArrowRight } from "lucide-react";
import { Reveal, ScrubText } from "./motion";
import styles from "./about.module.css";

const RULES = [
  { when: "If it's listed", then: "Find it nearby." },
  { when: "If it isn't", then: "Request it." },
  { when: "If sellers have it", then: "Let them come to you." },
];

export function Difference() {
  return (
    <section className={styles.difference} aria-labelledby="about-difference">
      <div className={styles.container}>
        <Reveal>
          <p className={styles.eyebrow}>The Briz difference</p>
          <h2 id="about-difference" className={styles.differenceSetup}>
            Most marketplaces show you what sellers decided to list.
          </h2>
        </Reveal>

        <ScrubText className={styles.differenceStatement} text="Briz lets you ask for what you actually need." />

        <ul className={styles.rules}>
          {RULES.map((rule, index) => (
            <li key={rule.when}>
              <Reveal delay={index * 0.08} className={styles.rule}>
                <span className={styles.ruleWhen}>{rule.when}</span>
                <ArrowRight className={styles.ruleArrow} aria-hidden="true" />
                <span className={styles.ruleThen}>{rule.then}</span>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
