"use client";

import React from "react";
import { SlidersHorizontal } from "lucide-react";
import styles from "./featured-state-bar.module.css";

export type FeaturedPageStateMode =
  | "default"
  | "filters-applied"
  | "filter-sidebar-open"
  | "mobile-filters-open"
  | "sorting-open"
  | "loading"
  | "no-results"
  | "no-location"
  | "server-error"
  | "final-page";

interface FeaturedStateBarProps {
  currentMode: FeaturedPageStateMode;
  onSelectMode: (mode: FeaturedPageStateMode) => void;
  type?: "products" | "stores";
}

const STATE_OPTIONS: { id: FeaturedPageStateMode; label: string; number: number }[] = [
  { id: "default", label: "1. Default", number: 1 },
  { id: "filters-applied", label: "2. Filters Applied", number: 2 },
  { id: "filter-sidebar-open", label: "3. Sidebar Open", number: 3 },
  { id: "mobile-filters-open", label: "4. Mobile Sheet Open", number: 4 },
  { id: "sorting-open", label: "5. Sorting Open", number: 5 },
  { id: "loading", label: "6. Loading Skeleton", number: 6 },
  { id: "no-results", label: "7. No Matches Found", number: 7 },
  { id: "no-location", label: "8. Location Unavailable", number: 8 },
  { id: "server-error", label: "9. Server Error", number: 9 },
  { id: "final-page", label: "10. Viewed All Results", number: 10 },
];

export function FeaturedStateBar({
  currentMode,
  onSelectMode,
}: FeaturedStateBarProps) {
  return (
    <nav className={styles.bar} aria-label="Interactive State Preview Switcher">
      <div className={styles.barLabel}>
        <SlidersHorizontal size={14} aria-hidden="true" />
        <span>10 Shared States:</span>
      </div>
      <div className={styles.pillsList} role="tablist">
        {STATE_OPTIONS.map((opt) => {
          const isActive = currentMode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles.pillBtn} ${isActive ? styles.pillBtnActive : ""}`}
              onClick={() => onSelectMode(opt.id)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
