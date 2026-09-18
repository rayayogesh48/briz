"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./sort-dropdown.module.css";

interface SortDropdownProps {
  label?: string;
  value: string;
  options: Record<string, string>;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
}

export function SortDropdown({
  label = "Sort by:",
  value,
  options,
  onChange,
  className = "",
  ariaLabel,
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  const entries = Object.entries(options);
  const activeLabel = options[value] || entries[0]?.[1] || "Select";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setIsOpen(true);
        const currentIndex = entries.findIndex(([k]) => k === value);
        setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
      }
      return;
    }

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case "ArrowDown":
        event.preventDefault();
        setFocusedIndex(prev => (prev + 1) % entries.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setFocusedIndex(prev => (prev - 1 + entries.length) % entries.length);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (focusedIndex >= 0 && entries[focusedIndex]) {
          onChange(entries[focusedIndex][0]);
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (key: string) => {
    onChange(key);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.sortControl} ${className}`}
      onKeyDown={handleKeyDown}
      data-node-id="787:28094"
    >
      <label id={labelId} className={styles.label}>
        {label}
      </label>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={labelId}
        aria-label={ariaLabel || label}
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span className={styles.triggerValue}>{activeLabel}</span>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}>
          <Image
            src="/figma/results/sort-chevron-down.svg"
            width={16}
            height={16}
            alt=""
            unoptimized
          />
        </span>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={styles.menu}
          role="listbox"
          aria-labelledby={labelId}
          data-node-id="832:40193"
        >
          {entries.map(([key, optLabel], index) => {
            const isSelected = key === value;
            const isFocused = index === focusedIndex;
            return (
              <button
                key={key}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`${styles.menuItem} ${isSelected ? styles.menuItemSelected : ""} ${
                  isFocused ? styles.menuItemFocus : ""
                }`}
                onClick={() => handleSelect(key)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <span
                  className={`${styles.checkIcon} ${isSelected ? "" : styles.checkHidden}`}
                >
                  <Image
                    src="/figma/results/sort-check.svg"
                    width={16}
                    height={16}
                    alt=""
                    unoptimized
                  />
                </span>
                <span>{optLabel}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

