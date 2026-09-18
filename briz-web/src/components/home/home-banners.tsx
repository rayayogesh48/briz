"use client";

import Image from "next/image";
import Link from "next/link";
import { HERO_BANNER, PROMO_BANNERS } from "./home-data";
import styles from "./home-components.module.css";

export function HomeBanners() {
  return (
    <section className={styles.section} aria-label="Promotions and banners">
      <div className={styles.heroBanner}>
        <Link href={HERO_BANNER.link} aria-label={HERO_BANNER.title}>
          <Image
            src={HERO_BANNER.image}
            alt={HERO_BANNER.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
            priority
          />
        </Link>
      </div>

      <div className={styles.promoStrip} role="region" aria-label="Promotional cards">
        {PROMO_BANNERS.map((promo) => (
          <Link
            key={promo.id}
            href={promo.link}
            className={styles.promoCard}
            aria-label={promo.title}
          >
            <Image
              src={promo.image}
              alt={promo.title}
              fill
              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 460px, 528px"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
