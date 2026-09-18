"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Asset, StoreCard } from "../catalog-cards";
import type { Store } from "../search-data";
import { FEATURED_STORES } from "./home-data";
import styles from "./home-components.module.css";

export function StoreCarousel() {
  const router = useRouter();

  function handleSelectStore(store: Store) {
    router.push(`/search?q=${encodeURIComponent(store.name)}&type=stores`);
  }

  return (
    <section className={styles.section} aria-label="Featured Stores">
      <div className={styles.sectionHeader}>
        <h2>Featured Stores</h2>
        <Link href="/search?type=stores" className={styles.viewAllLink}>
          <span>Explore All Stores</span>
          <Asset name="footer-imgChevron" size={16} />
        </Link>
      </div>

      <div className={styles.storesScroll} role="region" aria-label="Featured stores list">
        {FEATURED_STORES.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            onSelect={handleSelectStore}
          />
        ))}
      </div>
    </section>
  );
}

