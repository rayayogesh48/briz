"use client";

import Image from "next/image";
import Link from "next/link";
import { Asset } from "../catalog-cards";
import { POPULAR_CATEGORIES } from "./home-data";
import styles from "./home-components.module.css";

export function PopularCategories() {
  return (
    <section className={styles.section} aria-label="Popular Categories">
      <div className={styles.sectionHeader}>
        <h2>Popular Categories</h2>
        <Link href="/search" className={styles.viewAllLink}>
          <span>Explore All Categories</span>
          <Asset name="footer-imgChevron" size={16} />
        </Link>
      </div>

      <div className={styles.categoryStrip} role="region" aria-label="Category list">
        {POPULAR_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/search?category=${encodeURIComponent(cat.query)}`}
            className={styles.categoryCard}
          >
            <div className={styles.categoryThumb}>
              <Image
                src={cat.image}
                alt=""
                width={80}
                height={80}
              />
            </div>
            <p className={styles.categoryName}>{cat.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
