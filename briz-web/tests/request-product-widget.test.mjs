import assert from "node:assert/strict";
import { after, test } from "node:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

// Compile the pure data module with the project's existing TypeScript toolchain
const directory = mkdtempSync(join(tmpdir(), "briz-widget-tests-"));
const flowDataTs = readFileSync(new URL("../src/components/request-flow-data.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(flowDataTs, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
writeFileSync(join(directory, "request-flow-data.js"), outputText);
const { findCategoryMatches } = createRequire(import.meta.url)(join(directory, "request-flow-data.js"));
after(() => rmSync(directory, { recursive: true, force: true }));

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

test("RequestProductPanel interactive prototype flow, 12 preview states, ambiguity logic, and accessibility", () => {
  const panelCss = readFileSync(new URL("../src/components/request-product-panel.module.css", import.meta.url), "utf8");
  const widgetTsx = readFileSync(new URL("../src/components/request-product-widget.tsx", import.meta.url), "utf8");
  const panelTsx = readFileSync(new URL("../src/components/request-product-panel.tsx", import.meta.url), "utf8");

  // 1. Connection from launcher to panel & exports
  assert.match(widgetTsx, /<RequestProductPanel/);
  assert.match(widgetTsx, /setIsOpen\(true\)/);
  assert.match(widgetTsx, /draft=\{draft\}/);
  assert.match(panelTsx, /export \{ RequestProductPanel/);

  // 2. Unit logic: Category matching & ambiguity detection
  const appleMatches = findCategoryMatches("Apple");
  assert.equal(appleMatches.length, 2, "Apple must trigger multiple category matches");
  assert.ok(appleMatches.some((c) => c.id === "fruits-vegetables"));
  assert.ok(appleMatches.some((c) => c.id === "electronics"));

  const chargerMatches = findCategoryMatches("phone charger");
  assert.equal(chargerMatches.length, 2, "charger must trigger multiple category matches");
  assert.ok(chargerMatches.some((c) => c.id === "electronics"));
  assert.ok(chargerMatches.some((c) => c.id === "automotive"));

  const mouseMatches = findCategoryMatches("wireless mouse");
  assert.equal(mouseMatches.length, 1, "wireless mouse must be unambiguous");
  assert.equal(mouseMatches[0].id, "electronics");

  const bananaMatches = findCategoryMatches("organic banana");
  assert.equal(bananaMatches.length, 1, "banana must be unambiguous");
  assert.equal(bananaMatches[0].id, "fruits-vegetables");

  const fallbackMatches = findCategoryMatches("xyz custom handmade craft");
  assert.equal(fallbackMatches.length, 1);
  assert.equal(fallbackMatches[0].id, "general");

  // 3. Panel header & prototype state switcher
  assert.match(widgetTsx, /Request a product/);
  assert.match(widgetTsx, /Tell nearby sellers what you’re looking for\./);
  assert.match(widgetTsx, /Preview states/);
  assert.match(widgetTsx, /data-testid="request-preview-states"/);

  // All 12 prototype states present in the switcher
  const requiredStates = [
    "form-empty",
    "form-filled",
    "validation-error",
    "image-uploading",
    "image-attached",
    "matching",
    "ambiguity",
    "ambiguity-selected",
    "review",
    "submitting",
    "success",
    "error",
  ];
  for (const s of requiredStates) {
    assert.ok(widgetTsx.includes(`"${s}"`), `Preview states must include "${s}"`);
  }

  // 4. Form fields & controls
  assert.match(widgetTsx, /data-testid="request-item-name"/);
  assert.match(widgetTsx, /Please enter the item you’re looking for\./);
  assert.match(widgetTsx, /data-testid="request-quantity"/);
  assert.match(widgetTsx, /data-testid="request-rate"/);
  assert.match(widgetTsx, /data-testid="request-details"/);
  assert.match(widgetTsx, /data-testid="request-image-input"/);
  assert.match(widgetTsx, /data-testid="request-continue"/);

  // 5. Ambiguity review step
  assert.match(widgetTsx, /Which category fits your item\?/);
  assert.match(widgetTsx, /We found more than one possible match/);
  assert.match(widgetTsx, /data-testid="request-category-option"/);
  assert.match(widgetTsx, /role="radiogroup"/);
  assert.match(widgetTsx, /role="radio"/);

  // 6. Review step
  assert.match(widgetTsx, /Review your request/);
  assert.match(widgetTsx, /data-testid="request-send"/);
  assert.match(widgetTsx, /Send request/);
  assert.match(widgetTsx, /Nearby sellers will review your request/);

  // 7. Success state
  assert.match(widgetTsx, /Request sent/);
  assert.match(widgetTsx, /We’ll let you know when local sellers respond with offers\./);
  assert.match(widgetTsx, /Create another/);
  assert.match(widgetTsx, /Done/);

  // 8. Accessibility & Keyboard controls
  assert.match(widgetTsx, /role="dialog"/);
  assert.match(widgetTsx, /aria-modal="true"/);
  assert.match(widgetTsx, /Escape/);

  // 9. CSS layout and responsive constraints
  assert.match(panelCss, /\.panelContainer\s*\{[^}]*position:\s*fixed/);
  assert.match(panelCss, /\.panelContainer\s*\{[^}]*right:\s*24px/);
  assert.match(panelCss, /\.panelContainer\s*\{[^}]*bottom:\s*24px/);
  assert.match(panelCss, /\.panelContainer\s*\{[^}]*width:\s*400px/);
  assert.match(panelCss, /\.panelContainer\s*\{[^}]*max-height:\s*min\(680px,\s*calc\(100vh\s*-\s*48px\)\)/);
  assert.match(panelCss, /@media\s*\(max-width:\s*639px\)/);
  assert.match(panelCss, /width:\s*calc\(100vw\s*-\s*32px\)/);
  assert.match(panelCss, /max-height:\s*calc\(100dvh\s*-\s*32px\)/);
});
