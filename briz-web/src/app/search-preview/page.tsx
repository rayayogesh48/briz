"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import NavbarSearch, { type SearchState } from "@/components/navbar-search";
import { OperatingHours, ProductRow, StoreRow, SearchIcon, SkeletonGroup, SkeletonRow } from "@/components/search-parts";
import { DESIGN_PRODUCTS, DESIGN_STORES } from "@/components/search-data";
import { SortDropdown } from "@/components/sort-dropdown";
import { PRODUCT_SORTS, STORE_SORTS } from "@/components/search-results-model";
import styles from "./preview.module.css";

const states: { label: string; state: SearchState }[] = [
  { label: "Idle · 400px", state: "idle" },
  { label: "Focused · 540px", state: "focused" },
  { label: "Search loading", state: "loading" },
  { label: "Search results", state: "results" },
  { label: "Filled", state: "filled" },
  { label: "Empty history", state: "empty-history" },
  { label: "Request a product", state: "no-results" },
];

const FIGMA_DESIGNS = [
  {
    nodeId: "780:25540",
    title: "Product Searched Result",
    type: "Search",
    description: "Results for “Wireless headphones” with Products tab active, 4-col product grid, and sort dropdown.",
    href: "/search?q=Wireless+headphones",
  },
  {
    nodeId: "787:28094",
    title: "Sort By Input Field",
    type: "Component",
    description: "FieldLabel 'Sort by:' + 40px select trigger with chevron-down icon and active sort value.",
    href: "/search?q=Wireless+headphones",
  },
  {
    nodeId: "836:3686",
    title: "Categories -> Products",
    type: "Browse",
    description: "All categories view with Products tab active, left category/price filters, and Load More button.",
    href: "/search",
  },
  {
    nodeId: "811:37415",
    title: "Filter Applied State",
    type: "State",
    description: "Filtering panel with active filter pill chips (#f0f4ff, #3e63dd, remove 'x') and red Clear All button.",
    href: "/search?q=Wireless+headphones&category=Books+%26+Stationery&min=100&max=1000",
  },
  {
    nodeId: "836:28820",
    title: "Categories -> Stores",
    type: "Browse",
    description: "All categories view with Stores tab active, 3-column store cards, and Load More Stores button.",
    href: "/search?type=stores",
  },
  {
    nodeId: "832:40193",
    title: "Product: Sort By Menu",
    type: "Overlay",
    description: "200px popup menu with checkmarks for Relevance, Nearest, New Arrivals, Price, Discount.",
    href: "/search?q=Wireless+headphones",
  },
  {
    nodeId: "836:30472",
    title: "Category: Ag & Farming (Stores)",
    type: "Category",
    description: "Agriculture & Farming selected with Stores tab active and category breadcrumbs.",
    href: "/search?category=Agriculture+%26+Farming&type=stores",
  },
  {
    nodeId: "811:36363",
    title: "Store Searched Results",
    type: "Search",
    description: "Results for “Wireless headphones” with Stores tab active and 3-column store cards.",
    href: "/search?q=Wireless+headphones&type=stores",
  },
  {
    nodeId: "822:38234",
    title: "Search: No Result Found",
    type: "Empty",
    description: "180x180 illustration, 'No results found' heading, subtitle, and clear filters action.",
    href: "/search?q=nonexistentitemxyz",
  },
  {
    nodeId: "832:40248",
    title: "Stores: Sort By Menu",
    type: "Overlay",
    description: "200px popup menu with checkmarks for Nearest, Top Rated, Verified, Newly Joined.",
    href: "/search?type=stores",
  },
  {
    nodeId: "836:31246",
    title: "Category: Ag & Farming (Products)",
    type: "Category",
    description: "Agriculture & Farming selected with Products tab active and category subcategories list.",
    href: "/search?category=Agriculture+%26+Farming",
  },
  {
    nodeId: "836:32569",
    title: "Category: No Result Found",
    type: "Empty",
    description: "Category empty state with 180x180 empty illustration and guidance.",
    href: "/search?category=Agriculture+%26+Farming&subcategory=Seeds",
  },
];

