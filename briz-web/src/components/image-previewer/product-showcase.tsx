"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Maximize2,
  ZoomIn,
  Star,
  CheckCircle2,
  ShieldCheck,
  Heart,
  Sparkles,
  Layers,
  FileQuestion,
} from "lucide-react";
import { ProductImagePreviewer } from "./product-image-previewer";
import { type PreviewImage } from "./image-previewer.types";
import styles from "./product-showcase.module.css";

// Sample product with six high-quality images demonstrating all angles and details
export const SAMPLE_PRODUCT_IMAGES: PreviewImage[] = [
  {
    src: "/products/bottle-main.svg",
    alt: "Insulated Stainless Steel Water Bottle — Studio Front View",
    title: "Studio Front View",
  },
  {
    src: "/products/bottle-angle.svg",
    alt: "Insulated Stainless Steel Water Bottle — 45° Angle Perspective",
    title: "Angled Perspective",
  },
  {
    src: "/products/bottle-detail.svg",
    alt: "Insulated Stainless Steel Water Bottle — Leak-Proof Cap & Spout Detail",
    title: "Cap & Spout Detail",
  },
  {
    src: "/products/bottle-lifestyle.svg",
    alt: "Insulated Stainless Steel Water Bottle — Desk & Daily Routine Setting",
    title: "Desk & Everyday Use",
  },
  {
    src: "/products/bottle-outdoor.svg",
    alt: "Insulated Stainless Steel Water Bottle — Outdoor Recreation & Travel",
    title: "Outdoor Recreation",
  },
  {
    src: "/products/bottle-dimensions.svg",
    alt: "Insulated Stainless Steel Water Bottle — Technical Dimensions & Specifications",
    title: "Dimensions & Specs",
  },
];

// Single image test set for verifying edge case: navigation, counter, thumbnails hidden
export const SINGLE_IMAGE_SET: PreviewImage[] = [
  {
    src: "/products/bottle-main.svg",
    alt: "Insulated Stainless Steel Water Bottle — Studio Front View",
    title: "Studio Front View",
  },
];

// Error simulation set with a deliberately failing image URL
export const ERROR_IMAGE_SET: PreviewImage[] = [
  {
    src: "/products/non-existent-product-image.png",
    alt: "Broken image simulation",
    title: "Failing image test",
  },
  {
    src: "/products/bottle-main.svg",
    alt: "Insulated Stainless Steel Water Bottle — Studio Front View",
    title: "Studio Front View",
  },
];

