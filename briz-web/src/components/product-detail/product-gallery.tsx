"use client";

import { useState, useRef, TouchEvent } from "react";
import Image from "next/image";
import { ZoomIn, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { ImageViewerModal } from "./image-viewer-modal";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Touch swipe support for mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 45;

  const currentImage = images[activeIndex] || images[0] || "/products/bottle-main.svg";

  function handleTouchStart(e: TouchEvent) {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  }

  function handleTouchMove(e: TouchEvent) {
    touchEndX.current = e.targetTouches[0].clientX;
  }

  function handleTouchEnd() {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeIndex < images.length - 1) {
      setActiveIndex((prev) => prev + 1);
    } else if (isRightSwipe && activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }

  function handleImageError(index: number) {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  }

  return (
    <section className="flex flex-col gap-4 w-full" aria-label="Product Image Gallery">
      {/* Main Showcase Stage */}
      <div
        className="relative w-full aspect-square rounded-2xl bg-white border border-[#ebebeb] shadow-sm overflow-hidden flex items-center justify-center group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Click to open Lightbox Trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          aria-label={`Open full-screen image viewer for ${productName}`}
          className="relative h-full w-full flex items-center justify-center p-6 cursor-zoom-in focus-visible:ring-2 focus-visible:ring-[#3e63dd] focus-visible:outline-none"
        >
          {failedImages[activeIndex] ? (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
              <ImageOff className="h-12 w-12 stroke-[1.5]" />
              <span className="text-xs font-medium">Image preview unavailable</span>
            </div>
          ) : (
            <Image
              src={currentImage}
              alt={`${productName} - Image ${activeIndex + 1} of ${images.length}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 55vw, 680px"
              priority={activeIndex === 0}
              className="object-contain p-4 transition-transform duration-200 group-hover:scale-[1.02]"
              onError={() => handleImageError(activeIndex)}
            />
          )}

          {/* Hover Zoom Prompt Badge on Desktop */}
          <div className="absolute bottom-4 right-4 hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-[#ebebeb] shadow-sm text-xs font-semibold text-[#202020] opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="h-3.5 w-3.5 text-[#3e63dd]" />
            <span>Click to zoom</span>
          </div>
        </button>

        {/* Mobile Image Counter Badge */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-3 md:hidden z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-semibold tracking-wider">
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* Mobile Swipe Navigation Chevrons */}
        {images.length > 1 && (
          <>
            {activeIndex > 0 && (
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => prev - 1)}
                aria-label="Previous image"
                className="absolute left-2 md:hidden z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 shadow border border-[#ebebeb] text-[#202020] transition active:scale-95"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {activeIndex < images.length - 1 && (
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => prev + 1)}
                aria-label="Next image"
                className="absolute right-2 md:hidden z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 shadow border border-[#ebebeb] text-[#202020] transition active:scale-95"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Desktop Thumbnail Row */}
      {images.length > 1 && (
        <div
          role="tablist"
          aria-label="Product image thumbnails"
          className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none"
        >
          {images.map((img, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={img}
                role="tab"
                type="button"
                aria-selected={isSelected}
                aria-label={`Thumbnail ${idx + 1}: select image ${idx + 1}`}
                onClick={() => setActiveIndex(idx)}
                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all ${
                  isSelected
                    ? "border-[#3e63dd] shadow-sm ring-2 ring-[#3e63dd]/20"
                    : "border-[#ebebeb] hover:border-slate-300 opacity-80 hover:opacity-100"
                }`}
              >
                {failedImages[idx] ? (
                  <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
                    <ImageOff className="h-5 w-5" />
                  </div>
                ) : (
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                    onError={() => handleImageError(idx)}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Accessible Full Screen Lightbox Modal */}
      <ImageViewerModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={images}
        activeIndex={activeIndex}
        onIndexChange={setActiveIndex}
        productName={productName}
        triggerRef={triggerRef}
      />
    </section>
  );
}

