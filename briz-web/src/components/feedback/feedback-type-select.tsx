"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { FEEDBACK_TYPES, type FeedbackType } from "./feedback-data";
import styles from "./feedback.module.css";

type Props = {
  id: string;
  value: FeedbackType | "";
  invalid: boolean;
  describedBy?: string;
  disabled?: boolean;
  onChange: (value: FeedbackType) => void;
  onClose: () => void;
};

/** Select that opens as a dropdown on desktop and a bottom sheet on phones. */
export function FeedbackTypeSelect({ id, value, invalid, describedBy, disabled, onChange, onClose }: Props) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function close(restoreFocus = true) {
    setOpen(false);
    onClose();
    if (restoreFocus) triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    const selected = value ? FEEDBACK_TYPES.indexOf(value) : 0;
    optionRefs.current[selected]?.focus();

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        onClose();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
    // Runs only when the list opens; value and onClose are read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleTriggerKey(event: KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
    }
  }

  function handleListKey(event: KeyboardEvent) {
    const current = optionRefs.current.findIndex((option) => option === document.activeElement);
    const last = FEEDBACK_TYPES.length - 1;
    const moves: Record<string, number> = {
      ArrowDown: Math.min(current + 1, last),
      ArrowUp: Math.max(current - 1, 0),
      Home: 0,
      End: last,
    };
    if (event.key in moves) {
      event.preventDefault();
      optionRefs.current[moves[event.key]]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      close(false);
    }
  }

  return (
    <div className={styles.select} ref={rootRef}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={styles.control}
        data-placeholder={!value}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        data-invalid={invalid}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={handleTriggerKey}
      >
        <span>{value || "Select feedback type"}</span>
        <ChevronDown size={20} className={styles.selectChevron} aria-hidden="true" />
      </button>

      {open && (
        <>
          <div className={styles.sheetBackdrop} onClick={() => close()} aria-hidden="true" />
          <div className={styles.sheet}>
            <div className={styles.sheetHead}>
              <span>Feedback type</span>
              <button type="button" className={styles.iconButton} aria-label="Close" onClick={() => close()}>
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div id={listId} role="listbox" aria-label="Feedback type" onKeyDown={handleListKey}>
              {FEEDBACK_TYPES.map((option, index) => (
                <button
                  key={option}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  type="button"
                  role="option"
                  aria-selected={option === value}
                  className={styles.option}
                  onClick={() => {
                    onChange(option);
                    close();
                  }}
                >
                  {option}
                  {option === value && <Check size={20} aria-hidden="true" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
