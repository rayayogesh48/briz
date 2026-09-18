"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Asset, ProductCard } from "../catalog-cards";
import type { Product } from "../search-data";
import styles from "./home-components.module.css";

interface ProductCarouselProps {
  title: string;
  category: string;
  products: Product[];
}

export function ProductCarousel({ title, category, products }: ProductCarouselProps) {
  const router = useRouter();

  function handleSelectProduct(product: Product) {
    router.push(`/search?q=${encodeURIComponent(product.name)}`);
  }

  return (
    <section className={styles.section} aria-label={title}>
      <div className={styles.sectionHeader}>
        <h2>{title}</h2>
        <Link
          href={`/search?category=${encodeURIComponent(category)}`}
          className={styles.viewAllLink}
        >
          <span>View All</span>
          <Asset name="footer-imgChevron" size={16} />
        </Link>
      </div>

      <div className={styles.horizontalScroll} role="region" aria-label={`${title} products`}>
        {products.map((prod) => (
          <ProductCard
            key={prod.id}
            product={prod}
            onSelect={handleSelectProduct}
          />
        ))}
      </div>
    </section>
  );
}
