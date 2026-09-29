export interface PreviewImage {
  src: string;
  alt?: string;
  thumbnail?: string;
  title?: string;
}

export interface ProductImagePreviewerProps {
  /**
   * List of images to preview. Can be an array of image URL strings
   * or PreviewImage objects with custom alt text and thumbnails.
   */
  images: (string | PreviewImage)[];

  /**
   * The initially selected image index (0-indexed). Defaults to 0.
   */
  initialIndex?: number;

  /**
   * Whether the full-screen lightbox is currently open.
   */
  isOpen: boolean;

  /**
   * Callback fired when the lightbox requests to close
   * (via close button, Escape key, or backdrop click).
   */
  onClose: () => void;

  /**
   * Optional callback fired when the active image index changes.
   */
  onIndexChange?: (index: number) => void;

  /**
   * Optional product name for accessible dialog labelling and header copy.
   */
  productName?: string;

  /**
   * Optional reference to the element that triggered opening the previewer.
   * Focus will be smoothly restored to this element upon closing.
   */
  triggerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Normalizes input image items (string or object) to a consistent PreviewImage structure.
 */
export function normalizePreviewImages(
  rawImages: (string | PreviewImage)[] | undefined,
  fallbackAlt = "Product image"
): PreviewImage[] {
  if (!rawImages || !Array.isArray(rawImages) || rawImages.length === 0) {
    return [];
  }

  return rawImages.map((item, idx) => {
    if (typeof item === "string") {
      return {
        src: item,
        alt: `${fallbackAlt} — view ${idx + 1}`,
        thumbnail: item,
      };
    }
    return {
      src: item.src,
      alt: item.alt || `${fallbackAlt} — view ${idx + 1}`,
      thumbnail: item.thumbnail || item.src,
      title: item.title,
    };
  });
}
