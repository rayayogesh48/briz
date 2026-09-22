"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { ALL_CATEGORY_ITEMS, type CategoryInfo } from "./category-data";
import styles from "./all-categories-page.module.css";

export function AllCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return ALL_CATEGORY_ITEMS;
    return ALL_CATEGORY_ITEMS.filter(item =>
      item.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <main className={styles.page} data-node-id="868:90135" data-name="All Category">
      {/* Breadcrumb section matching Figma 868:90137 */}
      <nav className={styles.breadcrumbSection} aria-label="Breadcrumb" data-node-id="868:90137">
        <div className={styles.breadcrumb} data-node-id="868:90138">
          <Link href="/" data-node-id="868:90139">Home</Link>
          <span className={styles.breadcrumbSeparator} aria-hidden data-node-id="868:90140">›</span>
          <span className={styles.breadcrumbActive} data-node-id="868:90145">All Categories</span>
        </div>
      </nav>

      {/* Main container matching Figma 868:90146 */}
      <div className={styles.container}>
        {/* Header section with title, count, and category search filter */}
        <div className={styles.headerSection}>
          <div className={styles.titleArea}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>All Categories</h1>
              <span className={styles.badge} aria-label={`${filteredCategories.length} categories available`}>
                {filteredCategories.length} Categories
              </span>
            </div>
            <p className={styles.subtitle}>
              Browse local products and verified stores across all categories
            </p>
          </div>

          {/* Quick category search filter */}
          <div className={styles.searchContainer} role="search">
            <span className={styles.searchIcon} aria-hidden>
              <Image src="/figma/search.svg" width={18} height={18} alt="" unoptimized />
            </span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search categories..."
              aria-label="Search categories"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={() => setSearchQuery("")}
                aria-label="Clear category search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 6-Column Category Grid matching Figma 868:90774 */}
        {filteredCategories.length > 0 ? (
          <div
            className={styles.grid}
            data-node-id="868:90774"
            data-name="Scrollable Container"
            aria-live="polite"
          >
            {filteredCategories.map((category: CategoryInfo) => (
              <Link
                key={category.id}
                href={`/category?category=${encodeURIComponent(category.name)}`}
                className={styles.card}
                data-node-id="868:90775"
                data-name="Default State"
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={120}
                    height={120}
                    className={styles.categoryImage}
                    unoptimized
                  />
                </div>
                <p className={styles.cardLabel} title={category.name}>
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Image
              src="/figma/results/empty-box.svg"
              width={64}
              height={64}
              alt=""
              unoptimized
            />
            <h2 className={styles.emptyTitle}>No categories found</h2>
            <p className={styles.emptyDescription}>
              We couldn&apos;t find any category matching &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              type="button"
              className={styles.resetButton}
              onClick={() => setSearchQuery("")}
            >
              Show all categories
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

