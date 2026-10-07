"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { useCursorLook } from "./use-cursor-look";
import { money } from "./search-results-model";
import {
  type RequestFlowStep,
  type PrototypeState,
  type RequestDraft,
  type CategoryOption,
  CATEGORY_OPTIONS,
  findCategoryMatches,
  submitRequest,
  INITIAL_REQUEST_DRAFT,
  MOCK_FILLED_DRAFT,
  MOCK_ATTACHED_IMAGE_DRAFT,
  MOCK_AMBIGUOUS_DRAFT,
  MOCK_AMBIGUOUS_SELECTED_DRAFT,
} from "./request-flow-data";
import styles from "./request-product-widget.module.css";
import panelStyles from "./request-product-panel.module.css";

/**
 * How long (ms) the shopper's thought stays up as a hint on touch devices.
 */
const TOUCH_HINT_DURATION = 4500;

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
  initialPrototypeState?: PrototypeState;
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
  initialPrototypeState,
}: RequestProductPanelProps) {
  const shouldReduceMotion = useReducedMotion();
  const [step, setStep] = useState<RequestFlowStep>(initialStep);
  const [direction, setDirection] = useState(1);
  const [showValidationError, setShowValidationError] = useState(false);
  const [isUploadingPreview, setIsUploadingPreview] = useState(false);
  const [previewDropdownOpen, setPreviewDropdownOpen] = useState(false);
  const [categoryChoices, setCategoryChoices] = useState<CategoryOption[]>([]);
  const [activePrototypeState, setActivePrototypeState] = useState<PrototypeState | null>(
    initialPrototypeState || null
  );

  const itemNameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Focus item name on initial form mount
  useEffect(() => {
    if (step === "form" && itemNameInputRef.current) {
      itemNameInputRef.current.focus();
    }
  }, [step]);

  // Close preview dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setPreviewDropdownOpen(false);
      }
    }
    if (previewDropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      return () => document.removeEventListener("mousedown", handleOutsideClick);
    }
  }, [previewDropdownOpen]);

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
          onDraftChange((prev) => ({
            ...prev,
            categoryId: matches[0]?.id || "general",
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

  // Preset prototype state switcher
  const applyPrototypeState = (pState: PrototypeState) => {
    setActivePrototypeState(pState);
    setPreviewDropdownOpen(false);
    setShowValidationError(false);
    setIsUploadingPreview(false);

    switch (pState) {
      case "form-empty":
        onDraftChange(() => ({ ...INITIAL_REQUEST_DRAFT }));
        setDirection(-1);
        setStep("form");
        break;
      case "form-filled":
        onDraftChange(() => ({ ...MOCK_FILLED_DRAFT }));
        setDirection(1);
        setStep("form");
        break;
      case "validation-error":
        onDraftChange((prev) => ({ ...prev, itemName: "" }));
        setShowValidationError(true);
        setDirection(-1);
        setStep("form");
        setTimeout(() => itemNameInputRef.current?.focus(), 50);
        break;
      case "image-uploading":
        onDraftChange(() => ({ ...MOCK_FILLED_DRAFT, image: null, imagePreviewUrl: null }));
        setIsUploadingPreview(true);
        setDirection(1);
        setStep("form");
        break;
      case "image-attached":
        onDraftChange(() => ({ ...MOCK_ATTACHED_IMAGE_DRAFT }));
        setDirection(1);
        setStep("form");
        break;
      case "matching":
        onDraftChange(() => ({ ...MOCK_AMBIGUOUS_DRAFT }));
        setDirection(1);
        setStep("matching");
        break;
      case "ambiguity":
        onDraftChange(() => ({ ...MOCK_AMBIGUOUS_DRAFT }));
        setCategoryChoices(findCategoryMatches("Apple"));
        setDirection(1);
        setStep("ambiguity");
        break;
      case "ambiguity-selected":
        onDraftChange(() => ({ ...MOCK_AMBIGUOUS_SELECTED_DRAFT }));
        setCategoryChoices(findCategoryMatches("Apple"));
        setDirection(1);
        setStep("ambiguity");
        break;
      case "review":
        onDraftChange(() => ({ ...MOCK_ATTACHED_IMAGE_DRAFT }));
        setDirection(1);
        setStep("review");
        break;
      case "submitting":
        onDraftChange(() => ({ ...MOCK_ATTACHED_IMAGE_DRAFT }));
        setDirection(1);
        setStep("submitting");
        break;
      case "success":
        onDraftChange(() => ({ ...MOCK_ATTACHED_IMAGE_DRAFT }));
        setDirection(1);
        setStep("success");
        break;
      case "error":
        onDraftChange(() => ({ ...MOCK_ATTACHED_IMAGE_DRAFT }));
        setDirection(1);
        setStep("error");
        break;
    }
  };

  // Form input handlers
  const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (showValidationError && val.trim().length > 0) {
      setShowValidationError(false);
    }
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
    setIsUploadingPreview(false);
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
  const handleFormContinue = () => {
    if (!draft.itemName.trim()) {
      setShowValidationError(true);
      itemNameInputRef.current?.focus();
      return;
    }
    setDirection(1);
    setStep("matching");
  };

  const selectedCategoryName =
    draft.categoryId && CATEGORY_OPTIONS[draft.categoryId]
      ? CATEGORY_OPTIONS[draft.categoryId].name
      : "General Marketplace";

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
            <span className={panelStyles.headerSubtitle}>
              Tell nearby sellers what you’re looking for.
            </span>
          </div>
        </div>

        <div className={panelStyles.headerControls} ref={dropdownRef}>
          {/* Prototype State Preview Button */}
          <button
            type="button"
            className={`${panelStyles.previewStatesButton} ${
              previewDropdownOpen ? panelStyles.previewStatesButtonActive : ""
            }`}
            onClick={() => setPreviewDropdownOpen((prev) => !prev)}
            data-testid="request-preview-states"
            aria-expanded={previewDropdownOpen}
            aria-haspopup="listbox"
            title="Preview all prototype flow states"
          >
            <span>Preview states</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

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

          {/* Preview States Dropdown Popover */}
          {previewDropdownOpen && (
            <div className={panelStyles.previewDropdown} role="listbox">
              <div className={panelStyles.previewDropdownHeader}>
                <span className={panelStyles.previewDropdownTitle}>Prototype State Preview</span>
                <span className={panelStyles.previewDropdownBadge}>Mock Tool</span>
              </div>
              {[
                { id: "form-empty", label: "Empty form" },
                { id: "form-filled", label: "Filled form" },
                { id: "validation-error", label: "Validation error" },
                { id: "image-uploading", label: "Uploading photo..." },
                { id: "image-attached", label: "Photo attached" },
                { id: "matching", label: "Searching categories..." },
                { id: "ambiguity", label: "Ambiguous matches (Apple)" },
                { id: "ambiguity-selected", label: "Ambiguity selected" },
                { id: "review", label: "Review summary" },
                { id: "submitting", label: "Submitting request..." },
                { id: "success", label: "Request sent (Success)" },
                { id: "error", label: "Submission error" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={activePrototypeState === item.id}
                  className={`${panelStyles.previewStateItem} ${
                    activePrototypeState === item.id ? panelStyles.previewStateItemActive : ""
                  }`}
                  onClick={() => applyPrototypeState(item.id as PrototypeState)}
                >
                  <span>{item.label}</span>
                  {activePrototypeState === item.id && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Step Progress Ribbon ─── */}
      <div className={panelStyles.progressRibbon} aria-label="Request progress">
        <div
          className={`${panelStyles.progressStep} ${
            step === "form" || step === "matching" || step === "ambiguity"
              ? panelStyles.progressStepActive
              : panelStyles.progressStepDone
          }`}
        >
          <span className={panelStyles.progressDot} />
          <span>Details</span>
        </div>
        <div
          className={`${panelStyles.progressStep} ${
            step === "review" || step === "submitting"
              ? panelStyles.progressStepActive
              : step === "success"
              ? panelStyles.progressStepDone
              : ""
          }`}
        >
          <span className={panelStyles.progressDot} />
          <span>Review</span>
        </div>
        <div
          className={`${panelStyles.progressStep} ${
            step === "success" ? panelStyles.progressStepActive : ""
          }`}
        >
          <span className={panelStyles.progressDot} />
          <span>Sent</span>
        </div>
      </div>

      {/* ─── Main Content Area with Motion transition between screens ─── */}
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
              <div className={panelStyles.screenHeader}>
                <h2 className={panelStyles.screenTitle}>What are you looking for?</h2>
                <p className={panelStyles.screenSubtitle}>
                  Add a few details so local sellers can understand your request.
                </p>
              </div>

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
                      showValidationError ? panelStyles.textInputError : ""
                    }`}
                    placeholder="What are you looking for? (e.g. iPhone 15 Pro case)"
                    value={draft.itemName}
                    onChange={handleItemNameChange}
                    data-testid="request-item-name"
                    aria-required="true"
                    aria-invalid={showValidationError}
                    aria-describedby={
                      showValidationError ? "request-item-name-error" : undefined
                    }
                  />
                  {showValidationError && (
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

                {/* 2. Quantity (Required) */}
                <div className={panelStyles.fieldItem}>
                  <label htmlFor="request-quantity" className={panelStyles.fieldLabel}>
                    <span>Quantity</span>
                  </label>
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
                </div>

                {/* 3. Rate (Expected Price) */}
                <div className={panelStyles.fieldItem}>
                  <label htmlFor="request-rate" className={panelStyles.fieldLabel}>
                    <span>Rate</span>
                    <span className={panelStyles.optionalBadge}>Optional expected rate</span>
                  </label>
                  <div className={panelStyles.currencyInputContainer}>
                    <span className={panelStyles.currencyPrefix} aria-hidden="true">
                      Rs.
                    </span>
                    <input
                      id="request-rate"
                      type="text"
                      inputMode="numeric"
                      className={panelStyles.currencyInput}
                      placeholder="Enter expected rate (e.g. 2,500)"
                      value={
                        draft.rate ? Number(draft.rate).toLocaleString("en-IN") : ""
                      }
                      onChange={handleRateChange}
                      data-testid="request-rate"
                    />
                  </div>
                </div>

                {/* 4. Item Detail */}
                <div className={panelStyles.fieldItem}>
                  <label htmlFor="request-details" className={panelStyles.fieldLabel}>
                    <span>Item detail</span>
                    <span className={panelStyles.optionalBadge}>Optional details</span>
                  </label>
                  <textarea
                    id="request-details"
                    className={panelStyles.textarea}
                    placeholder="Add size, brand, color, model, or anything sellers should know."
                    rows={3}
                    value={draft.details}
                    onChange={handleDetailsChange}
                    data-testid="request-details"
                  />
                  <div className={panelStyles.charCounter}>
                    {draft.details.length} / 500
                  </div>
                </div>

                {/* 5. Attach Image */}
                <div className={panelStyles.fieldItem}>
                  <span className={panelStyles.fieldLabel}>
                    <span>Attach image</span>
                    <span className={panelStyles.optionalBadge}>JPG, PNG, WebP</span>
                  </span>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                    data-testid="request-image-input"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />

                  {/* Uploading Simulation Card */}
                  {isUploadingPreview ? (
                    <div className={panelStyles.imageUploadingCard}>
                      <div className={panelStyles.imageUploadingHeader}>
                        <div className={panelStyles.imageDropzoneIcon}>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <div className={panelStyles.imageInfoText}>
                          <span className={panelStyles.imageFileName}>Uploading photo...</span>
                          <span className={panelStyles.imageFileSize}>72% completed</span>
                        </div>
                      </div>
                      <div className={panelStyles.uploadProgressBarBg}>
                        <div className={panelStyles.uploadProgressBarFill} />
                      </div>
                    </div>
                  ) : draft.imagePreviewUrl ? (
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
                  <span className={panelStyles.reviewRowValue}>{draft.quantity}</span>
                </div>

                <div className={panelStyles.reviewRow}>
                  <span className={panelStyles.reviewRowLabel}>Expected rate</span>
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
                Nearby sellers will review your request and send you their best offers.
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

              <h2 className={panelStyles.screenTitle}>Request sent</h2>
              <p className={panelStyles.screenSubtitle}>
                We’ll let you know when local sellers respond with offers.
              </p>

              <div className={panelStyles.successSummaryChip}>
                {draft.itemName} · {selectedCategoryName} · Qty {draft.quantity}
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
              Back
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
              Send request
            </button>
          </>
        )}

        {/* Step 6: Success footer (Create another + Done) */}
        {step === "success" && (
          <>
            <button
              type="button"
              className={panelStyles.secondaryButton}
              onClick={() => {
                onDraftChange(() => ({ ...INITIAL_REQUEST_DRAFT }));
                setDirection(-1);
                setStep("form");
              }}
            >
              Create another
            </button>
            <button
              type="button"
              className={panelStyles.primaryButton}
              onClick={() => {
                onDraftChange(() => ({ ...INITIAL_REQUEST_DRAFT }));
                onClose();
              }}
            >
              Done
            </button>
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
  const [isScanning, setIsScanning] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  // "shopper" and "face" are the two character launchers; they share styles and behaviour.
  const isFace = variant === "face" || variant === "seller" || variant === "sprite";
  const isCharacter = variant === "shopper" || isFace;
  const launcherRef = useCursorLook<HTMLButtonElement>(isFace);
  const [showTouchHint, setShowTouchHint] = useState(false);
  const hasTriggeredRef = useRef(initialExpanded);

  // Motion scroll listener
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > scrollThreshold && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      setExpanded(true);
      setIsScanning(true);
      // Touch devices cannot hover, so the shopper shows its thought once as a hint.
      if (isCharacter && window.matchMedia("(hover: none)").matches) {
        setShowTouchHint(true);
      }
    }
  });

  useEffect(() => {
    if (!showTouchHint) return;
    const timer = setTimeout(() => setShowTouchHint(false), TOUCH_HINT_DURATION);
    return () => clearTimeout(timer);
  }, [showTouchHint]);

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
      const customEvent = e as CustomEvent<{ itemName?: string; categoryId?: string }>;
      if (customEvent.detail) {
        setDraft((prev) => ({
          ...prev,
          itemName: customEvent.detail?.itemName !== undefined ? customEvent.detail.itemName : prev.itemName,
          categoryId: customEvent.detail?.categoryId !== undefined ? customEvent.detail.categoryId : prev.categoryId,
        }));
      }
      setIsOpen(true);
    };
    window.addEventListener("briz:open-request", handleOpenEvent);
    return () => window.removeEventListener("briz:open-request", handleOpenEvent);
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
            key="request-panel"
            layoutId={layoutId}
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
              data-hint={showTouchHint}
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
              data-character={isFace ? "face" : variant}
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
export function openBrizRequest(options?: { itemName?: string; categoryId?: string }) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("briz:open-request", { detail: options }));
  }
}

// Re-export mascot, panel, and flow data for composability
export { RequestMascot } from "./request-mascot";
export * from "./request-flow-data";

