import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";

test("home page data models and Figma content are populated accurately", () => {
  const homeDataContent = readFileSync(new URL("../src/components/home/home-data.ts", import.meta.url), "utf8");

  // Popular categories has 10 items
  assert.match(homeDataContent, /Renewable Energy/);
  assert.match(homeDataContent, /Urban Development/);
  assert.match(homeDataContent, /Technology & Software/);

  // Request on Briz 3 steps
  assert.match(homeDataContent, /Tell Briz what you need/);
  assert.match(homeDataContent, /Get offers from local sellers/);
  assert.match(homeDataContent, /Compare, chat & choose/);

  // Featured stores and products
  assert.match(homeDataContent, /Himalayan Bazzar/);
  assert.match(homeDataContent, /Audio World Nepal/);
});

test("home page responsive tokens and mobile scroll transitions are preserved", () => {
  const homeCss = readFileSync(new URL("../src/app/home.module.css", import.meta.url), "utf8");
  const homeCompCss = readFileSync(new URL("../src/components/home/home-components.module.css", import.meta.url), "utf8");
  const headerCss = readFileSync(new URL("../src/components/briz-header.module.css", import.meta.url), "utf8");

  // Desktop 120px margins on home page
  assert.match(homeCss, /\.home\s*\{[^}]*padding:\s*40px\s+120px/);
  assert.match(homeCompCss, /\.requestSection\s*\{[^}]*padding:\s*48px\s+120px/);
  assert.match(homeCompCss, /\.appDownloadSection\s*\{[^}]*padding:\s*0\s+120px\s+48px/);

  // Mobile scrolled header collapses to 68px (node 379:55492)
  assert.match(headerCss, /\.header\[data-scrolled="true"\]\s*\{[^}]*height:\s*68px/);
});

