"use client";

import React, { useState } from "react";
import { Filter, X, ChevronDown, Star, Check } from "lucide-react";
import {
  PRODUCT_CATEGORIES,
  ALL_PRODUCT_CATEGORIES,
  STORE_CATEGORIES,
  ALL_STORE_CATEGORIES,
  DISTANCE_OPTIONS,
  type ProductFilters as ProductFiltersType,
  type StoreFilters as StoreFiltersType,
} from "@/data/featured-data";
import styles from "./featured-filters.module.css";

/* =========================================================================
   PRODUCT FILTERS COMPONENT
   ========================================================================= */

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onChange: (updated: ProductFiltersType) => void;
  onClearAll: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  totalResultsCount?: number;
}

export function ProductFilters({
  filters,
  onChange,
  onClearAll,
  isMobile = false,
  isOpen = false,
  onClose,
  totalResultsCount,
}: ProductFiltersProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [sliderMax, setSliderMax] = useState<number>(filters.maxPrice || 10000);

  const categories = showAllCategories ? ALL_PRODUCT_CATEGORIES : PRODUCT_CATEGORIES;

  // Active filters count
  const hasActiveFilters =
    (filters.category && filters.category !== "all") ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    (filters.maxDistanceKm !== undefined && filters.maxDistanceKm < Infinity) ||
    Boolean(filters.availability.inStockOnly) ||
    Boolean(filters.availability.pickupAvailable) ||
    Boolean(filters.availability.onlineDeliveryAvailable) ||
    Boolean(filters.offers.discountOnly) ||
    Boolean(filters.offers.specialOffersOnly) ||
    (filters.minRating !== undefined && filters.minRating > 0);

  const handleCategorySelect = (cat: string) => {
    onChange({
      ...filters,
      category: filters.category === cat ? "all" : cat,
    });
  };

  const handlePriceMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === "" ? undefined : Math.max(0, Number(e.target.value));
    onChange({
      ...filters,
      minPrice: val,
    });
  };

  const handlePriceMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === "" ? undefined : Math.max(0, Number(e.target.value));
    setSliderMax(val || 10000);
    onChange({
      ...filters,
      maxPrice: val,
    });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderMax(val);
    onChange({
      ...filters,
      maxPrice: val >= 10000 ? undefined : val,
    });
  };

  const handleDistanceSelect = (maxKm: number) => {
    onChange({
      ...filters,
      maxDistanceKm: maxKm,
    });
  };

  const handleAvailabilityToggle = (key: keyof ProductFiltersType["availability"]) => {
    onChange({
      ...filters,
      availability: {
        ...filters.availability,
        [key]: !filters.availability[key],
      },
    });
  };

  const handleOfferToggle = (key: keyof ProductFiltersType["offers"]) => {
    onChange({
      ...filters,
      offers: {
        ...filters.offers,
        [key]: !filters.offers[key],
      },
    });
  };

  const handleRatingSelect = (rating: number) => {
    onChange({
      ...filters,
      minRating: filters.minRating === rating ? undefined : rating,
    });
  };

  const content = (
    <>
      {/* 1. Categories */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Categories</span>
        </div>
        <div className={styles.categoryList}>
          <label className={styles.categoryItem}>
            <div className={styles.categoryRadioLabel}>
              <input
                type="radio"
                name="productCategory"
                checked={!filters.category || filters.category === "all"}
                onChange={() => handleCategorySelect("all")}
                className={styles.categoryRadio}
              />
              <span>All Categories</span>
            </div>
          </label>
          {categories.map((cat) => (
            <label key={cat} className={styles.categoryItem}>
              <div className={styles.categoryRadioLabel}>
                <input
                  type="radio"
                  name="productCategory"
                  checked={filters.category === cat}
                  onChange={() => handleCategorySelect(cat)}
                  className={styles.categoryRadio}
                />
                <span>{cat}</span>
              </div>
            </label>
          ))}
          {!showAllCategories && (
            <button
              type="button"
              className={styles.viewAllCategoriesBtn}
              onClick={() => setShowAllCategories(true)}
            >
              <span>View all categories</span>
              <ChevronDown size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Price Range */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Price Range (Rs.)</span>
        </div>
        <div className={styles.priceInputs}>
          <div className={styles.priceInputGroup}>
            <span className={styles.pricePrefix}>Rs.</span>
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice ?? ""}
              onChange={handlePriceMinChange}
              className={styles.priceInput}
              aria-label="Minimum price in rupees"
            />
          </div>
          <span className={styles.priceDash}>–</span>
          <div className={styles.priceInputGroup}>
            <span className={styles.pricePrefix}>Rs.</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice ?? ""}
              onChange={handlePriceMaxChange}
              className={styles.priceInput}
              aria-label="Maximum price in rupees"
            />
          </div>
        </div>
        <div className={styles.sliderContainer}>
          <input
            type="range"
            min={0}
            max={10000}
            step={250}
            value={sliderMax}
            onChange={handleSliderChange}
            className={styles.rangeSlider}
            aria-label="Price range upper limit slider"
          />
          <div className={styles.sliderLabels}>
            <span>Rs. 0</span>
            <span>Up to Rs. {sliderMax.toLocaleString("en-IN")}+</span>
          </div>
        </div>
      </div>

      {/* 3. Distance */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Distance</span>
        </div>
        <div className={styles.optionsList}>
          {DISTANCE_OPTIONS.map((opt) => {
            const isSelected =
              filters.maxDistanceKm === opt.maxKm ||
              (opt.maxKm === Infinity && (filters.maxDistanceKm === undefined || filters.maxDistanceKm === Infinity));
            return (
              <label key={opt.label} className={styles.checkboxLabel}>
                <input
                  type="radio"
                  name="productDistance"
                  checked={isSelected}
                  onChange={() => handleDistanceSelect(opt.maxKm)}
                  className={styles.categoryRadio}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Availability */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Availability</span>
        </div>
        <div className={styles.optionsList}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={Boolean(filters.availability.inStockOnly)}
              onChange={() => handleAvailabilityToggle("inStockOnly")}
              className={styles.checkbox}
            />
            <span>In stock</span>
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={Boolean(filters.availability.pickupAvailable)}
              onChange={() => handleAvailabilityToggle("pickupAvailable")}
              className={styles.checkbox}
            />
            <span>Available for pickup</span>
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={Boolean(filters.availability.onlineDeliveryAvailable)}
              onChange={() => handleAvailabilityToggle("onlineDeliveryAvailable")}
              className={styles.checkbox}
            />
            <span>Online delivery available</span>
          </label>
        </div>
      </div>

      {/* 5. Offers */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Offers & Deals</span>
        </div>
        <div className={styles.optionsList}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={Boolean(filters.offers.discountOnly)}
              onChange={() => handleOfferToggle("discountOnly")}
              className={styles.checkbox}
            />
            <span>Products on discount</span>
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={Boolean(filters.offers.specialOffersOnly)}
              onChange={() => handleOfferToggle("specialOffersOnly")}
              className={styles.checkbox}
            />
            <span>Special offers</span>
          </label>
        </div>
      </div>

      {/* 6. Rating */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Customer Rating</span>
        </div>
        <div className={styles.optionsList}>
          <label className={styles.ratingOption}>
            <input
              type="radio"
              name="productRating"
              checked={filters.minRating === 4}
              onChange={() => handleRatingSelect(4)}
              className={styles.categoryRadio}
            />
            <div className={styles.starsRow}>
              {[...Array(4)].map((_, i) => (
                <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
              ))}
              <Star size={13} color="#cbd5e1" />
            </div>
            <span>4 stars and above</span>
          </label>
          <label className={styles.ratingOption}>
            <input
              type="radio"
              name="productRating"
              checked={filters.minRating === 3}
              onChange={() => handleRatingSelect(3)}
              className={styles.categoryRadio}
            />
            <div className={styles.starsRow}>
              {[...Array(3)].map((_, i) => (
                <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
              ))}
              <Star size={13} color="#cbd5e1" />
              <Star size={13} color="#cbd5e1" />
            </div>
            <span>3 stars and above</span>
          </label>
        </div>
      </div>
    </>
  );

  // If mobile bottom sheet
  if (isMobile) {
    if (!isOpen) return null;
    return (
      <div className={styles.mobileBackdrop} onClick={onClose} role="dialog" aria-modal="true" aria-label="Filters">
        <div className={styles.bottomSheet} onClick={(e) => e.stopPropagation()}>
          <div className={styles.sheetHeader}>
            <div className={styles.sheetHandle} />
            <h2 className={styles.sheetTitle}>
              <Filter size={18} />
              <span>Filter Products</span>
            </h2>
            <button
              type="button"
              className={styles.closeSheetBtn}
              onClick={onClose}
              aria-label="Close filters"
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.sheetBody}>{content}</div>

          <div className={styles.sheetFooter}>
            <button
              type="button"
              className={styles.mobileClearBtn}
              onClick={onClearAll}
              disabled={!hasActiveFilters}
            >
              Clear all
            </button>
            <button
              type="button"
              className={styles.mobileApplyBtn}
              onClick={onClose}
            >
              <Check size={16} />
              <span>
                Show results {totalResultsCount !== undefined ? `(${totalResultsCount})` : ""}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Sticky Sidebar
  return (
    <aside className={styles.desktopSidebar} aria-label="Product filters">
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>
          <Filter size={16} />
          <span>Filters</span>
        </h2>
        <button
          type="button"
          className={styles.clearAllBtn}
          onClick={onClearAll}
          disabled={!hasActiveFilters}
        >
          Clear all
        </button>
      </div>
      {content}
    </aside>
  );
}

/* =========================================================================
   STORE FILTERS COMPONENT
   ========================================================================= */

interface StoreFiltersProps {
  filters: StoreFiltersType;
  onChange: (updated: StoreFiltersType) => void;
  onClearAll: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  totalResultsCount?: number;
}

export function StoreFilters({
  filters,
  onChange,
  onClearAll,
  isMobile = false,
  isOpen = false,
  onClose,
  totalResultsCount,
}: StoreFiltersProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);

  const categories = showAllCategories ? ALL_STORE_CATEGORIES : STORE_CATEGORIES;

  const hasActiveFilters =
    (filters.category && filters.category !== "all") ||
    (filters.maxDistanceKm !== undefined && filters.maxDistanceKm < Infinity) ||
    Boolean(filters.availability.openNow) ||
    Boolean(filters.availability.openToday) ||
    Boolean(filters.shoppingOptions.pickup) ||
    Boolean(filters.shoppingOptions.onlineDelivery) ||
    Boolean(filters.shoppingOptions.both) ||
    Boolean(filters.verifiedOnly) ||
    (filters.minRating !== undefined && filters.minRating > 0);

  const handleCategorySelect = (cat: string) => {
    onChange({
      ...filters,
      category: filters.category === cat ? "all" : cat,
    });
  };

  const handleDistanceSelect = (maxKm: number) => {
    onChange({
      ...filters,
      maxDistanceKm: maxKm,
    });
  };

  const handleAvailabilityToggle = (key: keyof StoreFiltersType["availability"]) => {
    onChange({
      ...filters,
      availability: {
        ...filters.availability,
        [key]: !filters.availability[key],
      },
    });
  };

  const handleShoppingOptionToggle = (key: keyof StoreFiltersType["shoppingOptions"]) => {
    onChange({
      ...filters,
      shoppingOptions: {
        ...filters.shoppingOptions,
        [key]: !filters.shoppingOptions[key],
      },
    });
  };

  const handleRatingSelect = (rating: number) => {
    onChange({
      ...filters,
      minRating: filters.minRating === rating ? undefined : rating,
    });
  };

  const content = (
    <>
      {/* 1. Store Categories */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Store Categories</span>
        </div>
        <div className={styles.categoryList}>
          <label className={styles.categoryItem}>
            <div className={styles.categoryRadioLabel}>
              <input
                type="radio"
                name="storeCategory"
                checked={!filters.category || filters.category === "all"}
                onChange={() => handleCategorySelect("all")}
                className={styles.categoryRadio}
              />
              <span>All Categories</span>
            </div>
          </label>
          {categories.map((cat) => (
            <label key={cat} className={styles.categoryItem}>
              <div className={styles.categoryRadioLabel}>
                <input
                  type="radio"
                  name="storeCategory"
                  checked={filters.category === cat}
                  onChange={() => handleCategorySelect(cat)}
                  className={styles.categoryRadio}
                />
                <span>{cat}</span>
              </div>
            </label>
          ))}
          {!showAllCategories && (
            <button
              type="button"
              className={styles.viewAllCategoriesBtn}
              onClick={() => setShowAllCategories(true)}
            >
              <span>View all categories</span>
              <ChevronDown size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Distance */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Distance</span>
        </div>
        <div className={styles.optionsList}>
          {DISTANCE_OPTIONS.map((opt) => {
            const isSelected =
              filters.maxDistanceKm === opt.maxKm ||
              (opt.maxKm === Infinity && (filters.maxDistanceKm === undefined || filters.maxDistanceKm === Infinity));
            return (
              <label key={opt.label} className={styles.checkboxLabel}>
                <input
                  type="radio"
                  name="storeDistance"
                  checked={isSelected}
                  onChange={() => handleDistanceSelect(opt.maxKm)}
                  className={styles.categoryRadio}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Store Availability */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Store Availability</span>
        </div>
        <div className={styles.optionsList}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={Boolean(filters.availability.openNow)}
              onChange={() => handleAvailabilityToggle("openNow")}
              className={styles.checkbox}
            />
            <span>Open now</span>
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={Boolean(filters.availability.openToday)}
              onChange={() => handleAvailabilityToggle("openToday")}
              className={styles.checkbox}
            />
            <span>Open today</span>
          </label>
        </div>
      </div>

      {/* 4. Shopping Options */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Shopping Options</span>
        </div>
        <div className={styles.optionsList}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={Boolean(filters.shoppingOptions.pickup)}
              onChange={() => handleShoppingOptionToggle("pickup")}
              className={styles.checkbox}
            />
            <span>Available for pickup</span>
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={Boolean(filters.shoppingOptions.onlineDelivery)}
              onChange={() => handleShoppingOptionToggle("onlineDelivery")}
              className={styles.checkbox}
            />
            <span>Online delivery available</span>
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={Boolean(filters.shoppingOptions.both)}
              onChange={() => handleShoppingOptionToggle("both")}
              className={styles.checkbox}
            />
            <span>Pickup & online delivery</span>
          </label>
        </div>
      </div>

      {/* 5. Verification */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Store Verification</span>
        </div>
        <div className={styles.optionsList}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={Boolean(filters.verifiedOnly)}
              onChange={() => onChange({ ...filters, verifiedOnly: !filters.verifiedOnly })}
              className={styles.checkbox}
            />
            <span>Verified stores only</span>
          </label>
        </div>
      </div>

      {/* 6. Rating */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Store Rating</span>
        </div>
        <div className={styles.optionsList}>
          <label className={styles.ratingOption}>
            <input
              type="radio"
              name="storeRating"
              checked={filters.minRating === 4}
              onChange={() => handleRatingSelect(4)}
              className={styles.categoryRadio}
            />
            <div className={styles.starsRow}>
              {[...Array(4)].map((_, i) => (
                <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
              ))}
              <Star size={13} color="#cbd5e1" />
            </div>
            <span>4 stars and above</span>
          </label>
          <label className={styles.ratingOption}>
            <input
              type="radio"
              name="storeRating"
              checked={filters.minRating === 3}
              onChange={() => handleRatingSelect(3)}
              className={styles.categoryRadio}
            />
            <div className={styles.starsRow}>
              {[...Array(3)].map((_, i) => (
                <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
              ))}
              <Star size={13} color="#cbd5e1" />
              <Star size={13} color="#cbd5e1" />
            </div>
            <span>3 stars and above</span>
          </label>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    if (!isOpen) return null;
    return (
      <div className={styles.mobileBackdrop} onClick={onClose} role="dialog" aria-modal="true" aria-label="Filters">
        <div className={styles.bottomSheet} onClick={(e) => e.stopPropagation()}>
          <div className={styles.sheetHeader}>
            <div className={styles.sheetHandle} />
            <h2 className={styles.sheetTitle}>
              <Filter size={18} />
              <span>Filter Stores</span>
            </h2>
            <button
              type="button"
              className={styles.closeSheetBtn}
              onClick={onClose}
              aria-label="Close filters"
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.sheetBody}>{content}</div>

          <div className={styles.sheetFooter}>
            <button
              type="button"
              className={styles.mobileClearBtn}
              onClick={onClearAll}
              disabled={!hasActiveFilters}
            >
              Clear all
            </button>
            <button
              type="button"
              className={styles.mobileApplyBtn}
              onClick={onClose}
            >
              <Check size={16} />
              <span>
                Show results {totalResultsCount !== undefined ? `(${totalResultsCount})` : ""}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className={styles.desktopSidebar} aria-label="Store filters">
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>
          <Filter size={16} />
          <span>Filters</span>
        </h2>
        <button
          type="button"
          className={styles.clearAllBtn}
          onClick={onClearAll}
          disabled={!hasActiveFilters}
        >
          Clear all
        </button>
      </div>
      {content}
    </aside>
  );
}
