"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { RequestMascot } from "./request-mascot";
import { RequestScanVisual } from "./request-scan-visual";
import { RequestScoutCharacter } from "./request-scout-character";
import { ShopperLauncherContent } from "./request-shopper-launcher";
import { useAttentionHint } from "./use-attention-hint";
import { useCursorLook } from "./use-cursor-look";
import { money } from "./search-results-model";
import { requestsStore } from "@/store/requests-store";
import {
  type RequestFlowStep,
  type RequestDraft,
  type CategoryOption,
  CATEGORY_OPTIONS,
  findCategoryMatches,
  submitRequest,
  INITIAL_REQUEST_DRAFT,
  REQUEST_UNITS,
  REQUEST_IMAGE_TYPES,
  REQUEST_IMAGE_MAX_BYTES,
} from "./request-flow-data";
import styles from "./request-product-widget.module.css";
import panelStyles from "./request-product-panel.module.css";

/**
 * Scroll threshold (in pixels) required to trigger one-way widget expansion.
 */
export const EXPAND_SCROLL_THRESHOLD = 120;

export type RequestWidgetVariant = "mascot" | "scan" | "scout" | "shopper" | "face" | "seller" | "sprite";

export interface RequestProductWidgetProps {
  /**
   * Launcher look. "mascot": white card with the searching shopping-bag character.
   * "scan": Briz-blue tile with a product box being scanned, on a layered card.
   * "sprite": the illustrated v2 character from a nine-direction sprite atlas; the
   * head follows the cursor. Same interaction as "face".
   * "seller": the v2 face drawn as a slightly older shopkeeper. Same interaction as "face".
   * "face": mascot v2 — a face-only character that turns toward the cursor. Same
   * interaction as "shopper".
   * "shopper": the Briz shopper — a chibi character in a blue hoodie with a phone.
   * "scout": Pinu, a map-pin character with a magnifier monocle hunting for a parcel.
   */
  variant?: RequestWidgetVariant;
  /**
   * Launcher colour theme. "dark" is designed for the mascot variant.
   */
  theme?: "light" | "dark";
  /**
   * Callback fired when user activates the launcher.
   * Prepares hooks for the future 360–400px request popover dialog.
   */
  onOpen?: () => void;
  /**
   * Optional custom CSS class for positioning or style overrides.
   */
  className?: string;
  /**
   * Shared layout identifier for seamless transition into the future popover.
   * Defaults to "briz-request-widget".
   */
  layoutId?: string;
  /**
   * Optional initial expansion state override (useful for testing or demos).
   */
  initialExpanded?: boolean;
  /**
   * Optional scroll threshold in pixels (defaults to EXPAND_SCROLL_THRESHOLD = 120).
   */
  scrollThreshold?: number;
  /**
   * Optional initial open state override (useful for testing the expanded panel directly).
   */
  initialOpen?: boolean;
}

/**
 * Delay (in seconds) before the launcher first appears, so the page can settle.
 */
export const ENTRANCE_DELAY = 0.4;

// Launcher variants. The labels (hover, tap) propagate to the mascot layers and
// the arrow, so one gesture moves every part together.
export const widgetEntranceVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.85,
    y: 12,
  },
  // `custom` carries the entrance delay; it is 0 once the launcher has entered.
  animate: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 320,
      damping: 24,
      mass: 0.8,
      delay,
    },
  }),
  hover: {
    y: -3,
    scale: 1.012,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 24,
    },
  },
  tap: {
    scale: 0.985,
  },
};

