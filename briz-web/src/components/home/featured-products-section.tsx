"use client";

import Link from "next/link";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Asset, ProductCard } from "../catalog-cards";
import type { Product } from "../search-data";
import { FEATURED_PRODUCTS } from "./home-data";
import styles from "./home-components.module.css";

export function FeaturedProductsSection() {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollRight() {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: 244, behavior: "smooth" });
    }
  }

  function handleSelectProduct(product: Product) {
    router.push(`/search?q=${encodeURIComponent(product.name)}`);
  }

  return (
    <section className={styles.section} aria-label="Featured Products">
      <div className={styles.featuredProductsBox}>
        <div className={styles.sectionHeader}>
          <h2>Featured Products</h2>
          <Link href="/search" className={styles.viewAllLink}>
            <span>Explore All Products</span>
            <Asset name="footer-imgChevron" size={16} />
          </Link>
        </div>

        <div className={styles.cardsTrack}>
          <div ref={trackRef} className={styles.horizontalScroll}>
            {FEATURED_PRODUCTS.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelect={handleSelectProduct}
              />
            ))}
          </div>

          <button
            type="button"
            className={styles.scrollButton}
            onClick={scrollRight}
            aria-label="Scroll next products"
          >
            <Asset name="footer-imgChevron" size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
