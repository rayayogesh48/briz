"use client";

import Link from "next/link";
import { useState } from "react";
import { BrizHeader } from "@/components/briz-header";
import { BrizFooter } from "@/components/briz-footer";
import { ProductCategoryList } from "@/components/product-category-list";
import styles from "./component-doc.module.css";

const STANDARD_CATEGORIES = [
  "All Products",
  "Men's Fashion",
  "Women's Fashion",
  "Men's Streetwear",
  "Women's Streetwear",
  "Athleisure Essentials",
  "Urban Outerwear",
  "Kids' Apparel",
  "Athleisure",
  "Accessories & Jewelry",
  "Seasonal Collections",
  "Kids Clothes",
  "Others",
];

const LONG_NAME_CATEGORIES = [
  "All Products",
  "Traditional Handmade Nepalese Lokta Paper Notebooks & Journal Collections",
  "Men's Streetwear",
  "Authentic Organic Himalayan Green Tea & Herbal Wellness Blends",
  "Women's Fashion",
  "Handcrafted Carved Wooden Buddha Statues & Sacred Temple Art",
  "Kids' Apparel",
];

const FEW_CATEGORIES = [
  "All Products",
  "Electronics",
  "Groceries",
  "Home & Living",
  "Books",
];

export default function ProductCategoryListDocPage() {
  const [selectedStandard, setSelectedStandard] = useState("All Products");
  const [selectedLong, setSelectedLong] = useState(LONG_NAME_CATEGORIES[1]);
  const [selectedFew, setSelectedFew] = useState("All Products");
  const [selectedKeyboard, setSelectedKeyboard] = useState("All Products");

  return (
    <>
      <BrizHeader />

      <main className={styles.page}>
        <div className={styles.container}>
          {/* Breadcrumbs */}
          <nav className={styles.breadcrumbSection} aria-label="Breadcrumb">
            <div className={styles.breadcrumb}>
              <Link href="/">Home</Link>
              <span className={styles.breadcrumbSeparator} aria-hidden>›</span>
              <span>Components</span>
              <span className={styles.breadcrumbSeparator} aria-hidden>›</span>
              <span className={styles.breadcrumbActive}>Product Category List</span>
            </div>
          </nav>

          {/* Component Header (Radix UI / shadcn style) */}
          <header className={styles.docHeader}>
            <div className={styles.badgeRow}>
              <span className={styles.badge}>Component</span>
              <a
                href="https://www.figma.com/design/WBxilPJIVmVdEMutum6eXp/Briz-Web?node-id=946-103107&t=FAiy3jInkFxq1rx5-4"
                rel="noopener noreferrer"
                className={styles.figmaLink}
              >
                Go to figma Component ↗
              </a>
            </div>
            <h1 className={styles.title}>Product Category List</h1>
            <p className={styles.description}>
              A horizontal, scrollable pill navigation component for filtering product categories with smooth scrolling, overflow gradient fades, and interactive edge-case handling.
            </p>
          </header>

          {/* Documentation Sections: Only Title & Description with Live Preview */}
          <div className={styles.sectionsList}>
            {/* Section 1: Default */}
            <section className={styles.sectionItem}>
              <div className={styles.sectionMeta}>
                <h2 className={styles.sectionTitle}>Default</h2>
                <p className={styles.sectionDescription}>
                  Standard horizontal scrollable category pills with automatic 152px gradient fade masks and navigation chevrons.
                </p>
              </div>
              <div className={styles.previewCanvas}>
                <ProductCategoryList
                  categories={STANDARD_CATEGORIES}
                  selected={selectedStandard}
                  onSelect={setSelectedStandard}
                  backgroundColor="#ffffff"
                  ariaLabel="Default categories list"
                />
                <div className={styles.canvasFooter}>
                  <span>Selected: <strong>{selectedStandard}</strong></span>
                  <span>Figma Node: 946:103107</span>
                </div>
              </div>
            </section>

            {/* Section 2: Long Category Names */}
            <section className={styles.sectionItem}>
              <div className={styles.sectionMeta}>
                <h2 className={styles.sectionTitle}>Long Category Names</h2>
                <p className={styles.sectionDescription}>
                  Unselected categories with long labels are clamped with an ellipsis (maximum 160px width). When selected, the category expands to 100% width so the full label is visible without clipping.
                </p>
              </div>
              <div className={styles.previewCanvas}>
                <ProductCategoryList
                  categories={LONG_NAME_CATEGORIES}
                  selected={selectedLong}
                  onSelect={setSelectedLong}
                  backgroundColor="#ffffff"
                  ariaLabel="Categories with long names"
                />
                <div className={styles.canvasFooter}>
                  <span>Selected: <strong>{selectedLong}</strong></span>
                  <span>Max Width: 160px (Unselected) → Full (Selected)</span>
                </div>
              </div>
            </section>

            {/* Section 3: Compact (Few Categories) */}
            <section className={styles.sectionItem}>
              <div className={styles.sectionMeta}>
                <h2 className={styles.sectionTitle}>Compact (Few Categories)</h2>
                <p className={styles.sectionDescription}>
                  When all categories fit within the container width, gradient fades and navigation chevrons are automatically hidden for an uncluttered appearance.
                </p>
              </div>
              <div className={styles.previewCanvas}>
                <ProductCategoryList
                  categories={FEW_CATEGORIES}
                  selected={selectedFew}
                  onSelect={setSelectedFew}
                  backgroundColor="#ffffff"
                  ariaLabel="Compact categories list"
                />
                <div className={styles.canvasFooter}>
                  <span>Selected: <strong>{selectedFew}</strong></span>
                  <span>Variant: Less category</span>
                </div>
              </div>
            </section>

            {/* Section 4: Keyboard Navigation */}
            <section className={styles.sectionItem}>
              <div className={styles.sectionMeta}>
                <h2 className={styles.sectionTitle}>Keyboard & Touch Navigation</h2>
                <p className={styles.sectionDescription}>
                  Fully accessible with standard tablist semantics, roving tabIndex, left and right arrow key navigation, and smooth 60fps momentum swipe on touch and trackpad devices.
                </p>
              </div>
              <div className={styles.previewCanvas}>
                <ProductCategoryList
                  categories={STANDARD_CATEGORIES.slice(0, 8)}
                  selected={selectedKeyboard}
                  onSelect={setSelectedKeyboard}
                  backgroundColor="#ffffff"
                  ariaLabel="Keyboard accessible categories"
                />
                <div className={styles.canvasFooter}>
                  <span>Selected: <strong>{selectedKeyboard}</strong></span>
                  <span>Use ← and → arrow keys to navigate</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <BrizFooter />
    </>
  );
}

