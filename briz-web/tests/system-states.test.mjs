import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, existsSync } from "node:fs";

test("SystemState component architecture, tokens, accessibility, and variant system", () => {
  const stateTsx = readFileSync(new URL("../src/components/system-state/system-state.tsx", import.meta.url), "utf8");
  const stateCss = readFileSync(new URL("../src/components/system-state/system-state.module.css", import.meta.url), "utf8");
  const dataTs = readFileSync(new URL("../src/components/system-state/system-states-data.ts", import.meta.url), "utf8");
  const indexTs = readFileSync(new URL("../src/components/system-state/index.ts", import.meta.url), "utf8");

  // 1. Export check in index.ts
  assert.match(indexTs, /export \* from "\.\/system-state"/);
  assert.match(indexTs, /export \* from "\.\/empty-state"/);
  assert.match(indexTs, /export \* from "\.\/loading-state"/);
  assert.match(indexTs, /export \* from "\.\/upload-state"/);
  assert.match(indexTs, /export \* from "\.\/mobile-app-required"/);
  assert.match(indexTs, /export \* from "\.\/form-state"/);
  assert.match(indexTs, /export \* from "\.\/state-preview-launcher"/);

  // 2. Component supports variants: neutral, info, warning, error, success
  assert.match(dataTs, /"neutral"\s*\|\s*"info"\s*\|\s*"warning"\s*\|\s*"error"\s*\|\s*"success"/);
  assert.match(stateCss, /\.variant-neutral/);
  assert.match(stateCss, /\.variant-info/);
  assert.match(stateCss, /\.variant-warning/);
  assert.match(stateCss, /\.variant-error/);
  assert.match(stateCss, /\.variant-success/);

  // 3. Dual modes: Full page & Compact in-context
  assert.match(stateTsx, /compact\s*=\s*false/);
  assert.match(stateTsx, /fullPage\s*=\s*false/);
  assert.match(stateCss, /\.fullPage/);
  assert.match(stateCss, /\.compact/);
  assert.match(stateCss, /max-width:\s*520px/); // 480-560px design spec

  // 4. Accessibility: semantic headings, roles, and reduced motion
  assert.match(stateTsx, /role=\{computedRole\}/);
  assert.match(stateTsx, /variant === "error" \? "alert"/);
  assert.match(stateTsx, /useReducedMotion/);
  assert.match(stateCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);

  // 5. Actions support: Primary, Secondary, href (Link) vs onClick (button), and loading spinner
  assert.match(stateTsx, /action\.href/);
  assert.match(stateTsx, /action\.onClick/);
  assert.match(stateTsx, /action\.loading/);
  assert.match(stateCss, /\.spinner/);
});

