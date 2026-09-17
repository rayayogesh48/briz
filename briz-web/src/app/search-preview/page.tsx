"use client";

import { useState } from "react";
import NavbarSearch, { type SearchState } from "@/components/navbar-search";
import { OperatingHours, ProductRow, StoreRow, SearchIcon, SkeletonGroup, SkeletonRow } from "@/components/search-parts";
import { DESIGN_PRODUCTS, DESIGN_STORES } from "@/components/search-data";
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
export default function SearchPreview() {
  const [revision, setRevision] = useState(0);
  const [selection, setSelection] = useState("");
  return <main className={styles.canvas}>
    <div className={styles.heading}><div><h1>Search components</h1><p>Figma states, result rows, operating hours, and loading motion.</p></div><button onClick={() => { setRevision(value => value + 1); setSelection(""); }}>Reset previews</button></div>
    <div className={styles.grid} key={revision}>
      {states.map(({ label, state }) => <section className={styles.example} key={state} aria-label={label}><h2>{label}</h2><NavbarSearch location="New Baneshwor, Kathmandu" previewState={state} /></section>)}
      <section className={styles.example} aria-label="Result row variants"><h2>Result rows · default, hover, loading</h2><div className={styles.cards}>
        <ProductRow product={DESIGN_PRODUCTS[0]} onSelect={() => setSelection(DESIGN_PRODUCTS[0].name)} />
        <ProductRow product={DESIGN_PRODUCTS[0]} hovered onSelect={() => setSelection(DESIGN_PRODUCTS[0].name)} />
        <SkeletonGroup><SkeletonRow kind="product" /><StoreRow store={DESIGN_STORES[0]} onSelect={() => setSelection(DESIGN_STORES[0].name)} /><StoreRow store={DESIGN_STORES[0]} hovered onSelect={() => setSelection(DESIGN_STORES[0].name)} /><SkeletonRow kind="store" /></SkeletonGroup>
      </div>{selection && <p role="status">Selected: {selection}</p>}</section>
      <section className={styles.example}><h2>Operating hours</h2><div className={styles.statuses}><OperatingHours status="open" /><OperatingHours status="closed" /><OperatingHours status="closed-today" /></div><h2>Suggestion icon · 20px</h2><SearchIcon name="ai" /></section>
    </div>
  </main>;
}
