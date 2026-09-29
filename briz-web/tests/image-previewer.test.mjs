import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, existsSync } from "node:fs";

test("image-previewer.types.ts defines PreviewImage, ProductImagePreviewerProps, and normalizePreviewImages", () => {
  const typesContent = readFileSync(
    new URL("../src/components/image-previewer/image-previewer.types.ts", import.meta.url),
    "utf8"
  );

  assert.match(typesContent, /export interface PreviewImage/);
  assert.match(typesContent, /export interface ProductImagePreviewerProps/);
  assert.match(typesContent, /export function normalizePreviewImages/);
  assert.match(typesContent, /triggerRef\?: React\.RefObject<HTMLElement \| null>/);
  assert.match(typesContent, /initialIndex\?: number/);
  assert.match(typesContent, /onIndexChange\?: \(index: number\) => void/);
});

test("ProductImagePreviewer component implements all user specifications", () => {
  const previewerTsx = readFileSync(
    new URL("../src/components/image-previewer/product-image-previewer.tsx", import.meta.url),
    "utf8"
  );
  const previewerCss = readFileSync(
    new URL("../src/components/image-previewer/product-image-previewer.module.css", import.meta.url),
    "utf8"
  );

  // 1. Opening the preview: Dark semi-transparent backdrop & non-cropped image display
  assert.match(previewerCss, /background-color:\s*rgba\(9,\s*13,\s*22,\s*0\.94\)/);
  assert.match(previewerCss, /backdrop-filter:\s*blur\(14px\)/);
  assert.match(previewerCss, /object-fit:\s*contain/);

  // 2. Layout & Controls: Centered image, Previous, Next, Close button, Counter
  assert.match(previewerTsx, /aria-label="Previous image \(Left arrow\)"/);
  assert.match(previewerTsx, /aria-label="Next image \(Right arrow\)"/);
  assert.match(previewerTsx, /aria-label="Close image preview \(Escape\)"/);
  assert.match(previewerTsx, /\{activeIndex\s*\+\s*1\}\s*\/\s*\{totalCount\}/);

  // 3. Highlight the active thumbnail with #3E63DD border
  assert.match(previewerCss, /border-color:\s*#3E63DD\s*!important/);
  assert.match(previewerCss, /rgba\(62,\s*99,\s*221/);

  // 4. Looping: last image to first and first to last
  assert.match(previewerTsx, /if\s*\(nextIdx\s*>=\s*totalCount\)\s*\{\s*resolvedIndex\s*=\s*0;/);
  assert.match(previewerTsx, /if\s*\(nextIdx\s*<\s*0\)\s*\{\s*resolvedIndex\s*=\s*totalCount\s*-\s*1;/);

  // 5. Interaction safety: Clicking the image must not close the preview
  assert.match(previewerTsx, /className=\{styles\.imageFrame\}/);
  assert.match(previewerTsx, /onClick=\{\(e\)\s*=>\s*\{\s*\/\/\s*Crucial requirement:\s*Clicking the image must not close the preview\s*e\.stopPropagation\(\);/);

  // 6. Single image edge case: Hide navigation, thumbnails, and counter
  assert.match(previewerTsx, /const hasMultiple = totalCount > 1;/);
  assert.match(previewerTsx, /\{hasMultiple\s*&&\s*\(/);

  // 7. Scroll lock: Background scroll locked while open
  assert.match(previewerTsx, /document\.body\.style\.overflow\s*=\s*"hidden"/);

  // 8. Mobile touch swipe gestures
  assert.match(previewerTsx, /onTouchStart=\{handleTouchStart\}/);
  assert.match(previewerTsx, /onTouchMove=\{handleTouchMove\}/);
  assert.match(previewerTsx, /onTouchEnd=\{handleTouchEnd\}/);

  // 9. Keyboard controls: ArrowLeft, ArrowRight, Escape
  assert.match(previewerTsx, /e\.key\s*===\s*"Escape"/);
  assert.match(previewerTsx, /e\.key\s*===\s*"ArrowLeft"/);
  assert.match(previewerTsx, /e\.key\s*===\s*"ArrowRight"/);

  // 10. Focus trap & focus return
  assert.match(previewerTsx, /e\.key\s*===\s*"Tab"/);
  assert.match(previewerTsx, /triggerRef\?\.current\?\.focus\(\)/);

  // 11. Loading & Error states with Retry button
  assert.match(previewerTsx, /role="status"/);
  assert.match(previewerTsx, /Loading image…/);
  assert.match(previewerTsx, /Unable to load image/);
  assert.match(previewerTsx, /<button[^>]*onClick=\{handleRetry\}[^>]*>[\s\S]*?Retry/);

  // 12. Minimum 44px touch targets on mobile and desktop
  assert.match(previewerCss, /min-width:\s*44px/);
  assert.match(previewerCss, /min-height:\s*44px/);

  // 13. Reduced motion preferences
  assert.match(previewerCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

test("Sample product with 6 images and demonstration testbench", () => {
  const showcaseTsx = readFileSync(
    new URL("../src/components/image-previewer/product-showcase.tsx", import.meta.url),
    "utf8"
  );

  // 1. Sample product contains exactly 6 images
  assert.match(showcaseTsx, /SAMPLE_PRODUCT_IMAGES:\s*PreviewImage\[\]/);
  assert.match(showcaseTsx, /\/products\/bottle-main\.svg/);
  assert.match(showcaseTsx, /\/products\/bottle-angle\.svg/);
  assert.match(showcaseTsx, /\/products\/bottle-detail\.svg/);
  assert.match(showcaseTsx, /\/products\/bottle-lifestyle\.svg/);
  assert.match(showcaseTsx, /\/products\/bottle-outdoor\.svg/);
  assert.match(showcaseTsx, /\/products\/bottle-dimensions\.svg/);

  // 2. Interactive testbench modes
  assert.match(showcaseTsx, /Standard \(6 Images\)/);
  assert.match(showcaseTsx, /1 Image \(Hide Nav \/ Counter\)/);
  assert.match(showcaseTsx, /Simulate Load Error/);

  // 3. Demo page route exists
  assert.ok(existsSync(new URL("../src/app/previewer/page.tsx", import.meta.url)));
  assert.ok(existsSync(new URL("../src/app/image-previewer/page.tsx", import.meta.url)));
});

test("Product detail image-viewer-modal is upgraded to ProductImagePreviewer", () => {
  const modalTsx = readFileSync(
    new URL("../src/components/product-detail/image-viewer-modal.tsx", import.meta.url),
    "utf8"
  );
  assert.match(modalTsx, /import\s*\{\s*ProductImagePreviewer\s*\}\s*from\s*"@\/components\/image-previewer"/);
  assert.match(modalTsx, /<ProductImagePreviewer/);
});
