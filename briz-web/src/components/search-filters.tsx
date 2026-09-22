"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { CATEGORIES, subcategoriesFor } from "./search-results-model";
import styles from "./search-filters.module.css";

type Update = (changes: Record<string, string | null>) => void;
type Props = { category: string; subcategory: string; min?: number; max?: number; stores: boolean; update: Update };

const SLIDER_DEFAULT_MAX = 10000;
const SLIDER_STEP = 50;

export function PriceFilter({ min, max, update }: Pick<Props, "min" | "max" | "update">) {
  const [low, setLow] = useState(min?.toString() || "");
  const [high, setHigh] = useState(max?.toString() || "");
  const [error, setError] = useState("");
  const [activeThumb, setActiveThumb] = useState<"min" | "max" | null>(null);
  const errorId = useId();

  const numLow = Number(low);
  const numHigh = Number(high);
  const effectiveMax = Math.max(
    SLIDER_DEFAULT_MAX,
    Number.isFinite(numHigh) && numHigh > 0 ? Math.ceil(numHigh / 1000) * 1000 : 0,
    max || 0
  );

  const sliderMinVal = Number.isFinite(numLow) && numLow >= 0 ? Math.min(numLow, effectiveMax) : 0;
  const sliderMaxVal = Number.isFinite(numHigh) && numHigh > 0 ? Math.min(numHigh, effectiveMax) : effectiveMax;

  const minPercent = Math.min(100, Math.max(0, (sliderMinVal / effectiveMax) * 100));
  const maxPercent = Math.min(100, Math.max(0, (sliderMaxVal / effectiveMax) * 100));

  function commit(newLowStr: string, newHighStr: string) {
    const l = newLowStr.trim();
    const h = newHighStr.trim();
    if (l && h && Number(l) > Number(h)) {
      setError("Minimum must be less than maximum.");
      return;
    }
    setError("");
    const nextMin = l && Number(l) > 0 ? l : null;
    const nextMax = h && Number(h) > 0 && Number(h) < effectiveMax ? h : null;
    if (nextMin !== (min?.toString() || null) || nextMax !== (max?.toString() || null)) {
      update({ min: nextMin, max: nextMax });
    }
  }

  function handleMinSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Math.min(Number(e.target.value), sliderMaxVal - SLIDER_STEP);
    const strVal = val <= 0 ? "" : val.toString();
    setLow(strVal);
    setError("");
  }

  function handleMaxSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Math.max(Number(e.target.value), sliderMinVal + SLIDER_STEP);
    const strVal = val >= effectiveMax ? "" : val.toString();
    setHigh(strVal);
    setError("");
  }

  function handleSliderCommit() {
    commit(low, high);
  }

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
    <div className={styles.rangeSliderContainer}>
      <div className={styles.rangeSlider}>
        <div className={styles.sliderTrack} />
        <div
          className={styles.sliderRange}
          style={{
            left: `${minPercent}%`,
            width: `${Math.max(0, maxPercent - minPercent)}%`,
          }}
        />
        <input
          type="range"
          min={0}
          max={effectiveMax}
          step={SLIDER_STEP}
          value={sliderMinVal}
          onChange={handleMinSlider}
          onPointerDown={() => setActiveThumb("min")}
          onPointerUp={handleSliderCommit}
          onKeyUp={handleSliderCommit}
          aria-label="Minimum price range slider"
          aria-valuemin={0}
          aria-valuemax={effectiveMax}
          aria-valuenow={sliderMinVal}
          className={`${styles.thumbInput} ${activeThumb === "min" || sliderMinVal > effectiveMax - 1000 ? styles.thumbInputTop : ""}`}
        />
        <input
          type="range"
          min={0}
          max={effectiveMax}
          step={SLIDER_STEP}
          value={sliderMaxVal}
          onChange={handleMaxSlider}
          onPointerDown={() => setActiveThumb("max")}
          onPointerUp={handleSliderCommit}
          onKeyUp={handleSliderCommit}
          aria-label="Maximum price range slider"
          aria-valuemin={0}
          aria-valuemax={effectiveMax}
          aria-valuenow={sliderMaxVal}
          className={`${styles.thumbInput} ${activeThumb === "max" ? styles.thumbInputTop : ""}`}
        />
      </div>
      <div className={styles.rangeLabels} aria-hidden="true">
        <span>Rs. 0</span>
        <span>Rs. {effectiveMax.toLocaleString("en-IN")}+</span>
      </div>
    </div>

    <div className={styles.priceInputs}>
      <label>Min price<span>Rs.<input aria-label="Minimum price" aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} type="number" min="0" step="any" placeholder="0" value={low} onChange={event => { setLow(event.target.value); setError(""); }} /></span></label>
      <span className={styles.priceDash}><Image src="/figma/results/filter-minus.svg" width={16} height={16} alt="" unoptimized /></span>
      <label>Max price<span>Rs.<input aria-label="Maximum price" aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} type="number" min="0" step="any" placeholder="Any" value={high} onChange={event => { setHigh(event.target.value); setError(""); }} /></span></label>
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
