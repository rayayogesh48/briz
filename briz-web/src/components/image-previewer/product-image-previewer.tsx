"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, ImageOff, RotateCcw } from "lucide-react";
import {
  type ProductImagePreviewerProps,
  normalizePreviewImages,
} from "./image-previewer.types";
import styles from "./product-image-previewer.module.css";

export function ProductImagePreviewer({
  images: rawImages,
  initialIndex = 0,
  isOpen,
  onClose,
  onIndexChange,
  productName = "Product",
  triggerRef,
}: ProductImagePreviewerProps) {
  const images = normalizePreviewImages(rawImages, productName);
  const totalCount = images.length;
  const hasMultiple = totalCount > 1;

  // Active index state (clamped between 0 and totalCount - 1)
  const [activeIndex, setActiveIndex] = useState(() => {
    if (initialIndex >= 0 && initialIndex < totalCount) return initialIndex;
    return 0;
  });

  // Track slide direction for subtle transitions: "next" | "prev" | null
  const [transitionDirection, setTransitionDirection] = useState<"next" | "prev" | null>(null);

  // Per-index error and loading state tracking
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Touch tracking for mobile swipe gestures
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Element references for focus trapping and scroll management
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const thumbnailListRef = useRef<HTMLDivElement>(null);
  const activeThumbnailRef = useRef<HTMLButtonElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPortalContainer(document.body);
  }, []);

  // Adjust state during render when initialIndex or isOpen changes
  const [prevInitialIndex, setPrevInitialIndex] = useState(initialIndex);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (initialIndex !== prevInitialIndex || isOpen !== prevIsOpen) {
    setPrevInitialIndex(initialIndex);
    setPrevIsOpen(isOpen);
    if (isOpen) {
      const targetIndex = initialIndex >= 0 && initialIndex < totalCount ? initialIndex : 0;
      setActiveIndex(targetIndex);
      setIsLoading(true);
      setHasError(false);
      setTransitionDirection(null);
    }
  }

  // Navigate to specific index with wrap-around looping
  const goTo = useCallback(
    (nextIdx: number, direction?: "next" | "prev") => {
      if (totalCount === 0) return;
      let resolvedIndex = nextIdx;
      if (nextIdx >= totalCount) {
        resolvedIndex = 0;
      } else if (nextIdx < 0) {
        resolvedIndex = totalCount - 1;
      }

      setTransitionDirection(
        direction || (resolvedIndex > activeIndex ? "next" : "prev")
      );
      setActiveIndex(resolvedIndex);
      setIsLoading(true);
      setHasError(false);
      onIndexChange?.(resolvedIndex);
    },
    [totalCount, activeIndex, onIndexChange]
  );

  const goToNext = useCallback(() => {
    goTo(activeIndex + 1, "next");
  }, [goTo, activeIndex]);

  const goToPrev = useCallback(() => {
    goTo(activeIndex - 1, "prev");
  }, [goTo, activeIndex]);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (isOpen && activeThumbnailRef.current && thumbnailListRef.current) {
      activeThumbnailRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeIndex, isOpen]);

  // Lock background body scroll while the preview is open
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Accessible Focus Management & Trap
  useEffect(() => {
    if (!isOpen) {
      // Return focus to the trigger button when preview closes
      triggerRef?.current?.focus();
      return;
    }

    // Auto-focus the close button or first interactive element when opened
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 40);

    function handleKeyDown(e: KeyboardEvent) {
      if (!modalRef.current) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (hasMultiple) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          goToPrev();
          return;
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          goToNext();
          return;
        }
      }

      // Focus trapping inside the modal dialog
      if (e.key === "Tab") {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusable = Array.from(focusableElements).filter(
          (el) => el.offsetParent !== null
        );

        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, hasMultiple, goToNext, goToPrev, onClose, triggerRef]);

  // Touch handlers for mobile swipe gestures
  const handleTouchStart = (e: ReactTouchEvent) => {
    if (!hasMultiple) return;
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: ReactTouchEvent) => {
    if (!hasMultiple) return;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!hasMultiple || touchStartX.current === null || touchEndX.current === null) {
      return;
    }

    const deltaX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 42;

    if (deltaX > minSwipeDistance) {
      // Swiped Left -> Next image
      goToNext();
    } else if (deltaX < -minSwipeDistance) {
      // Swiped Right -> Previous image
      goToPrev();
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
  };

  // Retry loading current image
  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    setHasError(false);
    setRetryKey((prev) => prev + 1);
  };

  if (!isOpen || !portalContainer || totalCount === 0) {
    return null;
  }

  const currentImage = images[activeIndex] || images[0];

  // Resolve source URL with cache-buster if retrying
  const currentSrc = retryKey > 0
    ? `${currentImage.src}${currentImage.src.includes("?") ? "&" : "?"}_retry=${retryKey}`
    : currentImage.src;

  const content = (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Image preview: ${productName}`}
      className={styles.overlay}
      onClick={(e) => {
        // Clicking backdrop directly closes the preview
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Top Header Bar */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {hasMultiple && (
            <div
              className={styles.counter}
              aria-live="polite"
              aria-atomic="true"
            >
              {activeIndex + 1} / {totalCount}
            </div>
          )}
          <span className={styles.productTitle} title={productName}>
            {productName}
          </span>
        </div>

        <div className={styles.headerRight}>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close image preview (Escape)"
            className={styles.closeButton}
          >
            <X className="w-5 h-5 stroke-[2]" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Main Image Stage */}
      <div
        className={styles.stageWrapper}
        onClick={(e) => {
          // Clicking outside the image frame on the stage background closes the preview
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Previous Arrow Button (Hidden when only 1 image) */}
        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            aria-label="Previous image (Left arrow)"
            className={`${styles.navButton} ${styles.prevButton}`}
          >
            <ChevronLeft className="w-6 h-6 stroke-[2]" aria-hidden="true" />
          </button>
        )}

        {/* Central Stage */}
        <div
          className={styles.stage}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => {
            // Clicking backdrop around the image closes preview
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          {/* Main Image Frame - Clicking image must NOT close preview */}
          <div
            className={styles.imageFrame}
            onClick={(e) => {
              // Crucial requirement: Clicking the image must not close the preview
              e.stopPropagation();
            }}
          >
            {/* Loading Indicator */}
            {isLoading && !hasError && (
              <div
                className={styles.loadingContainer}
                role="status"
                aria-label="Loading image..."
              >
                <div className={styles.spinner} />
                <span className={styles.loadingText}>Loading image…</span>
              </div>
            )}

            {/* Error State with Retry Button */}
            {hasError ? (
              <div
                className={styles.errorContainer}
                role="alert"
                aria-live="assertive"
              >
                <ImageOff className={styles.errorIcon} aria-hidden="true" />
                <h3 className={styles.errorTitle}>Unable to load image</h3>
                <p className={styles.errorDescription}>
                  There was a problem loading this product image. Check your connection and try again.
                </p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className={styles.retryButton}
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Retry</span>
                </button>
              </div>
            ) : (
              /* Display complete image without cropping or stretching */
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={`${currentImage.src}-${retryKey}`}
                src={currentSrc}
                alt={currentImage.alt || `${productName} view ${activeIndex + 1}`}
                onLoad={() => {
                  setIsLoading(false);
                  setHasError(false);
                }}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
                className={`${styles.mainImage} ${
                  transitionDirection === "next"
                    ? styles.imageTransitioningNext
                    : transitionDirection === "prev"
                    ? styles.imageTransitioningPrev
                    : ""
                }`}
                style={{
                  display: hasError ? "none" : "block",
                  opacity: isLoading ? 0.3 : 1,
                }}
              />
            )}
          </div>
        </div>

        {/* Next Arrow Button (Hidden when only 1 image) */}
        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            aria-label="Next image (Right arrow)"
            className={`${styles.navButton} ${styles.nextButton}`}
          >
            <ChevronRight className="w-6 h-6 stroke-[2]" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Horizontal Thumbnail Strip (Hidden when only 1 image) */}
      {hasMultiple && (
        <div
          ref={thumbnailListRef}
          role="tablist"
          aria-label="Product thumbnails"
          className={styles.thumbnailStrip}
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={`${item.src}-${idx}`}
                ref={isActive ? activeThumbnailRef : undefined}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-label={`Thumbnail ${idx + 1} of ${totalCount}`}
                onClick={() => goTo(idx)}
                className={`${styles.thumbnailItem} ${
                  isActive ? styles.thumbnailActive : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbnail || item.src}
                  alt=""
                  className={styles.thumbnailImage}
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return createPortal(content, portalContainer);
}
