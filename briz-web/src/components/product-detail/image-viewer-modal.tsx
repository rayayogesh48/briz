"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  productName: string;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export function ImageViewerModal({
  isOpen,
  onClose,
  images,
  activeIndex,
  onIndexChange,
  productName,
  triggerRef,
}: ImageViewerModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Restore focus to the trigger button when closing
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      triggerRef?.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, triggerRef]);

  // Keyboard navigation: Escape, ArrowLeft, ArrowRight
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onIndexChange(activeIndex === 0 ? images.length - 1 : activeIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onIndexChange(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeIndex, images.length, onClose, onIndexChange]);

  if (!isOpen) return null;

  const currentImage = images[activeIndex] || images[0];

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Image viewer for ${productName}`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/90 p-4 backdrop-blur-md transition-opacity animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Bar */}
      <div className="flex w-full max-w-5xl items-center justify-between py-2 text-white">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider text-white">
            {activeIndex + 1} / {images.length}
          </span>
          <span className="hidden truncate text-sm font-medium text-slate-300 sm:inline-block max-w-md">
            {productName}
          </span>
        </div>

        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close image viewer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex h-[70vh] w-full max-w-4xl items-center justify-center">
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onIndexChange(activeIndex === 0 ? images.length - 1 : activeIndex - 1)}
            aria-label="Previous product image"
            className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/80 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-white sm:left-4"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <div className="relative flex h-full w-full items-center justify-center p-4">
          <Image
            src={currentImage}
            alt={`${productName} - view ${activeIndex + 1}`}
            fill
            sizes="(max-width: 1024px) 90vw, 800px"
            className="object-contain"
            priority
          />
        </div>

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onIndexChange(activeIndex === images.length - 1 ? 0 : activeIndex + 1)}
            aria-label="Next product image"
            className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/80 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-white sm:right-4"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnails Strip */}
      {images.length > 1 && (
        <div className="flex w-full max-w-lg items-center justify-center gap-3 overflow-x-auto py-3">
          {images.map((img, idx) => (
            <button
              key={img}
              type="button"
              onClick={() => onIndexChange(idx)}
              aria-label={`View image ${idx + 1} of ${images.length}`}
              aria-current={idx === activeIndex ? "true" : undefined}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                idx === activeIndex
                  ? "border-[#3e63dd] ring-2 ring-[#3e63dd]/40 scale-105"
                  : "border-white/20 opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt=""
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