export default function SearchPreview() {
  const [revision, setRevision] = useState(0);
  const [selection, setSelection] = useState("");
  const [productSort, setProductSort] = useState("relevance");
  const [storeSort, setStoreSort] = useState("nearest");

  return (
    <main className={styles.canvas}>
      <div className={styles.heading}>
        <div>
          <h1>Search & 12 Figma Designs Preview</h1>
          <p>Interactive showcase for all 12 Figma designs from Briz-Web (WBxilPJIVmVdEMutum6eXp).</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setRevision(value => value + 1);
            setSelection("");
          }}
        >
          Reset previews
        </button>
      </div>

      {/* 12 Figma Designs Navigator */}
      <section className={styles.showcaseSection} aria-label="12 Figma Designs Navigator">
        <div className={styles.showcaseHeading}>
          <h2>12 Figma Designs Gallery</h2>
          <span>Click any card to open the live implementation in /search</span>
        </div>
        <div className={styles.designLinksGrid}>
          {FIGMA_DESIGNS.map(design => (
            <Link key={design.nodeId} href={design.href} className={styles.designCard}>
              <div className={styles.designHeader}>
                <span className={styles.nodeBadge}>{design.nodeId}</span>
                <span className={styles.designType}>{design.type}</span>
              </div>
              <h3 className={styles.designTitle}>{design.title}</h3>
              <p className={styles.designDesc}>{design.description}</p>
            </Link>
          ))}
        </div>

        {/* Live Component Previews */}
        <div className={styles.componentRow}>
          <div className={styles.componentPreview}>
            <h3>Node 787:28094 & 832:40193 · Product Sort</h3>
            <SortDropdown
              label="Sort by:"
              value={productSort}
              options={PRODUCT_SORTS}
              onChange={setProductSort}
            />
          </div>

          <div className={styles.componentPreview}>
            <h3>Node 832:40248 · Store Sort</h3>
            <SortDropdown
              label="Sort by:"
              value={storeSort}
              options={STORE_SORTS}
              onChange={setStoreSort}
            />
          </div>

          <div className={styles.componentPreview}>
            <h3>Node 836:28812 · Load More Button</h3>
            <div style={{ display: "inline-flex" }}>
              <button
                type="button"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  width: 215,
                  height: 48,
                  padding: "0 16px",
                  background: "#f1f1f1",
                  border: 0,
                  borderRadius: 12,
                  color: "#202020",
                  fontWeight: 650,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                <span>Load More Products</span>
                <Image
                  src="/figma/results/sort-chevron-down.svg"
                  width={16}
                  height={16}
                  alt=""
                  unoptimized
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Navbar search states and components */}
      <div className={styles.grid} key={revision}>
        {states.map(({ label, state }) => (
          <section className={styles.example} key={state} aria-label={label}>
            <h2>{label}</h2>
            <NavbarSearch location="New Baneshwor, Kathmandu" previewState={state} />
          </section>
        ))}
        <section className={styles.example} aria-label="Result row variants">
          <h2>Result rows · default, hover, loading</h2>
          <div className={styles.cards}>
            <ProductRow
              product={DESIGN_PRODUCTS[0]}
              onSelect={() => setSelection(DESIGN_PRODUCTS[0].name)}
            />
            <ProductRow
              product={DESIGN_PRODUCTS[0]}
              hovered
              onSelect={() => setSelection(DESIGN_PRODUCTS[0].name)}
            />
            <SkeletonGroup>
              <SkeletonRow kind="product" />
              <StoreRow
                store={DESIGN_STORES[0]}
                onSelect={() => setSelection(DESIGN_STORES[0].name)}
              />
              <StoreRow
                store={DESIGN_STORES[0]}
                hovered
                onSelect={() => setSelection(DESIGN_STORES[0].name)}
              />
              <SkeletonRow kind="store" />
            </SkeletonGroup>
          </div>
          {selection && <p role="status">Selected: {selection}</p>}
        </section>
        <section className={styles.example}>
          <h2>Operating hours</h2>
          <div className={styles.statuses}>
            <OperatingHours status="open" />
            <OperatingHours status="closed" />
            <OperatingHours status="closed-today" />
          </div>
          <h2>Suggestion icon · 20px</h2>
          <SearchIcon name="ai" />
        </section>
      </div>
    </main>
  );
}
