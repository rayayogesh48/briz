"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { MapPin, ChevronRight, CheckCircle2 } from "lucide-react";
import {
  FEATURED_PRODUCTS,
  DEFAULT_PRODUCT_FILTERS,
  filterAndSortFeaturedProducts,
  type ProductFilters as ProductFiltersType,
  type ProductSortOption,
} from "@/data/featured-data";
import { FeaturedBanner } from "./featured-banner";
import { ProductFilters } from "./featured-filters";
import { FeaturedFilterChips } from "./featured-filter-chips";
import { FeaturedToolbar } from "./featured-toolbar";
import { ProductCard } from "@/components/catalog-cards";
import { FeaturedProductSkeleton } from "./featured-skeletons";
import { FeaturedStateBar, type FeaturedPageStateMode } from "./featured-state-bar";
import { SystemState } from "@/components/system-state/system-state";
import { money } from "@/components/search-results-model";
import { safeJsonParse } from "@/lib/safe-json";
import type { Product } from "@/components/search-data";
import styles from "./featured-listing.module.css";
import searchStyles from "@/components/search-results.module.css";

const TOTAL_CATALOG_COUNT = 128;
const INITIAL_PAGE_SIZE = 12;

export function FeaturedProductsView() {
  const searchParams = useSearchParams();
  const urlStateParam = searchParams.get("state") as FeaturedPageStateMode | null;

  // Active simulated state mode
  const [internalStateMode, setInternalStateMode] = useState<FeaturedPageStateMode>(
    urlStateParam || "default"
  );
  const stateMode = urlStateParam || internalStateMode;

  // Real interactive filter state
  const [filters, setFilters] = useState<ProductFiltersType>(DEFAULT_PRODUCT_FILTERS);
  const [sortOption, setSortOption] = useState<ProductSortOption>("recommended");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [pageSize, setPageSize] = useState<number>(INITIAL_PAGE_SIZE);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("Kathmandu");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Product detail modal state (matching Search Results)
  const productDialog = useRef<HTMLDialogElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [requestSaved, setRequestSaved] = useState(false);
  const [requestError, setRequestError] = useState("");

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setRequestSaved(false);
    setRequestError("");
    productDialog.current?.showModal();
  };

  const saveRequest = () => {
    if (!selectedProduct) return;
    try {
      const old = safeJsonParse<Record<string, unknown>[]>(localStorage.getItem("briz-product-requests"), []);
      localStorage.setItem(
        "briz-product-requests",
        JSON.stringify([
          ...(Array.isArray(old) ? old : []),
          { name: selectedProduct.name, storeId: selectedProduct.storeId, createdAt: new Date().toISOString() },
        ])
      );
      setRequestSaved(true);
    } catch {
      setRequestError("Couldn’t save your request on this device. Please try again.");
    }
  };

  // When switching state via state bar
  const handleSelectMode = (mode: FeaturedPageStateMode) => {
    setInternalStateMode(mode);
    if (mode === "filters-applied") {
      setFilters({
        ...DEFAULT_PRODUCT_FILTERS,
        category: "Electronics",
        maxDistanceKm: 3,
        offers: { ...DEFAULT_PRODUCT_FILTERS.offers, discountOnly: true },
      });
    } else if (mode === "default") {
      setFilters(DEFAULT_PRODUCT_FILTERS);
      setPageSize(INITIAL_PAGE_SIZE);
      setSelectedLocation("Kathmandu");
    } else if (mode === "mobile-filters-open") {
      setIsMobileFiltersOpen(true);
    } else if (mode === "final-page") {
      setPageSize(TOTAL_CATALOG_COUNT);
    }
  };

  const clearAllFilters = () => {
    setFilters(DEFAULT_PRODUCT_FILTERS);
    if (stateMode === "no-results" || stateMode === "filters-applied") {
      setInternalStateMode("default");
    }
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return filterAndSortFeaturedProducts(FEATURED_PRODUCTS, filters, sortOption);
  }, [filters, sortOption]);

  // Derived effective products for display
  const displayedProducts = useMemo(() => {
    if (stateMode === "final-page") {
      // Simulate viewing full catalog
      return filteredProducts;
    }
    return filteredProducts.slice(0, pageSize);
  }, [filteredProducts, pageSize, stateMode]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category && filters.category !== "all") count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.maxDistanceKm !== undefined && filters.maxDistanceKm < Infinity) count++;
    if (filters.availability.inStockOnly) count++;
    if (filters.availability.pickupAvailable) count++;
    if (filters.availability.onlineDeliveryAvailable) count++;
    if (filters.offers.discountOnly) count++;
    if (filters.offers.specialOffersOnly) count++;
    if (filters.minRating !== undefined && filters.minRating > 0) count++;
    return count;
  }, [filters]);

  const isFilterActive = activeFiltersCount > 0;
  const isAllLoaded = stateMode === "final-page" || displayedProducts.length >= filteredProducts.length;

  // Determine display count for toolbar
  const toolbarCount =
    stateMode === "no-results" || (stateMode === "default" && filteredProducts.length === 0)
      ? 0
      : stateMode === "default" && !isFilterActive
      ? TOTAL_CATALOG_COUNT
      : filteredProducts.length;

  return (
    <div className={styles.page}>
      {/* Breadcrumb: Home / Featured Products */}
      <nav className={styles.breadcrumbSection} aria-label="Breadcrumb">
        <ol className={styles.breadcrumb}>
          <li className={styles.breadcrumbItem}>
            <Link href="/" className={styles.breadcrumbLink}>
              Home
            </Link>
          </li>
          <li className={styles.breadcrumbSeparator} aria-hidden="true">
            /
          </li>
          <li className={styles.breadcrumbItem}>
            <span className={styles.breadcrumbActive} aria-current="page">
              Featured Products
            </span>
          </li>
        </ol>
      </nav>

      {/* Interactive State Bar for Developer & Reviewer testing */}
      <FeaturedStateBar
        type="products"
        currentMode={stateMode}
        onSelectMode={handleSelectMode}
      />

      {/* Promotional Banner */}
      <FeaturedBanner
        type="products"
        eyebrow="FEATURED PRODUCTS"
        heading="Popular picks from stores near you"
        description="Explore products selected for their popularity, value, and availability from local stores."
        supportingLabel="Updated regularly"
      />

      {/* Main Container: Sidebar + Content */}
      <div className={styles.container}>
        {/* Desktop Sticky Filters Sidebar */}
        <ProductFilters
          filters={filters}
          onChange={(newFilters) => {
            setFilters(newFilters);
            if (stateMode !== "default" && stateMode !== "filters-applied") {
              setInternalStateMode("default");
            }
          }}
          onClearAll={clearAllFilters}
          totalResultsCount={filteredProducts.length}
        />

        {/* Mobile Filter Bottom Sheet Modal */}
        <ProductFilters
          isMobile
          isOpen={isMobileFiltersOpen || stateMode === "mobile-filters-open"}
          onClose={() => {
            setIsMobileFiltersOpen(false);
            if (stateMode === "mobile-filters-open") {
              setInternalStateMode("default");
            }
          }}
          filters={filters}
          onChange={(newFilters) => {
            setFilters(newFilters);
          }}
          onClearAll={clearAllFilters}
          totalResultsCount={filteredProducts.length}
        />

        {/* Main Content Area */}
        <main className={styles.mainContent}>
          {/* Active Filter Chips */}
          <FeaturedFilterChips
            type="products"
            filters={filters}
            onChange={setFilters}
            onClearAll={clearAllFilters}
          />

          {/* Product Toolbar */}
          <FeaturedToolbar
            type="products"
            itemCount={toolbarCount}
            totalCatalogCount={TOTAL_CATALOG_COUNT}
            locationName={selectedLocation}
            sort={sortOption}
            onSortChange={setSortOption}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
            activeFiltersCount={activeFiltersCount}
            isSortOpenControlled={stateMode === "sorting-open" ? true : undefined}
          />

          {/* STATE 8: Location Unavailable / Not Selected */}
          {stateMode === "no-location" ? (
            <div style={{ marginTop: "24px", marginBottom: "40px" }}>
              <SystemState
                variant="info"
                iconName="MapPin"
                eyebrow="Location Required"
                title="Select your location"
                description="Choose your location to see featured products and stores available near you."
                primaryAction={{
                  label: "Select Location",
                  onClick: () => setIsLocationModalOpen(true),
                }}
                secondaryAction={{
                  label: "Use Default (Kathmandu)",
                  onClick: () => {
                    setSelectedLocation("Kathmandu");
                    setInternalStateMode("default");
                  },
                }}
              />
            </div>
          ) : /* STATE 9: Server Error */
          stateMode === "server-error" ? (
            <div style={{ marginTop: "24px", marginBottom: "40px" }}>
              <SystemState
                variant="error"
                iconName="AlertCircle"
                eyebrow="Server Error"
                title="Failed to load featured products"
                description="We encountered an issue fetching the featured catalog from nearby stores. Your cart and saved items remain safe."
                primaryAction={{
                  label: "Try Again",
                  onClick: () => setInternalStateMode("default"),
                }}
                secondaryAction={{
                  label: "Browse All Categories",
                  href: "/categories",
                }}
              />
            </div>
          ) : /* STATE 6: Loading with Skeleton Cards */
          stateMode === "loading" ? (
            <div className={searchStyles.productGrid} aria-label="Loading products">
              <FeaturedProductSkeleton count={8} />
            </div>
          ) : /* STATE 7: Empty state / No matches found */
          stateMode === "no-results" || filteredProducts.length === 0 ? (
            <div style={{ marginTop: "24px", marginBottom: "40px" }}>
              <SystemState
                variant="neutral"
                iconName="Search"
                eyebrow="No Results"
                title="No matches found"
                description="Try changing or clearing some filters to see more results."
                primaryAction={{
                  label: "Clear Filters",
                  onClick: clearAllFilters,
                }}
                secondaryAction={{
                  label: "Browse All",
                  onClick: () => {
                    clearAllFilters();
                    setInternalStateMode("default");
                  },
                }}
              />
            </div>
          ) : (
            /* STATES 1, 2, 3, 4, 5, 10: Product Grid matching Search Results */
            <>
              <section
                className={searchStyles.productGrid}
                aria-label="Featured Products Grid"
              >
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={handleSelectProduct}
                  />
                ))}
              </section>

              {/* Load More Button (matching search results page) or End-of-Catalog state */}
              <div className={styles.loadMoreWrapper}>
                {!isAllLoaded ? (
                  <div className={searchStyles.loadMoreContainer} data-node-id="836:28812">
                    <button
                      type="button"
                      className={searchStyles.loadMoreButton}
                      onClick={() => setPageSize((prev) => prev + 8)}
                    >
                      <span>Load more products</span>
                      <Image
                        src="/figma/results/sort-chevron-down.svg"
                        width={16}
                        height={16}
                        alt=""
                        unoptimized
                      />
                    </button>
                  </div>
                ) : (
                  <div className={styles.endOfListBlock} role="status">
                    <span className={styles.endOfListBadge}>
                      <CheckCircle2 size={13} color="#10b981" />
                      <span>All caught up</span>
                    </span>
                    <p className={styles.endOfListText}>
                      You&apos;ve viewed all {toolbarCount} featured products
                    </p>
                    <p className={styles.endOfListSubtext}>
                      New selections from local merchants in {selectedLocation} are added daily.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Product Detail Dialog (matching Search Results Page) */}
      <dialog
        ref={productDialog}
        className={searchStyles.productDialog}
        aria-labelledby="featured-product-detail-title"
      >
        <button
          type="button"
          className={searchStyles.closeDetail}
          aria-label="Close product details"
          onClick={() => productDialog.current?.close()}
        >
          ×
        </button>
        {selectedProduct && (
          <>
            <Image
              src={selectedProduct.image}
              width={224}
              height={224}
              alt={selectedProduct.name}
            />
            <h2 id="featured-product-detail-title">{selectedProduct.name}</h2>
            <p>{selectedProduct.askForPrice ? "Ask the seller for a price" : money(selectedProduct.price)}</p>
            <p>
              {selectedProduct.storeName} · {selectedProduct.location} · {selectedProduct.distance}
            </p>
            <p>{selectedProduct.inStock ? "In stock" : "Out of stock"}</p>
            {selectedProduct.askForPrice && (
              <>
                <button
                  type="button"
                  className={searchStyles.showResults}
                  onClick={saveRequest}
                  disabled={requestSaved}
                >
                  {requestSaved ? "Request saved on this device" : "Save a price request"}
                </button>
                <small>Price requests are saved locally. Seller messaging isn’t connected yet.</small>
                {requestError && <p role="alert">{requestError}</p>}
              </>
            )}
            <Link
              href={`/store/${selectedProduct.storeId}`}
              className={searchStyles.viewStore}
              onClick={() => productDialog.current?.close()}
            >
              View products from this store
            </Link>
            <small>Demo catalog. Selections and saved items last for this visit; checkout isn’t connected.</small>
          </>
        )}
      </dialog>

      {/* Location Selector Modal */}
      {isLocationModalOpen && (
        <div
          className={styles.locationModalBackdrop}
          onClick={() => setIsLocationModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="location-modal-title"
        >
          <div className={styles.locationModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.locationModalHeader}>
              <h2 id="location-modal-title" className={styles.locationModalTitle}>
                <MapPin size={18} color="#3e63dd" />
                <span>Select Your Location</span>
              </h2>
              <button
                type="button"
                className={styles.locationModalClose}
                onClick={() => setIsLocationModalOpen(false)}
                aria-label="Close location picker"
              >
                ✕
              </button>
            </div>
            <div className={styles.locationModalBody}>
              {[
                "Kathmandu",
                "Lalitpur",
                "Bhaktapur",
                "Baluwatar",
                "New Road",
                "Thamel",
              ].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  className={styles.locationOptionBtn}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setIsLocationModalOpen(false);
                    setInternalStateMode("default");
                  }}
                >
                  <span>{loc}</span>
                  <ChevronRight size={16} color="#64748b" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
