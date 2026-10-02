"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, LayoutGrid, List, Filter } from "lucide-react";
import {
  PRODUCT_SORT_LABELS,
  STORE_SORT_LABELS,
  type ProductSortOption,
  type StoreSortOption,
} from "@/data/featured-data";
import styles from "./featured-toolbar.module.css";

interface ProductToolbarProps {
  type: "products";
  itemCount: number;
  totalCatalogCount?: number;
  locationName?: string;
  sort: ProductSortOption;
  onSortChange: (sort: ProductSortOption) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onOpenMobileFilters: () => void;
  activeFiltersCount?: number;
  isSortOpenControlled?: boolean;
}

interface StoreToolbarProps {
  type: "stores";
  itemCount: number;
  totalCatalogCount?: number;
  locationName?: string;
  sort: StoreSortOption;
  onSortChange: (sort: StoreSortOption) => void;
  viewMode?: never;
  onViewModeChange?: never;
  onOpenMobileFilters: () => void;
  activeFiltersCount?: number;
  isSortOpenControlled?: boolean;
}

export type FeaturedToolbarProps = ProductToolbarProps | StoreToolbarProps;

export function FeaturedToolbar(props: FeaturedToolbarProps) {
  const {
    type,
    itemCount,
    locationName = "Kathmandu",
    onOpenMobileFilters,
    activeFiltersCount = 0,
    isSortOpenControlled,
  } = props;

  const [sortOpenInternal, setSortOpenInternal] = useState(false);
  const sortWrapperRef = useRef<HTMLDivElement>(null);

  const isSortOpen = isSortOpenControlled !== undefined ? isSortOpenControlled : sortOpenInternal;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortWrapperRef.current && !sortWrapperRef.current.contains(event.target as Node)) {
        setSortOpenInternal(false);
      }
    }
    if (isSortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSortOpen]);

  const countText =
    type === "products"
      ? `${itemCount} featured products near `
      : `${itemCount} featured stores near `;

  return (
    <div className={styles.toolbar}>
      {/* Left side: Count & Location */}
      <div className={styles.countArea}>
        <p className={styles.countText}>
          <span>{countText}</span>
          <span className={styles.countLocation}>{locationName}</span>
        </p>
      </div>

      {/* Right side: Controls */}
      <div className={styles.controlsArea}>
        {/* Mobile Filters Trigger */}
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className={styles.mobileFilterTrigger}
          aria-label="Open filter options"
        >
          <Filter size={15} aria-hidden="true" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className={styles.filterBadge}>{activeFiltersCount}</span>
          )}
        </button>

        {/* Sort Dropdown */}
        <div className={styles.sortWrapper} ref={sortWrapperRef}>
          <span className={styles.sortLabel}>Sort by:</span>
          <button
            type="button"
            onClick={() => setSortOpenInternal(!isSortOpen)}
            className={styles.sortDropdownTrigger}
            aria-expanded={isSortOpen}
            aria-haspopup="listbox"
            aria-label="Sort options"
          >
            <span>
              {type === "products"
                ? PRODUCT_SORT_LABELS[props.sort]
                : STORE_SORT_LABELS[props.sort]}
            </span>
            <ChevronDown size={15} aria-hidden="true" />
          </button>

          {isSortOpen && (
            <div className={styles.sortMenu} role="listbox" aria-label="Sort options menu">
              {type === "products"
                ? (
                    Object.entries(PRODUCT_SORT_LABELS) as [
                      ProductSortOption,
                      string,
                    ][]
                  ).map(([key, label]) => {
                    const isSelected = props.sort === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`${styles.sortMenuItem} ${
                          isSelected ? styles.sortMenuItemActive : ""
                        }`}
                        onClick={() => {
                          props.onSortChange(key);
                          setSortOpenInternal(false);
                        }}
                      >
                        <span>{label}</span>
                        {isSelected && <Check size={14} aria-hidden="true" />}
                      </button>
                    );
                  })
                : (
                    Object.entries(STORE_SORT_LABELS) as [
                      StoreSortOption,
                      string,
                    ][]
                  ).map(([key, label]) => {
                    const isSelected = props.sort === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`${styles.sortMenuItem} ${
                          isSelected ? styles.sortMenuItemActive : ""
                        }`}
                        onClick={() => {
                          props.onSortChange(key);
                          setSortOpenInternal(false);
                        }}
                      >
                        <span>{label}</span>
                        {isSelected && <Check size={14} aria-hidden="true" />}
                      </button>
                    );
                  })}
            </div>
          )}
        </div>

        {/* Grid / List view mode toggles (only for Products) */}
        {type === "products" && props.onViewModeChange && (
          <div className={styles.viewModeGroup} role="group" aria-label="Grid or List view">
            <button
              type="button"
              onClick={() => props.onViewModeChange("grid")}
              className={`${styles.viewModeBtn} ${
                props.viewMode === "grid" ? styles.viewModeBtnActive : ""
              }`}
              aria-label="Grid view"
              title="Grid view"
            >
              <LayoutGrid size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => props.onViewModeChange("list")}
              className={`${styles.viewModeBtn} ${
                props.viewMode === "list" ? styles.viewModeBtnActive : ""
              }`}
              aria-label="List view"
              title="List view"
            >
              <List size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
