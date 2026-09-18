"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { ALL_STORES, type Product, type Store } from "./search-data";
import { getSearchResults, money, PRODUCT_SORTS, STORE_SORTS } from "./search-results-model";
import { SearchFilters } from "./search-filters";
import { ProductCard, StoreCard } from "./catalog-cards";
import { SortDropdown } from "./sort-dropdown";
import styles from "./search-results.module.css";

export function SearchResults() {
  const params = useSearchParams();
  const { query, view, category, subcategory, min, max, sort, storeId, products, stores } = getSearchResults(params);
  const mobileFilters = useRef<HTMLDialogElement>(null);
  const productDialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [requestSaved, setRequestSaved] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeCount =
    Number(Boolean(category)) +
    Number(Boolean(subcategory)) +
    Number(min !== undefined || max !== undefined) +
    Number(Boolean(storeId));

  const sortOptions = view === "products" ? PRODUCT_SORTS : STORE_SORTS;
  const items = view === "products" ? products : stores;
  const perPage = view === "products" ? 8 : 6;
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
    window.history.pushState(null, "", `/search${next.size ? `?${next}` : ""}`);
  }

  function clearFilters() {
    update({ category: null, subcategory: null, min: null, max: null, store: null });
  }

  function chooseView(type: string) {
    update({ type: type === "products" ? null : type, sort: null });
  }

  function selectStore(store: Store) {
    update({ type: null, store: store.id, sort: null });
    document.getElementById("results-heading")?.scrollIntoView({ block: "start" });
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

  function renderFilters() {
    return (
      <SearchFilters
        category={category}
        subcategory={subcategory}
        min={min}
        max={max}
        stores={view === "stores"}
        update={update}
      />
    );
  }

  return (
    <main className={styles.page}>
      {/* Breadcrumb section matching Figma 782:27605 & 836:3688 */}
      <nav className={styles.breadcrumbSection} aria-label="Breadcrumb" data-node-id="782:27605">
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span className={styles.breadcrumbSeparator} aria-hidden>
            ›
          </span>
          {query ? (
            <span className={styles.breadcrumbActive}>Search results</span>
          ) : category ? (
            <>
              <Link href="/search">Categories</Link>
              <span className={styles.breadcrumbSeparator} aria-hidden>
                ›
              </span>
              <span className={styles.breadcrumbActive}>{category}</span>
            </>
          ) : (
            <span className={styles.breadcrumbActive}>Categories</span>
          )}
        </div>
      </nav>

      {/* Header section matching Figma 787:27621 & 836:3695 */}
      <div className={styles.headerSection} data-node-id={query ? "787:27621" : "836:3695"}>
        {query ? (
          <>
            <span className={styles.resultsFor}>Results for</span>
            <span className={styles.queryHighlight}>“{query}”</span>
          </>
        ) : (
          <h1 className={styles.categoryTitle}>{category || "All categories"}</h1>
        )}
      </div>

      <div className={styles.layout} data-node-id="780:25542">
        {/* Left Filter Sidebar matching Figma 782:26923 */}
        <aside className={styles.filters} aria-label="Search filters" data-node-id="782:26923">
          {!filtersOpen && renderFilters()}
        </aside>

        {/* Right Content Area matching Figma 782:26924 */}
        <div className={styles.content}>
          {/* Toolbar: Tabs & Sort By matching Figma 811:31402 */}
          <div className={styles.toolbar} data-node-id="811:31402">
            <div className={styles.tabs} role="group" aria-label="Result type" data-node-id="811:31420">
              <button
                type="button"
                aria-pressed={view === "products"}
                onClick={() => chooseView("products")}
                data-node-id="811:31421"
              >
                <span>Products</span>
                <span className={styles.tabBadge}>{products.length}</span>
              </button>
              <button
                type="button"
                aria-pressed={view === "stores"}
                onClick={() => chooseView("stores")}
                data-node-id="811:37204"
              >
                <span>Stores</span>
                <span className={styles.tabBadge}>{stores.length}</span>
              </button>
            </div>

            <button
              type="button"
              className={styles.mobileFilterButton}
              onClick={() => {
                setFiltersOpen(true);
                mobileFilters.current?.showModal();
              }}
            >
              Filters
              {activeCount > 0 && <span>{activeCount}</span>}
            </button>

            <SortDropdown
              label="Sort by:"
              value={sort}
              options={sortOptions}
              onChange={newSort => update({ sort: newSort })}
              ariaLabel={`Sort ${view}`}
            />
          </div>

          {/* Filtering Panel / Applied filter state matching Figma 822:39486 / 811:37415 */}
          {activeCount > 0 && (
            <div className={styles.filteringPanel} aria-label="Active filters" data-node-id="822:39486">
              <span className={styles.filterAppliedLabel}>Filter applied:</span>
              {category && (
                <button
                  type="button"
                  className={styles.filterChip}
                  onClick={() => update({ category: null, subcategory: null })}
                >
                  <span>{category}</span>
                  <span className={styles.filterChipClose} aria-label="Remove category filter">
                    <Image
                      src="/figma/results/filter-chip-remove.svg"
                      width={16}
                      height={16}
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
                      width={16}
                      height={16}
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
                      width={16}
                      height={16}
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
                  <span>{ALL_STORES.find(store => store.id === storeId)?.name || "Store"}</span>
                  <span className={styles.filterChipClose} aria-label="Remove store filter">
                    <Image
                      src="/figma/results/filter-chip-remove.svg"
                      width={16}
                      height={16}
                      alt=""
                      unoptimized
                    />
                  </span>
                </button>
              )}
              <button
                type="button"
                className={styles.clearAllButton}
                onClick={clearFilters}
                data-node-id="822:39543"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Matching stores horizontal strip */}
          {view === "products" && stores.length > 0 && !storeId && query && (
            <section className={styles.matchingStores} aria-labelledby="matching-stores-heading">
              <div className={styles.sectionHeading}>
                <div>
                  <h2 id="matching-stores-heading">Matching stores</h2>
                  <p>A few nearby places to start exploring</p>
                </div>
                <button type="button" onClick={() => chooseView("stores")}>
                  View all stores <span aria-hidden>↗</span>
                </button>
              </div>
              <div className={styles.storeStrip}>
                {stores.slice(0, 3).map(store => (
                  <StoreCard store={store} key={store.id} onSelect={selectStore} />
                ))}
              </div>
            </section>
          )}

          {/* Results grid or Empty state */}
          <section aria-label={`${view === "products" ? "Products" : "Stores"} results`}>
            {items.length ? (
              <>
                <div
                  className={view === "products" ? styles.productGrid : styles.storeGrid}
                  data-node-id={view === "products" ? "811:34813" : "811:36363"}
                >
                  {view === "products"
                    ? products
                        .slice(0, displayed)
                        .map(product => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onSelect={selectProduct}
                          />
                        ))
                    : stores
                        .slice(0, displayed)
                        .map(store => (
                          <StoreCard
                            key={store.id}
                            store={store}
                            onSelect={selectStore}
                          />
                        ))}
                </div>

                {/* Load More Button matching Figma 836:28812 */}
                {displayed < items.length && (
                  <div className={styles.loadMoreContainer} data-node-id="836:28812">
                    <button
                      type="button"
                      className={styles.loadMoreButton}
                      onClick={() => update({ page: String(page + 1) })}
                    >
                      <span>{view === "products" ? "Load More Products" : "Load More Stores"}</span>
                      <Image
                        src="/figma/results/sort-chevron-down.svg"
                        width={16}
                        height={16}
                        alt=""
                        unoptimized
                      />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State Card matching Figma 822:39564 & 836:32569 */
              <div
                className={styles.emptyStateCard}
                data-node-id={query ? "822:39564" : "836:32569"}
              >
                <div className={styles.emptyIllustration}>
                  <Image
                    src="/figma/results/empty-state-illustration.png"
                    width={180}
                    height={180}
                    alt=""
                    unoptimized
                  />
                </div>
                <div className={styles.emptyText}>
                  <h2 className={styles.emptyHeading}>No results found</h2>
                  <p className={styles.emptySubheading}>
                    We couldn’t find any products or stores that match what you’re looking for.
                  </p>
                </div>
                {activeCount > 0 ? (
                  <button type="button" className={styles.clearFiltersButton} onClick={clearFilters}>
                    Clear all filters
                  </button>
                ) : (
                  <Link className={styles.exploreButton} href="/search">
                    Explore all products
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <dialog
        ref={mobileFilters}
        className={styles.filterDialog}
        aria-label="Filter search results"
        onClose={() => setFiltersOpen(false)}
      >
        <div className={styles.mobileDialogHeading}>
          <strong>Refine your search</strong>
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => mobileFilters.current?.close()}
          >
            ×
          </button>
        </div>
        {activeCount > 0 && (
          <button type="button" className={styles.mobileReset} onClick={clearFilters}>
            Reset all filters
          </button>
        )}
        {filtersOpen && renderFilters()}
        <button
          type="button"
          className={styles.showResults}
          onClick={() => mobileFilters.current?.close()}
        >
          Show {items.length} {view}
        </button>
      </dialog>

      {/* Product Detail Dialog */}
      <dialog
        ref={productDialog}
        className={styles.productDialog}
        aria-labelledby="product-detail-title"
      >
        <button
          type="button"
          className={styles.closeDetail}
          aria-label="Close product details"
          onClick={() => productDialog.current?.close()}
        >
          ×
        </button>
        {selected && (
          <>
            <Image src={selected.image} width={224} height={224} alt={selected.name} />
            <h2 id="product-detail-title">{selected.name}</h2>
            <p>{selected.askForPrice ? "Ask the seller for a price" : money(selected.price)}</p>
            <p>
              {selected.storeName} · {selected.location} · {selected.distance}
            </p>
            <p>{selected.inStock ? "In stock" : "Out of stock"}</p>
            {selected.askForPrice && (
              <>
                <button
                  type="button"
                  className={styles.showResults}
                  onClick={saveRequest}
                  disabled={requestSaved}
                >
                  {requestSaved ? "Request saved on this device" : "Save a price request"}
                </button>
                <small>Price requests are saved locally. Seller messaging isn’t connected yet.</small>
                {requestError && <p role="alert">{requestError}</p>}
              </>
            )}
            <button
              type="button"
              className={styles.viewStore}
              onClick={() => {
                productDialog.current?.close();
                selectStore(ALL_STORES.find(store => store.id === selected.storeId)!);
              }}
            >
              View products from this store
            </button>
            <small>Demo catalog. Selections and saved items last for this visit; checkout isn’t connected.</small>
          </>
        )}
      </dialog>
    </main>
  );
}
