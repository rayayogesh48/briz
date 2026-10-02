"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { MapPin, ChevronRight, CheckCircle2 } from "lucide-react";
import {
  FEATURED_STORES,
  DEFAULT_STORE_FILTERS,
  filterAndSortFeaturedStores,
  type StoreFilters as StoreFiltersType,
  type StoreSortOption,
} from "@/data/featured-data";
import { FeaturedBanner } from "./featured-banner";
import { StoreFilters } from "./featured-filters";
import { FeaturedFilterChips } from "./featured-filter-chips";
import { FeaturedToolbar } from "./featured-toolbar";
import { StoreCard } from "@/components/catalog-cards";
import { FeaturedStoreSkeleton } from "./featured-skeletons";
import { FeaturedStateBar, type FeaturedPageStateMode } from "./featured-state-bar";
import { SystemState } from "@/components/system-state/system-state";
import styles from "./featured-listing.module.css";
import searchStyles from "@/components/search-results.module.css";

const TOTAL_CATALOG_COUNT = 48;
const INITIAL_PAGE_SIZE = 9;

export function FeaturedStoresView() {
  const searchParams = useSearchParams();
  const urlStateParam = searchParams.get("state") as FeaturedPageStateMode | null;

  // Active simulated state mode
  const [internalStateMode, setInternalStateMode] = useState<FeaturedPageStateMode>(
    urlStateParam || "default"
  );
  const stateMode = urlStateParam || internalStateMode;

  // Real interactive filter state
  const [filters, setFilters] = useState<StoreFiltersType>(DEFAULT_STORE_FILTERS);
  const [sortOption, setSortOption] = useState<StoreSortOption>("recommended");
  const [pageSize, setPageSize] = useState<number>(INITIAL_PAGE_SIZE);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("Kathmandu");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // When switching state via state bar
  const handleSelectMode = (mode: FeaturedPageStateMode) => {
    setInternalStateMode(mode);
    if (mode === "filters-applied") {
      setFilters({
        ...DEFAULT_STORE_FILTERS,
        category: "Grocery & Essentials",
        maxDistanceKm: 3,
        verifiedOnly: true,
      });
    } else if (mode === "default") {
      setFilters(DEFAULT_STORE_FILTERS);
      setPageSize(INITIAL_PAGE_SIZE);
      setSelectedLocation("Kathmandu");
    } else if (mode === "mobile-filters-open") {
      setIsMobileFiltersOpen(true);
    } else if (mode === "final-page") {
      setPageSize(TOTAL_CATALOG_COUNT);
    }
  };

  const clearAllFilters = () => {
    setFilters(DEFAULT_STORE_FILTERS);
    if (stateMode === "no-results" || stateMode === "filters-applied") {
      setInternalStateMode("default");
    }
  };

  // Filter and sort stores
  const filteredStores = useMemo(() => {
    return filterAndSortFeaturedStores(FEATURED_STORES, filters, sortOption);
  }, [filters, sortOption]);

  const displayedStores = useMemo(() => {
    if (stateMode === "final-page") {
      return filteredStores;
    }
    return filteredStores.slice(0, pageSize);
  }, [filteredStores, pageSize, stateMode]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category && filters.category !== "all") count++;
    if (filters.maxDistanceKm !== undefined && filters.maxDistanceKm < Infinity) count++;
    if (filters.availability.openNow) count++;
    if (filters.availability.openToday) count++;
    if (filters.shoppingOptions.pickup) count++;
    if (filters.shoppingOptions.onlineDelivery) count++;
    if (filters.shoppingOptions.both) count++;
    if (filters.verifiedOnly) count++;
    if (filters.minRating !== undefined && filters.minRating > 0) count++;
    return count;
  }, [filters]);

  const isFilterActive = activeFiltersCount > 0;
  const isAllLoaded = stateMode === "final-page" || displayedStores.length >= filteredStores.length;

  const toolbarCount =
    stateMode === "no-results" || (stateMode === "default" && filteredStores.length === 0)
      ? 0
      : stateMode === "default" && !isFilterActive
      ? TOTAL_CATALOG_COUNT
      : filteredStores.length;

  return (
    <div className={styles.page}>
      {/* Breadcrumb: Home / Featured Stores */}
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
              Featured Stores
            </span>
          </li>
        </ol>
      </nav>

      {/* Interactive State Bar for Developer & Reviewer testing */}
      <FeaturedStateBar
        type="stores"
        currentMode={stateMode}
        onSelectMode={handleSelectMode}
      />

      {/* Promotional Banner */}
      <FeaturedBanner
        type="stores"
        eyebrow="FEATURED STORES"
        heading="Discover trusted stores near you"
        description="Shop from selected local stores offering popular products, great service, and convenient shopping options."
        supportingLabel="Verified local merchants"
      />

      {/* Main Container: Sidebar + Content */}
      <div className={styles.container}>
        {/* Desktop Sticky Filters Sidebar */}
        <StoreFilters
          filters={filters}
          onChange={(newFilters) => {
            setFilters(newFilters);
            if (stateMode !== "default" && stateMode !== "filters-applied") {
              setInternalStateMode("default");
            }
          }}
          onClearAll={clearAllFilters}
          totalResultsCount={filteredStores.length}
        />

        {/* Mobile Filter Bottom Sheet Modal */}
        <StoreFilters
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
          totalResultsCount={filteredStores.length}
        />

        {/* Main Content Area */}
        <main className={styles.mainContent}>
          {/* Active Filter Chips */}
          <FeaturedFilterChips
            type="stores"
            filters={filters}
            onChange={setFilters}
            onClearAll={clearAllFilters}
          />

          {/* Store Toolbar */}
          <FeaturedToolbar
            type="stores"
            itemCount={toolbarCount}
            totalCatalogCount={TOTAL_CATALOG_COUNT}
            locationName={selectedLocation}
            sort={sortOption}
            onSortChange={setSortOption}
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
                title="Failed to load featured stores"
                description="We encountered an issue fetching merchant profiles in Kathmandu. Your preferences remain saved."
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
            <div className={searchStyles.storeGrid} aria-label="Loading stores">
              <FeaturedStoreSkeleton count={6} />
            </div>
          ) : /* STATE 7: Empty state / No matches found */
          stateMode === "no-results" || filteredStores.length === 0 ? (
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
            /* STATES 1, 2, 3, 4, 5, 10: Store Grid matching Search Results */
            <>
              <section className={searchStyles.storeGrid} aria-label="Featured Stores Grid">
                {displayedStores.map((store) => (
                  <StoreCard key={store.id} store={store} />
                ))}
              </section>

              {/* Load More Button (matching search results page) or End-of-Catalog state */}
              <div className={styles.loadMoreWrapper}>
                {!isAllLoaded ? (
                  <div className={searchStyles.loadMoreContainer} data-node-id="836:28812">
                    <button
                      type="button"
                      className={searchStyles.loadMoreButton}
                      onClick={() => setPageSize((prev) => prev + 6)}
                    >
                      <span>Load more stores</span>
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
                      You&apos;ve viewed all {toolbarCount} featured stores
                    </p>
                    <p className={styles.endOfListSubtext}>
                      Local merchants across {selectedLocation} are verified regularly.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

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
