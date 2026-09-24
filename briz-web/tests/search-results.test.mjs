import assert from "node:assert/strict";
import { after, test } from "node:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

// Compile the pure catalog modules with the project's existing TypeScript toolchain.
const directory = mkdtempSync(join(tmpdir(), "briz-search-tests-"));
for (const name of ["search-data", "search-results-model"]) {
  const source = readFileSync(new URL(`../src/components/${name}.ts`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  writeFileSync(join(directory, `${name}.js`), outputText);
}
const { getSearchResults } = createRequire(import.meta.url)(join(directory, "search-results-model.js"));
after(() => rmSync(directory, { recursive: true, force: true }));
const result = (query = "") => getSearchResults(new URLSearchParams(query));
const ids = items => items.map(item => item.id);

test("search matches words regardless of case, whitespace, or order and includes related stores", () => {
  const data = result("q=++PAPER++Thermal++");
  assert.equal(data.products.length, 12);
  assert.equal(data.stores.length, 4);
  assert.equal(result("q=Himalayan+Bazzar").products.length, 3);
  assert.equal(result("q=not-in-the-catalog").products.length, 0);
  assert.equal(result().products.length, 18);
});

test("all product sort modes order the actual catalog", () => {
  for (const [sort, expected] of [["relevance", "paper-1"], ["nearest", "paper-3"], ["newest", "paper-12"], ["price-asc", "paper-11"], ["price-desc", "paper-8"], ["discount", "paper-5"]]) {
    assert.equal(result(`q=thermal&sort=${sort}`).products[0].id, expected, sort);
  }
  for (const sort of ["price-asc", "price-desc"]) {
    assert(result(`q=thermal&sort=${sort}`).products.slice(-2).every(product => product.askForPrice));
  }
});

test("all store sort modes use distance, rating, verification, and joining date", () => {
  for (const [sort, expected] of [["nearest", "s8"], ["rating", "s6"], ["verified", "s6"], ["newest", "s8"]]) {
    assert.equal(result(`q=thermal&type=stores&sort=${sort}`).stores[0].id, expected, sort);
  }
  const verified = result("q=thermal&type=stores&sort=verified").stores;
  assert(verified.slice(0, 3).every(store => store.verified));
  assert.equal(verified[3].verified, false);
});

test("price bounds are inclusive, exclude unknown prices, and constrain stores by inventory", () => {
  const data = result("q=thermal&min=500&max=850");
  assert.deepEqual(ids(data.products), ["paper-1", "paper-2", "paper-5", "paper-9"]);
  assert.deepEqual(ids(data.stores), ["s6", "s7"]);
  assert.deepEqual(ids(result("q=thermal&min=850&max=500").products), ids(data.products));
  assert.equal(result("q=thermal&max=0").products.length, 0);
});

test("main category, subcategory, and store filters compose", () => {
  const data = result("q=thermal&category=Office+Supplies&subcategory=Labels+%26+Stickers");
  assert.deepEqual(ids(data.products), ["paper-9", "paper-10"]);
  assert.deepEqual(ids(result("q=thermal&store=s6").products), ["paper-1", "paper-4", "paper-11"]);
  assert.equal(result("q=thermal&category=Electronics").products.length, 0);
});

test("malformed URL parameters fall back safely and do not mutate shared catalog order", () => {
  const data = result("q=thermal&type=other&sort=rating&min=NaN&max=Infinity&category=unknown&store=unknown");
  assert.equal(data.view, "products"); assert.equal(data.sort, "relevance");
  assert.equal(data.min, undefined); assert.equal(data.max, undefined);
  assert.equal(data.products.length, 12);
  result("q=thermal&sort=price-desc");
  assert.equal(result("q=thermal").products[0].id, "paper-1");
  assert.equal(result("type=stores&sort=price-asc").sort, "nearest");
});

test("category browsing and search share filters, including legacy category URLs", () => {
  const browse = result("category=Books+%26+Stationery");
  assert.equal(browse.query, "");
  assert.equal(browse.category, "Books & Stationery");
  assert.equal(browse.products.length, 12);
  assert.deepEqual(ids(result("q=Books+%26+Stationery").products), ids(browse.products));
  assert.equal(browse.stores.length, 4);
  assert.deepEqual(ids(result("category=Office+Supplies").products), ids(browse.products));
  assert.deepEqual(ids(result("category=Books+%26+Stationery&subcategory=Labels+%26+Stickers&max=500").products), ["paper-10"]);
  assert.deepEqual(ids(result("q=thermal&category=Books+%26+Stationery&subcategory=Labels+%26+Stickers&max=500").products), ["paper-10"]);
});

test("categories without sample inventory show empty results, and stale subcategories reset", () => {
  const empty = result("category=Agriculture+%26+Farming");
  assert.equal(empty.category, "Agriculture & Farming");
  assert.equal(empty.products.length, 0);
  assert.equal(empty.stores.length, 0);
  const changed = result("category=Electronics&subcategory=Thermal+Paper");
  assert.equal(changed.subcategory, "");
  assert.equal(changed.products.length, 4);
});

test("desktop margins consistently align at 120px, navbar has 32px padding, and body background is #f9f9f9", () => {
  const globalsCss = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  const headerCss = readFileSync(new URL("../src/components/briz-header.module.css", import.meta.url), "utf8");
  const searchCss = readFileSync(new URL("../src/components/search-results.module.css", import.meta.url), "utf8");
  const footerCss = readFileSync(new URL("../src/components/briz-footer.module.css", import.meta.url), "utf8");
  const homeCss = readFileSync(new URL("../src/app/home.module.css", import.meta.url), "utf8");

  // Body background token is #f9f9f9
  assert.match(globalsCss, /--background:\s*#f9f9f9/);
  assert.match(globalsCss, /body\s*\{[^}]*background:\s*var\(--background\)/);

  // Navbar is sticky at top: 0 with elevated z-index
  assert.match(headerCss, /\.header\s*\{[^}]*position:\s*sticky/);
  assert.match(headerCss, /\.header\s*\{[^}]*top:\s*0/);

  // Navbar has 32px padding on both sides as previous
  assert.match(headerCss, /\.logo\s*\{[^}]*padding-left:\s*32px/);
  assert.match(headerCss, /\.actions\s*\{[^}]*padding:\s*0\s+32px\s+0\s+12px/);

  // Search results body has 120px left/right padding and full width
  assert.match(searchCss, /\.page\s*\{[^}]*padding:\s*0\s+120px\s+48px/);
  assert.match(searchCss, /\.page\s*\{[^}]*width:\s*100%/);

  // Footer and home also maintain 120px left/right padding on desktop
  assert.match(footerCss, /\.footer\s*\{[^}]*padding:\s*48px\s+120px/);
  assert.match(homeCss, /\.home\s*\{[^}]*padding:\s*40px\s+120px/);
});

test("price range filter includes an interactive dual-thumb range slider", () => {
  const filtersTsx = readFileSync(new URL("../src/components/search-filters.tsx", import.meta.url), "utf8");
  const filtersCss = readFileSync(new URL("../src/components/search-filters.module.css", import.meta.url), "utf8");

  // Dual-thumb range slider markup with aria labels
  assert.match(filtersTsx, /type="range"/);
  assert.match(filtersTsx, /aria-label="Minimum price range slider"/);
  assert.match(filtersTsx, /aria-label="Maximum price range slider"/);
  assert.match(filtersTsx, /className=\{styles\.rangeSlider\}/);
  assert.match(filtersTsx, /className=\{styles\.sliderTrack\}/);
  assert.match(filtersTsx, /className=\{styles\.sliderRange\}/);

  // Range slider CSS styles matching design system
  assert.match(filtersCss, /\.rangeSlider\s*\{[^}]*display:\s*flex/);
  assert.match(filtersCss, /\.sliderTrack\s*\{[^}]*background:\s*var\(--border/);
  assert.match(filtersCss, /\.sliderRange\s*\{[^}]*background:\s*var\(--primary/);
  assert.match(filtersCss, /\.thumbInput::-webkit-slider-thumb\s*\{[^}]*border:\s*2px\s+solid\s+var\(--primary/);
});

test("category page implements Figma 836:3686 layout with 260px sidebar, improved toolbar, and 4-column grid", () => {
  const categoryPageCss = readFileSync(new URL("../src/components/category-page.module.css", import.meta.url), "utf8");
  const categorySidebarCss = readFileSync(new URL("../src/components/category-sidebar.module.css", import.meta.url), "utf8");
  const categoryToolbarCss = readFileSync(new URL("../src/components/category-toolbar.module.css", import.meta.url), "utf8");
  const popularCategoriesTsx = readFileSync(new URL("../src/components/home/popular-categories.tsx", import.meta.url), "utf8");
  const categoryRouteTsx = readFileSync(new URL("../src/app/category/page.tsx", import.meta.url), "utf8");

  // Route exists and renders CategoryPage with header & footer
  assert.match(categoryRouteTsx, /<CategoryPage\s*\/>/);
  assert.match(categoryRouteTsx, /<BrizHeader[^>]*\/>/);
  assert.match(categoryRouteTsx, /<BrizFooter\s*\/>/);

  // Desktop margin is 120px and background is #f9f9f9
  assert.match(categoryPageCss, /\.page\s*\{[^}]*padding:\s*0\s+120px/);
  assert.match(categoryPageCss, /\.page\s*\{[^}]*background-color:\s*#f9f9f9/);

  // Main container matching Figma 836:3698
  assert.match(categoryPageCss, /\.container\s*\{[^}]*display:\s*flex/);
  assert.match(categoryPageCss, /\.container\s*\{[^}]*gap:\s*25px/);

  // Figma 836:3699 sidebar with 260px width and border-right
  assert.match(categorySidebarCss, /\.filterContainer\s*\{[^}]*width:\s*260px/);
  assert.match(categorySidebarCss, /\.filterContainer\s*\{[^}]*border-right:\s*1px\s+solid\s+#ebebeb/);
  assert.match(categorySidebarCss, /\.shopCard/);
  assert.match(categorySidebarCss, /\.shopCardActive/);

  // Figma 836:3763 toolbar with tabs and improved filter popovers
  assert.match(categoryToolbarCss, /\.toolbar\s*\{[^}]*display:\s*flex/);
  assert.match(categoryToolbarCss, /\.tabs\s*\{[^}]*background:\s*#f1f1f1/);
  assert.match(categoryToolbarCss, /\.selectButton/);
  assert.match(categoryToolbarCss, /\.pricePopover/);
  assert.match(categoryToolbarCss, /\.popoverMenu/);

  // Figma 836:3771 4-column product grid
  assert.match(categoryPageCss, /\.productGrid\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*1fr\)/);

  // Figma 836:28812 centered show more button
  assert.match(categoryPageCss, /\.buttonWrapper\s*\{[^}]*justify-content:\s*center/);
  assert.match(categoryPageCss, /\.showMoreButton\s*\{[^}]*height:\s*48px/);

  // Popular categories on home link to /categories
  assert.match(popularCategoriesTsx, /href="\/categories"/);
  assert.match(popularCategoriesTsx, /href=\{`\/category\?category=\$\{encodeURIComponent\(cat\.name\)\}`\}/);
});

test("category page supports in-category live search and solves 2-search UX challenge", () => {
  const categoryToolbarTsx = readFileSync(new URL("../src/components/category-toolbar.tsx", import.meta.url), "utf8");
  const categoryToolbarCss = readFileSync(new URL("../src/components/category-toolbar.module.css", import.meta.url), "utf8");
  const categoryPageTsx = readFileSync(new URL("../src/components/category-page.tsx", import.meta.url), "utf8");
  const navbarSearchTsx = readFileSync(new URL("../src/components/navbar-search.tsx", import.meta.url), "utf8");

  // In-category search input in toolbar
  assert.match(categoryToolbarTsx, /className=\{styles\.searchField\}/);
  assert.match(categoryToolbarTsx, /placeholder=\{`Search in \$\{category\}\.\.\.`\}/);
  assert.match(categoryToolbarTsx, /className=\{styles\.clearSearchButton\}/);
  assert.match(categoryToolbarCss, /\.searchField\s*\{[^}]*display:\s*flex/);
  assert.match(categoryToolbarCss, /\.searchInput\s*\{[^}]*border:\s*none/);

  // In-category search in category-page filter chips and empty state
  assert.match(categoryPageTsx, /query=\{query\}/);
  assert.match(categoryPageTsx, /Search:\s*&ldquo;\{query\}&rdquo;/);
  assert.match(categoryPageTsx, /Search across all Briz/);

  // Scoped search options in navbar header search dropdown
  assert.match(navbarSearchTsx, /categoryContext/);
  assert.match(navbarSearchTsx, /Search &ldquo;\{query\}&rdquo; in <strong>\{categoryContext\}<\/strong>/);
  assert.match(navbarSearchTsx, /Search &ldquo;\{query\}&rdquo; across <strong>all of Briz<\/strong>/);

  // Model test: query within category
  const filtered = result("category=Books+%26+Stationery&q=thermal");
  assert.equal(filtered.category, "Books & Stationery");
  assert.equal(filtered.query, "thermal");
  assert.equal(filtered.products.length > 0, true);
  assert(filtered.products.every(p => p.category === "Office Supplies"));
});

test("all categories page implements Figma 868:90135 with 6-column grid and category search filter", () => {
  const categoriesRouteTsx = readFileSync(new URL("../src/app/categories/page.tsx", import.meta.url), "utf8");
  const allCategoriesTsx = readFileSync(new URL("../src/components/all-categories-page.tsx", import.meta.url), "utf8");
  const allCategoriesCss = readFileSync(new URL("../src/components/all-categories-page.module.css", import.meta.url), "utf8");
  const categoryPageTsx = readFileSync(new URL("../src/components/category-page.tsx", import.meta.url), "utf8");

  // Route exists and renders AllCategoriesPage
  assert.match(categoriesRouteTsx, /<AllCategoriesPage\s*\/>/);
  assert.match(categoriesRouteTsx, /<BrizHeader\s*\/>/);
  assert.match(categoriesRouteTsx, /<BrizFooter\s*\/>/);

  // Breadcrumbs: Home › Categories links to /categories
  assert.match(categoryPageTsx, /<Link href="\/categories"[^>]*>Categories<\/Link>/);
  assert.match(allCategoriesTsx, /All Categories/);

  // Figma 868:90135 data attributes
  assert.match(allCategoriesTsx, /data-node-id="868:90135"/);
  assert.match(allCategoriesTsx, /data-node-id="868:90774"/);
  assert.match(allCategoriesTsx, /data-node-id="868:90775"/);

  // 6-column grid matching Figma geometry
  assert.match(allCategoriesCss, /\.grid\s*\{[^}]*grid-template-columns:\s*repeat\(6,\s*1fr\)/);
  assert.match(allCategoriesCss, /\.page\s*\{[^}]*background-color:\s*#f9f9f9/);
  assert.match(allCategoriesCss, /\.container\s*\{[^}]*padding:\s*0\s+120px/);

  // Interactive search filter
  assert.match(allCategoriesTsx, /placeholder="Search categories\.\.\."/);
  assert.match(allCategoriesTsx, /filteredCategories/);
});

test("store detail page implements Figma 885:95254 desktop layout with profile card, info clusters, and 5-column catalog", () => {
  const storeRouteTsx = readFileSync(new URL("../src/app/store/[id]/page.tsx", import.meta.url), "utf8");
  const storeDetailPageTsx = readFileSync(new URL("../src/components/store-detail-page.tsx", import.meta.url), "utf8");
  const storeDetailCss = readFileSync(new URL("../src/components/store-detail-page.module.css", import.meta.url), "utf8");
  const catalogCardsTsx = readFileSync(new URL("../src/components/catalog-cards.tsx", import.meta.url), "utf8");

  // Dynamic route exists and renders StoreDetailPage with BrizHeader and BrizFooter
  assert.match(storeRouteTsx, /<StoreDetailPage\s+storeId=\{id\}\s*\/>/);
  assert.match(storeRouteTsx, /<BrizHeader/);
  assert.match(storeRouteTsx, /<BrizFooter\s*\/>/);
  assert.match(storeRouteTsx, /export async function generateMetadata/);

  // StoreCard links to store detail page
  assert.match(catalogCardsTsx, /href=\{`\/store\/\$\{store\.id\}`\}/);

  // Figma 885:95254 node IDs present
  assert.match(storeDetailPageTsx, /data-node-id="885:95254"/);
  assert.match(storeDetailPageTsx, /data-node-id="885:95256"/);
  assert.match(storeDetailPageTsx, /data-node-id="890:98045"/);
  assert.match(storeDetailPageTsx, /data-node-id="893:99952"/);
  assert.match(storeDetailPageTsx, /data-node-id="893:99892"/);
  assert.match(storeDetailPageTsx, /data-node-id="893:99851"/);
  assert.match(storeDetailPageTsx, /data-node-id="893:99819"/);
  assert.match(storeDetailPageTsx, /data-node-id="893:99823"/);
  assert.match(storeDetailPageTsx, /data-node-id="893:99919"/);
  assert.match(storeDetailPageTsx, /data-node-id="893:99944"/);
  assert.match(storeDetailPageTsx, /data-node-id="893:100516"/);
  assert.match(storeDetailPageTsx, /data-node-id="893:100845"/);
  assert.match(storeDetailPageTsx, /data-node-id="893:100955"/);
  assert.match(storeDetailPageTsx, /data-node-id="893:100847"/);
  assert.match(storeDetailPageTsx, /data-node-id="893:100536"/);
  assert.match(storeDetailPageTsx, /data-node-id="893:101003"/);

  // Profile section elements matching Figma 890:98045
  assert.match(storeDetailPageTsx, /className=\{styles\.profileSection\}/);
  assert.match(storeDetailPageTsx, /className=\{styles\.coverImageWrapper\}/);
  assert.match(storeDetailPageTsx, /className=\{styles\.coverGradient\}/);
  assert.match(storeDetailPageTsx, /className=\{styles\.profilePictureFrame\}/);
  assert.match(storeDetailPageTsx, /className=\{styles\.storeTitle\}/);
  assert.match(storeDetailPageTsx, /className=\{styles\.verifiedBadgeWrapper\}/);
  assert.match(storeDetailPageTsx, /className=\{styles\.distanceBadge\}/);

  // Right Actions: Message, Open Map, Favorite, More
  assert.match(storeDetailPageTsx, /className=\{styles\.messageActionBtn\}/);
  assert.match(storeDetailPageTsx, /className=\{styles\.mapActionBtn\}/);
  assert.match(storeDetailPageTsx, /className=\{\`\$\{styles\.iconActionBtn\}/);
  assert.match(storeDetailPageTsx, /toggleFavourite/);
  assert.match(storeDetailPageTsx, /useSyncExternalStore\(subscribeToStorage,\s*getFavStoreIds,\s*getServerSnapshot\)/);
  assert.match(storeDetailPageTsx, /cachedRawFavourites/);
  assert.match(storeDetailPageTsx, /handleCopyShareLink/);
  assert.match(storeDetailPageTsx, /Message \{store\.name\}/);
  assert.match(storeDetailPageTsx, /maps\.google\.com/);

  // Horizontal Info clusters: Rating, Status, Location, Delivery
  assert.match(storeDetailPageTsx, /className=\{styles\.infoClusters\}/);
  assert.match(storeDetailPageTsx, /className=\{styles\.reviewsCluster\}/);
  assert.match(storeDetailPageTsx, /className=\{styles\.statusCluster\}/);
  assert.match(storeDetailPageTsx, /Weekly Operating Hours/);
  assert.match(storeDetailPageTsx, /className=\{styles\.locationCluster\}/);
  assert.match(storeDetailPageTsx, /className=\{styles\.deliveryCluster\}/);

  // Clamped description with Read More toggle
  assert.match(storeDetailPageTsx, /className=\{styles\.descriptionBlock\}/);
  assert.match(storeDetailPageTsx, /className=\{styles\.readMoreLink\}/);
  assert.match(storeDetailPageTsx, /Read More/);
  assert.match(storeDetailPageTsx, /Read Less/);

  // Product catalog section matching Figma 893:100516
  assert.match(storeDetailPageTsx, /Browse All Products/);
  assert.match(storeDetailPageTsx, /<ProductCategoryList/);
  assert.match(storeDetailPageTsx, /className=\{styles\.catalogToolbar\}/);
  assert.match(storeDetailPageTsx, /className=\{styles\.searchInput\}/);
  assert.match(storeDetailPageTsx, /className=\{styles\.sortSelect\}/);
  assert.match(storeDetailPageTsx, /className=\{styles\.productGrid\}/);
  assert.match(storeDetailPageTsx, /Load More Products/);

  // CSS module verification: 120px desktop margins, #f9f9f9 background, 5-column grid
  assert.match(storeDetailCss, /\.page\s*\{[^}]*background-color:\s*#f9f9f9/);
  assert.match(storeDetailCss, /\.container\s*\{[^}]*padding:\s*0\s+120px/);
  assert.match(storeDetailCss, /\.productGrid\s*\{[^}]*grid-template-columns:\s*repeat\(5,\s*1fr\)/);
});

test("ALL_STORES catalog contains enriched fields for store detail view", () => {
  const { ALL_STORES } = createRequire(import.meta.url)(join(directory, "search-data.js"));

  assert(ALL_STORES.length >= 9);
  const s6 = ALL_STORES.find(s => s.id === "s6");
  assert(s6 !== undefined);
  assert.equal(s6.name, "Himalayan Bazzar");
  assert.equal(s6.verified, true);
  assert.equal(s6.deliveryType, "both");
  assert(s6.address && s6.address.length > 5);
  assert(s6.operatingHours && s6.operatingHours.length > 3);
  assert(Array.isArray(s6.schedule) && s6.schedule.length === 7);
  assert(Array.isArray(s6.gallery) && s6.gallery.length >= 3);
  assert(s6.description && s6.description.length > 20);

  // Ensure all stores have valid deliveryType and schedule
  for (const store of ALL_STORES) {
    assert(["online", "pickup", "both"].includes(store.deliveryType));
    assert(store.schedule && store.schedule.length === 7);
  }
});

test("home page contains only redirection buttons to specific pages and component page", () => {
  const homeTsx = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  const homeCss = readFileSync(new URL("../src/app/home.module.css", import.meta.url), "utf8");
  const docPageTsx = readFileSync(new URL("../src/app/components/product-category-list/page.tsx", import.meta.url), "utf8");

  // Removed heavy carousels, marketing sections, and inline component showcase
  assert.equal(homeTsx.includes("<HomeBanners"), false);
  assert.equal(homeTsx.includes("<FeaturedProductsSection"), false);
  assert.equal(homeTsx.includes("<StoreCarousel"), false);
  assert.equal(homeTsx.includes("<ProductCarousel"), false);
  assert.equal(homeTsx.includes("<MarketplaceCta"), false);
  assert.equal(homeTsx.includes("<RequestOnBriz"), false);
  assert.equal(homeTsx.includes("<AppDownloadBanner"), false);
  assert.equal(homeTsx.includes("<HomeCategoryShowcase"), false);

  // Redirection portal links to key pages
  assert.match(homeTsx, /\/search\?q=thermal/);
  assert.match(homeTsx, /\/category\?category=Office\+Supplies/);
  assert.match(homeTsx, /\/categories/);
  assert.match(homeTsx, /\/store\/s6/);

  // Redirection button to component documentation page
  assert.match(homeTsx, /href="\/components\/product-category-list"/);
  assert.match(homeTsx, /View Component Docs & Preview/);

  // Dedicated component documentation page exists with title and description
  assert.match(docPageTsx, /Product Category List/);
  assert.match(docPageTsx, /<ProductCategoryList/);

  // CSS module verification
  assert.match(homeCss, /\.redirectGrid\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*1fr\)/);
  assert.match(homeCss, /\.componentCard/);
  assert.match(homeCss, /\.componentButton\s*\{[^}]*background-color:\s*#3e63dd/);
});

test("ProductCategoryList implements Figma 946:103107 with all edge cases handled", () => {
  const compTsx = readFileSync(new URL("../src/components/product-category-list.tsx", import.meta.url), "utf8");
  const compCss = readFileSync(new URL("../src/components/product-category-list.module.css", import.meta.url), "utf8");

  // Figma node IDs and variants
  assert.match(compTsx, /data-node-id=\{dataNodeId\}/);
  assert.match(compTsx, /data-name="Product Category list"/);
  assert.match(compTsx, /data-variant=\{variant\}/);
  assert.match(compTsx, /data-node-id="946:103091"/); // gradient-left
  assert.match(compTsx, /data-node-id="946:103085"/); // gradient-right
  assert.match(compTsx, /data-node-id="946:103096"/); // chevron-left
  assert.match(compTsx, /data-node-id="946:103086"/); // chevron-right

  // Edge Case 1: Long category names truncated, expanding when active
  assert.match(compCss, /\.pillLabel\s*\{[^}]*text-overflow:\s*ellipsis/);
  assert.match(compCss, /\.pillLabel\s*\{[^}]*white-space:\s*nowrap/);
  assert.match(compCss, /\.pillLabel\s*\{[^}]*max-width:\s*var\(--max-item-width,\s*160px\)/);
  assert.match(compCss, /\.pillActive\s+\.pillLabel\s*\{[^}]*max-width:\s*1000px/);

  // Edge Case 2: Selected item auto-scrolls into view
  assert.match(compTsx, /pill\.scrollIntoView/);
  assert.match(compTsx, /inline:\s*"nearest"/);

  // Edge Case 3: Empty categories handled safely
  assert.match(compTsx, /if\s*\(items\.length\s*===\s*0\)\s*\{\s*return null;\s*\}/);

  // Edge Case 4: Variant "Less category" when no overflow
  assert.match(compTsx, /if\s*\(!canScrollLeft\s*&&\s*!canScrollRight\)\s*return "Less category"/);

  // Edge Case 5: ResizeObserver tracking
  assert.match(compTsx, /new ResizeObserver/);

  // Edge Case 6: Keyboard a11y navigation
  assert.match(compTsx, /role="tablist"/);
  assert.match(compTsx, /role="tab"/);
  assert.match(compTsx, /aria-selected=\{isSelected\}/);
  assert.match(compTsx, /e\.key === "ArrowRight"/);
  assert.match(compTsx, /e\.key === "ArrowLeft"/);

  // Figma pill styling: 40px height, 12px radius, Inter 650 weight, 14px size
  assert.match(compCss, /\.pill\s*\{[^}]*height:\s*40px/);
  assert.match(compCss, /\.pill\s*\{[^}]*border-radius:\s*12px/);
  assert.match(compCss, /\.pill\s*\{[^}]*font-weight:\s*650/);
  assert.match(compCss, /\.pill\s*\{[^}]*font-size:\s*14px/);
  assert.match(compCss, /\.pillActive\s*\{[^}]*background-color:\s*#3e63dd/);
  assert.match(compCss, /\.gradientLeft\s*\{[^}]*width:\s*152px/);
  assert.match(compCss, /\.gradientRight\s*\{[^}]*width:\s*152px/);
});

test("ShareDialog provides social sharing, copyable share link, and CTA trigger on home page", () => {
  const shareDialogTsx = readFileSync(new URL("../src/components/share-dialog.tsx", import.meta.url), "utf8");
  const shareDialogCss = readFileSync(new URL("../src/components/share-dialog.module.css", import.meta.url), "utf8");
  const homeTsx = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  const homeCss = readFileSync(new URL("../src/app/home.module.css", import.meta.url), "utf8");

  // ShareDialog export and props
  assert.match(shareDialogTsx, /export function ShareDialog\(/);
  assert.match(shareDialogTsx, /isOpen:\s*boolean/);
  assert.match(shareDialogTsx, /onClose:\s*\(\)\s*=>\s*void/);

  // Social sharing: Facebook, Instagram, WhatsApp, Email
  assert.match(shareDialogTsx, /IconFacebook/);
  assert.match(shareDialogTsx, /IconInstagram/);
  assert.match(shareDialogTsx, /IconWhatsApp/);
  assert.match(shareDialogTsx, /IconMail/);
  assert.match(shareDialogTsx, /https:\/\/www\.facebook\.com\/sharer\/sharer\.php/);
  assert.match(shareDialogTsx, /https:\/\/www\.instagram\.com/);
  assert.match(shareDialogTsx, /https:\/\/api\.whatsapp\.com\/send/);
  assert.match(shareDialogTsx, /mailto:\?subject=/);

  // Copyable link section
  assert.match(shareDialogTsx, /className=\{styles\.linkInput\}/);
  assert.match(shareDialogTsx, /navigator\.clipboard\.writeText/);
  assert.match(shareDialogTsx, /Copied!/);

  // Dialog accessibility and keyboard handling
  assert.match(shareDialogTsx, /role="dialog"/);
  assert.match(shareDialogTsx, /aria-modal="true"/);
  assert.match(shareDialogTsx, /aria-labelledby="share-dialog-title"/);
  assert.match(shareDialogTsx, /e\.key === "Escape"/);
  assert.match(shareDialogTsx, /document\.body\.style\.overflow = "hidden"/);

  // CSS module styling for dialog
  assert.match(shareDialogCss, /\.backdrop\s*\{[^}]*position:\s*fixed/);
  assert.match(shareDialogCss, /\.modal\s*\{[^}]*border-radius:\s*20px/);
  assert.match(shareDialogCss, /\.socialGrid\s*\{[^}]*display:\s*grid/);
  assert.match(shareDialogCss, /\.copyBtn\s*\{[^}]*background-color:\s*#3e63dd/);
  assert.match(shareDialogCss, /\.copyBtnSuccess\s*\{[^}]*background-color:\s*#30a46c/);

  // Home page integrates ShareDialog and CTA
  assert.match(homeTsx, /import \{ ShareDialog \} from "@\/components\/share-dialog"/);
  assert.match(homeTsx, /const \[isShareOpen, setIsShareOpen\] = useState\(false\)/);
  assert.match(homeTsx, /onClick=\{\(\) => setIsShareOpen\(true\)\}/);
  assert.match(homeTsx, /Open Share Dialog/);
  assert.match(homeTsx, /<ShareDialog[^>]*isOpen=\{isShareOpen\}/);

  // Home CSS styling for CTA
  assert.match(homeCss, /\.openDialogBtn\s*\{[^}]*background-color:\s*#3e63dd/);
  assert.match(homeCss, /\.actionCard/);
});

test("product detail data model correctly specifies bottle specs, 24% discount, Urban Essentials seller, and similar items", () => {
  const dataTs = readFileSync(new URL("../src/data/product-detail-data.ts", import.meta.url), "utf8");

  // Main product attributes matching user specification
  assert.match(dataTs, /name:\s*"Insulated Stainless Steel Water Bottle, 750 ml"/);
  assert.match(dataTs, /category:\s*"Home & Kitchen"/);
  assert.match(dataTs, /subcategory:\s*"Drinkware"/);
  assert.match(dataTs, /currentPrice:\s*1250/);
  assert.match(dataTs, /originalPrice:\s*1650/);
  assert.match(dataTs, /inStock:\s*true/);
  assert.match(dataTs, /distance:\s*"1\.8 km from your location"/);
  assert.match(dataTs, /shortSummary:\s*[\s\S]*Keep your drinks hot or cold/);

  // Discount rule: 24% off calculation formula
  assert.match(dataTs, /calculateDiscount/);
  assert.match(dataTs, /Math\.round\(\(\(originalPrice - currentPrice\) \/ originalPrice\) \* 100\)/);

  // Nepalese rupees format
  assert.match(dataTs, /`Rs\. \$\{amount\.toLocaleString\("en-IN"\)\}`/);

  // Structured specifications
  assert.match(dataTs, /\{ label: "Capacity", value: "750 ml" \}/);
  assert.match(dataTs, /\{ label: "Material", value: "Stainless steel" \}/);
  assert.match(dataTs, /\{ label: "Colour", value: "Midnight blue" \}/);
  assert.match(dataTs, /\{ label: "Lid type", value: "Screw top" \}/);
  assert.match(dataTs, /\{ label: "Care", value: "Hand wash recommended" \}/);

  // 5 realistic packshot & lifestyle images
  assert.match(dataTs, /\/products\/bottle-main\.svg/);
  assert.match(dataTs, /\/products\/bottle-angle\.svg/);
  assert.match(dataTs, /\/products\/bottle-detail\.svg/);
  assert.match(dataTs, /\/products\/bottle-lifestyle\.svg/);
  assert.match(dataTs, /\/products\/bottle-outdoor\.svg/);

  // Seller details: Urban Essentials in New Baneshwor with 4.7 rating and 128 reviews
  assert.match(dataTs, /name:\s*"Urban Essentials"/);
  assert.match(dataTs, /verified:\s*true/);
  assert.match(dataTs, /rating:\s*4\.7/);
  assert.match(dataTs, /reviewCount:\s*128/);
  assert.match(dataTs, /address:\s*"New Baneshwor, Kathmandu"/);
  assert.match(dataTs, /deliveryType:\s*"both"/);

  // Similar products and edge cases
  assert.match(dataTs, /SIMILAR_PRODUCTS:\s*SimilarProduct\[\]/);
  assert.match(dataTs, /out-of-stock-bottle/);
  assert.match(dataTs, /single-image-tumbler/);
  assert.match(dataTs, /no-reviews-store-item/);
  assert.match(dataTs, /getProductBySlug/);
});

test("product detail page implements complete responsive layout, image lightbox, mobile sticky action bar, and interactive dialogs", () => {
  const routeTsx = readFileSync(new URL("../src/app/products/[slug]/page.tsx", import.meta.url), "utf8");
  const loadingTsx = readFileSync(new URL("../src/app/products/[slug]/loading.tsx", import.meta.url), "utf8");
  const pageTsx = readFileSync(new URL("../src/components/product-detail/product-detail-page.tsx", import.meta.url), "utf8");
  const galleryTsx = readFileSync(new URL("../src/components/product-detail/product-gallery.tsx", import.meta.url), "utf8");
  const modalTsx = readFileSync(new URL("../src/components/product-detail/image-viewer-modal.tsx", import.meta.url), "utf8");
  const infoTsx = readFileSync(new URL("../src/components/product-detail/product-information.tsx", import.meta.url), "utf8");
  const actionsTsx = readFileSync(new URL("../src/components/product-detail/product-actions.tsx", import.meta.url), "utf8");
  const mobileBarTsx = readFileSync(new URL("../src/components/product-detail/mobile-product-action-bar.tsx", import.meta.url), "utf8");
  const sellerTsx = readFileSync(new URL("../src/components/product-detail/seller-details.tsx", import.meta.url), "utf8");
  const descTsx = readFileSync(new URL("../src/components/product-detail/product-description.tsx", import.meta.url), "utf8");
  const benefitsTsx = readFileSync(new URL("../src/components/product-detail/briz-benefits.tsx", import.meta.url), "utf8");
  const similarTsx = readFileSync(new URL("../src/components/product-detail/similar-products.tsx", import.meta.url), "utf8");
  const chatDrawerTsx = readFileSync(new URL("../src/components/product-detail/store-chat-drawer.tsx", import.meta.url), "utf8");
  const shareDialogTsx = readFileSync(new URL("../src/components/product-detail/share-product-dialog.tsx", import.meta.url), "utf8");
  const homeTsx = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");

  // Route: Server component with generateMetadata, BrizHeader, BrizFooter, and 404 fallback
  assert.match(routeTsx, /export async function generateMetadata/);
  assert.match(routeTsx, /<BrizHeader/);
  assert.match(routeTsx, /<ProductDetailPage/);
  assert.match(routeTsx, /<BrizFooter/);
  assert.match(routeTsx, /Product not found/);
  assert.match(routeTsx, /Browse products/);

  // Loading skeleton matching layout structure
  assert.match(loadingTsx, /animate-pulse/);
  assert.match(loadingTsx, /max-w-\[1280px\]/);

  // 2-column section (first = image, second = details with store detail at last) and bottom 1-column similar items
  assert.match(pageTsx, /max-w-\[1280px\]/);
  assert.match(pageTsx, /lg:w-\[(52|55)%\]/);
  assert.match(pageTsx, /lg:w-\[(45|48)%\]/);
  assert.match(pageTsx, /Similar Products Section/);

  // Breadcrumb navigation
  assert.match(pageTsx, /aria-label="Breadcrumb"/);
  assert.match(pageTsx, /href="\/"/);
  assert.match(pageTsx, /product\.category/);
  assert.match(pageTsx, /product\.subcategory/);

  // Gallery: Desktop thumbnails + mobile swipe gestures
  assert.match(galleryTsx, /cursor-zoom-in/);
  assert.match(galleryTsx, /border-\[\#3e63dd\]/);
  assert.match(galleryTsx, /onTouchStart=\{handleTouchStart\}/);
  assert.match(galleryTsx, /onTouchEnd=\{handleTouchEnd\}/);
  assert.match(galleryTsx, /\{activeIndex \+ 1\} \/ \{images\.length\}/);

  // Lightbox modal: Keyboard navigation and focus restoration
  assert.match(modalTsx, /role="dialog"/);
  assert.match(modalTsx, /e\.key === "Escape"/);
  assert.match(modalTsx, /e\.key === "ArrowLeft"/);
  assert.match(modalTsx, /e\.key === "ArrowRight"/);
  assert.match(modalTsx, /triggerRef\?\.current\?\.focus\(\)/);

  // Product information: Title, price, discount badge, availability, and distance
  assert.match(infoTsx, /formatPriceNPR\(product\.currentPrice\)/);
  assert.match(infoTsx, /\{discount\}% off/);
  assert.match(infoTsx, /In stock/);
  assert.match(infoTsx, /product\.distance/);
  assert.equal(infoTsx.includes("product.shortSummary"), false); // sub-description after pricing removed as requested
  assert.match(infoTsx, /toggleFavourite\(product\.id\)/);

  // Product actions: Add to Cart and Message Store
  assert.match(actionsTsx, /Add to Cart/);
  assert.match(actionsTsx, /Added to cart/);
  assert.match(actionsTsx, /Message Store/);
  assert.match(actionsTsx, /Out of stock/);
  assert.match(actionsTsx, /Ask about availability/);

  // Mobile sticky bottom action bar
  assert.match(mobileBarTsx, /fixed bottom-0/);
  assert.match(mobileBarTsx, /md:hidden/);
  assert.match(mobileBarTsx, /pb-\[calc\(0\.75rem\+env\(safe-area-inset-bottom\)\)\]/);

  // Seller details: "Sold by", Urban Essentials, verified badge, rating, reviews
  assert.match(sellerTsx, /Sold by/);
  assert.match(sellerTsx, /seller\.verified/);
  assert.match(sellerTsx, /seller\.rating/);
  assert.match(sellerTsx, /store reviews/);
  assert.match(sellerTsx, /Delivery options/);
  assert.match(sellerTsx, /View Store Profile/);

  // Product description: Clean description with Read more toggle (structured specs removed)
  assert.match(descTsx, /Description/);
  assert.match(descTsx, /Read more/);
  assert.equal(descTsx.includes("Product details"), false); // structured specs removed as requested

  // Why shop on Briz 3-column benefits
  assert.match(benefitsTsx, /Why shop on Briz\?/);
  assert.match(benefitsTsx, /Shop nearby/);
  assert.match(benefitsTsx, /Talk to the store/);
  assert.match(benefitsTsx, /Choose how you shop/);

  // Similar products grid
  assert.match(similarTsx, /Similar products/);
  assert.match(similarTsx, /grid-cols-2 md:grid-cols-4/);
  assert.match(similarTsx, /e\.stopPropagation\(\)/);

  // Store chat drawer: Attached product context card and demo indicator
  assert.match(chatDrawerTsx, /Attached Product/);
  assert.match(chatDrawerTsx, /Demo conversation/);
  assert.match(chatDrawerTsx, /handleSendMessage/);

  // Share dialog: product preview, copy link, and social channels
  assert.match(shareDialogTsx, /Share this product/);
  assert.match(shareDialogTsx, /Copy Link/);
  assert.match(shareDialogTsx, /WhatsApp/);
  assert.match(shareDialogTsx, /Facebook/);

  // Home portal links to product detail page
  assert.match(homeTsx, /\/products\/insulated-stainless-steel-water-bottle-750ml/);
});

test("search module is optimized for mobile responsiveness, ergonomics, and touch targets", () => {
  const navbarSearchTsx = readFileSync(new URL("../src/components/navbar-search.tsx", import.meta.url), "utf8");
  const navbarSearchCss = readFileSync(new URL("../src/components/navbar-search.module.css", import.meta.url), "utf8");
  const searchPartsTsx = readFileSync(new URL("../src/components/search-parts.tsx", import.meta.url), "utf8");
  const headerTsx = readFileSync(new URL("../src/components/briz-header.tsx", import.meta.url), "utf8");
  const headerCss = readFileSync(new URL("../src/components/briz-header.module.css", import.meta.url), "utf8");

  // 1. iOS Safari Auto-Zoom Fix: font-size 16px on mobile viewports & embedded mode
  assert.match(navbarSearchCss, /@media\s*\(max-width:\s*768px\)\s*\{[^}]*\.field\s+input\s*\{[^}]*font-size:\s*16px/);
  assert.match(navbarSearchCss, /\.embedded\s+\.field\s+input\s*\{[^}]*font-size:\s*16px/);

  // 2. Touch-friendly hit targets (clear button >= 36px, remove button >= 36px, chip >= 38px)
  assert.match(navbarSearchCss, /\.clear\s*\{[^}]*min-width:\s*36px/);
  assert.match(navbarSearchCss, /\.clear\s*\{[^}]*height:\s*36px/);
  assert.match(navbarSearchCss, /\.remove\s*\{[^}]*width:\s*36px/);
  assert.match(navbarSearchCss, /\.remove\s*\{[^}]*height:\s*36px/);
  assert.match(navbarSearchCss, /\.chips\s+button\s*\{[^}]*min-height:\s*38px/);
  assert.match(navbarSearchCss, /\.scopedButton\s*\{[^}]*min-height:\s*44px/);

  // 3. Mobile Back / Close Navigation in Search Header
  assert.match(navbarSearchTsx, /className=\{styles\.searchHeader\}/);
  assert.match(navbarSearchTsx, /className=\{styles\.backButton\}/);
  assert.match(navbarSearchTsx, /<ArrowLeft/);
  assert.match(navbarSearchCss, /\.backButton\s*\{[^}]*width:\s*44px/);
  assert.match(navbarSearchCss, /\.backButton\s*\{[^}]*height:\s*44px/);

  // 4. Smooth touch scrolling performance & overscroll containment
  assert.match(navbarSearchCss, /\.dropdown\s*\{[^}]*overscroll-behavior-y:\s*contain/);
  assert.match(navbarSearchCss, /\.dropdown\s*\{[^}]*-webkit-overflow-scrolling:\s*touch/);
  assert.match(navbarSearchCss, /\.embedded\s+\.dropdown\s*\{[^}]*-webkit-overflow-scrolling:\s*touch/);

  // 5. Mobile search dialog layout with safe area insets
  assert.match(headerCss, /@media\s*\(max-width:\s*768px\)\s*\{[^}]*\.searchDialog\s*\{[^}]*height:\s*100dvh/);
  assert.match(headerCss, /safe-area-inset-top/);
  assert.match(headerCss, /safe-area-inset-bottom/);

  // 6. Header renders integrated search header without redundant modal title on mobile
  assert.match(headerTsx, /panel\s*!==\s*"search"\s*&&\s*\(/);
  assert.match(headerTsx, /className=\{styles\.srOnly\}>Search Briz<\/h2>/);
  assert.match(headerTsx, /onClose=\{\(\)\s*=>\s*setPanel\(null\)\}/);

  // 7. Recent searches remove button prevents accidental query trigger
  assert.match(searchPartsTsx, /event\.stopPropagation\(\)/);
});

test("mobile responsive toolbar orders Category filter & sortby on top, with product & store tabs after", () => {
  const searchResultsCss = readFileSync(new URL("../src/components/search-results.module.css", import.meta.url), "utf8");
  const searchResultsTsx = readFileSync(new URL("../src/components/search-results.tsx", import.meta.url), "utf8");
  const categoryToolbarCss = readFileSync(new URL("../src/components/category-toolbar.module.css", import.meta.url), "utf8");

  // Search results mobile toolbar ordering
  assert.match(searchResultsTsx, /Category & Filters/);
  assert.match(searchResultsTsx, /className=\{styles\.sortWrapper\}/);
  assert.match(searchResultsCss, /\.mobileFilterButton\s*\{[^}]*order:\s*1/);
  assert.match(searchResultsCss, /\.sortWrapper\s*\{[^}]*order:\s*2/);
  assert.match(searchResultsCss, /\.tabs\s*\{[^}]*order:\s*3/);

  // Category page mobile toolbar ordering
  assert.match(categoryToolbarCss, /\.filterControls\s*\{[^}]*order:\s*1/);
  assert.match(categoryToolbarCss, /\.searchField\s*\{[^}]*order:\s*2/);
  assert.match(categoryToolbarCss, /\.tabs\s*\{[^}]*order:\s*3/);
});

test("store reviews experience displays Avatar, Username, Given Star, Tags, max 360 char Content, and Date in right side-pop drawer (view-only)", () => {
  const reviewsDataTs = readFileSync(new URL("../src/data/store-reviews-data.ts", import.meta.url), "utf8");
  const storeDetailPageTsx = readFileSync(new URL("../src/components/store-detail-page.tsx", import.meta.url), "utf8");
  const storeReviewsDrawerTsx = readFileSync(new URL("../src/components/store-reviews-drawer.tsx", import.meta.url), "utf8");
  const storeReviewsDrawerCss = readFileSync(new URL("../src/components/store-reviews-drawer.module.css", import.meta.url), "utf8");

  // Transpile reviews module to verify data helpers directly
  const { outputText } = ts.transpileModule(reviewsDataTs, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const reviewModule = {};
  const exports = reviewModule;
  const fn = new Function("exports", "module", outputText);
  fn(exports, { exports });
  const { MAX_REVIEW_LENGTH, validateReviewContent, getInitialStoreReviews } = exports;

  // 1. Constraint: Max 360 characters
  assert.equal(MAX_REVIEW_LENGTH, 360);
  assert.equal(validateReviewContent("   ").valid, false);
  assert.equal(validateReviewContent("Great store!").valid, true);
  const longReview = "a".repeat(361);
  assert.equal(validateReviewContent(longReview).valid, false);
  assert(validateReviewContent(longReview).error.includes("360"));

  // 2. Data model contains all 6 required fields
  const sampleReviews = getInitialStoreReviews("s1");
  assert(sampleReviews.length >= 3);
  for (const review of sampleReviews) {
    assert(typeof review.avatar === "string" && review.avatar.length > 0, "Avatar is required");
    assert(typeof review.username === "string" && review.username.length > 0, "Username is required");
    assert(typeof review.givenStar === "number" && review.givenStar >= 1 && review.givenStar <= 5, "Given Star is required (1-5)");
    assert(Array.isArray(review.tags) && review.tags.length > 0, "Tags are required");
    assert(typeof review.content === "string" && review.content.length > 0, "Review content is required");
    assert(review.content.length <= 360, "Review content must not exceed 360 characters");
    assert(typeof review.date === "string" && review.date.length > 0, "Review date is required");
  }

  // 3. Side-pop Drawer UI component renders all 6 data fields
  assert.match(storeReviewsDrawerTsx, /className=\{styles\.reviewAvatarWrapper\}/); // 1. Avatar
  assert.match(storeReviewsDrawerTsx, /className=\{styles\.reviewAuthorName\}/); // 2. Username
  assert.match(storeReviewsDrawerTsx, /className=\{styles\.reviewStarsRow\}/); // 3. Given Star
  assert.match(storeReviewsDrawerTsx, /className=\{styles\.reviewTagsList\}/); // 4. Tags
  assert.match(storeReviewsDrawerTsx, /className=\{styles\.reviewTagBadge\}/);
  assert.match(storeReviewsDrawerTsx, /className=\{styles\.reviewContentText\}/); // 5. Content
  assert.match(storeReviewsDrawerTsx, /review\.content\.slice\(0,\s*MAX_REVIEW_LENGTH\)/); // 360 char cap
  assert.match(storeReviewsDrawerTsx, /className=\{styles\.reviewDateText\}/); // 6. Review Date

  // 4. Rating overview and filter options in drawer
  assert.match(storeReviewsDrawerTsx, /className=\{styles\.ratingOverviewCard\}/);
  assert.match(storeReviewsDrawerTsx, /className=\{styles\.starBarsCol\}/);
  assert.match(storeReviewsDrawerTsx, /className=\{styles\.tagsFilterCloud\}/);
  assert.match(storeReviewsDrawerTsx, /Customer Reviews/);

  // 5. Drawer styling & right side-pop layout
  assert.match(storeReviewsDrawerCss, /\.backdrop\s*\{[^}]*position:\s*fixed/);
  assert.match(storeReviewsDrawerCss, /\.backdrop\s*\{[^}]*backdrop-filter:\s*blur\(4px\)/);
  assert.match(storeReviewsDrawerCss, /\.drawer\s*\{[^}]*position:\s*fixed/);
  assert.match(storeReviewsDrawerCss, /\.drawer\s*\{[^}]*right:\s*0/);
  assert.match(storeReviewsDrawerCss, /\.drawer\s*\{[^}]*width:\s*min\(520px,\s*100vw\)/);
  assert.match(storeReviewsDrawerCss, /animation:\s*slideInRight/);
  assert.match(storeReviewsDrawerCss, /@keyframes slideInRight\s*\{[^}]*transform:\s*translateX\(100%\)/);

  // 6. View-only constraint: visitors cannot submit reviews
  assert.match(storeReviewsDrawerTsx, /View-only/);
  assert.doesNotMatch(storeReviewsDrawerTsx, /<textarea/);
  assert.doesNotMatch(storeReviewsDrawerTsx, /<input/);
  assert.doesNotMatch(storeReviewsDrawerTsx, /Submit Review/);
  assert.doesNotMatch(storeDetailPageTsx, /Write a Review/);
  assert.doesNotMatch(storeDetailPageTsx, /Submit Review/);

  // 7. Store Detail Page integration: opens side-pop drawer on review click
  assert.match(storeDetailPageTsx, /import\s*\{\s*StoreReviewsDrawer\s*\}\s*from\s*"\.\/store-reviews-drawer"/);
  assert.match(storeDetailPageTsx, /<StoreReviewsDrawer/);
  assert.match(storeDetailPageTsx, /isOpen=\{isReviewsDrawerOpen\}/);
  assert.match(storeDetailPageTsx, /onClose=\{\(\)\s*=>\s*setIsReviewsDrawerOpen\(false\)\}/);
  assert.match(storeDetailPageTsx, /className=\{styles\.reviewsCluster\}/);
  assert.match(storeDetailPageTsx, /onClick=\{\(\)\s*=>\s*setIsReviewsDrawerOpen\(true\)\}/);
});

test("seller design page implements all 3 responsive Figma designs (Desktop 964:107194, Tablet 1152:21303, Mobile 1153:23352)", () => {
  const storeDetailPageTsx = readFileSync(new URL("../src/components/store-detail-page.tsx", import.meta.url), "utf8");
  const storeDetailPageCss = readFileSync(new URL("../src/components/store-detail-page.module.css", import.meta.url), "utf8");

  // 1. Desktop Figma Design (node 964:107194 - Laptop 1440px)
  assert.match(storeDetailPageCss, /\.container\s*\{[^}]*padding:\s*0\s*120px/); // 120px margins
  assert.match(storeDetailPageCss, /\.coverImageWrapper\s*\{[^}]*height:\s*420px/); // 420px cover
  assert.match(storeDetailPageCss, /\.coverGradient\s*\{[^}]*height:\s*340px/); // 340px bottom gradient
  assert.match(storeDetailPageCss, /\.profilePictureFrame\s*\{[^}]*width:\s*80px;[^}]*height:\s*80px/); // 80x80 frame
  assert.match(storeDetailPageCss, /\.profilePictureInner\s*\{[^}]*width:\s*72px;[^}]*height:\s*72px/); // 72x72 inner
  assert.match(storeDetailPageCss, /\.productGrid\s*\{[^}]*grid-template-columns:\s*repeat\(5/); // 5-column grid
  assert.match(storeDetailPageCss, /\.searchInputWrapper\s*\{[^}]*width:\s*340px/); // 340px search bar
  assert.match(storeDetailPageCss, /\.desktopFilterControls\s*\{[^}]*display:\s*flex/); // Desktop filter toolbar
  assert.match(storeDetailPageCss, /\.loadMoreBtn\s*\{[^}]*height:\s*48px/); // Load more button

  // Desktop JSX elements
  assert.match(storeDetailPageTsx, /className=\{styles\.titleWithVerified\}/);
  assert.match(storeDetailPageTsx, /className=\{styles\.distanceBadge\}/);
  assert.match(storeDetailPageTsx, /className=\{styles\.actionsCluster\}/);
  assert.match(storeDetailPageTsx, /className=\{styles\.desktopFilterControls\}/);
  assert.match(storeDetailPageTsx, /Filter by/);
  assert.match(storeDetailPageTsx, /All Price Range/);
  assert.match(storeDetailPageTsx, /Sort by/);
  assert.match(storeDetailPageTsx, /Relevance/);
  assert.match(storeDetailPageTsx, /className=\{styles\.categoryPillsWrapper\}/);
  assert.match(storeDetailPageTsx, /Load More Products/);

  // 2. Tablet Figma Design (node 1152:21303 - Tablet 744px)
  const tabletMedia = storeDetailPageCss.split("@media (max-width: 1024px)")[1].split("@media (max-width: 768px)")[0];
  assert.match(tabletMedia, /padding-left:\s*32px;\s*padding-right:\s*32px;/); // 32px margins
  assert.match(tabletMedia, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/); // 3-col grid
  assert.match(tabletMedia, /\.searchInputWrapper\s*\{[^}]*width:\s*320px/); // 320px search
  assert.match(tabletMedia, /\.desktopFilterControls\s*\{[^}]*display:\s*none/);
  assert.match(tabletMedia, /\.moreFiltersBtn\s*\{[^}]*display:\s*inline-flex/);

  // 3. Mobile Figma Design (node 1153:23352 - Phone 393px)
  const mobileMedia = storeDetailPageCss.split("@media (max-width: 768px)")[1];
  assert.match(mobileMedia, /padding-left:\s*16px;\s*padding-right:\s*16px;/); // 16px margins
  assert.match(mobileMedia, /\.coverImageWrapper\s*\{[^}]*height:\s*146px/); // 146px cover
  assert.match(mobileMedia, /\.coverGradient\s*\{[^}]*height:\s*101px/); // 101px gradient
  assert.match(mobileMedia, /\.profilePictureFrame\s*\{[^}]*width:\s*56px;\s*height:\s*56px/); // 56x56 profile
  assert.match(mobileMedia, /\.profilePictureInner\s*\{[^}]*width:\s*52px;\s*height:\s*52px/); // 52x52 inner
  assert.match(mobileMedia, /\.storeInfoTitleBlock\s*\{[^}]*justify-content:\s*space-between/); // title left, distance right
  assert.match(mobileMedia, /\.actionsCluster\s*\{[^}]*display:\s*none/); // hide desktop actions
  assert.match(mobileMedia, /\.mobileActionsCluster\s*\{[^}]*display:\s*flex/); // mobile actions bar
  assert.match(mobileMedia, /\.infoClusters\s*\{[^}]*flex-direction:\s*column/); // 4 stacked lines
  assert.match(mobileMedia, /\.clusterDot\s*\{[^}]*display:\s*none/); // hide dots
  assert.match(mobileMedia, /\.productGrid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/); // 2-col grid

  // Mobile JSX elements & interactive filter modal
  assert.match(storeDetailPageTsx, /className=\{styles\.mobileActionsCluster\}/);
  assert.match(storeDetailPageTsx, /data-node-id="1181:53223"/);
  assert.match(storeDetailPageTsx, /className=\{styles\.moreFiltersBtn\}/);
  assert.match(storeDetailPageTsx, /setIsFilterModalOpen\(true\)/);
  assert.match(storeDetailPageTsx, /className=\{styles\.filterModalBody\}/);
  assert.match(storeDetailPageTsx, /styles\.filterOptionPill/);
});

