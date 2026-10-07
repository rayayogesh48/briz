"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, X, ChevronRight, ExternalLink } from "lucide-react";
import { SYSTEM_STATE_PRESETS, SYSTEM_STATE_CATEGORIES } from "./system-states-data";
import { SHOPPER_EXPRESSIONS } from "@/components/briz-shopper";
import styles from "./state-preview-launcher.module.css";

export function StatePreviewLauncher() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  // Close popup menu on route change
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setIsOpen(false);
  }

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Don't show launcher if we are already on /dev/states, or allow toggle
  const isAlreadyOnDevStates = pathname === "/dev/states";

  if (isMinimized) {
    return (
      <button
        type="button"
        className={styles.minimizedPill}
        onClick={() => setIsMinimized(false)}
        aria-label="Expand System States Preview button"
        title="Show System States Preview button"
      >
        <Layers size={15} />
      </button>
    );
  }

  return (
    <aside
      className={styles.launcherContainer}
      aria-label="System States Development Tool"
      data-testid="briz-state-preview-launcher"
    >
      {/* Quick Jump Drawer Popover */}
      {isOpen && (
        <div
          className={styles.popoverMenu}
          role="dialog"
          aria-modal="true"
          aria-label="System States Quick Menu"
        >
          <div className={styles.popoverHeader}>
            <div className={styles.popoverHeaderTitle}>
              <Layers size={16} className={styles.headerIcon} />
              <span>System States & Errors</span>
            </div>
            <div className={styles.popoverHeaderActions}>
              <Link
                href="/featured-products"
                className={styles.fullGalleryLink}
                onClick={() => setIsOpen(false)}
                title="Open Featured Products Page"
              >
                <span>Products</span>
                <ExternalLink size={12} />
              </Link>
              <Link
                href="/featured-stores"
                className={styles.fullGalleryLink}
                onClick={() => setIsOpen(false)}
                title="Open Featured Stores Page"
              >
                <span>Stores</span>
                <ExternalLink size={12} />
              </Link>
              <Link
                href="/previewer"
                className={styles.fullGalleryLink}
                onClick={() => setIsOpen(false)}
                title="Open Product Image Previewer"
              >
                <span>Previewer</span>
                <ExternalLink size={12} />
              </Link>
              <Link
                href="/dev/mascot"
                className={styles.fullGalleryLink}
                onClick={() => setIsOpen(false)}
                title="Open mascot expressions gallery"
              >
                <span>Mascot</span>
                <ExternalLink size={12} />
              </Link>
              <Link
                href="/dev/states"
                className={styles.fullGalleryLink}
                onClick={() => setIsOpen(false)}
                title="Open complete gallery page"
              >
                <span>States</span>
                <ExternalLink size={12} />
              </Link>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
                aria-label="Close state quick menu"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div className={styles.popoverList}>
            {SYSTEM_STATE_CATEGORIES.map((category) => {
              const statesInCategory = Object.values(SYSTEM_STATE_PRESETS).filter(
                (preset) => preset.category === category.id
              );

              return (
                <div key={category.id} className={styles.categorySection}>
                  <div className={styles.categoryHeading}>{category.label}</div>
                  <div className={styles.categoryGrid}>
                    {statesInCategory.map((state) => (
                      <Link
                        key={state.id}
                        href={`/dev/states?state=${state.id}`}
                        className={styles.stateItem}
                        onClick={() => setIsOpen(false)}
                      >
                        <span className={styles.stateItemName}>{state.title}</span>
                        <ChevronRight size={12} className={styles.itemChevron} />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Briz shopper mascot: one entry per expression, opening the gallery at that pose */}
            <div className={styles.categorySection}>
              <div className={styles.categoryHeading}>Mascot expressions</div>
              <div className={styles.categoryGrid}>
                {SHOPPER_EXPRESSIONS.map((expression) => (
                  <Link
                    key={expression}
                    href={`/dev/mascot#${expression}`}
                    className={styles.stateItem}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className={styles.stateItemName}>{expression}</span>
                    <ChevronRight size={12} className={styles.itemChevron} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Launcher Button */}
      <div className={styles.buttonGroup}>
        <Link
          href="/dev/states"
          className={`${styles.primaryLauncherBtn} ${isAlreadyOnDevStates ? styles.activePage : ""}`}
          aria-label="Open System States Preview gallery"
        >
          <Layers size={15} />
          <span className={styles.btnLabel}>States Preview</span>
          <span className={styles.badge}>{Object.keys(SYSTEM_STATE_PRESETS).length}</span>
        </Link>

        <button
          type="button"
          className={styles.quickToggleBtn}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle Quick States Menu"
          title="Quick States Menu"
        >
          <span className={styles.caret}>{isOpen ? "✕" : "▲"}</span>
        </button>

        <button
          type="button"
          className={styles.minimizeBtn}
          onClick={() => setIsMinimized(true)}
          aria-label="Minimize preview button"
          title="Minimize button"
        >
          <span className={styles.dash}>−</span>
        </button>
      </div>
    </aside>
  );
}
