"use client";

import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { MAP_PLACES, PHOTOS, PRODUCT_IMAGES } from "./about-data";
import { Reveal, RevealHeading } from "./motion";
import styles from "./about.module.css";

/** Abstract Kathmandu Valley: ring road, the two rivers, and neighbourhood markers. */
function ValleyMap() {
  return (
    <svg className={styles.mapSvg} viewBox="0 0 600 520" aria-hidden="true">
      <g className={styles.mapStreets}>
        <path d="M60 250 L540 232" />
        <path d="M250 60 L300 470" />
        <path d="M120 150 L470 400" />
        <path d="M150 400 L450 130" />
        <path d="M200 110 L420 110" />
        <path d="M110 340 L500 300" />
      </g>
      <path className={styles.mapRiver} d="M330 20 C350 120, 420 200, 400 290 S340 400, 300 500" />
      <path className={styles.mapRiver} d="M200 40 C215 140, 230 230, 262 300 S300 360, 340 380" />
      <path
        className={styles.mapRing}
        d="M300 92 C392 84, 478 140, 492 236 C504 322, 452 404, 348 430 C248 452, 136 408, 110 314 C86 224, 152 104, 300 92 Z"
      />
      {MAP_PLACES.map((place, index) => (
        <g
          key={place.name}
          className={styles.mapPlace}
          data-home={"home" in place}
          transform={`translate(${place.x} ${place.y})`}
          style={{ animationDelay: `${index * 0.35}s` }}
        >
          <circle className={styles.mapPulse} r="14" style={{ animationDelay: `${index * 0.35}s` }} />
          <circle className={styles.mapDot} r="5" />
          <text x="12" y="5">{place.name}</text>
        </g>
      ))}
    </svg>
  );
}

export function BuiltForNepal() {
  return (
    <section className={styles.section} aria-labelledby="about-nepal">
      <div className={`${styles.container} ${styles.nepalGrid}`}>
        <div className={styles.nepalCopy}>
          <Reveal>
            <p className={styles.eyebrow}>Built for Nepal</p>
          </Reveal>
          <RevealHeading id="about-nepal" className={styles.title} text="Built around how Nepal actually shops." />
          <Reveal delay={0.1}>
            <p className={styles.storyLead}>Briz is a marketplace for Nepal, starting with Kathmandu.</p>
          </Reveal>
          <Reveal delay={0.18}>
            <p className={styles.body}>
              Instead of replacing local stores with centralized warehouses, Briz helps people discover
              and buy from the businesses already around them.
            </p>
          </Reveal>
        </div>

        <Reveal className={styles.map}>
          <p className={styles.srOnly}>
            Map of Kathmandu with markers on neighbourhoods including Thamel, Asan, New Baneshwor, Patan
            and Boudha.
          </p>
          <ValleyMap />

          <div className={`${styles.floating} ${styles.mapProduct}`} aria-hidden="true">
            <span className={styles.thumb}>
              <Image src={PRODUCT_IMAGES.bottle} alt="" fill sizes="56px" />
            </span>
            <span className={styles.floatText}>
              <span className={styles.floatTitle}>Steel Bottle 750 ml</span>
              <span className={styles.floatMeta}>
                Thamel · 0.9 km · <span className={styles.open}>In stock</span>
              </span>
            </span>
          </div>

          <figure className={styles.mapStore}>
            <span className={styles.mapStorePhoto}>
              <Image src={PHOTOS.storefront.src} alt={PHOTOS.storefront.alt} fill sizes="240px" unoptimized />
            </span>
            <figcaption>
              <span className={styles.floatTitle}>
                Neighbourhood store
                <BadgeCheck size={15} className={styles.verifiedIcon} aria-hidden="true" />
              </span>
              <span className={styles.floatMeta}>Now discoverable on Briz</span>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
