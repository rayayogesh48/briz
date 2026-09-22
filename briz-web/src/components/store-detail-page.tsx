"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useRef, useSyncExternalStore } from "react";
import { ALL_STORES, ALL_PRODUCTS, type Store, type Product, DEFAULT_STORE_SCHEDULE } from "./search-data";
import { ProductCard } from "./catalog-cards";
import { ProductCategoryList } from "./product-category-list";
import { money } from "./search-results-model";
import styles from "./store-detail-page.module.css";

interface StoreDetailPageProps {
  storeId: string;
}

function IconTruck() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconHeart({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#e11d48" : "none"} stroke={filled ? "#e11d48" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconGoogleMaps() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#4285F4" />
      <circle cx="12" cy="9" r="2.5" fill="#ffffff" />
    </svg>
  );
}

function IconEllipsisVertical() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

const EMPTY_FAVOURITES: string[] = [];
let cachedRawFavourites: string | null = null;
let cachedFavouritesList: string[] = EMPTY_FAVOURITES;

function getFavStoreIds(): string[] {
  if (typeof window === "undefined") return EMPTY_FAVOURITES;
  try {
    const raw = localStorage.getItem("briz-favourite-stores");
    if (raw === cachedRawFavourites) {
      return cachedFavouritesList;
    }
    cachedRawFavourites = raw;
    cachedFavouritesList = raw ? JSON.parse(raw) : EMPTY_FAVOURITES;
    return cachedFavouritesList;
  } catch {
    return EMPTY_FAVOURITES;
  }
}

function getServerSnapshot(): string[] {
  return EMPTY_FAVOURITES;
}

function subscribeToStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function StoreDetailPage({ storeId }: StoreDetailPageProps) {
  const store: Store = useMemo(() => {
    return ALL_STORES.find(s => s.id === storeId) || ALL_STORES[0];
  }, [storeId]);

  // All products belonging to this store (supplementing to at least 15 for full 5-column grid rows)
  const storeProducts = useMemo(() => {
    const direct = ALL_PRODUCTS.filter(p => p.storeId === store.id);
    if (direct.length >= 15) return direct;
    const combined = [...direct];
    for (const p of ALL_PRODUCTS) {
      if (combined.length >= 15) break;
      if (!combined.some(c => c.id === p.id)) {
        combined.push({
          ...p,
          storeId: store.id,
          storeName: store.name,
          location: store.location,
          distance: store.distance,
        });
      }
    }
    return combined;
  }, [store]);

  // Subcategories available in this store (matching Figma 893:100955)
  const subcategories = useMemo(() => {
    const list = new Set(storeProducts.map(p => p.subcategory).filter(Boolean) as string[]);
    const dynamicList = Array.from(list);
    if (dynamicList.length >= 3) {
      return ["All Products", ...dynamicList];
    }
    return ["All Products", "Men's Fashion", "Women's Fashion", "Kids Clothes", "Others"];
  }, [storeProducts]);

  // UI state
  const [selectedSubcategory, setSelectedSubcategory] = useState("All Products");
  const [inStoreQuery, setInStoreQuery] = useState("");
  const [sortOption, setSortOption] = useState("relevance");
  const [visibleCount, setVisibleCount] = useState(10);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Modal references
  const messageModalRef = useRef<HTMLDialogElement>(null);
  const mapModalRef = useRef<HTMLDialogElement>(null);
  const productModalRef = useRef<HTMLDialogElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  // External store subscription for favourites
  const favouriteIds = useSyncExternalStore(subscribeToStorage, getFavStoreIds, getServerSnapshot);
  const isFavourited = favouriteIds.includes(store.id);

  function toggleFavourite() {
    try {
      const favs = getFavStoreIds();
      let nextFavs: string[];
      if (favs.includes(store.id)) {
        nextFavs = favs.filter(id => id !== store.id);
        showToast("Removed from favourites");
      } else {
        nextFavs = [...favs, store.id];
        showToast("Added to favourites! ❤️");
      }
      localStorage.setItem("briz-favourite-stores", JSON.stringify(nextFavs));
      window.dispatchEvent(new Event("storage"));
    } catch {
      // ignore
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText.trim()) return;
    try {
      const msgs = JSON.parse(localStorage.getItem("briz-seller-messages") || "[]");
      msgs.push({
        storeId: store.id,
        storeName: store.name,
        text: messageText.trim(),
        date: new Date().toISOString(),
      });
      localStorage.setItem("briz-seller-messages", JSON.stringify(msgs));
      setMessageSent(true);
      setTimeout(() => {
        setMessageSent(false);
        setMessageText("");
        messageModalRef.current?.close();
        showToast("Message sent to seller!");
      }, 1200);
    } catch {
      showToast("Message delivered!");
      messageModalRef.current?.close();
    }
  }

  function handleCopyShareLink() {
    navigator.clipboard?.writeText(window.location.href);
    showToast("Store link copied to clipboard! 📋");
  }

  // Filtered & sorted products
  const displayedProducts = useMemo(() => {
    let list = storeProducts;

    if (selectedSubcategory !== "All Products") {
      list = list.filter(p => p.subcategory === selectedSubcategory);
    }

    if (inStoreQuery.trim()) {
      const q = inStoreQuery.trim().toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q))
      );
    }

    const sorted = [...list];
    if (sortOption === "price-asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-desc") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortOption === "discount") {
      sorted.sort((a, b) => {
        const dA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const dB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return dB - dA;
      });
    } else if (sortOption === "newest") {
      sorted.sort((a, b) => (b.addedAt || "").localeCompare(a.addedAt || ""));
    }

    return sorted;
  }, [storeProducts, selectedSubcategory, inStoreQuery, sortOption]);

  const schedule = store.schedule || DEFAULT_STORE_SCHEDULE;

  return (
    <main className={styles.page} data-node-id="885:95254" data-name="Product Searched result">
      {/* Breadcrumb Navigation matching Figma 885:95256 */}
      <nav className={styles.breadcrumbSection} data-node-id="885:95256" aria-label="Breadcrumb">
        <div className={styles.breadcrumb} data-node-id="885:95257">
          <Link href="/" data-node-id="885:95258">Home</Link>
          <span className={styles.breadcrumbSeparator} data-node-id="885:95259" aria-hidden>›</span>
          <Link href="/categories" data-node-id="885:95260">Stores</Link>
          <span className={styles.breadcrumbSeparator} data-node-id="885:95261" aria-hidden>›</span>
          <span className={styles.breadcrumbActive} data-node-id="885:95262">{store.name}</span>
        </div>
      </nav>

      <div className={styles.container}>
        {/* Profile Section matching Figma 890:98045 */}
        <div className={styles.profileSection} data-node-id="890:98045" data-name="profile Section">
          {/* Cover Image matching Figma 893:99952 */}
          <div className={styles.coverImageWrapper} data-node-id="893:99952" data-name="cover-image">
            <Image
              src={store.cover || "/figma/home/hero-banner.png"}
              alt={`${store.name} cover`}
              width={1200}
              height={340}
              className={styles.coverImage}
              unoptimized
              priority
            />
          </div>

          {/* Bottom Gradient Fade matching Figma 893:99892 */}
          <div className={styles.coverGradient} data-node-id="893:99892" data-name="gradient" />

          {/* Details Container matching Figma 893:99814 */}
          <div className={styles.storeDetailsContainer} data-node-id="893:99814" data-name="Container">
            {/* Profile Picture Frame overlapping the banner matching Figma 893:99851 */}
            <div className={styles.profilePictureFrame} data-node-id="893:99851" data-name="Profile Picture Frame">
              <div className={styles.profilePictureInner} data-node-id="893:99852" data-name="Profile Picture">
                <Image
                  src={store.logo || "/figma/results/store-imgAvatarImage1.png"}
                  alt={`${store.name} logo`}
                  width={72}
                  height={72}
                  className={styles.profileAvatarImage}
                  unoptimized
                />
              </div>
            </div>

            <div className={styles.storeContentBlock} data-node-id="893:99815" data-name="Store Container">
              {/* Header Row: Store Info & Actions matching Figma 893:99819 */}
              <div className={styles.storeHeaderRow} data-node-id="893:99819" data-name="Header">
                <div className={styles.storeInfoTitleBlock} data-node-id="893:99820" data-name="Store Info">
                  <h1 className={styles.storeTitle} data-node-id="893:99821">{store.name}</h1>
                  {store.verified && (
                    <div className={styles.verifiedBadgeWrapper} data-node-id="893:99822" data-name="Verification Icon" title="Verified Store">
                      <Image src="/figma/results/store-imgVerifiedIcon.svg" width={20} height={20} alt="Verified" unoptimized />
                    </div>
                  )}
                  <span className={styles.distanceBadge}>
                    <IconMapPin />
                    <span>{store.distance}</span>
                  </span>
                </div>

                <div className={styles.actionsCluster} data-node-id="893:99823" data-name="Actions">
                  <button
                    type="button"
                    className={styles.messageActionBtn}
                    data-node-id="893:99824"
                    data-name="Message Button"
                    onClick={() => messageModalRef.current?.showModal()}
                    aria-label="Message seller"
                  >
                    <IconChat />
                    <span>Message</span>
                  </button>
                  <button
                    type="button"
                    className={styles.mapActionBtn}
                    data-node-id="893:99825"
                    data-name="Map Button"
                    onClick={() => mapModalRef.current?.showModal()}
                    aria-label="Open store on map"
                  >
                    <IconGoogleMaps />
                    <span>Open Map</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.iconActionBtn} ${isFavourited ? styles.iconActionBtnActive : ""}`}
                    data-node-id="893:99826"
                    data-name="Favorite Button"
                    onClick={toggleFavourite}
                    aria-label={isFavourited ? "Remove from favourites" : "Add to favourites"}
                    aria-pressed={isFavourited}
                    title={isFavourited ? "Remove from favourites" : "Add to favourites"}
                  >
                    <IconHeart filled={isFavourited} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconActionBtn}
                    data-node-id="893:99953"
                    data-name="Options Button"
                    onClick={handleCopyShareLink}
                    aria-label="More options / share store"
                    title="Copy store link"
                  >
                    <IconEllipsisVertical />
                  </button>
                </div>
              </div>

              {/* Category Container matching Figma 893:99827 */}
              <div className={styles.categoryContainer} data-node-id="893:99827" data-name="Category Container">
                <p className={styles.categoryText} data-node-id="893:99828">{store.category}</p>
              </div>

              {/* Info Clusters matching Figma 893:99919 */}
              <div className={styles.infoClusters} data-node-id="893:99919" data-name="Info Clusters">
                <div className={styles.reviewsCluster} data-node-id="893:99920" data-name="Reviews">
                  <IconStar />
                  <span className={styles.reviewScore}>{store.rating ? store.rating.toFixed(1) : "5.0"}</span>
                  <span className={styles.reviewCountText}>({store.reviewCount || 32} Reviews)</span>
                </div>

                <span className={styles.clusterDot} data-node-id="893:99941" aria-hidden />

                <div className={styles.statusCluster} data-node-id="893:99924" data-name="Status Frame">
                  <IconClock />
                  <button
                    type="button"
                    className={styles.statusHoursBtn}
                    onClick={() => setIsHoursOpen(!isHoursOpen)}
                    aria-expanded={isHoursOpen}
                  >
                    <span className={store.status === "open" ? styles.statusOpenText : styles.statusClosedText} data-node-id="893:99926">
                      {store.status === "open" ? "OPEN" : "CLOSED"}
                    </span>
                    <span className={styles.statusInnerDot} data-node-id="893:99927" aria-hidden />
                    <span className={styles.statusTimeText} data-node-id="893:99928">
                      {store.status === "open" ? "Closes at 7 PM" : "Opens at 9 AM"}
                    </span>
                    <span className={styles.statusChevron}>▾</span>
                  </button>

                  {isHoursOpen && (
                    <div className={styles.hoursPopover} role="dialog" aria-label="Weekly Operating Hours">
                      <div className={styles.hoursPopoverHeader}>
                        <strong>Weekly Operating Hours</strong>
                        <span className={store.status === "open" ? styles.popoverOpenBadge : styles.popoverClosedBadge}>
                          {store.status === "open" ? "Open Now" : "Closed Now"}
                        </span>
                      </div>
                      <div className={styles.hoursList}>
                        {schedule.map((item) => (
                          <div key={item.day} className={`${styles.hoursRow} ${item.day === "Monday" ? styles.hoursRowToday : ""}`}>
                            <span>{item.day}</span>
                            <span>{item.hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <span className={styles.clusterDot} data-node-id="893:99942" aria-hidden />

                <div className={styles.locationCluster} data-node-id="893:99921" data-name="Location Frame">
                  <IconMapPin />
                  <span className={styles.locationText} data-node-id="893:99923">{store.address || `${store.location}, Kathmandu, Nepal`}</span>
                </div>

                <span className={styles.clusterDot} aria-hidden />

                <div className={styles.deliveryCluster}>
                  <IconTruck />
                  <span className={styles.deliveryText}>
                    {store.deliveryType === "online"
                      ? "Online Delivery Only"
                      : store.deliveryType === "pickup"
                      ? "In-Store Pickup Only"
                      : "Online Delivery & In-Store Pickup"}
                  </span>
                </div>
              </div>

              {/* Description matching Figma 893:99944 */}
              <div className={styles.descriptionBlock} data-node-id="893:99944" data-name="Description">
                <p className={`${styles.descriptionText} ${!isDescExpanded ? styles.descriptionClamp : ""}`}>
                  {store.description ||
                    `${store.name} is a verified store in ${store.location} providing certified, genuine quality products with reliable local delivery and verified merchant warranties.`}
                </p>
                <button
                  type="button"
                  className={styles.readMoreLink}
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                >
                  {isDescExpanded ? "Read Less" : "Read More"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Catalog Section matching Figma 893:100516 */}
        <section className={styles.catalogContainer} data-node-id="893:100516" data-name="container" aria-label="Browse All Products">
          {/* Section Header & Subcategory Pills matching Figma 893:100519 */}
          <div className={styles.catalogHeadingSection} data-node-id="893:100519" data-name="Search & Sort by:">
            <h2 className={styles.catalogTitle} data-node-id="893:100845">Browse All Products</h2>
            <div data-node-id="893:100955" style={{ width: "100%" }}>
              <ProductCategoryList
                categories={subcategories}
                selected={selectedSubcategory}
                onSelect={setSelectedSubcategory}
                backgroundColor="#f9f9f9"
                ariaLabel="Filter by product category"
              />
            </div>
          </div>

          {/* Search & Sort Toolbar matching Figma 893:100847 */}
          <div className={styles.catalogToolbar} data-node-id="893:100847" data-name="Search & Sort by:">
            <div className={styles.searchInputWrapper} data-node-id="893:100912" data-name="Search State">
              <span className={styles.searchMagnifier} aria-hidden>
                <Image src="/figma/search.svg" width={18} height={18} alt="" unoptimized />
              </span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search products..."
                aria-label={`Search products in ${store.name}`}
                value={inStoreQuery}
                onChange={e => setInStoreQuery(e.target.value)}
              />
              {inStoreQuery && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => setInStoreQuery("")}
                  aria-label="Clear product search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className={styles.sortWrapper} data-node-id="893:100863" data-name="Input">
              <select
                className={styles.sortSelect}
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                aria-label="Sort products"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Highest Discount</option>
                <option value="newest">Newest Arrivals</option>
              </select>
              <span className={styles.sortChevron} aria-hidden>
                <IconChevronDown />
              </span>
            </div>
          </div>

          {/* 5-Column Product Grid matching Figma 893:100536 */}
          {displayedProducts.length > 0 ? (
            <div className={styles.productGrid} data-node-id="893:100536" data-name="product lists">
              {displayedProducts.slice(0, visibleCount).map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(p) => {
                    setSelectedProduct(p);
                    productModalRef.current?.showModal();
                  }}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Image src="/figma/results/empty-box.svg" width={56} height={56} alt="" unoptimized />
              <h3 className={styles.emptyTitle}>No products found in this store</h3>
              <p className={styles.emptySubtitle}>
                Try adjusting your search term or selecting &ldquo;All Products&rdquo;.
              </p>
              <button
                type="button"
                className={styles.resetButton}
                onClick={() => {
                  setSelectedSubcategory("All Products");
                  setInStoreQuery("");
                }}
              >
                Reset in-store filters
              </button>
            </div>
          )}

          {/* Load More Button matching Figma 893:101002 */}
          {displayedProducts.length > visibleCount && (
            <div className={styles.loadMoreWrapper} data-node-id="893:101002" data-name="button">
              <button
                type="button"
                className={styles.loadMoreBtn}
                data-node-id="893:101003"
                data-name="Secondary Type Size"
                onClick={() => setVisibleCount(prev => prev + 10)}
              >
                <span>Load More Products</span>
                <IconChevronDown />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Message Seller Modal */}
      <dialog ref={messageModalRef} className={styles.dialogBackdrop} onClose={() => setMessageSent(false)}>
        <div className={styles.dialogHeader}>
          <h2>Message {store.name}</h2>
          <button type="button" className={styles.dialogCloseBtn} onClick={() => messageModalRef.current?.close()}>×</button>
        </div>
        {messageSent ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#30a46c" }}>
            <p style={{ fontSize: "16px", fontWeight: 600 }}>Message Sent Successfully!</p>
            <p style={{ fontSize: "13px", color: "#646464" }}>The seller will respond to your registered contact.</p>
          </div>
        ) : (
          <form onSubmit={handleSendMessage}>
            <p style={{ fontSize: "13.5px", color: "#646464", margin: "0 0 12px" }}>
              Have questions about products, availability, or bulk rates? Ask directly:
            </p>
            <div className={styles.quickQuestionChips}>
              {["Is delivery available today?", "Can I pick up in person?", "Do you have wholesale pricing?", "Is this item in stock?"].map(q => (
                <button
                  key={q}
                  type="button"
                  className={styles.questionChip}
                  onClick={() => setMessageText(q)}
                >
                  {q}
                </button>
              ))}
            </div>
            <textarea
              className={styles.messageTextarea}
              rows={4}
              placeholder="Type your message to the merchant..."
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              required
            />
            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.mapButton}
                onClick={() => messageModalRef.current?.close()}
              >
                Cancel
              </button>
              <button type="submit" className={styles.messageButton} disabled={!messageText.trim()}>
                Send Message
              </button>
            </div>
          </form>
        )}
      </dialog>

      {/* Open on Map Modal */}
      <dialog ref={mapModalRef} className={styles.dialogBackdrop}>
        <div className={styles.dialogHeader}>
          <h2>Store Location: {store.name}</h2>
          <button type="button" className={styles.dialogCloseBtn} onClick={() => mapModalRef.current?.close()}>×</button>
        </div>
        <div style={{ background: "#e8eff7", borderRadius: "12px", height: "180px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", margin: "12px 0" }}>
          <span style={{ fontSize: "36px" }}>🗺️</span>
          <strong style={{ color: "#202020" }}>{store.address || `${store.location}, Kathmandu`}</strong>
          <span style={{ fontSize: "13px", color: "#3e63dd", fontWeight: 600 }}>Distance: {store.distance} from your location</span>
        </div>
        <div className={styles.dialogActions}>
          <button type="button" className={styles.mapButton} onClick={() => mapModalRef.current?.close()}>
            Close
          </button>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(store.name + " " + (store.address || store.location))}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.messageButton}
            style={{ textDecoration: "none" }}
          >
            Open in Google Maps ↗
          </a>
        </div>
      </dialog>

      {/* Product Detail / Inquiry Dialog */}
      <dialog ref={productModalRef} className={styles.dialogBackdrop} onClose={() => setSelectedProduct(null)}>
        {selectedProduct && (
          <div>
            <div className={styles.dialogHeader}>
              <h2>{selectedProduct.name}</h2>
              <button type="button" className={styles.dialogCloseBtn} onClick={() => productModalRef.current?.close()}>×</button>
            </div>
            <div style={{ display: "flex", gap: "16px", margin: "16px 0", alignItems: "center" }}>
              <Image
                src={selectedProduct.image}
                alt={selectedProduct.name}
                width={120}
                height={120}
                style={{ borderRadius: "12px", border: "1px solid #ebebeb", objectFit: "cover" }}
                unoptimized
              />
              <div>
                <p style={{ margin: "0 0 6px", fontSize: "14px", color: "#646464" }}>
                  Merchant: <strong>{store.name}</strong> ({store.location})
                </p>
                <p style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 700, color: "#202020" }}>
                  {selectedProduct.askForPrice ? "Ask for Price" : money(selectedProduct.price)}
                </p>
                <p style={{ margin: 0, fontSize: "13px", color: selectedProduct.inStock ? "#30a46c" : "#e5484d", fontWeight: 600 }}>
                  {selectedProduct.inStock ? "✓ In Stock" : "✗ Out of Stock"}
                </p>
              </div>
            </div>
            <div className={styles.dialogActions}>
              <button type="button" className={styles.mapButton} onClick={() => productModalRef.current?.close()}>
                Close
              </button>
              <button
                type="button"
                className={styles.messageButton}
                onClick={() => {
                  productModalRef.current?.close();
                  setMessageText(`Hi, I'm interested in "${selectedProduct.name}". Is it available for pickup or delivery?`);
                  messageModalRef.current?.showModal();
                }}
              >
                Inquire about this product
              </button>
            </div>
          </div>
        )}
      </dialog>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <dialog open className={styles.lightbox} onClick={() => setLightboxImage(null)}>
          <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setLightboxImage(null)}
              aria-label="Close photo preview"
            >
              ✕
            </button>
            <Image
              src={lightboxImage}
              alt="Store photo preview"
              width={800}
              height={500}
              className={styles.lightboxImage}
              unoptimized
            />
          </div>
        </dialog>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={styles.toast} role="status">
          {toast}
        </div>
      )}
    </main>
  );
}
