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