test("Native Next.js route boundaries: not-found.tsx, error.tsx, global-error.tsx, and /maintenance", () => {
  // 1. not-found.tsx (404)
  assert.ok(existsSync(new URL("../src/app/not-found.tsx", import.meta.url)));
  const notFoundTsx = readFileSync(new URL("../src/app/not-found.tsx", import.meta.url), "utf8");
  assert.match(notFoundTsx, /eyebrow="404"/);
  assert.match(notFoundTsx, /title="Page not found"/);
  assert.match(notFoundTsx, /label:\s*"Go to home"/);
  assert.match(notFoundTsx, /label:\s*"Search products"/);
  assert.match(notFoundTsx, /<BrizHeader/);
  assert.match(notFoundTsx, /<BrizFooter/);

  // 2. error.tsx (500)
  assert.ok(existsSync(new URL("../src/app/error.tsx", import.meta.url)));
  const errorTsx = readFileSync(new URL("../src/app/error.tsx", import.meta.url), "utf8");
  assert.match(errorTsx, /"use client"/);
  assert.match(errorTsx, /title="Something went wrong"/);
  assert.match(errorTsx, /label:\s*"Try again"/);
  assert.match(errorTsx, /onClick:\s*reset/);
  assert.match(errorTsx, /label:\s*"Go to home"/);

  // 3. global-error.tsx
  assert.ok(existsSync(new URL("../src/app/global-error.tsx", import.meta.url)));
  const globalErrorTsx = readFileSync(new URL("../src/app/global-error.tsx", import.meta.url), "utf8");
  assert.match(globalErrorTsx, /<html/);
  assert.match(globalErrorTsx, /<body/);
  assert.match(globalErrorTsx, /title="Something went wrong"/);

  // 4. maintenance route
  assert.ok(existsSync(new URL("../src/app/maintenance/page.tsx", import.meta.url)));
  const maintenanceTsx = readFileSync(new URL("../src/app/maintenance/page.tsx", import.meta.url), "utf8");
  assert.match(maintenanceTsx, /Briz is getting a quick tune-up/);
  assert.match(maintenanceTsx, /We're temporarily unavailable while we make improvements/);
  assert.match(maintenanceTsx, /minimalHeader/);
});

test("System states registry contains all required states across Pages, Commerce, Requests, Forms, Uploads, Loading, Platform", () => {
  const dataTs = readFileSync(new URL("../src/components/system-state/system-states-data.ts", import.meta.url), "utf8");

  // Required Pages
  const requiredPageStates = [
    "not-found",
    "server-error",
    "offline",
    "maintenance",
    "access-denied",
    "session-expired",
    "too-many-requests",
  ];
  for (const id of requiredPageStates) {
    assert.match(dataTs, new RegExp(`["']?${id}["']?:\\s*\\{`));
  }

  // Required Commerce States
  const requiredCommerceStates = [
    "product-unavailable",
    "product-removed",
    "store-unavailable",
    "no-search-results",
    "empty-category",
    "empty-saved-products",
    "empty-saved-stores",
  ];
  for (const id of requiredCommerceStates) {
    assert.match(dataTs, new RegExp(`"${id}":`));
  }

  // Required Request States
  const requiredRequestStates = [
    "request-expired",
    "request-cancelled",
    "no-requests",
    "waiting-for-offers",
    "request-submit-failed",
  ];
  for (const id of requiredRequestStates) {
    assert.match(dataTs, new RegExp(`"${id}":`));
  }

  // Required Upload States
  const requiredUploadStates = [
    "uploading",
    "unsupported-file",
    "file-too-large",
    "upload-failed",
  ];
  for (const id of requiredUploadStates) {
    assert.match(dataTs, new RegExp(`"${id}":`));
  }

  // Required Platform States
  const requiredPlatformStates = [
    "service-unavailable",
    "mobile-app-required",
    "coming-soon",
    "restricted-seller-category",
  ];
  for (const id of requiredPlatformStates) {
    assert.match(dataTs, new RegExp(`"${id}":`));
  }
});

test("No search results state seamlessly connects to Request a Product widget and pre-fills query", () => {
  const searchResultsTsx = readFileSync(new URL("../src/components/search-results.tsx", import.meta.url), "utf8");
  const widgetTsx = readFileSync(new URL("../src/components/request-product-widget.tsx", import.meta.url), "utf8");

  // 1. search-results uses SystemState with clear call to action
  assert.match(searchResultsTsx, /<SystemState/);
  assert.match(searchResultsTsx, /title="We couldn't find that product"/);
  assert.match(searchResultsTsx, /description="Try another search, or request it from nearby sellers\."/);
  assert.match(searchResultsTsx, /label:\s*"Request this product"/);
  assert.match(searchResultsTsx, /openBrizRequest/);

  // 2. RequestProductWidget listens to global request trigger and exports openBrizRequest
  assert.match(widgetTsx, /briz:open-request/);
  assert.match(widgetTsx, /export function openBrizRequest/);
});

test("Persistent preview state button exists across pages and links to /dev/states gallery", () => {
  const layoutTsx = readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
  const launcherTsx = readFileSync(new URL("../src/components/system-state/state-preview-launcher.tsx", import.meta.url), "utf8");
  const launcherCss = readFileSync(new URL("../src/components/system-state/state-preview-launcher.module.css", import.meta.url), "utf8");
  const galleryTsx = readFileSync(new URL("../src/app/dev/states/states-gallery-client.tsx", import.meta.url), "utf8");

  // 1. Mounted globally in RootLayout
  assert.match(layoutTsx, /<StatePreviewLauncher/);

  // 2. Fixed positioning at bottom-left to avoid overlap with bottom-right request widget
  assert.match(launcherCss, /position:\s*fixed/);
  assert.match(launcherCss, /bottom:\s*24px/);
  assert.match(launcherCss, /left:\s*24px/);

  // 3. Links to /dev/states
  assert.match(launcherTsx, /href="\/dev\/states"/);
  assert.match(launcherTsx, /States Preview/);

  // 4. Gallery client supports responsive viewport selector (Desktop, Tablet, Mobile)
  assert.match(galleryTsx, /"desktop"\s*\|\s*"tablet"\s*\|\s*"mobile"/);
  assert.match(galleryTsx, /viewport === "desktop"/);
  assert.match(galleryTsx, /viewport === "tablet"/);
  assert.match(galleryTsx, /viewport === "mobile"/);
});

test("Form and upload components preserve user data and provide accessible feedback", () => {
  const formTsx = readFileSync(new URL("../src/components/system-state/form-state.tsx", import.meta.url), "utf8");
  const uploadTsx = readFileSync(new URL("../src/components/system-state/upload-state.tsx", import.meta.url), "utf8");
  const loadingTsx = readFileSync(new URL("../src/components/system-state/loading-state.tsx", import.meta.url), "utf8");

  // 1. Form submission error preserves input data message
  assert.match(formTsx, /Couldn't submit your request/);
  assert.match(formTsx, /Your information is still here\. Please try again\./);
  assert.match(formTsx, /InlineFieldError/);
  assert.match(formTsx, /role="alert"/);

  // 2. Upload state handles formats, size limits, and progress
  assert.match(uploadTsx, /This file type isn't supported/);
  assert.match(uploadTsx, /This image is too large/);
  assert.match(uploadTsx, /Couldn't upload this image/);
  assert.match(uploadTsx, /progressPercent/);

  // 3. Loading state provides skeletons and slow-loading notice
  assert.match(loadingTsx, /SlowLoadingNotice/);
  assert.match(loadingTsx, /This is taking longer than usual/);
  assert.match(loadingTsx, /ProductCardSkeleton/);
  assert.match(loadingTsx, /StoreCardSkeleton/);
  assert.match(loadingTsx, /RequestCardSkeleton/);
});
