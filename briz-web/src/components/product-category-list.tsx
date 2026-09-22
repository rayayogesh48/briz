"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type KeyboardEvent,
} from "react";
import styles from "./product-category-list.module.css";

export interface ProductCategoryListProps {
  /** List of category names */
  categories?: string[];
  /** Controlled selected category name */
  selected?: string;
  /** Uncontrolled initial selected category */
  defaultSelected?: string;
  /** Callback fired when a category is selected */
  onSelect?: (category: string) => void;
  /** Background color for seamless gradient overlays (default: "#f9f9f9") */
  backgroundColor?: string;
  /** Maximum width in px for unselected item labels before truncation (default: 160) */
  maxItemWidth?: number;
  /** Custom CSS class for the container */
  className?: string;
  /** Accessible label for the navigation tablist */
  ariaLabel?: string;
  /** Figma Node ID attribute */
  dataNodeId?: string;
}

function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/**
 * ProductCategoryList component matching Figma node 946:103107.
 * Features:
 * - Dynamic scroll detection with 152px gradient overlays matching Figma variants:
 *   - "Less category": All items fit, no gradients or buttons
 *   - "default": Scrolled at start, right gradient + chevron right
 *   - "scroll": Scrolled in middle, both left & right gradients + chevrons
 *   - "end": Scrolled to end, left gradient + chevron left
 * - Truncation of long category names with ellipsis, expanding fully when selected.
 * - Auto-scrolling selected items into view.
 * - Keyboard navigation (Arrow keys, Home, End, Enter, Space).
 * - Touch and drag scrolling with momentum.
 */
export function ProductCategoryList({
  categories = [],
  selected,
  defaultSelected,
  onSelect,
  backgroundColor = "#f9f9f9",
  maxItemWidth = 160,
  className,
  ariaLabel = "Product categories",
  dataNodeId = "946:103107",
}: ProductCategoryListProps) {
  const items = useMemo(() => categories || [], [categories]);

  // Determine active category (controlled vs uncontrolled)
  const initialCategory = defaultSelected || (items[0] ?? "");
  const [internalSelected, setInternalSelected] = useState(initialCategory);
  const currentSelected = selected !== undefined ? selected : internalSelected;

  // Track DOM element ref
  const trackRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Scroll visibility states
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Determine Figma variant property1 for inspection and styling
  const variant: "Less category" | "default" | "scroll" | "end" = useMemo(() => {
    if (!canScrollLeft && !canScrollRight) return "Less category";
    if (!canScrollLeft && canScrollRight) return "default";
    if (canScrollLeft && canScrollRight) return "scroll";
    return "end";
  }, [canScrollLeft, canScrollRight]);

  const updateScrollBounds = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);

    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < maxScroll - 2);
  }, []);

  // Set up scroll and resize listeners
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateScrollBounds();

    el.addEventListener("scroll", updateScrollBounds, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateScrollBounds();
      });
      resizeObserver.observe(el);
    }

    return () => {
      el.removeEventListener("scroll", updateScrollBounds);
      resizeObserver?.disconnect();
    };
  }, [updateScrollBounds, items]);

  // Edge case: Smoothly scroll active category into view when selected
  useEffect(() => {
    if (!currentSelected) return;
    const pill = pillRefs.current.get(currentSelected);
    if (pill && trackRef.current) {
      pill.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [currentSelected]);

  function handleSelect(name: string) {
    if (selected === undefined) {
      setInternalSelected(name);
    }
    onSelect?.(name);
  }

  function scrollByOffset(offset: number) {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: offset, behavior: "smooth" });
  }

  // Keyboard navigation across tabs
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (items.length === 0) return;
    const currentIndex = items.findIndex(item => item === currentSelected);

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % items.length;
      const nextName = items[nextIndex];
      handleSelect(nextName);
      pillRefs.current.get(nextName)?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + items.length) % items.length;
      const prevName = items[prevIndex];
      handleSelect(prevName);
      pillRefs.current.get(prevName)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      const firstName = items[0];
      handleSelect(firstName);
      pillRefs.current.get(firstName)?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const lastName = items[items.length - 1];
      handleSelect(lastName);
      pillRefs.current.get(lastName)?.focus();
    }
  }

  // Edge case: empty categories
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={`${styles.container} ${className || ""}`}
      style={{
        ["--bg-color" as string]: backgroundColor,
        ["--max-item-width" as string]: `${maxItemWidth}px`,
      }}
      data-node-id={dataNodeId}
      data-name="Product Category list"
      data-variant={variant}
    >
      {/* Left Gradient Overlay & Chevron (shown when scrolled forward: "scroll" or "end") */}
      {canScrollLeft && (
        <div
          className={styles.gradientLeft}
          data-node-id="946:103091"
          data-name="gradient-left"
          aria-hidden="true"
        >
          <button
            type="button"
            className={styles.chevronBtnLeft}
            data-node-id="946:103096"
            data-name="chevron-left"
            onClick={() => scrollByOffset(-240)}
            aria-label="Scroll categories left"
            tabIndex={-1}
          >
            <IconChevronLeft />
          </button>
        </div>
      )}

      {/* Scrollable Track with Pills */}
      <div
        ref={trackRef}
        className={styles.track}
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
      >
        {items.map((cat, idx) => {
          const isSelected = cat === currentSelected;
          return (
            <button
              key={`cat-${idx}-${cat}`}
              ref={(el) => {
                if (el) pillRefs.current.set(cat, el);
                else pillRefs.current.delete(cat);
              }}
              type="button"
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              className={`${styles.pill} ${isSelected ? styles.pillActive : ""}`}
              onClick={() => handleSelect(cat)}
              title={cat}
            >
              <span className={styles.pillLabel}>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Right Gradient Overlay & Chevron (shown when more items to the right: "default" or "scroll") */}
      {canScrollRight && (
        <div
          className={styles.gradientRight}
          data-node-id="946:103085"
          data-name="gradient-right"
          aria-hidden="true"
        >
          <button
            type="button"
            className={styles.chevronBtnRight}
            data-node-id="946:103086"
            data-name="chevron-right"
            onClick={() => scrollByOffset(240)}
            aria-label="Scroll categories right"
            tabIndex={-1}
          >
            <IconChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