// Action arrow affordance micro-motion variant
export const arrowVariants: Variants = {
  initial: { x: 0 },
  animate: { x: 0 },
  hover: {
    x: 3,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
  tap: {
    x: 1,
  },
};

const contentStepVariants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 12 : -12,
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -10 : 10,
    transition: {
      duration: 0.16,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export interface RequestProductPanelProps {
  layoutId?: string;
  onClose: () => void;
  draft: RequestDraft;
  onDraftChange: (updater: (prev: RequestDraft) => RequestDraft) => void;
  className?: string;
  initialStep?: RequestFlowStep;
  /** Preview only: start with the required-field errors showing. */
  initialShowErrors?: boolean;
  /** Preview only: the request the success screen links to. */
  initialCreatedId?: string | null;
}

/**
 * Request Product Panel prototype component.
 */
export function RequestProductPanel({
  layoutId = "briz-request-widget",
  onClose,
  draft,
  onDraftChange,
  className,
  initialStep = "form",
  initialShowErrors = false,
  initialCreatedId = null,
}: RequestProductPanelProps) {
  const shouldReduceMotion = useReducedMotion();
  const [step, setStep] = useState<RequestFlowStep>(initialStep);
  const [direction, setDirection] = useState(1);
  const [showValidationError, setShowValidationError] = useState(initialShowErrors);
  const [imageError, setImageError] = useState("");
  // The mock request created on submit; the success screen links to it.
  const [createdId, setCreatedId] = useState<string | null>(initialCreatedId);
  const [categoryChoices, setCategoryChoices] = useState<CategoryOption[]>(() =>
    initialStep === "ambiguity" ? findCategoryMatches(draft.itemName) : []
  );

  const itemNameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Focus item name on initial form mount
  useEffect(() => {
    if (step === "form" && itemNameInputRef.current) {
      itemNameInputRef.current.focus();
    }
  }, [step]);

  // Global escape key to close widget
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Matching step automated transition (500–900ms)
  useEffect(() => {
    if (step === "matching") {
      const duration = shouldReduceMotion ? 120 : 650;
      const timer = setTimeout(() => {
        const matches = findCategoryMatches(draft.itemName);
        setCategoryChoices(matches);
        if (matches.length > 1) {
          setDirection(1);
          setStep("ambiguity");
        } else {
          // One clear match is used as-is. The "general" fallback means nothing matched,
          // so no category is claimed and the request goes ahead on its description.
          const only = matches[0]?.id;
          onDraftChange((prev) => ({
            ...prev,
            categoryId: only && only !== "general" ? only : null,
          }));
          setDirection(1);
          setStep("review");
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [step, draft.itemName, onDraftChange, shouldReduceMotion]);

  // Submitting step automated transition (700–1000ms)
  useEffect(() => {
    if (step === "submitting") {
      const duration = shouldReduceMotion ? 120 : 800;
      const timer = setTimeout(async () => {
        try {
          await submitRequest(draft);
          // Mock record only: Active now, expiring 24 hours later, with no offers yet.
          setCreatedId(
            requestsStore.create({
              itemName: draft.itemName.trim(),
              category: draft.categoryId ? CATEGORY_OPTIONS[draft.categoryId]?.name ?? null : null,
              quantity: draft.quantity,
              unit: draft.unit ?? "Pieces",
              budget: Number(draft.rate),
              description: draft.details.trim(),
              image: draft.imagePreviewUrl,
            })
          );
          setDirection(1);
          setStep("success");
        } catch {
          setDirection(1);
          setStep("error");
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [step, draft, shouldReduceMotion]);

  // Form input handlers
  const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // If item name changes after ambiguity, clear category selection
    onDraftChange((prev) => ({
      ...prev,
      itemName: val,
      categoryId: prev.itemName.trim() !== val.trim() ? null : prev.categoryId,
    }));
  };

  const handleQuantityIncrement = () => {
    onDraftChange((prev) => ({ ...prev, quantity: prev.quantity + 1 }));
  };

  const handleQuantityDecrement = () => {
    onDraftChange((prev) => ({
      ...prev,
      quantity: Math.max(1, prev.quantity - 1),
    }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(val) && val >= 1) {
      onDraftChange((prev) => ({ ...prev, quantity: val }));
    }
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawNumeric = e.target.value.replace(/[^0-9]/g, "");
    onDraftChange((prev) => ({ ...prev, rate: rawNumeric }));
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value.slice(0, 500);
    onDraftChange((prev) => ({ ...prev, details: text }));
  };

  const handleFileSelect = (file: File) => {
    if (!REQUEST_IMAGE_TYPES.includes(file.type)) {
      setImageError("Use a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > REQUEST_IMAGE_MAX_BYTES) {
      setImageError("That image is larger than 5 MB. Choose a smaller one.");
      return;
    }
    setImageError("");
    const url = URL.createObjectURL(file);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    onDraftChange((prev) => {
      if (prev.imagePreviewUrl && prev.imagePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(prev.imagePreviewUrl);
      }
      return {
        ...prev,
        image: file,
        imagePreviewUrl: url,
        imageName: file.name,
        imageSize: sizeInMb,
      };
    });
  };

  const handleRemoveImage = () => {
    onDraftChange((prev) => {
      if (prev.imagePreviewUrl && prev.imagePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(prev.imagePreviewUrl);
      }
      return {
        ...prev,
        image: null,
        imagePreviewUrl: null,
        imageName: undefined,
        imageSize: undefined,
      };
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Continue from form to matching/category check
  // Required fields. Errors only show after Continue has been pressed, and each
  // one clears as soon as its field is fixed.
  const budgetValid = Number(draft.rate) > 0;
  const nameError = showValidationError && !draft.itemName.trim();
  const budgetError = showValidationError && !budgetValid;
  const detailsError = showValidationError && !draft.details.trim();
  const quantityLabel = `${draft.quantity} ${
    draft.quantity === 1 && (draft.unit ?? "Pieces").endsWith("s") ? (draft.unit ?? "Pieces").slice(0, -1) : draft.unit ?? "Pieces"
  }`;
  const errorIcon = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );

  const handleFormContinue = () => {
    if (!draft.itemName.trim() || !budgetValid || !draft.details.trim()) {
      setShowValidationError(true);
      const firstInvalid = !draft.itemName.trim() ? "request-item-name" : !budgetValid ? "request-rate" : "request-details";
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    setShowValidationError(false);
    setDirection(1);
    setStep("matching");
  };

  const selectedCategoryName =
    draft.categoryId && CATEGORY_OPTIONS[draft.categoryId]
      ? CATEGORY_OPTIONS[draft.categoryId].name
      : "Not specified";

  return (
    <motion.aside
      layout
      layoutId={layoutId}
      className={`${panelStyles.panelContainer} ${className || ""}`.trim()}
      aria-label="Request a product panel"
      data-testid="request-widget-panel"
      role="dialog"
      aria-modal="true"
    >
      {/* ─── Header ─── */}
      <div className={panelStyles.header}>
        <div className={panelStyles.headerInfo}>
          <div className={panelStyles.headerMascotBadge} aria-hidden="true">
            <RequestMascot size={26} />
          </div>
          <div className={panelStyles.headerTextGroup}>
            <span className={panelStyles.headerTitle}>Request a product</span>
          </div>
        </div>

        <div className={panelStyles.headerControls}>
          {/* Close / Return to Launcher button */}
          <button
            type="button"
            className={panelStyles.closeButton}
            onClick={onClose}
            aria-label="Close request panel and return to launcher"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

        </div>
      </div>

      <div className={panelStyles.bodyArea}>
        <AnimatePresence mode="wait" custom={direction}>
          {/* STEP 1: REQUEST FORM */}
          {step === "form" && (
            <motion.div
              key="step-form"
              custom={direction}
              variants={shouldReduceMotion ? undefined : contentStepVariants}
              initial={shouldReduceMotion ? undefined : "initial"}
              animate={shouldReduceMotion ? undefined : "animate"}
              exit={shouldReduceMotion ? undefined : "exit"}
            >
              <div className={panelStyles.fieldGroup}>
                {/* 1. Item Name (Required) */}
                <div className={panelStyles.fieldItem}>
                  <label htmlFor="request-item-name" className={panelStyles.fieldLabel}>
                    <span>
                      Item name <span className={panelStyles.requiredAsterisk}>*</span>
                    </span>
                  </label>
                  <input
                    id="request-item-name"
                    ref={itemNameInputRef}
                    type="text"
                    className={`${panelStyles.textInput} ${
                      nameError ? panelStyles.textInputError : ""
                    }`}
                    placeholder="Enter product name"
                    value={draft.itemName}
                    onChange={handleItemNameChange}
                    data-testid="request-item-name"
                    aria-required="true"
                    aria-invalid={nameError}
                    aria-describedby={
                      nameError ? "request-item-name-error" : undefined
                    }
                  />
                  {nameError && (
                    <div
                      id="request-item-name-error"
                      className={panelStyles.inlineErrorMessage}
                      role="alert"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>Please enter the item you’re looking for.</span>
                    </div>
                  )}
                </div>

                <div className={panelStyles.fieldPair}>
                {/* 2. Quantity (Required) */}
                <div className={panelStyles.fieldItem}>
                  <label htmlFor="request-quantity" className={panelStyles.fieldLabel}>
                    <span>
                      Quantity <span className={panelStyles.requiredAsterisk}>*</span>
                    </span>
                  </label>
                  <div className={panelStyles.quantityRow}>
                  <div className={panelStyles.quantityStepper}>
                    <button
                      type="button"
                      className={panelStyles.stepperButton}
                      onClick={handleQuantityDecrement}
                      disabled={draft.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <input
                      id="request-quantity"
                      type="text"
                      inputMode="numeric"
                      className={panelStyles.stepperInput}
                      value={draft.quantity}
                      onChange={handleQuantityChange}
                      data-testid="request-quantity"
                      aria-label="Item quantity"
                    />
                    <button
                      type="button"
                      className={panelStyles.stepperButton}
                      onClick={handleQuantityIncrement}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <select
                    className={panelStyles.unitSelect}
                    aria-label="Unit"
                    value={draft.unit ?? "Pieces"}
                    onChange={(e) => onDraftChange((prev) => ({ ...prev, unit: e.target.value }))}
                    data-testid="request-unit"
                  >
                    {REQUEST_UNITS.map((unit) => (
                      <option key={unit}>{unit}</option>
                    ))}
                  </select>
                  </div>
                </div>

                {/* 3. Rate (Expected Price) */}
                <div className={panelStyles.fieldItem}>
                  <label htmlFor="request-rate" className={panelStyles.fieldLabel}>
                    <span>
                      Budget <span className={panelStyles.requiredAsterisk}>*</span>
                    </span>
                  </label>
                  <div className={`${panelStyles.currencyInputContainer} ${budgetError ? panelStyles.textInputError : ""}`}>
                    <span className={panelStyles.currencyPrefix} aria-hidden="true">
                      Rs.
                    </span>
                    <input
                      id="request-rate"
                      type="text"
                      inputMode="numeric"
                      className={panelStyles.currencyInput}
                      placeholder="Amount"
                      aria-required="true"
                      aria-invalid={budgetError}
                      aria-describedby={budgetError ? "request-rate-error" : undefined}
                      value={
                        draft.rate ? Number(draft.rate).toLocaleString("en-IN") : ""
                      }
                      onChange={handleRateChange}
                      data-testid="request-rate"
                    />
                  </div>
                  {budgetError && (
                    <div id="request-rate-error" className={panelStyles.inlineErrorMessage} role="alert">
                      {errorIcon}
                      <span>Enter a valid budget.</span>
                    </div>
                  )}
                </div>
                </div>

                {/* 4. Item Detail */}
                <div className={panelStyles.fieldItem}>
                  <label htmlFor="request-details" className={panelStyles.fieldLabel}>
                    <span>
                      Item description <span className={panelStyles.requiredAsterisk}>*</span>
                    </span>
                  </label>
                  <textarea
                    id="request-details"
                    className={`${panelStyles.textarea} ${detailsError ? panelStyles.textInputError : ""}`}
                    placeholder="Describe the product, specifications, brand, size, or other important details."
                    aria-required="true"
                    aria-invalid={detailsError}
                    aria-describedby={detailsError ? "request-details-error" : undefined}
                    rows={2}
                    value={draft.details}
                    onChange={handleDetailsChange}
                    data-testid="request-details"
                  />
                  {detailsError && (
                    <div id="request-details-error" className={panelStyles.inlineErrorMessage} role="alert">
                      {errorIcon}
                      <span>Add a few details about the product you’re looking for.</span>
                    </div>
                  )}
                </div>

                {/* 5. Attach Image */}
                <div className={panelStyles.fieldItem}>
                  <span className={panelStyles.fieldLabel}>
                    <span>Photo</span>
                    <span className={panelStyles.optionalBadge}>Optional</span>
                  </span>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                    data-testid="request-image-input"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) handleFileSelect(file);
                    }}
                  />
                  {imageError && (
                    <div className={panelStyles.inlineErrorMessage} role="alert">
                      {errorIcon}
                      <span>{imageError}</span>
                    </div>
                  )}

                  {draft.imagePreviewUrl ? (
                    /* Attached Image Card */
                    <div className={panelStyles.imageAttachedCard}>
                      <div className={panelStyles.imageAttachedLeft}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={draft.imagePreviewUrl}
                          alt="Attached product preview"
                          className={panelStyles.imageThumbnail}
                        />
                        <div className={panelStyles.imageInfoText}>
                          <span className={panelStyles.imageFileName}>
                            {draft.imageName || "product-photo.jpg"}
                          </span>
                          <span className={panelStyles.imageFileSize}>
                            {draft.imageSize || "1.2 MB"}
                          </span>
                        </div>
                      </div>
                      <div className={panelStyles.imageActions}>
                        <button
                          type="button"
                          className={`${panelStyles.imageActionBtn} ${panelStyles.imageReplaceBtn}`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          className={`${panelStyles.imageActionBtn} ${panelStyles.imageRemoveBtn}`}
                          onClick={handleRemoveImage}
                          aria-label="Remove attached image"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Default Dropzone */
                    <div
                      className={panelStyles.imageDropzone}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      aria-label="Add a product photo"
                    >
                      <div className={panelStyles.imageDropzoneIcon} aria-hidden="true">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="4" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="m21 15-5-5L5 21" />
                        </svg>
                      </div>
                      <span className={panelStyles.imageDropzoneTitle}>Add a product photo</span>
                      <span className={panelStyles.imageDropzoneSubtitle}>
                        JPG, PNG or WebP to help sellers identify your item
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: MATCHING TRANSITIONAL STATE */}
          {step === "matching" && (
            <motion.div
              key="step-matching"
              custom={direction}
              variants={shouldReduceMotion ? undefined : contentStepVariants}
              initial={shouldReduceMotion ? undefined : "initial"}
              animate={shouldReduceMotion ? undefined : "animate"}
              exit={shouldReduceMotion ? undefined : "exit"}
              className={panelStyles.matchingContainer}
            >
              <div className={panelStyles.matchingMascotWrapper} aria-hidden="true">
                <RequestMascot size={42} isScanning={true} />
              </div>
              <h2 className={panelStyles.matchingTitle}>Searching categories...</h2>
              <p className={panelStyles.matchingSubtitle}>
                We’re checking where this request fits best across nearby stores.
              </p>
            </motion.div>
          )}

          {/* STEP 3: AMBIGUITY REVIEW */}
          {step === "ambiguity" && (
            <motion.div
              key="step-ambiguity"
              custom={direction}
              variants={shouldReduceMotion ? undefined : contentStepVariants}
              initial={shouldReduceMotion ? undefined : "initial"}
              animate={shouldReduceMotion ? undefined : "animate"}
              exit={shouldReduceMotion ? undefined : "exit"}
            >
              <div className={panelStyles.screenHeader}>
                <h2 className={panelStyles.screenTitle}>Which category fits your item?</h2>
                <p className={panelStyles.screenSubtitle}>
                  We found more than one possible match. Choose the category that best
                  describes what you’re looking for.
                </p>
              </div>

              {/* Show entered request item name */}
              <div className={panelStyles.ambiguityRequestTag}>
                <span className={panelStyles.ambiguityTagLabel}>Request:</span>
                <span className={panelStyles.ambiguityTagValue}>{draft.itemName}</span>
              </div>

              {/* Radio Card Choices */}
              <div
                className={panelStyles.categoryList}
                role="radiogroup"
                aria-label="Choose product category"
              >
                {categoryChoices.map((category) => {
                  const isSelected = draft.categoryId === category.id;
                  return (
                    <div
                      key={category.id}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      className={`${panelStyles.categoryCard} ${
                        isSelected ? panelStyles.categoryCardSelected : ""
                      }`}
                      onClick={() =>
                        onDraftChange((prev) => ({
                          ...prev,
                          categoryId: category.id,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onDraftChange((prev) => ({
                            ...prev,
                            categoryId: category.id,
                          }));
                        }
                      }}
                      data-testid="request-category-option"
                    >
                      <div className={panelStyles.categoryRadioIndicator} aria-hidden="true">
                        {isSelected && <div className={panelStyles.categoryRadioDot} />}
                      </div>
                      <div className={panelStyles.categoryCardBody}>
                        <span className={panelStyles.categoryCardTitle}>{category.name}</span>
                        <span className={panelStyles.categoryCardDescription}>
                          {category.description}
                        </span>
                      </div>
                      {isSelected && (
                        <div className={panelStyles.categoryCheckIcon} aria-hidden="true">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* No match: carry on with the user's own description instead of forcing a category. */}
              <button
                type="button"
                className={panelStyles.noMatchButton}
                onClick={() => {
                  onDraftChange((prev) => ({ ...prev, categoryId: null }));
                  setDirection(1);
                  setStep("review");
                }}
                data-testid="request-no-category"
              >
                None of these — continue with my details
              </button>
            </motion.div>
          )}

          {/* STEP 4: REVIEW STEP */}
          {step === "review" && (
            <motion.div
              key="step-review"
              custom={direction}
              variants={shouldReduceMotion ? undefined : contentStepVariants}
              initial={shouldReduceMotion ? undefined : "initial"}
              animate={shouldReduceMotion ? undefined : "animate"}
              exit={shouldReduceMotion ? undefined : "exit"}
            >
              <div className={panelStyles.screenHeader}>
                <h2 className={panelStyles.screenTitle}>Review your request</h2>
                <p className={panelStyles.screenSubtitle}>
                  Make sure everything looks right before sending it to local sellers.
                </p>
              </div>

              <div className={panelStyles.reviewSummaryCard}>
                <div className={panelStyles.reviewRow}>
                  <span className={panelStyles.reviewRowLabel}>Item</span>
                  <span className={panelStyles.reviewRowValue}>{draft.itemName}</span>
                </div>

                <div className={panelStyles.reviewRow}>
                  <span className={panelStyles.reviewRowLabel}>Category</span>
                  <span className={panelStyles.reviewRowValue}>
                    <span className={panelStyles.reviewCategoryBadge}>
                      {selectedCategoryName}
                    </span>
                  </span>
                </div>

                <div className={panelStyles.reviewRow}>
                  <span className={panelStyles.reviewRowLabel}>Quantity</span>
                  <span className={panelStyles.reviewRowValue}>{quantityLabel}</span>
                </div>

                <div className={panelStyles.reviewRow}>
                  <span className={panelStyles.reviewRowLabel}>Budget</span>
                  <span className={panelStyles.reviewRowValue}>
                    {draft.rate ? money(Number(draft.rate)) : "Not specified"}
                  </span>
                </div>

                {draft.details && (
                  <div className={panelStyles.reviewRow}>
                    <span className={panelStyles.reviewRowLabel}>Details</span>
                    <span className={panelStyles.reviewRowValue}>{draft.details}</span>
                  </div>
                )}

                <div className={panelStyles.reviewRow}>
                  <span className={panelStyles.reviewRowLabel}>Photo</span>
                  <span className={panelStyles.reviewRowValue}>
                    {draft.imagePreviewUrl ? (
                      <div className={panelStyles.reviewPhotoRow}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={draft.imagePreviewUrl}
                          alt="Photo preview"
                          className={panelStyles.reviewThumbnail}
                        />
                        <span>{draft.imageName || "Attached photo"}</span>
                      </div>
                    ) : (
                      <span style={{ color: "var(--muted-foreground)" }}>
                        No photo attached
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <p className={panelStyles.reviewDisclaimer}>
                <strong>Your request will be active for 24 hours.</strong> Nearby sellers can respond with offers during
                this time.
              </p>
            </motion.div>
          )}

          {/* STEP 5: SUBMITTING SPINNER */}
          {step === "submitting" && (
            <motion.div
              key="step-submitting"
              custom={direction}
              variants={shouldReduceMotion ? undefined : contentStepVariants}
              initial={shouldReduceMotion ? undefined : "initial"}
              animate={shouldReduceMotion ? undefined : "animate"}
              exit={shouldReduceMotion ? undefined : "exit"}
              className={panelStyles.submittingContainer}
            >
              <div className={panelStyles.spinner} role="status" aria-label="Sending request" />
              <h2 className={panelStyles.matchingTitle}>Sending request...</h2>
              <p className={panelStyles.matchingSubtitle}>
                Submitting your request to relevant nearby local merchants.
              </p>
            </motion.div>
          )}

          {/* STEP 6: SUCCESS CONFIRMATION */}
          {step === "success" && (
            <motion.div
              key="step-success"
              custom={direction}
              variants={shouldReduceMotion ? undefined : contentStepVariants}
              initial={shouldReduceMotion ? undefined : "initial"}
              animate={shouldReduceMotion ? undefined : "animate"}
              exit={shouldReduceMotion ? undefined : "exit"}
              className={panelStyles.successContainer}
            >
              <div className={panelStyles.successIconBadge} aria-hidden="true">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M20 6L9 17L4 12"
                    initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.42, ease: "easeOut" }}
                  />
                </svg>
              </div>

              <h2 className={panelStyles.screenTitle}>Request submitted!</h2>
              <p className={panelStyles.screenSubtitle}>
                Your request is active. We’ll show you the offers as sellers respond.
              </p>

              <div className={panelStyles.successSummaryChip}>
                {draft.itemName} · {quantityLabel} · {draft.rate ? money(Number(draft.rate)) : ""}
              </div>
            </motion.div>
          )}

          {/* STEP 7: ERROR STATE */}
          {step === "error" && (
            <motion.div
              key="step-error"
              custom={direction}
              variants={shouldReduceMotion ? undefined : contentStepVariants}
              initial={shouldReduceMotion ? undefined : "initial"}
              animate={shouldReduceMotion ? undefined : "animate"}
              exit={shouldReduceMotion ? undefined : "exit"}
              className={panelStyles.errorContainer}
            >
              <div className={panelStyles.errorIconBadge} aria-hidden="true">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>

              <h2 className={panelStyles.screenTitle}>Couldn’t send your request</h2>
              <p className={panelStyles.screenSubtitle}>
                Check your connection and try again.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Sticky Footer Controls ─── */}
      <div className={panelStyles.footer}>
        {/* Step 1: Form footer */}
        {step === "form" && (
          <button
            type="button"
            className={panelStyles.primaryButton}
            onClick={handleFormContinue}
            data-testid="request-continue"
          >
            <span>Continue</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        )}

        {/* Step 3: Ambiguity footer (Back + Continue) */}
        {step === "ambiguity" && (
          <>
            <button
              type="button"
              className={panelStyles.secondaryButton}
              onClick={() => {
                setDirection(-1);
                setStep("form");
              }}
            >
              Back to request
            </button>
            <button
              type="button"
              className={panelStyles.primaryButton}
              onClick={() => {
                setDirection(1);
                setStep("review");
              }}
              disabled={!draft.categoryId}
              data-testid="request-continue"
            >
              Continue
            </button>
          </>
        )}

        {/* Step 4: Review footer (Edit + Send request) */}
        {step === "review" && (
          <>
            <button
              type="button"
              className={panelStyles.secondaryButton}
              onClick={() => {
                setDirection(-1);
                setStep("form");
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className={panelStyles.primaryButton}
              onClick={() => {
                setDirection(1);
                setStep("submitting");
              }}
              data-testid="request-send"
            >
              Submit request
            </button>
          </>
        )}

        {/* Step 6: Success footer. Managing the request happens on the Requests pages. */}
        {step === "success" && (
          <>
            <Link
              href="/requests"
              className={panelStyles.secondaryButton}
              onClick={() => {
                onDraftChange(() => ({ ...INITIAL_REQUEST_DRAFT }));
                onClose();
              }}
            >
              My requests
            </Link>
            <Link
              href={createdId ? `/requests/${createdId}` : "/requests"}
              className={panelStyles.primaryButton}
              onClick={() => {
                onDraftChange(() => ({ ...INITIAL_REQUEST_DRAFT }));
                onClose();
              }}
              data-testid="request-view"
            >
              View request
            </Link>
          </>
        )}

        {/* Step 7: Error footer (Back to request + Try again) */}
        {step === "error" && (
          <>
            <button
              type="button"
              className={panelStyles.secondaryButton}
              onClick={() => {
                setDirection(-1);
                setStep("review");
              }}
            >
              Back to request
            </button>
            <button
              type="button"
              className={panelStyles.primaryButton}
              onClick={() => {
                setDirection(1);
                setStep("submitting");
              }}
            >
              Try again
            </button>
          </>
        )}
      </div>
    </motion.aside>
  );
}

/**
 * Floating "Request a Product" launcher widget for the Briz marketplace.
 *
 * Mental model: "Can't find what you need? Tell Briz. Local sellers may have it."
 *
 * Lifecycle:
 * 1. Page load -> small 56x56px animated icon only in bottom-right corner.
 * 2. User scrolls > 120px -> expands smoothly leftward to reveal explanatory copy.
 * 3. Expansion is one-way -> remains expanded for the session even when scrolling back up.
 * 4. User clicks -> smoothly expands into the interactive Request Product prototype panel.
 */
export function RequestProductWidget({
  variant = "mascot",
  theme = "light",
  onOpen,
  className,
  layoutId = "briz-request-widget",
  initialExpanded = false,
  scrollThreshold = EXPAND_SCROLL_THRESHOLD,
  initialOpen = false,
}: RequestProductWidgetProps) {
  const shouldReduceMotion = useReducedMotion();
  const [scrollExpanded, setExpanded] = useState(initialExpanded);
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [draft, setDraft] = useState<RequestDraft>(INITIAL_REQUEST_DRAFT);
  // Set only by the development "Preview states" control: which panel step to show, or the launcher's thought bubble.
  const [preview, setPreview] = useState<RequestWidgetPreview & { key: number }>({ key: 0 });
  const [isScanning, setIsScanning] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  // "shopper" and "face" are the two character launchers; they share styles and behaviour.
  const isFace = variant === "face" || variant === "seller" || variant === "sprite";
  const isCharacter = variant === "shopper" || isFace;
  const launcherRef = useCursorLook<HTMLButtonElement>(isFace);
  // The character shows its thought unprompted when the visitor goes quiet, and on
  // touch devices (which cannot hover) after the first scroll.
  const showHint = useAttentionHint(isCharacter && !isOpen);
  const hasTriggeredRef = useRef(initialExpanded);

  // Motion scroll listener
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > scrollThreshold && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      setExpanded(true);
      setIsScanning(true);
    }
  });



  // Handle page load when browser restores to an already-scrolled position
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.scrollY > scrollThreshold &&
      !hasTriggeredRef.current
    ) {
      hasTriggeredRef.current = true;
      setExpanded(true);
      setIsScanning(true);
    }
  }, [scrollThreshold]);

  // Settle one-time scan animation back to gentle idle after expansion
  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        setIsScanning(false);
      }, 850);
      return () => clearTimeout(timer);
    }
  }, [isScanning]);

  // Global event listener for triggering Request Product flow with prefilled query
  useEffect(() => {
    const handleOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Partial<RequestDraft>>;
      if (customEvent.detail) {
        // Only the fields that were passed change; anything already typed is kept.
        const defined = Object.fromEntries(Object.entries(customEvent.detail).filter(([, value]) => value !== undefined));
        setDraft((prev) => ({ ...prev, ...defined }));
      }
      setIsOpen(true);
    };
    const handlePreviewEvent = (e: Event) => {
      const detail = (e as CustomEvent<RequestWidgetPreview>).detail ?? {};
      if (detail.draft) setDraft(detail.draft);
      setPreview((prev) => ({ ...detail, key: prev.key + 1 }));
      setIsOpen(Boolean(detail.step));
    };
    window.addEventListener("briz:open-request", handleOpenEvent);
    window.addEventListener("briz:request-preview", handlePreviewEvent);
    return () => {
      window.removeEventListener("briz:open-request", handleOpenEvent);
      window.removeEventListener("briz:request-preview", handlePreviewEvent);
    };
  }, []);

  // The shopper never expands: it stays a lone character and reveals its thought
  // through CSS state alone. Every other variant expands once after the scroll threshold.
  const expanded = isCharacter ? false : scrollExpanded;

  const handleClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsOpen(true);
    if (onOpen) {
      onOpen();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen ? (
          <RequestProductPanel
            key={`request-panel-${preview.key}`}
            layoutId={layoutId}
            initialStep={preview.step}
            initialShowErrors={preview.showErrors}
            initialCreatedId={preview.createdId}
            onClose={handleClose}
            draft={draft}
            onDraftChange={setDraft}
          />
        ) : (
          <aside
            key="request-launcher"
            className={`${styles.widgetWrapper} ${className || ""}`.trim()}
            aria-label="Product Request Assistant"
            data-testid="briz-request-widget"
            data-variant={variant}
            data-expanded={expanded}
          >
            <motion.button
              type="button"
              layout
              layoutId={layoutId}
              className={`${styles.widgetButton} ${
                expanded ? styles.widgetButtonExpanded : styles.widgetButtonCollapsed
              }`}
              variants={shouldReduceMotion ? undefined : widgetEntranceVariants}
              custom={hasEntered ? 0 : ENTRANCE_DELAY}
              initial={shouldReduceMotion ? { opacity: 1, scale: 1, y: 0 } : "initial"}
              animate={shouldReduceMotion ? { opacity: 1, scale: 1, y: 0 } : "animate"}
              whileHover={shouldReduceMotion ? undefined : "hover"}
              whileTap={shouldReduceMotion ? { scale: 0.985 } : "tap"}
              onAnimationComplete={() => setHasEntered(true)}
              data-hint={showHint || Boolean(preview.hint)}
              transition={{
                layout: {
                  type: "spring",
                  stiffness: 380,
                  damping: 32,
                  mass: 0.8,
                },
                opacity: { duration: 0.25 },
              }}
              onClick={handleClick}
              ref={launcherRef}
              data-variant={isCharacter ? "shopper" : variant}
              data-character={variant === "sprite" ? "sprite" : isFace ? "face" : variant}
              data-theme={theme}
              aria-label="Request a product"
              aria-expanded={expanded}
            >
              {/* Zone 1: Animated Shopping Mascot (Bag + Magnifying Glass + Sparkle) */}
              <motion.div
                layout
                className={`${styles.mascotContainer} ${
                  expanded ? "" : styles.mascotContainerCollapsed
                }`}
                data-name="RequestMascot"
              >
                {isCharacter ? (
                  <ShopperLauncherContent character={isFace ? variant : "shopper"} />
                ) : variant === "scout" ? (
                  <RequestScoutCharacter size={expanded ? 48 : 46} isScanning={isScanning} />
                ) : variant === "scan" ? (
                  <RequestScanVisual size={expanded ? 42 : 44} isScanning={isScanning} />
                ) : (
                  <RequestMascot size={expanded ? 46 : 42} isScanning={isScanning} />
                )}
              </motion.div>

              {/* Zones 2 & 3: Revealed upon scroll expansion */}
              <AnimatePresence>
                {expanded && (
                  <div className={styles.bubble}>
                    {/* Zone 2: Informative Marketplace Copy */}
                    <div className={styles.contentBlock}>
                      {/* Headline: begins ~70ms after expansion starts */}
                      <motion.span
                        className={styles.headline}
                        initial={
                          shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 8 }
                        }
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 6 }}
                        transition={{
                          duration: 0.28,
                          delay: shouldReduceMotion ? 0 : 0.07,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <span className={styles.desktopText}>Can’t find a product?</span>
                        <span className={styles.mobileText}>Can’t find it?</span>
                      </motion.span>

                      {/* Description: begins ~140ms after expansion starts */}
                      <motion.span
                        className={styles.description}
                        initial={
                          shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 6 }
                        }
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 4 }}
                        transition={{
                          duration: 0.28,
                          delay: shouldReduceMotion ? 0 : 0.14,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <span className={styles.desktopText}>
                          Request it from nearby sellers.
                        </span>
                        <span className={styles.mobileText}>
                          Request it from local sellers.
                        </span>
                      </motion.span>
                    </div>

                    {/* Zone 3: Interactive Affordance Indicator (begins ~200ms) */}
                    <motion.div
                      className={styles.actionAffordance}
                      variants={shouldReduceMotion ? undefined : arrowVariants}
                      initial={
                        shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 6 }
                      }
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 4 }}
                      transition={{
                        duration: 0.25,
                        delay: shouldReduceMotion ? 0 : 0.2,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      aria-hidden="true"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.button>
          </aside>
        )}
      </AnimatePresence>
    </>
  );
}

// Helper function to programmatically open the floating Request a Product widget
/** What the development "Preview states" control can ask the widget to show. */
export type RequestWidgetPreview = {
  /** Open the panel on this step. Leave out to close the panel and show the launcher. */
  step?: RequestFlowStep;
  draft?: RequestDraft;
  showErrors?: boolean;
  createdId?: string | null;
  /** Launcher only: show the "Can't find product?" thought bubble. */
  hint?: boolean;
};

export function previewBrizRequestWidget(preview: RequestWidgetPreview) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("briz:request-preview", { detail: preview }));
  }
}

export function openBrizRequest(options?: Partial<RequestDraft>) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("briz:open-request", { detail: options }));
  }
}

// Re-export mascot, panel, and flow data for composability
export { RequestMascot } from "./request-mascot";
export * from "./request-flow-data";

