"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { CATEGORIES, subcategoriesFor } from "./search-results-model";
import styles from "./search-filters.module.css";

type Update = (changes: Record<string, string | null>) => void;
type Props = { category: string; subcategory: string; min?: number; max?: number; stores: boolean; update: Update };

function PriceFilter({ min, max, update }: Pick<Props, "min" | "max" | "update">) {
  const [low, setLow] = useState(min?.toString() || "");
  const [high, setHigh] = useState(max?.toString() || "");
  const [error, setError] = useState("");
  const errorId = useId();
  function apply(form: HTMLFormElement) {
    if (!form.checkValidity()) { setError("Enter a valid price of zero or more."); return; }
    if (low && high && Number(low) > Number(high)) { setError("Minimum must be less than maximum."); return; }
    setError("");
    if (low !== (min?.toString() || "") || high !== (max?.toString() || "")) update({ min: low || null, max: high || null });
  }
  return <form className={styles.priceForm} onSubmit={event => { event.preventDefault(); apply(event.currentTarget); }} onBlur={event => {
    // Commit both fields together; moving from Min to Max must not steal focus.
    if (!event.currentTarget.contains(event.relatedTarget as Node)) apply(event.currentTarget);
  }}>
    <div className={styles.priceInputs}>
      <label>Min price<span>Rs.<input aria-label="Minimum price" aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} type="number" min="0" step="any" placeholder="0" value={low} onChange={event => setLow(event.target.value)} /></span></label>
      <span className={styles.priceDash}><Image src="/figma/results/filter-minus.svg" width={16} height={16} alt="" unoptimized /></span>
      <label>Max price<span>Rs.<input aria-label="Maximum price" aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} type="number" min="0" step="any" placeholder="Any" value={high} onChange={event => setHigh(event.target.value)} /></span></label>
    </div>
    {error && <p id={errorId} className={styles.error} role="alert">{error}</p>}
    <button className={styles.submit} type="submit" tabIndex={-1}>Apply price range</button>
  </form>;
}

export function SearchFilters({ category, subcategory, min, max, stores, update }: Props) {
  const [moreCategories, setMoreCategories] = useState(false);
  const [moreSubcategories, setMoreSubcategories] = useState(false);
  const categoryId = useId();
  const subcategoryId = useId();
  const options = subcategoriesFor(category);
  function visible(items: string[], expanded: boolean, selected: string) {
    const first = items.slice(0, 6);
    return expanded ? items : selected && !first.includes(selected) ? [...first, selected] : first;
  }
  return <div className={styles.filters}>
    <section className={styles.section} aria-labelledby={`${categoryId}-heading`}>
      <h2 id={`${categoryId}-heading`}>Category</h2>
      <div className={styles.options} id={categoryId}><button type="button" className={styles.category} aria-pressed={!category} onClick={() => { setMoreSubcategories(false); update({ category: null, subcategory: null }); }}>All categories</button>{visible(CATEGORIES, moreCategories, category).map(item => <button type="button" key={item} className={styles.category} aria-pressed={category === item} onClick={() => { setMoreSubcategories(false); update({ category: item, subcategory: null }); }}>{item}</button>)}</div>
      {CATEGORIES.length > 6 && <button className={styles.viewMore} aria-expanded={moreCategories} aria-controls={categoryId} onClick={() => setMoreCategories(!moreCategories)}>{moreCategories ? "VIEW LESS" : "VIEW MORE"}</button>}
    </section>
    <fieldset className={styles.section}>
      <legend>Sub-Category</legend>
      <div className={styles.options} id={subcategoryId}>
        <label className={styles.radio}><input type="radio" name={subcategoryId} checked={!subcategory} onChange={() => update({ subcategory: null })} /><span>All</span></label>
        {visible(options, moreSubcategories, subcategory).map(item => <label key={item} className={styles.radio}><input type="radio" name={subcategoryId} checked={subcategory === item} onChange={() => update({ subcategory: item })} /><span>{item}</span></label>)}
      </div>
      {options.length > 6 && <button className={styles.viewMore} aria-expanded={moreSubcategories} aria-controls={subcategoryId} onClick={() => setMoreSubcategories(!moreSubcategories)}>{moreSubcategories ? "VIEW LESS" : "VIEW MORE"}</button>}
    </fieldset>
    <section className={styles.section} aria-labelledby={`${categoryId}-price`}><h2 id={`${categoryId}-price`}>Price Range</h2><PriceFilter key={`${min}-${max}`} min={min} max={max} update={update} />{stores && <p className={styles.hint}>Stores with products in this price range.</p>}</section>
  </div>;
}
