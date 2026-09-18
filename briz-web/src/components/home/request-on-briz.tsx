"use client";

import Image from "next/image";
import Link from "next/link";
import { REQUEST_STEPS } from "./home-data";
import styles from "./home-components.module.css";

export function RequestOnBriz() {
  return (
    <section className={styles.requestSection} aria-label="Request on Briz guide">
      <div className={styles.requestInner}>
        <div className={styles.requestHeader}>
          <h2>Can&apos;t find it? Request it on Briz</h2>
          <p>
            Connecting Kathmandu customers directly to neighborhood stores in 4 simple steps
          </p>
        </div>

        <div className={styles.stepsGrid}>
          {REQUEST_STEPS.map((step) => (
            <div key={step.id} className={styles.stepCard}>
              <div className={styles.stepThumb}>
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                />
              </div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <Link href="/search" className={styles.requestBtn}>
          Send your First Request
        </Link>
      </div>
    </section>
  );
}

