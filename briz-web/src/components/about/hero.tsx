"use client";

import Image from "next/image";
import { BadgeCheck, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { PHOTOS, PRODUCT_IMAGES } from "./about-data";
import { EASE, ParallaxPhoto, Reveal, RevealHeading } from "./motion";
import styles from "./about.module.css";

function FloatingCard({ children, className, delay }: { children: ReactNode; className: string; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`${styles.floating} ${className}`}
      initial={reduce ? false : { opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Faint "what's within reach" rings behind the hero photo. */
function RadiusRings() {
  return (
    <svg className={styles.heroRings} viewBox="0 0 800 800" aria-hidden="true">
      {[130, 230, 330, 395].map((radius) => (
        <circle key={radius} cx="400" cy="400" r={radius} />
      ))}
      <path d="M0 520 C 180 470, 300 560, 470 500 S 720 420, 800 470" />
      <path d="M250 0 C 290 190, 210 330, 300 520 S 380 700, 340 800" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="about-hero">
      <div className={`${styles.container} ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <Reveal>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              About Briz
            </p>
          </Reveal>
          <RevealHeading
            as="h1"
            id="about-hero"
            className={styles.heroTitle}
            text={"What you need\nmight already\nbe nearby."}
            accent={["nearby."]}
            delay={0.1}
          />
          <Reveal delay={0.45}>
            <p className={styles.heroLead}>
              Briz connects people with nearby stores, making it easier to discover what&rsquo;s available
              locally — and request what isn&rsquo;t.
            </p>
          </Reveal>
          <Reveal delay={0.55}>
            <p className={styles.brandLine}>
              <span>Find it nearby.</span> <strong>Or request it.</strong>
            </p>
          </Reveal>
        </div>

        <div className={styles.heroVisual}>
          <RadiusRings />
          <ParallaxPhoto
            photo={PHOTOS.street}
            className={styles.heroPhoto}
            sizes="(max-width: 900px) 100vw, 520px"
            priority
          />

          <FloatingCard className={styles.floatStore} delay={0.7}>
            <span className={styles.storeAvatar} aria-hidden="true">HB</span>
            <span className={styles.floatText}>
              <span className={styles.floatTitle}>
                Himalayan Bazzar
                <BadgeCheck size={16} className={styles.verifiedIcon} aria-label="Verified store" />
              </span>
              <span className={styles.floatMeta}>
                <MapPin size={13} aria-hidden="true" /> 350 m · <span className={styles.open}>Open now</span>
              </span>
            </span>
          </FloatingCard>

          <FloatingCard className={styles.floatProduct} delay={0.85}>
            <span className={styles.thumb}>
              <Image src={PRODUCT_IMAGES.paper} alt="" fill sizes="56px" />
            </span>
            <span className={styles.floatText}>
              <span className={styles.floatTitle}>Thermal Paper 58 mm</span>
              <span className={styles.floatMeta}>
                <strong>Rs. 500</strong> · <span className={styles.open}>In stock</span>
              </span>
            </span>
          </FloatingCard>

          <FloatingCard className={styles.floatOffers} delay={1}>
            <span className={styles.offerStack} aria-hidden="true">
              <span>KE</span>
              <span>PP</span>
              <span>OE</span>
            </span>
            <span className={styles.floatText}>
              <span className={styles.floatTitle}>3 nearby sellers replied</span>
              <span className={styles.floatMeta}>to your request · from Rs. 1,980</span>
            </span>
          </FloatingCard>
        </div>
      </div>

      <div className={`${styles.container} ${styles.heroMeta}`}>
        <span>Kathmandu, Nepal</span>
        <span aria-hidden="true">27.7172° N · 85.3240° E</span>
        <span>A local marketplace</span>
      </div>
    </section>
  );
}
