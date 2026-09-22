"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { ALL_CATEGORY_ITEMS } from "./category-data";
import { ALL_STORES, type Product, type Store } from "./search-data";
import { getSearchResults, money, PRODUCT_SORTS, STORE_SORTS } from "./search-results-model";
import { CategorySidebar } from "./category-sidebar";
import { CategoryToolbar } from "./category-toolbar";
import { ProductCard, StoreCard } from "./catalog-cards";
import styles from "./category-page.module.css";

export function CategoryPage() {
  const params = useSearchParams();
  const currentCategory = params.get("category") || ALL_CATEGORY_ITEMS[0].name;

  // Clone params and ensure category is populated for model evaluation
  const effectiveParams = new URLSearchParams(params.toString());
  if (!effectiveParams.get("category")) {
    effectiveParams.set("category", currentCategory);
  }

  const {
    query,
    view,
    category,
    subcategory,
    min,
    max,
    sort,
    storeId,
    products,
    stores,
  } = getSearchResults(effectiveParams);

  const activeCategory = category || currentCategory;

  const productDialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [requestSaved, setRequestSaved] = useState(false);
  const [requestError, setRequestError] = useState("");

  const activeCount =
    Number(Boolean(query)) +
    Number(Boolean(subcategory)) +
    Number(min !== undefined || max !== undefined) +
    Number(Boolean(storeId));

  const sortOptions = view === "products" ? PRODUCT_SORTS : STORE_SORTS;
  const items = view === "products" ? products : stores;
  const perPage = 8; // 2 rows of 4 cards per row matching Figma 836:3771
  const requestedPage = Number(params.get("page") || 1);
  const page = Number.isSafeInteger(requestedPage)
    ? Math.max(1, Math.min(requestedPage, Math.max(1, Math.ceil(items.length / perPage))))
    : 1;
  const displayed = Math.min(page * perPage, items.length);

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    if (!("page" in changes)) next.delete("page");
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    window.history.pushState(null, "", `/category${next.size ? `?${next}` : ""}`);
  }

  function handleCategorySelect(newCategory: string) {
    update({ category: newCategory, subcategory: null, page: null, q: null });
  }

  function selectStore(store: Store) {
    update({ type: null, store: store.id, sort: null });
    document.getElementById("category-heading")?.scrollIntoView({ block: "start" });
  }

  function selectProduct(product: Product) {
    setSelected(product);
    setRequestSaved(false);
    setRequestError("");
    productDialog.current?.showModal();
  }

  function saveRequest() {
    if (!selected) return;
    try {
      const old = JSON.parse(localStorage.getItem("briz-product-requests") || "[]");
      localStorage.setItem(
        "briz-product-requests",
        JSON.stringify([
          ...(Array.isArray(old) ? old : []),
          { name: selected.name, storeId: selected.storeId, createdAt: new Date().toISOString() },
        ])
      );
      setRequestSaved(true);
    } catch {
      setRequestError("Couldn’t save your request on this device. Please try again.");
    }
  }

  return (
    <main className={styles.page} data-node-id="836:3686">
      {/* Breadcrumb section matching Figma 836:3688 */}
      <nav className={styles.breadcrumbSection} aria-label="Breadcrumb" data-node-id="836:3688">
        <div className={styles.breadcrumb} data-node-id="836:3689">
          <Link href="/" data-node-id="836:3690">Home</Link>
          <span className={styles.breadcrumbSeparator} aria-hidden data-node-id="836:3693">›</span>
          <Link href="/categories" data-node-id="868:80328">Categories</Link>
          <span className={styles.breadcrumbSeparator} aria-hidden data-node-id="868:80329">›</span>
          <span className={styles.breadcrumbActive} data-node-id="836:3694">{activeCategory}</span>
          {subcategory && (
            <>
              <span className={styles.breadcrumbSeparator} aria-hidden>›</span>
              <span className={styles.breadcrumbActive}>{subcategory}</span>
            </>
          )}
        </div>
      </nav>

      {/* Main container matching Figma 836:3698 */}
      <div className={styles.container} data-node-id="836:3698">
        {/* Left: Category Sidebar matching Figma 836:3699 */}
        <CategorySidebar
          selectedCategory={activeCategory}
          onSelectCategory={handleCategorySelect}
        />

        {/* Right: Main Content Area matching Figma 836:3762 */}
        <div className={styles.mainContent} data-node-id="836:3762">
          {/* Header section matching Figma 868:80334 */}
          <div className={styles.headerSection} data-node-id="868:80334">
            <h1 id="category-heading" className={styles.categoryTitle} data-node-id="868:80335">
              {activeCategory}
            </h1>
          </div>

          {/* Search & Sort by Toolbar matching Figma 836:3763 */}
          <CategoryToolbar
            category={activeCategory}
            query={query}
            subcategory={subcategory}
            min={min}
            max={max}
            sort={sort}
            view={view}
            sortOptions={sortOptions}
            productCount={products.length}
            storeCount={stores.length}
            update={update}
          />

          {/* Applied filter chips */}
          {activeCount > 0 && (
            <div className={styles.filteringPanel} aria-label="Active filters">
              <span className={styles.filterAppliedLabel}>Filter applied:</span>
              {query && (
                <button
                  type="button"
                  className={styles.filterChip}
                  onClick={() => update({ q: null })}
                >
                  <span>Search: &ldquo;{query}&rdquo;</span>
                  <span className={styles.filterChipClose} aria-label="Remove search filter">
                    <Image
                      src="/figma/results/filter-chip-remove.svg"
                      width={14}
                      height={14}
                      alt=""
                      unoptimized
                    />
                  </span>
                </button>
              )}
              {subcategory && (
                <button
                  type="button"
                  className={styles.filterChip}
                  onClick={() => update({ subcategory: null })}
                >
                  <span>{subcategory}</span>
                  <span className={styles.filterChipClose} aria-label="Remove sub-category filter">
                    <Image
                      src="/figma/results/filter-chip-remove.svg"
                      width={14}
                      height={14}
                      alt=""
                      unoptimized
                    />
                  </span>
                </button>
              )}
              {(min !== undefined || max !== undefined) && (
                <button
                  type="button"
                  className={styles.filterChip}
                  onClick={() => update({ min: null, max: null })}
                >
                  <span>
                    {min === undefined
                      ? `Up to ${money(max!)}`
                      : max === undefined
                      ? `${money(min)} & above`
                      : `Price: ${min} - ${max}`}
                  </span>
                  <span className={styles.filterChipClose} aria-label="Remove price filter">
                    <Image
                      src="/figma/results/filter-chip-remove.svg"
                      width={14}
                      height={14}
                      alt=""
                      unoptimized
                    />
                  </span>
                </button>
              )}
              {storeId && (
                <button
                  type="button"
                  className={styles.filterChip}
                  onClick={() => update({ store: null })}
                >
                  <span>{ALL_STORES.find(s => s.id === storeId)?.name || "Store"}</span>
                  <span className={styles.filterChipClose} aria-label="Remove store filter">
                    <Image
                      src="/figma/results/filter-chip-remove.svg"
                      width={14}
                      height={14}
                      alt=""
                      unoptimized
                    />
                  </span>
                </button>
              )}
              <button
                type="button"
                className={styles.clearAllButton}
                onClick={() => update({ q: null, subcategory: null, min: null, max: null, store: null })}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product list matching Figma 836:3771 (4 cards per row) */}
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIllustration}>
                <Image
                  src="/figma/results/empty-state-illustration.png"
                  alt=""
                  width={160}
                  height={160}
                />
              </div>
              <h2 className={styles.emptyTitle}>
                {query
                  ? `No ${view} found for “${query}” in ${activeCategory}`
                  : `No items found in ${activeCategory}`}
              </h2>
              <p className={styles.emptySubtitle}>
                {query
                  ? "Try checking your spelling, removing filters, or searching across all categories."
                  : "Try adjusting your subcategory or price range to find available items."}
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "8px" }}>
                <button
                  type="button"
                  className={styles.emptyResetButton}
                  onClick={() => update({ q: null, subcategory: null, min: null, max: null, store: null })}
                >
                  Reset filters
                </button>
                {query && (
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    className={styles.emptyResetButton}
                    style={{ textDecoration: "none", backgroundColor: "#3e63dd", color: "#ffffff", borderColor: "#3e63dd" }}
                  >
                    Search across all Briz
                  </Link>
                )}
              </div>
            </div>
          ) : view === "products" ? (
            <div className={styles.productGrid} data-node-id="836:3771" data-name="product lists">
              {(items as Product[]).slice(0, displayed).map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={selectProduct}
                />
              ))}
            </div>
          ) : (
            <div className={styles.storeGrid}>
              {(items as Store[]).slice(0, displayed).map(store => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onSelect={selectStore}
                />
              ))}
            </div>
          )}

          {/* Centered Show More button matching Figma 836:28812 */}
          {items.length > perPage && (
            <div className={styles.buttonWrapper} data-node-id="836:28812">
              <button
                type="button"
                className={styles.showMoreButton}
                disabled={displayed >= items.length}
                onClick={() => update({ page: String(page + 1) })}
                data-node-id="836:28813"
              >
                {displayed >= items.length
                  ? `Showing all ${items.length} ${view}`
                  : `Show more (${displayed} of ${items.length})`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Detail / Inquiry Dialog */}
      <dialog
        ref={productDialog}
        className={styles.productModal}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{selected.name}</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => productDialog.current?.close()}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalImageWrapper}>
                <Image
                  src={selected.image}
                  alt={selected.name}
                  width={200}
                  height={200}
                  className={styles.modalImage}
                />
              </div>
              <div className={styles.modalDetails}>
                <p className={styles.modalStore}>Sold by: <strong>{selected.storeName}</strong></p>
                <p className={styles.modalLocation}>Location: {selected.location} ({selected.distance})</p>
                <p className={styles.modalPrice}>
                  Price: {selected.askForPrice ? "Ask for Price" : money(selected.price)}
                </p>
                {requestSaved ? (
                  <div className={styles.modalSuccess}>
                    Request saved! Nearby sellers will be notified when online.
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.requestButton}
                    onClick={saveRequest}
                  >
                    Request this product
                  </button>
                )}
                {requestError && <p className={styles.modalError}>{requestError}</p>}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </main>
  );
}
