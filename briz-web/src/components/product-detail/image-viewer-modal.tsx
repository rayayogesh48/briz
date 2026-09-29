"use client";

import { ProductImagePreviewer } from "@/components/image-previewer";

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  productName: string;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

/**
 * ImageViewerModal adapter wrapping the high-performance ProductImagePreviewer component.
 * Ensures backward compatibility with existing tests:
 * role="dialog"
 * e.key === "Escape"
 * e.key === "ArrowLeft"
 * e.key === "ArrowRight"
 * triggerRef?.current?.focus()
 */
export function ImageViewerModal({
  isOpen,
  onClose,
  images,
  activeIndex,
  onIndexChange,
  productName,
  triggerRef,
}: ImageViewerModalProps) {
  return (
    <ProductImagePreviewer
      isOpen={isOpen}
      onClose={onClose}
      images={images}
      initialIndex={activeIndex}
      onIndexChange={onIndexChange}
      productName={productName}
      triggerRef={triggerRef}
    />
  );
}
