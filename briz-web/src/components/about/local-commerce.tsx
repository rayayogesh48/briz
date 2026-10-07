"use client";

import { PHOTOS } from "./about-data";
import { ParallaxPhoto, Reveal, RevealHeading } from "./motion";
import styles from "./about.module.css";

export function LocalCommerce() {
  return (
    <section className={styles.section} aria-labelledby="about-local">
      <div className={styles.container}>
        <div className={styles.localHead}>
          <Reveal>
            <p className={styles.eyebrow}>Local commerce</p>
          </Reveal>
          <RevealHeading
            id="about-local"
            className={styles.title}
            text={"Better discovery for customers.\nBetter visibility for local businesses."}
          />
        </div>

        <div className={styles.localGrid}>
          <ParallaxPhoto
            photo={PHOTOS.shopkeeper}
            className={styles.localMain}
            sizes="(max-width: 900px) 100vw, 840px"
          />

          <div className={styles.localCopy}>
            <Reveal>
              <p className={styles.storyLead}>
                We believe local stores shouldn&rsquo;t become invisible just because they don&rsquo;t have
                sophisticated ecommerce infrastructure.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className={styles.body}>
                Briz gives local businesses a simpler way to show what they sell, understand what nearby
                customers want, and connect with people ready to buy.
              </p>
            </Reveal>
          </div>

          <ParallaxPhoto photo={PHOTOS.vendor} className={styles.localTall} sizes="(max-width: 900px) 60vw, 360px" />
          <ParallaxPhoto photo={PHOTOS.fabric} className={styles.localSmall} sizes="(max-width: 900px) 40vw, 300px" />
          <ParallaxPhoto photo={PHOTOS.market} className={styles.localWide} sizes="(max-width: 900px) 100vw, 620px" />
        </div>
      </div>
    </section>
  );
}
