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



