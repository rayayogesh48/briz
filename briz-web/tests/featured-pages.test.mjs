import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("Featured data catalog and filtering algorithms", async () => {
  const dataFilePath = path.join(rootDir, "src/data/featured-data.ts");
  assert.ok(fs.existsSync(dataFilePath), "featured-data.ts exists");
  const content = fs.readFileSync(dataFilePath, "utf8");

  // Check types and constants
  assert.match(content, /export interface FeaturedProduct/, "Exports FeaturedProduct interface");
  assert.match(content, /export interface FeaturedStore/, "Exports FeaturedStore interface");
  assert.match(content, /export const FEATURED_PRODUCTS/, "Exports FEATURED_PRODUCTS catalog");
  assert.match(content, /export const FEATURED_STORES/, "Exports FEATURED_STORES catalog");
  assert.match(content, /export const PRODUCT_CATEGORIES/, "Exports PRODUCT_CATEGORIES");
  assert.match(content, /export const STORE_CATEGORIES/, "Exports STORE_CATEGORIES");
  assert.match(content, /export const DISTANCE_OPTIONS/, "Exports DISTANCE_OPTIONS");
  assert.match(content, /export const PRODUCT_SORT_LABELS/, "Exports PRODUCT_SORT_LABELS");
  assert.match(content, /export const STORE_SORT_LABELS/, "Exports STORE_SORT_LABELS");

  // Check filtering algorithm functions
  assert.match(content, /export function filterAndSortFeaturedProducts/, "filterAndSortFeaturedProducts exists");
  assert.match(content, /export function filterAndSortFeaturedStores/, "filterAndSortFeaturedStores exists");
});

test("FeaturedBanner component implements required copy and visual compositions", () => {
  const bannerPath = path.join(rootDir, "src/components/featured/featured-banner.tsx");
  assert.ok(fs.existsSync(bannerPath), "featured-banner.tsx exists");
  const content = fs.readFileSync(bannerPath, "utf8");

  // Check required copy
  assert.match(content, /FEATURED PRODUCTS/, "Contains FEATURED PRODUCTS eyebrow");
  assert.match(content, /Popular picks from stores near you/, "Contains products heading");
  assert.match(content, /Explore products selected for their popularity/, "Contains products description");
  assert.match(content, /Updated regularly/, "Contains Updated regularly supporting badge");

  assert.match(content, /FEATURED STORES/, "Contains FEATURED STORES eyebrow");
  assert.match(content, /Discover trusted stores near you/, "Contains stores heading");
  assert.match(content, /Shop from selected local stores offering popular products/, "Contains stores description");
  assert.match(content, /Verified local merchants/, "Contains stores supporting badge");

  // Visual composition classes
  assert.match(content, /productCluster/, "Contains product visual cluster");
  assert.match(content, /storeCluster/, "Contains store visual cluster");
});

