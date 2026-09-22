"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { subcategoriesFor } from "./search-results-model";
import { PriceFilter } from "./search-filters";
import styles from "./category-toolbar.module.css";

type Update = (changes: Record<string, string | null>) => void;

interface CategoryToolbarProps {
  category: string;
  query?: string;
  subcategory: string;
  min?: number;
  max?: number;
  sort: string;
  view: string;
  sortOptions: Record<string, string>;
  productCount: number;
  storeCount: number;
  update: Update;
}

export function CategoryToolbar({
  category,
  query = "",
  subcategory,
  min,
  max,
  sort,
  view,
  sortOptions,
  productCount,
  storeCount,
  update,
}: CategoryToolbarProps) {
  const [activeMenu, setActiveMenu] = useState<"subcategory" | "price" | "sort" | null>(null);
  const [prevQuery, setPrevQuery] = useState(query);
  const [searchVal, setSearchVal] = useState(query);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (prevQuery !== query) {
    setPrevQuery(query);
    setSearchVal(query);
  }

  function handleSearchChange(val: string) {
    setSearchVal(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      update({ q: val.trim() ? val.trim() : null });
    }, 350);
  }

  function handleSearchClear() {
    setSearchVal("");
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    update({ q: null });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    update({ q: searchVal.trim() ? searchVal.trim() : null });
  }

  const subcategories = subcategoriesFor(category);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const priceLabel =
    min !== undefined || max !== undefined
      ? min !== undefined && max !== undefined
        ? `Rs. ${min} - ${max}`
        : min !== undefined
        ? `> Rs. ${min}`
        : `Up to Rs. ${max}`
      : "Rs. 0 - Any";

  const currentSortLabel = sortOptions[sort] || "Relevance";

  return (
    <div ref={containerRef} className={styles.toolbar} data-node-id="836:3763" data-name="Search & Sort by:">
      {/* Left: Tabs matching Figma 836:3764 */}
      <div className={styles.tabs} role="group" aria-label="Result type" data-node-id="836:3764" data-name="Tabs">
        <button
          type="button"
          aria-pressed={view === "products"}
          onClick={() => update({ type: null, sort: null })}
          className={`${styles.tab} ${view === "products" ? styles.tabActive : ""}`}
          data-node-id="836:3765"
          data-name="Tab"
        >
          <span className={styles.tabText}>Products</span>
          <span className={`${styles.badge} ${view === "products" ? styles.badgeActive : ""}`}>
            {productCount}
          </span>
        </button>
        <button
          type="button"
          aria-pressed={view === "stores"}
          onClick={() => update({ type: "stores", sort: null })}
          className={`${styles.tab} ${view === "stores" ? styles.tabActive : ""}`}
          data-node-id="836:3766"
          data-name="Tab"
        >
          <span className={styles.tabText}>Stores</span>
          <span className={`${styles.badge} ${view === "stores" ? styles.badgeActive : ""}`}>
            {storeCount}
          </span>
        </button>
      </div>

      {/* Center: In-Category Search matching Figma 836:3763 */}
      <form
        className={styles.searchField}
        role="search"
        onSubmit={handleSearchSubmit}
        aria-label={`Search in ${category}`}
      >
        <span className={styles.searchIcon} aria-hidden>
          <Image src="/figma/search.svg" width={16} height={16} alt="" unoptimized />
        </span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={`Search in ${category}...`}
          aria-label={`Search in ${category}`}
          value={searchVal}
          onChange={e => handleSearchChange(e.target.value)}
        />
        {searchVal && (
          <button
            type="button"
            className={styles.clearSearchButton}
            onClick={handleSearchClear}
            aria-label="Clear category search"
          >
            ✕
          </button>
        )}
      </form>

      {/* Right: Filter & Sort Controls matching Figma 868:80369 */}
      <div className={styles.filterControls} data-node-id="868:80369" data-name="Frame 2147207424">
        {/* 1. Sub-Category Field */}
        <div className={styles.fieldWrapper} data-node-id="836:3767" data-name="Input field">
          <label className={styles.fieldLabel} data-node-id="836:3768" data-name="FieldLabel">
            Sub-Category
          </label>
          <button
            type="button"
            className={`${styles.selectButton} ${subcategory ? styles.selectButtonActive : ""} ${activeMenu === "subcategory" ? styles.selectButtonOpen : ""}`}
            onClick={() => setActiveMenu(activeMenu === "subcategory" ? null : "subcategory")}
            aria-expanded={activeMenu === "subcategory"}
            aria-haspopup="listbox"
            data-node-id="836:3769"
            data-name="Input"
          >
            <span className={styles.selectValue} title={subcategory || "All"}>
              {subcategory || "All"}
            </span>
            <span className={`${styles.chevron} ${activeMenu === "subcategory" ? styles.chevronOpen : ""}`}>
              <Image src="/figma/chevron-down.svg" width={14} height={14} alt="" unoptimized />
            </span>
          </button>

          {/* Subcategory Popover */}
          {activeMenu === "subcategory" && (
            <div className={styles.popoverMenu} role="listbox" aria-label="Select sub-category">
              <button
                type="button"
                role="option"
                aria-selected={!subcategory}
                className={`${styles.menuItem} ${!subcategory ? styles.menuItemActive : ""}`}
                onClick={() => {
                  update({ subcategory: null });
                  setActiveMenu(null);
                }}
              >
                <span>All Sub-Categories</span>
                {!subcategory && <span className={styles.checkmark}>✓</span>}
              </button>
              {subcategories.map(item => (
                <button
                  key={item}
                  type="button"
                  role="option"
                  aria-selected={subcategory === item}
                  className={`${styles.menuItem} ${subcategory === item ? styles.menuItemActive : ""}`}
                  onClick={() => {
                    update({ subcategory: item });
                    setActiveMenu(null);
                  }}
                >
                  <span>{item}</span>
                  {subcategory === item && <span className={styles.checkmark}>✓</span>}
                </button>
              ))}
              {subcategories.length === 0 && (
                <p className={styles.emptyNotice}>No subcategories available</p>
              )}
            </div>
          )}
        </div>

        {/* 2. Price Range Field */}
        <div className={styles.fieldWrapper} data-node-id="868:80337" data-name="Input field">
          <label className={styles.fieldLabel} data-node-id="868:80338" data-name="FieldLabel">
            Price Range
          </label>
          <button
            type="button"
            className={`${styles.selectButton} ${min !== undefined || max !== undefined ? styles.selectButtonActive : ""} ${activeMenu === "price" ? styles.selectButtonOpen : ""}`}
            onClick={() => setActiveMenu(activeMenu === "price" ? null : "price")}
            aria-expanded={activeMenu === "price"}
            aria-haspopup="dialog"
            data-node-id="868:80339"
            data-name="Input"
          >
            <span className={styles.selectValue} title={priceLabel}>
              {priceLabel}
            </span>
            <span className={`${styles.chevron} ${activeMenu === "price" ? styles.chevronOpen : ""}`}>
              <Image src="/figma/chevron-down.svg" width={14} height={14} alt="" unoptimized />
            </span>
          </button>

          {/* Price Range Interactive Popover */}
          {activeMenu === "price" && (
            <div className={styles.pricePopover} role="dialog" aria-label="Price range filter">
              <div className={styles.pricePopoverHeader}>
                <span className={styles.popoverTitle}>Set Price Range</span>
                {(min !== undefined || max !== undefined) && (
                  <button
                    type="button"
                    className={styles.resetLink}
                    onClick={() => update({ min: null, max: null })}
                  >
                    Reset
                  </button>
                )}
              </div>
              <PriceFilter
                key={`${min}-${max}`}
                min={min}
                max={max}
                update={changes => {
                  update(changes);
                }}
              />
              <div className={styles.pricePopoverActions}>
                <button
                  type="button"
                  className={styles.applyButton}
                  onClick={() => setActiveMenu(null)}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Sort By Field */}
        <div className={styles.fieldWrapper} data-node-id="868:80353" data-name="Input field">
          <label className={styles.fieldLabel} data-node-id="868:80354" data-name="FieldLabel">
            Sort by
          </label>
          <button
            type="button"
            className={`${styles.selectButton} ${activeMenu === "sort" ? styles.selectButtonOpen : ""}`}
            onClick={() => setActiveMenu(activeMenu === "sort" ? null : "sort")}
            aria-expanded={activeMenu === "sort"}
            aria-haspopup="listbox"
            data-node-id="868:80355"
            data-name="Input"
          >
            <span className={styles.selectValue} title={currentSortLabel}>
              {currentSortLabel}
            </span>
            <span className={`${styles.chevron} ${activeMenu === "sort" ? styles.chevronOpen : ""}`}>
              <Image src="/figma/chevron-down.svg" width={14} height={14} alt="" unoptimized />
            </span>
          </button>

          {/* Sort By Popover */}
          {activeMenu === "sort" && (
            <div className={styles.popoverMenu} role="listbox" aria-label="Sort options">
              {Object.entries(sortOptions).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="option"
                  aria-selected={sort === key}
                  className={`${styles.menuItem} ${sort === key ? styles.menuItemActive : ""}`}
                  onClick={() => {
                    update({ sort: key });
                    setActiveMenu(null);
                  }}
                >
                  <span>{label}</span>
                  {sort === key && <span className={styles.checkmark}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
