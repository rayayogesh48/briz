"use client";

import React from "react";
import { X, RotateCcw } from "lucide-react";
import type { ProductFilters, StoreFilters } from "@/data/featured-data";
import styles from "./featured-filter-chips.module.css";

interface ActiveChip {
  id: string;
  label: string;
  onRemove: () => void;
}

interface ProductFilterChipsProps {
  type: "products";
  filters: ProductFilters;
  onChange: (updated: ProductFilters) => void;
  onClearAll: () => void;
}

interface StoreFilterChipsProps {
  type: "stores";
  filters: StoreFilters;
  onChange: (updated: StoreFilters) => void;
  onClearAll: () => void;
}

type FeaturedFilterChipsProps = ProductFilterChipsProps | StoreFilterChipsProps;

export function FeaturedFilterChips(props: FeaturedFilterChipsProps) {
  const chips: ActiveChip[] = [];

  if (props.type === "products") {
    const { filters, onChange } = props;

    if (filters.category && filters.category !== "all") {
      chips.push({
        id: "category",
        label: `Category: ${filters.category}`,
        onRemove: () => onChange({ ...filters, category: "all" }),
      });
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const minText = filters.minPrice !== undefined ? `Rs. ${filters.minPrice.toLocaleString("en-IN")}` : "Rs. 0";
      const maxText = filters.maxPrice !== undefined ? `Rs. ${filters.maxPrice.toLocaleString("en-IN")}` : "Max";
      chips.push({
        id: "price",
        label: `Price: ${minText} – ${maxText}`,
        onRemove: () => onChange({ ...filters, minPrice: undefined, maxPrice: undefined }),
      });
    }

    if (filters.maxDistanceKm !== undefined && filters.maxDistanceKm < Infinity) {
      chips.push({
        id: "distance",
        label: `Within ${filters.maxDistanceKm} km`,
        onRemove: () => onChange({ ...filters, maxDistanceKm: Infinity }),
      });
    }

    if (filters.availability.inStockOnly) {
      chips.push({
        id: "inStock",
        label: "In Stock",
        onRemove: () =>
          onChange({
            ...filters,
            availability: { ...filters.availability, inStockOnly: false },
          }),
      });
    }

    if (filters.availability.pickupAvailable) {
      chips.push({
        id: "pickup",
        label: "Pickup Available",
        onRemove: () =>
          onChange({
            ...filters,
            availability: { ...filters.availability, pickupAvailable: false },
          }),
      });
    }

    if (filters.availability.onlineDeliveryAvailable) {
      chips.push({
        id: "onlineDelivery",
        label: "Online Delivery",
        onRemove: () =>
          onChange({
            ...filters,
            availability: { ...filters.availability, onlineDeliveryAvailable: false },
          }),
      });
    }

    if (filters.offers.discountOnly) {
      chips.push({
        id: "discount",
        label: "Discounted",
        onRemove: () =>
          onChange({
            ...filters,
            offers: { ...filters.offers, discountOnly: false },
          }),
      });
    }

    if (filters.offers.specialOffersOnly) {
      chips.push({
        id: "specialOffers",
        label: "Special Offers",
        onRemove: () =>
          onChange({
            ...filters,
            offers: { ...filters.offers, specialOffersOnly: false },
          }),
      });
    }

    if (filters.minRating !== undefined && filters.minRating > 0) {
      chips.push({
        id: "rating",
        label: `${filters.minRating}+ Stars`,
        onRemove: () => onChange({ ...filters, minRating: undefined }),
      });
    }
  } else {
    const { filters, onChange } = props;

    if (filters.category && filters.category !== "all") {
      chips.push({
        id: "category",
        label: `Category: ${filters.category}`,
        onRemove: () => onChange({ ...filters, category: "all" }),
      });
    }

    if (filters.maxDistanceKm !== undefined && filters.maxDistanceKm < Infinity) {
      chips.push({
        id: "distance",
        label: `Within ${filters.maxDistanceKm} km`,
        onRemove: () => onChange({ ...filters, maxDistanceKm: Infinity }),
      });
    }

    if (filters.availability.openNow) {
      chips.push({
        id: "openNow",
        label: "Open Now",
        onRemove: () =>
          onChange({
            ...filters,
            availability: { ...filters.availability, openNow: false },
          }),
      });
    }

    if (filters.availability.openToday) {
      chips.push({
        id: "openToday",
        label: "Open Today",
        onRemove: () =>
          onChange({
            ...filters,
            availability: { ...filters.availability, openToday: false },
          }),
      });
    }

    if (filters.shoppingOptions.pickup) {
      chips.push({
        id: "pickup",
        label: "Pickup",
        onRemove: () =>
          onChange({
            ...filters,
            shoppingOptions: { ...filters.shoppingOptions, pickup: false },
          }),
      });
    }

    if (filters.shoppingOptions.onlineDelivery) {
      chips.push({
        id: "onlineDelivery",
        label: "Online Delivery",
        onRemove: () =>
          onChange({
            ...filters,
            shoppingOptions: { ...filters.shoppingOptions, onlineDelivery: false },
          }),
      });
    }

    if (filters.shoppingOptions.both) {
      chips.push({
        id: "both",
        label: "Pickup & Online Delivery",
        onRemove: () =>
          onChange({
            ...filters,
            shoppingOptions: { ...filters.shoppingOptions, both: false },
          }),
      });
    }

    if (filters.verifiedOnly) {
      chips.push({
        id: "verifiedOnly",
        label: "Verified Only",
        onRemove: () => onChange({ ...filters, verifiedOnly: false }),
      });
    }

    if (filters.minRating !== undefined && filters.minRating > 0) {
      chips.push({
        id: "rating",
        label: `${filters.minRating}+ Stars`,
        onRemove: () => onChange({ ...filters, minRating: undefined }),
      });
    }
  }

  if (chips.length === 0) return null;

  return (
    <div className={styles.chipsContainer} aria-label="Active filters">
      <div className={styles.chipsList}>
        {chips.map((chip) => (
          <span key={chip.id} className={styles.chip}>
            <span className={styles.chipText}>{chip.label}</span>
            <button
              type="button"
              onClick={chip.onRemove}
              className={styles.removeChipBtn}
              aria-label={`Remove filter: ${chip.label}`}
            >
              <X size={12} aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={props.onClearAll}
        className={styles.clearAllLink}
        aria-label="Clear all active filters"
      >
        <RotateCcw size={12} aria-hidden="true" />
        <span>Clear all</span>
      </button>
    </div>
  );
}
