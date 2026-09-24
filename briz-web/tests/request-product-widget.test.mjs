import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";

test("RequestProductWidget component meets all architecture, accessibility, scroll expansion, and Motion requirements", () => {
  const widgetTsx = readFileSync(new URL("../src/components/request-product-widget.tsx", import.meta.url), "utf8");
  const mascotTsx = readFileSync(new URL("../src/components/request-mascot.tsx", import.meta.url), "utf8");
  const widgetCss = readFileSync(new URL("../src/components/request-product-widget.module.css", import.meta.url), "utf8");
  const reexportTsx = readFileSync(new URL("../src/components/RequestProductWidget.tsx", import.meta.url), "utf8");
  const layoutTsx = readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");

  // 1. Motion for React library usage
  assert.match(widgetTsx, /from\s+["']motion\/react["']/);
  assert.match(mascotTsx, /from\s+["']motion\/react["']/);
  assert.match(widgetTsx, /useReducedMotion/);
  assert.match(mascotTsx, /useReducedMotion/);
  assert.match(widgetTsx, /useScroll/);
  assert.match(widgetTsx, /useMotionValueEvent/);
  assert.match(widgetTsx, /AnimatePresence/);

  // 2. Scroll threshold & one-way expansion behavior
  assert.match(widgetTsx, /EXPAND_SCROLL_THRESHOLD\s*=\s*120/);
  assert.match(widgetTsx, /useMotionValueEvent\(scrollY,\s*"change"/);
  assert.match(widgetTsx, /hasTriggeredRef/);
  assert.match(widgetTsx, /isScanning/);

  // 3. Accessibility & interactive button
  assert.match(widgetTsx, /<motion\.button[^>]*type="button"/);
  assert.match(widgetTsx, /aria-label="Request a product"/);
  assert.match(widgetTsx, /aria-expanded=\{expanded\}/);
  assert.match(widgetTsx, /onClick=\{handleClick\}/);
  assert.match(widgetCss, /\.widgetButton:focus-visible/);

  // 4. Three visual zones
  // Zone 1: Animated mascot with search scan & idle loop
  assert.match(widgetTsx, /<RequestMascot/);
  assert.match(mascotTsx, /Shopping Bag/i);
  assert.match(mascotTsx, /Magnifying Glass/i);
  assert.match(mascotTsx, /Sparkle/i);
  assert.match(mascotTsx, /isScanning/);
  // Zone 2: Informative copy (Desktop & Mobile)
  assert.match(widgetTsx, /Can’t find a product\?/);
  assert.match(widgetTsx, /Request it from nearby sellers\./);
  assert.match(widgetTsx, /Can’t find it\?/);
  assert.match(widgetTsx, /Request it from local sellers\./);
  // Zone 3: Action affordance
  assert.match(widgetTsx, /className=\{styles\.actionAffordance\}/);
  assert.match(widgetTsx, /arrowVariants/);

  // 5. Staggered sequence timing
  assert.match(widgetTsx, /delay:\s*shouldReduceMotion\s*\?\s*0\s*:\s*0\.07/);
  assert.match(widgetTsx, /delay:\s*shouldReduceMotion\s*\?\s*0\s*:\s*0\.14/);
  assert.match(widgetTsx, /delay:\s*shouldReduceMotion\s*\?\s*0\s*:\s*0\.2/);

  // 6. Future dialog transition preparation
  assert.match(widgetTsx, /layoutId=\{layoutId\}/);
  assert.match(widgetTsx, /briz-request-widget/);
  assert.match(widgetTsx, /\blayout\b/);

  // 7. CSS module design & responsive styles
  // Fixed positioning
  assert.match(widgetCss, /position:\s*fixed/);
  assert.match(widgetCss, /right:\s*24px/);
  assert.match(widgetCss, /bottom:\s*24px/);
  assert.match(widgetCss, /z-index:\s*900/);

  // Collapsed dimensions (56 x 56px, radius 18px)
  assert.match(widgetCss, /\.widgetButtonCollapsed\s*\{[^}]*width:\s*56px/);
  assert.match(widgetCss, /\.widgetButtonCollapsed\s*\{[^}]*height:\s*56px/);
  assert.match(widgetCss, /\.widgetButtonCollapsed\s*\{[^}]*border-radius:\s*18px/);

  // Desktop expanded dimensions (approx 312px width, 80px height, 22px radius)
  assert.match(widgetCss, /\.widgetButtonExpanded\s*\{[^}]*width:\s*312px/);
  assert.match(widgetCss, /\.widgetButtonExpanded\s*\{[^}]*border-radius:\s*22px/);

  // Existing Briz design system tokens used
  assert.match(widgetCss, /var\(--card/);
  assert.match(widgetCss, /var\(--border/);
  assert.match(widgetCss, /var\(--foreground/);
  assert.match(widgetCss, /var\(--muted-foreground/);
  assert.match(widgetCss, /var\(--primary/);

  // Mobile responsiveness (< 640px)
  assert.match(widgetCss, /@media\s*\(max-width:\s*639px\)/);
  assert.match(widgetCss, /right:\s*16px/);
  assert.match(widgetCss, /env\(safe-area-inset-bottom/);
  assert.match(widgetCss, /width:\s*min\(300px,\s*calc\(100vw\s*-\s*32px\)\)/);

  // Reduced motion media query
  assert.match(widgetCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);

  // 8. PascalCase re-export exists
  assert.match(reexportTsx, /export \* from "\.\/request-product-widget"/);

  // 9. Root layout mounts the widget
  assert.match(layoutTsx, /<RequestProductWidget/);
});