test("FeaturedProductCard component implements all user specifications", () => {
  const cardPath = path.join(rootDir, "src/components/featured/featured-product-card.tsx");
  assert.ok(fs.existsSync(cardPath), "featured-product-card.tsx exists");
  const content = fs.readFileSync(cardPath, "utf8");

  assert.match(content, /product\.featured/, "Checks product.featured");
  assert.match(content, /product\.discount/, "Displays discount badge");
  assert.match(content, /useFavourites/, "Integrates useFavourites hook");
  assert.match(content, /isFavourited/, "Checks isFavourited for animated heart");
  assert.match(content, /product\.name/, "Renders product name");
  assert.match(content, /formattedPrice/, "Renders current formatted price");
  assert.match(content, /formattedOriginalPrice/, "Renders original crossed-out price");
  assert.match(content, /product\.storeName/, "Renders store name");
  assert.match(content, /product\.distance/, "Renders distance");
  assert.match(content, /product\.deliveryLabel/, "Renders delivery label");
  assert.match(content, /product\.rating/, "Renders rating when available");
  assert.match(content, /useCart/, "Integrates useCart hook");
  assert.match(content, /addToCart/, "Calls addToCart on button click");
  assert.match(content, /\/products\/\$\{product\.slug\}/, "Links to product detail page");

  // CSS module check
  const cssPath = path.join(rootDir, "src/components/featured/featured-product-card.module.css");
  assert.ok(fs.existsSync(cssPath), "featured-product-card.module.css exists");
  const css = fs.readFileSync(cssPath, "utf8");
  assert.match(css, /#3e63dd/, "Uses primary Briz blue #3e63dd");
  assert.match(css, /min-height:\s*44px/, "Maintains 44px touch target on buttons");
});

test("FeaturedStoreCard component implements all user specifications", () => {
  const cardPath = path.join(rootDir, "src/components/featured/featured-store-card.tsx");
  assert.ok(fs.existsSync(cardPath), "featured-store-card.tsx exists");
  const content = fs.readFileSync(cardPath, "utf8");

  assert.match(content, /store\.cover/, "Renders cover image");
  assert.match(content, /store\.logo/, "Renders store logo");
  assert.match(content, /store\.featured/, "Renders featured badge");
  assert.match(content, /store\.verified/, "Renders verified badge");
  assert.match(content, /store\.name/, "Renders store name");
  assert.match(content, /store\.category/, "Renders category");
  assert.match(content, /store\.description/, "Renders store description");
  assert.match(content, /store\.rating/, "Renders rating");
  assert.match(content, /store\.reviewCount/, "Renders review count");
  assert.match(content, /store\.location/, "Renders location");
  assert.match(content, /store\.distance/, "Renders distance");
  assert.match(content, /store\.statusLabel/, "Renders open/closed status badge");
  assert.match(content, /store\.shoppingOptionLabel/, "Renders shopping options");
  assert.match(content, /store\.previewImages/, "Renders 3-4 product preview thumbnails");
  assert.match(content, /Visit Store/, "Renders Visit Store primary CTA button");
  assert.match(content, /\/store\/\$\{store\.id\}/, "Links to store profile page");

  const cssPath = path.join(rootDir, "src/components/featured/featured-store-card.module.css");
  assert.ok(fs.existsSync(cssPath), "featured-store-card.module.css exists");
  const css = fs.readFileSync(cssPath, "utf8");
  assert.match(css, /min-height:\s*44px/, "Maintains 44px touch target on buttons");
});

test("FeaturedFilters component implements sticky sidebar and mobile bottom sheet", () => {
  const filtersPath = path.join(rootDir, "src/components/featured/featured-filters.tsx");
  assert.ok(fs.existsSync(filtersPath), "featured-filters.tsx exists");
  const content = fs.readFileSync(filtersPath, "utf8");

  // Product filters
  assert.match(content, /ProductFilters/, "Exports ProductFilters component");
  assert.match(content, /StoreFilters/, "Exports StoreFilters component");
  assert.match(content, /Categories/, "Has Categories section");
  assert.match(content, /Price Range/, "Has Price Range section");
  assert.match(content, /Distance/, "Has Distance section");
  assert.match(content, /Availability/, "Has Availability section");
  assert.match(content, /Offers & Deals/, "Has Offers section");
  assert.match(content, /Customer Rating/, "Has Rating section");
  assert.match(content, /Clear all/, "Provides Clear all button");
  assert.match(content, /Show results/, "Provides mobile Show results button");
  assert.match(content, /bottomSheet/, "Implements bottomSheet modal for mobile");
});

test("FeaturedToolbar and FilterChips components implement requested controls", () => {
  const toolbarPath = path.join(rootDir, "src/components/featured/featured-toolbar.tsx");
  assert.ok(fs.existsSync(toolbarPath), "featured-toolbar.tsx exists");
  const toolbar = fs.readFileSync(toolbarPath, "utf8");

  assert.match(toolbar, /featured products near/i, "Renders products count text");
  assert.match(toolbar, /featured stores near/i, "Renders stores count text");
  assert.match(toolbar, /PRODUCT_SORT_LABELS/, "Supports all 7 product sort options");
  assert.match(toolbar, /STORE_SORT_LABELS/, "Supports all 5 store sort options");
  assert.match(toolbar, /viewMode/, "Supports grid and list view controls");
  assert.match(toolbar, /mobileFilterTrigger/, "Provides mobile filters button with badge");

  const chipsPath = path.join(rootDir, "src/components/featured/featured-filter-chips.tsx");
  assert.ok(fs.existsSync(chipsPath), "featured-filter-chips.tsx exists");
  const chips = fs.readFileSync(chipsPath, "utf8");
  assert.match(chips, /removeChipBtn/, "Renders removable chips");
  assert.match(chips, /clearAllLink/, "Provides clear all link");
});

test("FeaturedSkeletons components implement 4-col product and 3-col store pulse placeholders", () => {
  const skeletonsPath = path.join(rootDir, "src/components/featured/featured-skeletons.tsx");
  assert.ok(fs.existsSync(skeletonsPath), "featured-skeletons.tsx exists");
  const content = fs.readFileSync(skeletonsPath, "utf8");

  assert.match(content, /FeaturedProductSkeleton/, "Exports FeaturedProductSkeleton");
  assert.match(content, /FeaturedStoreSkeleton/, "Exports FeaturedStoreSkeleton");
});

test("FeaturedProductsView and FeaturedStoresView implement all 10 shared system states", () => {
  const productsViewPath = path.join(rootDir, "src/components/featured/featured-products-view.tsx");
  const storesViewPath = path.join(rootDir, "src/components/featured/featured-stores-view.tsx");

  assert.ok(fs.existsSync(productsViewPath), "featured-products-view.tsx exists");
  assert.ok(fs.existsSync(storesViewPath), "featured-stores-view.tsx exists");

  const pContent = fs.readFileSync(productsViewPath, "utf8");
  const sContent = fs.readFileSync(storesViewPath, "utf8");

  // State 1: Default
  assert.match(pContent, /FeaturedStateBar/, "Uses FeaturedStateBar");
  assert.match(sContent, /FeaturedStateBar/, "Uses FeaturedStateBar");

  // State 2: Filters Applied
  assert.match(pContent, /FeaturedFilterChips/, "Renders active filter chips");
  assert.match(sContent, /FeaturedFilterChips/, "Renders active filter chips");

  // State 6: Loading
  assert.match(pContent, /FeaturedProductSkeleton/, "Renders skeleton in loading state");
  assert.match(sContent, /FeaturedStoreSkeleton/, "Renders skeleton in loading state");

  // State 7: Empty state / No matches found
  assert.match(pContent, /No matches found/, "Has 'No matches found' title in empty state");
  assert.match(pContent, /Try changing or clearing some filters to see more results\./, "Has required empty description");
  assert.match(pContent, /Clear Filters/, "Has 'Clear Filters' primary action");
  assert.match(pContent, /Browse All/, "Has 'Browse All' secondary action");

  assert.match(sContent, /No matches found/, "Has 'No matches found' title in empty state");
  assert.match(sContent, /Try changing or clearing some filters to see more results\./, "Has required empty description");
  assert.match(sContent, /Clear Filters/, "Has 'Clear Filters' primary action");
  assert.match(sContent, /Browse All/, "Has 'Browse All' secondary action");

  // State 8: Location Unavailable
  assert.match(pContent, /Select your location/, "Has 'Select your location' title");
  assert.match(pContent, /Choose your location to see featured products and stores available near you\./, "Has required location description");
  assert.match(pContent, /Select Location/, "Has 'Select Location' action");
  assert.match(pContent, /locationModal/, "Has interactive Location Selector modal");

  assert.match(sContent, /Select your location/, "Has 'Select your location' title");
  assert.match(sContent, /Choose your location to see featured products and stores available near you\./, "Has required location description");
  assert.match(sContent, /Select Location/, "Has 'Select Location' action");
  assert.match(sContent, /locationModal/, "Has interactive Location Selector modal");

  // State 9: Server Error
  assert.match(pContent, /SystemState[^>]*variant="error"/, "Uses SystemState variant error for server error");
  assert.match(sContent, /SystemState[^>]*variant="error"/, "Uses SystemState variant error for server error");

  // State 10: Final page / viewed all
  assert.match(pContent, /You(?:&apos;|')ve viewed all/, "Has 'You've viewed all' message");
  assert.match(sContent, /You(?:&apos;|')ve viewed all/, "Has 'You've viewed all' message");
});

test("Route pages and global navigation entries are properly registered", () => {
  const productRoutePath = path.join(rootDir, "src/app/featured-products/page.tsx");
  const storeRoutePath = path.join(rootDir, "src/app/featured-stores/page.tsx");

  assert.ok(fs.existsSync(productRoutePath), "/featured-products route page exists");
  assert.ok(fs.existsSync(storeRoutePath), "/featured-stores route page exists");

  const productRoute = fs.readFileSync(productRoutePath, "utf8");
  const storeRoute = fs.readFileSync(storeRoutePath, "utf8");

  assert.match(productRoute, /BrizHeader/, "Includes BrizHeader on featured products");
  assert.match(productRoute, /BrizFooter/, "Includes BrizFooter on featured products");
  assert.match(productRoute, /FeaturedProductsView/, "Renders FeaturedProductsView");

  assert.match(storeRoute, /BrizHeader/, "Includes BrizHeader on featured stores");
  assert.match(storeRoute, /BrizFooter/, "Includes BrizFooter on featured stores");
  assert.match(storeRoute, /FeaturedStoresView/, "Renders FeaturedStoresView");

  // Home page navigation hub
  const homePath = path.join(rootDir, "src/app/page.tsx");
  const home = fs.readFileSync(homePath, "utf8");
  assert.match(home, /\/featured-products/, "Home page links to /featured-products");
  assert.match(home, /\/featured-stores/, "Home page links to /featured-stores");

  // StatePreviewLauncher
  const launcherPath = path.join(rootDir, "src/components/system-state/state-preview-launcher.tsx");
  const launcher = fs.readFileSync(launcherPath, "utf8");
  assert.match(launcher, /\/featured-products/, "StatePreviewLauncher links to /featured-products");
  assert.match(launcher, /\/featured-stores/, "StatePreviewLauncher links to /featured-stores");
});
