"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ExternalLink,
  Laptop,
  Layers,
  RefreshCw,
  Smartphone,
  Tablet,
  WifiOff,
} from "lucide-react";
import {
  SYSTEM_STATE_PRESETS,
  SYSTEM_STATE_CATEGORIES,
  type SystemStatePreset,
} from "@/components/system-state/system-states-data";
import { SystemState } from "@/components/system-state/system-state";
import {
  ProductCardSkeleton,
  StoreCardSkeleton,
  RequestCardSkeleton,
  SlowLoadingNotice,
} from "@/components/system-state/loading-state";
import { UploadState } from "@/components/system-state/upload-state";
import { MobileAppRequired } from "@/components/system-state/mobile-app-required";
import {
  FormSubmissionError,
  InlineFieldError,
  InlineFieldSuccess,
} from "@/components/system-state/form-state";
import { openBrizRequest } from "@/components/request-product-widget";
import styles from "./states-gallery.module.css";

type ViewportMode = "desktop" | "tablet" | "mobile";

export function StatesGalleryClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const requestedState = searchParams.get("state");
  const activeStateId =
    requestedState && SYSTEM_STATE_PRESETS[requestedState]
      ? requestedState
      : "not-found";

  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [isSimulatingRetry, setIsSimulatingRetry] = useState(false);

  const selectState = (stateId: string) => {
    router.replace(`/dev/states?state=${stateId}`, { scroll: false });
  };

  const preset: SystemStatePreset =
    SYSTEM_STATE_PRESETS[activeStateId] || SYSTEM_STATE_PRESETS["not-found"];

  // Simulate an action retry
  const handleSimulateRetry = () => {
    setIsSimulatingRetry(true);
    setTimeout(() => {
      setIsSimulatingRetry(false);
    }, 1200);
  };

  // Trigger Request Product Widget with mock query
  const handleTriggerRequest = (customItem?: string) => {
    const itemName = customItem || "iPhone 15 Pro case";
    openBrizRequest({ itemName });
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Top Gallery Header Bar */}
      <header className={styles.galleryHeader}>
        <div className={styles.brandCluster}>
          <Link href="/" className={styles.headerLink}>
            ← Briz
          </Link>
          <div className={styles.brandTitle}>
            <Layers size={18} className="text-[#3e63dd]" />
            <span>System States & Error Experience</span>
            <span className={styles.galleryBadge}>Development Preview</span>
          </div>
        </div>

        <div className={styles.controlsCluster}>
          {/* Viewport Width Selector */}
          <div className={styles.viewportSelector} role="group" aria-label="Preview Viewport Mode">
            <button
              type="button"
              className={`${styles.viewportBtn} ${viewport === "desktop" ? styles.activeViewport : ""}`}
              onClick={() => setViewport("desktop")}
              aria-pressed={viewport === "desktop"}
              title="Desktop View (1000px max)"
            >
              <Laptop size={14} />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              className={`${styles.viewportBtn} ${viewport === "tablet" ? styles.activeViewport : ""}`}
              onClick={() => setViewport("tablet")}
              aria-pressed={viewport === "tablet"}
              title="Tablet View (768px)"
            >
              <Tablet size={14} />
              <span>Tablet</span>
            </button>
            <button
              type="button"
              className={`${styles.viewportBtn} ${viewport === "mobile" ? styles.activeViewport : ""}`}
              onClick={() => setViewport("mobile")}
              aria-pressed={viewport === "mobile"}
              title="Mobile View (375px)"
            >
              <Smartphone size={14} />
              <span>Mobile</span>
            </button>
          </div>

          {/* Quick full-page links for route-based states */}
          {activeStateId === "not-found" && (
            <Link href="/non-existent-demo-route" className={styles.headerLink}>
              <span>Open live 404</span>
              <ExternalLink size={12} />
            </Link>
          )}

          {activeStateId === "maintenance" && (
            <Link href="/maintenance" className={styles.headerLink}>
              <span>Open live /maintenance</span>
              <ExternalLink size={12} />
            </Link>
          )}
        </div>
      </header>

      {/* Main Gallery Layout */}
      <div className={styles.galleryLayout}>
        {/* Sidebar Navigation */}
        <aside className={styles.sidebar} aria-label="System States Directory">
          <div className={styles.sidebarInner}>
            {SYSTEM_STATE_CATEGORIES.map((cat) => {
              const items = Object.values(SYSTEM_STATE_PRESETS).filter(
                (p) => p.category === cat.id
              );

              return (
                <div key={cat.id} className={styles.categoryGroup}>
                  <div className={styles.categoryHeader}>
                    <span>{cat.label}</span>
                    <span className={styles.categoryCount}>{items.length}</span>
                  </div>

                  {items.map((item) => {
                    const isActive = item.id === activeStateId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`${styles.stateNavButton} ${isActive ? styles.activeNavButton : ""}`}
                        onClick={() => selectState(item.id)}
                        aria-pressed={isActive}
                      >
                        <span>{item.title}</span>
                        <span
                          className={`${styles.variantIndicator} ${styles[`indicator-${item.variant}`]}`}
                          title={`Variant: ${item.variant}`}
                        />
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </aside>

        {/* State Preview Stage */}
        <main className={styles.workspace} aria-label="System State Live Preview">
          {/* Metadata banner */}
          <div className={styles.stateBanner}>
            <div className={styles.bannerInfo}>
              <div className={styles.bannerHeading}>
                <span>{preset.title}</span>
                <span className={styles.galleryBadge}>
                  {preset.category.toUpperCase()} · {preset.variant.toUpperCase()}
                </span>
              </div>
              <p className={styles.bannerSub}>{preset.contextNote}</p>
            </div>

            <div className={styles.bannerActions}>
              {/* If state has a primary retry action, allow test click */}
              {preset.primaryAction?.label === "Try again" && (
                <button
                  type="button"
                  className={styles.simulateBtn}
                  onClick={handleSimulateRetry}
                  disabled={isSimulatingRetry}
                >
                  <RefreshCw size={13} className={isSimulatingRetry ? "animate-spin" : ""} />
                  <span>{isSimulatingRetry ? "Simulating retry..." : "Test Retry Action"}</span>
                </button>
              )}

              {/* If state has a Request action, allow triggering real Request Widget */}
              {(preset.id === "no-search-results" ||
                preset.id === "product-unavailable" ||
                preset.id === "empty-category" ||
                preset.id === "product-removed") && (
                <button
                  type="button"
                  className={styles.simulateBtn}
                  onClick={() => handleTriggerRequest(preset.id === "no-search-results" ? "iPhone 15 Pro case" : "Nike Air Max 270")}
                >
                  <span>✨ Open Request Widget</span>
                </button>
              )}
            </div>
          </div>

          {/* Canvas Frame with responsive sizing */}
          <div className={`${styles.canvasFrame} ${styles[`frame-${viewport}`]}`}>
            <div className={styles.viewportContainer}>
              {/* 1. PAGES CATEGORY (Full-page vs in-context preview) */}
              {preset.category === "pages" && (
                <SystemState
                  variant={preset.variant}
                  iconName={preset.iconName}
                  eyebrow={preset.eyebrow}
                  title={preset.title}
                  description={preset.description}
                  compact={false}
                  fullPage={false}
                  primaryAction={{
                    label: preset.primaryAction?.label || "Action",
                    href: preset.primaryAction?.href,
                    variant: preset.primaryAction?.variant,
                    loading: isSimulatingRetry,
                    onClick: handleSimulateRetry,
                  }}
                  secondaryAction={preset.secondaryAction}
                >
                  {/* Contextual extras for certain states */}
                  {preset.id === "offline" && (
                    <div style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748b" }}>
                      <WifiOff size={14} />
                      <span>Monitors real-time browser online/offline events</span>
                    </div>
                  )}
                  {preset.id === "session-expired" && (
                    <div style={{ marginTop: "12px", fontSize: "12.5px", color: "#64748b" }}>
                      Intended return URL: <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>/cart/checkout</code>
                    </div>
                  )}
                  {preset.id === "too-many-requests" && (
                    <div style={{ marginTop: "12px", fontSize: "12.5px", color: "#64748b" }}>
                      Retry available in: <strong>28 seconds</strong>
                    </div>
                  )}
                </SystemState>
              )}

              {/* 2. COMMERCE CATEGORY */}
              {preset.category === "commerce" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <SystemState
                    variant={preset.variant}
                    iconName={preset.iconName}
                    eyebrow={preset.eyebrow}
                    title={preset.title}
                    description={preset.description}
                    compact
                    primaryAction={{
                      label: preset.primaryAction?.label || "Action",
                      variant: "primary",
                      onClick: () => {
                        if (preset.id === "no-search-results") {
                          handleTriggerRequest("iPhone 15 Pro case");
                        } else {
                          handleTriggerRequest("Nike Air Max 270");
                        }
                      },
                    }}
                    secondaryAction={preset.secondaryAction}
                  />

                  {/* Supporting contextual mock for Product Unavailable */}
                  {(preset.id === "product-unavailable" || preset.id === "product-removed") && (
                    <div className={styles.mockContextContainer}>
                      <div className={styles.mockContextTitle}>Preserved Product Context</div>
                      <div className={styles.mockProductItem}>
                        <div className={styles.mockThumb}>👟</div>
                        <div className={styles.mockDetails}>
                          <span className={styles.mockName}>Nike Air Max 270 — Black/White</span>
                          <span className={styles.mockMeta}>
                            Kathmandu Footwear Hub · Rs. 14,500 · Shoes & Fashion
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Supporting contextual mock for No Search Results */}
                  {preset.id === "no-search-results" && (
                    <div className={styles.mockContextContainer}>
                      <div className={styles.mockContextTitle}>Active Search Query</div>
                      <div className={styles.mockProductItem}>
                        <div className={styles.mockThumb}>🔍</div>
                        <div className={styles.mockDetails}>
                          <span className={styles.mockName}>Query: “iPhone 15 Pro case”</span>
                          <span className={styles.mockMeta}>
                            Location: New Baneshwor, Kathmandu · Category: All
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. REQUESTS CATEGORY */}
              {preset.category === "requests" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <SystemState
                    variant={preset.variant}
                    iconName={preset.iconName}
                    eyebrow={preset.eyebrow}
                    title={preset.title}
                    description={preset.description}
                    compact
                    primaryAction={{
                      label: preset.primaryAction?.label || "Action",
                      variant: "primary",
                      loading: isSimulatingRetry,
                      onClick: () => {
                        if (preset.id === "request-submit-failed") {
                          handleSimulateRetry();
                        } else {
                          handleTriggerRequest("Wireless mechanical keyboard");
                        }
                      },
                    }}
                    secondaryAction={preset.secondaryAction}
                  />

                  {/* Context for Active / Expired Request */}
                  <div className={styles.mockContextContainer}>
                    <div className={styles.mockContextTitle}>Request Details</div>
                    <div className={styles.mockProductItem}>
                      <div className={styles.mockThumb}>⌨️</div>
                      <div className={styles.mockDetails}>
                        <span className={styles.mockName}>Wireless mechanical keyboard (Keychron K2)</span>
                        <span className={styles.mockMeta}>
                          Electronics · Budget: Rs. 11,000 · Requested 2 days ago
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. FORMS CATEGORY */}
              {preset.category === "forms" && (
                <div className={styles.demoForm}>
                  <FormSubmissionError
                    title="Couldn’t submit your request"
                    description="Your information is still here. Please try again."
                    onRetry={handleSimulateRetry}
                    isRetrying={isSimulatingRetry}
                  />

                  <div className={styles.formField}>
                    <label className={styles.fieldLabel} htmlFor="demo-item-name">
                      Item name (with error)
                    </label>
                    <input
                      id="demo-item-name"
                      className={`${styles.textInput} ${styles.inputError}`}
                      defaultValue=""
                      aria-invalid="true"
                      aria-describedby="demo-item-error"
                    />
                    <InlineFieldError id="demo-item-error" message="Enter an item name." />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.fieldLabel} htmlFor="demo-phone">
                      Phone number (with error)
                    </label>
                    <input
                      id="demo-phone"
                      className={`${styles.textInput} ${styles.inputError}`}
                      defaultValue="980"
                      aria-invalid="true"
                      aria-describedby="demo-phone-error"
                    />
                    <InlineFieldError id="demo-phone-error" message="Enter a valid 10-digit mobile number." />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.fieldLabel} htmlFor="demo-category">
                      Category (valid)
                    </label>
                    <input
                      id="demo-category"
                      className={`${styles.textInput} ${styles.inputSuccess}`}
                      defaultValue="Electronics & Gadgets"
                      aria-invalid="false"
                      aria-describedby="demo-category-success"
                    />
                    <InlineFieldSuccess id="demo-category-success" message="Category recognized" />
                  </div>
                </div>
              )}

              {/* 5. UPLOAD CATEGORY */}
              {preset.category === "upload" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "480px", margin: "0 auto" }}>
                  {preset.id === "uploading" && (
                    <UploadState
                      status="uploading"
                      fileName="product-photo.jpg"
                      fileSizeText="2.4 MB"
                      progressPercent={64}
                      onCancel={() => {}}
                    />
                  )}

                  {preset.id === "unsupported-file" && (
                    <UploadState
                      status="error"
                      fileName="product_spec.pdf"
                      errorReason="unsupported-format"
                      onRetry={handleSimulateRetry}
                      onRemove={() => {}}
                    />
                  )}

                  {preset.id === "file-too-large" && (
                    <UploadState
                      status="error"
                      fileName="highres_banner.png"
                      errorReason="file-too-large"
                      maxSizeBytes={5 * 1024 * 1024}
                      onRetry={handleSimulateRetry}
                      onRemove={() => {}}
                    />
                  )}

                  {preset.id === "upload-failed" && (
                    <UploadState
                      status="error"
                      fileName="sample_image.webp"
                      errorReason="network-failure"
                      onRetry={handleSimulateRetry}
                      onRemove={() => {}}
                    />
                  )}
                </div>
              )}

              {/* 6. LOADING CATEGORY */}
              {preset.category === "loading" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <SlowLoadingNotice
                    delayMs={0}
                    title="This is taking longer than usual"
                    description="We’re still trying to load your results."
                    onRetry={handleSimulateRetry}
                  />

                  <div>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "#334155" }}>
                      Product Card Skeleton
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: viewport === "mobile" ? "1fr" : "1fr 1fr", gap: "16px" }}>
                      <ProductCardSkeleton />
                      {viewport !== "mobile" && <ProductCardSkeleton />}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "#334155" }}>
                      Store Card Skeleton
                    </h3>
                    <StoreCardSkeleton />
                  </div>

                  <div>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "#334155" }}>
                      Request Card Skeleton
                    </h3>
                    <RequestCardSkeleton />
                  </div>
                </div>
              )}

              {/* 7. PLATFORM CATEGORY */}
              {preset.category === "platform" && (
                <div>
                  {preset.id === "mobile-app-required" ? (
                    <MobileAppRequired
                      feature="Chat with Sellers"
                      description="Chat directly with local merchants from the Briz mobile app."
                    />
                  ) : (
                    <SystemState
                      variant={preset.variant}
                      iconName={preset.iconName}
                      eyebrow={preset.eyebrow}
                      title={preset.title}
                      description={preset.description}
                      compact
                      primaryAction={preset.primaryAction}
                      secondaryAction={preset.secondaryAction}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