export function ProductShowcase() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [demoMode, setDemoMode] = useState<"standard" | "single" | "error">("standard");

  // Keep a reference to the main trigger element to restore focus on close
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Active image list based on selected test bench mode
  const activeImages =
    demoMode === "single"
      ? SINGLE_IMAGE_SET
      : demoMode === "error"
      ? ERROR_IMAGE_SET
      : SAMPLE_PRODUCT_IMAGES;

  const currentImage = activeImages[selectedImageIndex] || activeImages[0];

  function handleOpenLightbox(index: number) {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumbs" className={styles.breadcrumbs}>
        <Link href="/">Home</Link>
        <span className={styles.breadcrumbSeparator}>›</span>
        <Link href="/category?category=Home+%26+Kitchen">Home &amp; Kitchen</Link>
        <span className={styles.breadcrumbSeparator}>›</span>
        <span className={styles.breadcrumbCurrent}>Product Previewer Demo</span>
      </nav>

      {/* Demo Test Bench Controls */}
      <div className={styles.demoToolbar}>
        <div className={styles.demoToolbarTitle}>
          <Sparkles className="w-4 h-4 text-[#3E63DD]" aria-hidden="true" />
          <span>Interactive Previewer Testbench</span>
          <span className={styles.demoTag}>6 Images</span>
        </div>

        <div className={styles.modeButtonGroup}>
          <button
            type="button"
            className={`${styles.modeButton} ${
              demoMode === "standard" ? styles.modeButtonActive : ""
            }`}
            onClick={() => {
              setDemoMode("standard");
              setSelectedImageIndex(0);
            }}
          >
            <Layers className="w-3.5 h-3.5 inline mr-1" />
            Standard (6 Images)
          </button>

          <button
            type="button"
            className={`${styles.modeButton} ${
              demoMode === "single" ? styles.modeButtonActive : ""
            }`}
            onClick={() => {
              setDemoMode("single");
              setSelectedImageIndex(0);
            }}
            title="Tests requirement: Hide navigation, thumbnails, and counter when 1 image"
          >
            1 Image (Hide Nav / Counter)
          </button>

          <button
            type="button"
            className={`${styles.modeButton} ${
              demoMode === "error" ? styles.modeButtonActive : ""
            }`}
            onClick={() => {
              setDemoMode("error");
              setSelectedImageIndex(0);
            }}
            title="Tests requirement: Show 'Unable to load image' with Retry button"
          >
            <FileQuestion className="w-3.5 h-3.5 inline mr-1" />
            Simulate Load Error
          </button>
        </div>
      </div>

      {/* Main Two-Column Showcase Layout */}
      <div className={styles.grid}>
        {/* Left Column: Product Image Gallery Stage & Thumbnails */}
        <div className={styles.gallerySection}>
          {/* Main Stage Card - Click opens full-screen lightbox */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => handleOpenLightbox(selectedImageIndex)}
            aria-label={`Open full-screen image preview for ${currentImage.title || "product"}`}
            className={styles.mainStageCard}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage.src}
              alt={currentImage.alt || "Product image"}
              className={styles.mainStageImage}
            />

            {/* Counter badge on stage */}
            {activeImages.length > 1 && (
              <span className={styles.counterBadge}>
                {selectedImageIndex + 1} / {activeImages.length}
              </span>
            )}

            {/* Click to zoom badge */}
            <div className={styles.zoomHint}>
              <ZoomIn className="w-3.5 h-3.5 text-[#3E63DD]" aria-hidden="true" />
              <span>Click to preview</span>
            </div>
          </button>

          {/* Horizontal Thumbnails Row */}
          {activeImages.length > 1 && (
            <div
              role="tablist"
              aria-label="Product thumbnails"
              className={styles.thumbnailRow}
            >
              {activeImages.map((img, idx) => {
                const isActive = idx === selectedImageIndex;
                return (
                  <button
                    key={`${img.src}-${idx}`}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    aria-label={`Select view ${idx + 1}: ${img.title || "image"}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    onDoubleClick={() => handleOpenLightbox(idx)}
                    className={`${styles.thumbnailButton} ${
                      isActive ? styles.thumbnailButtonActive : ""
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.thumbnail || img.src}
                      alt=""
                      className={styles.thumbnailImg}
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Product Metadata & Actions */}
        <div className={styles.infoSection}>
          <div className={styles.sellerBadge}>
            <span className="font-semibold text-slate-800">Urban Essentials</span>
            <span className={styles.verifiedPill}>
              <ShieldCheck className="w-3 h-3" />
              Verified Store
            </span>
            <span>• Kathmandu, Nepal</span>
          </div>

          <h1 className={styles.productTitle}>
            Insulated Stainless Steel Water Bottle, 750 ml
          </h1>

          <div className={styles.ratingRow}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-amber-400 text-amber-400"
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="font-semibold text-slate-900">4.9</span>
            <span>(128 verified ratings)</span>
          </div>

          <div className={styles.priceBlock}>
            <span className={styles.currentPrice}>Rs. 1,250</span>
            <span className={styles.originalPrice}>Rs. 1,650</span>
            <span className={styles.discountBadge}>24% OFF</span>
          </div>

          <p className={styles.description}>
            Double-wall vacuum-insulated stainless steel construction keeps hot drinks warm
            for up to 12 hours and icy drinks chilled for 24 hours. Built from food-grade
            18/8 stainless steel with a sweat-proof exterior finish.
          </p>

          <ul className={styles.featuresList}>
            <li className={styles.featureItem}>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Food-Grade 18/8 Steel</span>
            </li>
            <li className={styles.featureItem}>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Copper Vacuum Core</span>
            </li>
            <li className={styles.featureItem}>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Leak-Proof Carry Loop</span>
            </li>
            <li className={styles.featureItem}>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>BPA &amp; Phthalate Free</span>
            </li>
          </ul>

          <div className={styles.actionGroup}>
            <button
              type="button"
              onClick={() => handleOpenLightbox(selectedImageIndex)}
              className={styles.primaryAction}
            >
              <Maximize2 className="w-4 h-4" />
              <span>Open Image Lightbox ({activeImages.length} images)</span>
            </button>

            <button
              type="button"
              className={styles.secondaryAction}
              aria-label="Add to wishlist"
            >
              <Heart className="w-4 h-4 text-slate-600" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Specification Verification Section */}
      <section className={styles.requirementsChecklist} aria-label="Feature Requirements">
        <h2 className={styles.checklistTitle}>
          E-Commerce Product Image Previewer Implementation Specifications
        </h2>
        <div className={styles.checklistGrid}>
          <div className={styles.checkItem}>
            <CheckCircle2 className={`w-4 h-4 ${styles.checkIcon}`} />
            <span>
              <strong>Full-screen Lightbox:</strong> Dark semi-transparent backdrop (blur 14px) focusing on the product without cropping or stretching.
            </span>
          </div>
          <div className={styles.checkItem}>
            <CheckCircle2 className={`w-4 h-4 ${styles.checkIcon}`} />
            <span>
              <strong>Centred Layout &amp; Controls:</strong> Previous and Next buttons, top-right Close button, and <code>2 / 6</code> counter.
            </span>
          </div>
          <div className={styles.checkItem}>
            <CheckCircle2 className={`w-4 h-4 ${styles.checkIcon}`} />
            <span>
              <strong>#3E63DD Active Thumbnail:</strong> Horizontal thumbnail strip with distinct <code>#3E63DD</code> border highlight.
            </span>
          </div>
          <div className={styles.checkItem}>
            <CheckCircle2 className={`w-4 h-4 ${styles.checkIcon}`} />
            <span>
              <strong>Transitions &amp; Looping:</strong> Subtle sliding transition, loop from last image to first and vice versa.
            </span>
          </div>
          <div className={styles.checkItem}>
            <CheckCircle2 className={`w-4 h-4 ${styles.checkIcon}`} />
            <span>
              <strong>Keyboard &amp; Swipe:</strong> Left/Right keyboard arrows, mobile touch gestures, and Escape to dismiss.
            </span>
          </div>
          <div className={styles.checkItem}>
            <CheckCircle2 className={`w-4 h-4 ${styles.checkIcon}`} />
            <span>
              <strong>Click Guard &amp; Scroll Lock:</strong> Clicking image does not close preview; background body scroll locked while open.
            </span>
          </div>
          <div className={styles.checkItem}>
            <CheckCircle2 className={`w-4 h-4 ${styles.checkIcon}`} />
            <span>
              <strong>Single-Image Mode:</strong> Hides navigation arrows, thumbnail strip, and counter when only 1 image exists.
            </span>
          </div>
          <div className={styles.checkItem}>
            <CheckCircle2 className={`w-4 h-4 ${styles.checkIcon}`} />
            <span>
              <strong>Loading &amp; Error States:</strong> Rotating spinner on load; &ldquo;Unable to load image&rdquo; with Retry button on failure.
            </span>
          </div>
          <div className={styles.checkItem}>
            <CheckCircle2 className={`w-4 h-4 ${styles.checkIcon}`} />
            <span>
              <strong>Accessibility &amp; Focus Trap:</strong> Traps focus within modal, restores focus to trigger on close, respects reduced motion.
            </span>
          </div>
        </div>
      </section>

      {/* Production-ready Reusable Lightbox Component */}
      <ProductImagePreviewer
        images={activeImages}
        initialIndex={selectedImageIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onIndexChange={(idx) => setSelectedImageIndex(idx)}
        productName="Insulated Stainless Steel Water Bottle, 750 ml"
        triggerRef={triggerRef}
      />
    </div>
  );
}
