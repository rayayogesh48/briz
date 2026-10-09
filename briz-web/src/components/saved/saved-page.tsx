"use client";

// Saved page prototype. Local state and mock data only: nothing is fetched,
// synced or persisted, and a refresh restores the mock lists.

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronUp, CircleAlert, Heart, Store } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { FeaturedProductCard } from "@/components/featured/featured-product-card";
import { FeaturedProductSkeleton, FeaturedStoreSkeleton } from "@/components/featured/featured-skeletons";
import { FeaturedStoreCard } from "@/components/featured/featured-store-card";
import { openBrizRequest } from "@/components/request-product-widget";
import { FEATURED_PRODUCTS, FEATURED_STORES, type FeaturedProduct, type FeaturedStore } from "@/data/featured-data";
import grid from "@/components/featured/featured-listing.module.css";
import previewStyles from "@/components/navbar-preview-control.module.css";
import styles from "./saved-page.module.css";

type SavedTab = "products" | "stores";
type ListStatus = "ready" | "loading" | "error";

// Most recently saved first. Borrowed from the existing demo catalogue.
const MOCK_SAVED_PRODUCTS = FEATURED_PRODUCTS.slice(0, 8);
const MOCK_SAVED_STORES = FEATURED_STORES.slice(0, 4);

const TABS: { id: SavedTab; label: string }[] = [
  { id: "products", label: "Products" },
  { id: "stores", label: "Stores" },
];

const SHOW_PREVIEW = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SAVED_PREVIEW === "1";

type Preset = {
  label: string;
  tab: SavedTab;
  products?: FeaturedProduct[];
  stores?: FeaturedStore[];
  status?: ListStatus;
  unavailable?: string[];
};

const PRESETS: Preset[][] = [
  [
    { label: "Products — populated", tab: "products" },
    { label: "Products — empty", tab: "products", products: [] },
    { label: "Products — loading", tab: "products", status: "loading" },
    { label: "Products — error", tab: "products", status: "error" },
    { label: "Products — unavailable item", tab: "products", unavailable: [MOCK_SAVED_PRODUCTS[1].id] },
  ],
  [
    { label: "Stores — populated", tab: "stores" },
    { label: "Stores — empty", tab: "stores", stores: [] },
    { label: "Stores — loading", tab: "stores", status: "loading" },
    { label: "Stores — error", tab: "stores", status: "error" },
    { label: "Stores — unavailable store", tab: "stores", unavailable: [MOCK_SAVED_STORES[1].id] },
  ],
  [
    { label: "Mixed — products saved, stores empty", tab: "products", stores: [] },
    { label: "Mixed — stores saved, products empty", tab: "stores", products: [] },
  ],
];

function EmptyState({ icon, title, description, href, cta }: { icon: ReactNode; title: string; description: string; href: string; cta: string }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>{icon}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link href={href} className={styles.primaryButton}>
        {cta}
      </Link>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.empty} role="alert">
      <span className={styles.emptyIcon} data-tone="error">
        <CircleAlert size={22} aria-hidden="true" />
      </span>
      <h2>Couldn&rsquo;t load your saved items</h2>
      <p>Try again in a moment.</p>
      <button type="button" className={styles.primaryButton} onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

/** A saved product the seller has since removed: kept visible, clearly inactive. */
function UnavailableProduct({ product, onRemove }: { product: FeaturedProduct; onRemove: () => void }) {
  return (
    <article className={styles.unavailable}>
      <div className={styles.unavailableImage}>
        <Image src={product.image} alt="" width={240} height={240} />
        <span className={styles.unavailableBadge}>Unavailable</span>
      </div>
      <div className={styles.unavailableBody}>
        <h3>{product.name}</h3>
        <p>This product is no longer available from {product.storeName}.</p>
        <div className={styles.unavailableActions}>
          <button type="button" className={styles.secondaryButton} onClick={() => openBrizRequest({ itemName: product.name })}>
            Request this product
          </button>
          <button type="button" className={styles.textButton} onClick={onRemove} aria-label={`Remove product from saved: ${product.name}`}>
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

function UnavailableStore({ store, onRemove }: { store: FeaturedStore; onRemove: () => void }) {
  return (
    <article className={`${styles.unavailable} ${styles.unavailableStore}`}>
      <span className={styles.unavailableStoreIcon}>
        <Store size={22} aria-hidden="true" />
      </span>
      <div className={styles.unavailableBody}>
        <h3>{store.name}</h3>
        <p>This store is no longer available.</p>
        <div className={styles.unavailableActions}>
          <button type="button" className={styles.secondaryButton} onClick={onRemove} aria-label={`Remove store from saved: ${store.name}`}>
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

function PreviewControl({ onPick }: { onPick: (preset: Preset) => void }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(PRESETS[0][0].label);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    // Stacked above the other dev pills in the corner, outside the page's own UI.
    <div className={`${previewStyles.root} ${styles.previewOffset}`} ref={root}>
      {open && (
        <div className={`${previewStyles.menu} ${styles.previewMenu}`} role="menu" aria-label="Saved page preview states">
          {PRESETS.map((group, index) => (
            <div key={index} className={styles.previewGroup} role="group">
              {group.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  role="menuitemradio"
                  aria-checked={preset.label === current}
                  className={previewStyles.item}
                  onClick={() => {
                    onPick(preset);
                    setCurrent(preset.label);
                    setOpen(false);
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      <button type="button" className={previewStyles.trigger} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        Preview saved <ChevronUp size={15} data-open={open} aria-hidden="true" />
      </button>
    </div>
  );
}

export function SavedPage() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // The tab lives in the URL (/saved?tab=stores) so it survives refresh, back and forward.
  const activeTab: SavedTab = searchParams.get("tab") === "stores" ? "stores" : "products";

  const [savedProducts, setSavedProducts] = useState(MOCK_SAVED_PRODUCTS);
  const [savedStores, setSavedStores] = useState(MOCK_SAVED_STORES);
  const [status, setStatus] = useState<ListStatus>("ready");
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [toast, setToast] = useState(0);
  const tabRefs = useRef<Record<SavedTab, HTMLButtonElement | null>>({ products: null, stores: null });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(0), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  function selectTab(tab: SavedTab) {
    if (tab === activeTab) return;
    setStatus("ready");
    router.push(tab === "products" ? pathname : `${pathname}?tab=${tab}`, { scroll: false });
  }

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    const index = TABS.findIndex((tab) => tab.id === activeTab);
    const next =
      event.key === "ArrowRight" ? TABS[(index + 1) % TABS.length]
      : event.key === "ArrowLeft" ? TABS[(index - 1 + TABS.length) % TABS.length]
      : event.key === "Home" ? TABS[0]
      : event.key === "End" ? TABS[TABS.length - 1]
      : null;
    if (!next) return;
    event.preventDefault();
    selectTab(next.id);
    tabRefs.current[next.id]?.focus();
  }

  const removeProduct = (id: string) => {
    setSavedProducts((items) => items.filter((item) => item.id !== id));
    setToast((count) => count + 1);
  };
  const removeStore = (id: string) => {
    setSavedStores((items) => items.filter((item) => item.id !== id));
    setToast((count) => count + 1);
  };

  function applyPreset(preset: Preset) {
    setSavedProducts(preset.products ?? MOCK_SAVED_PRODUCTS);
    setSavedStores(preset.stores ?? MOCK_SAVED_STORES);
    setStatus(preset.status ?? "ready");
    setUnavailable(preset.unavailable ?? []);
    if (preset.tab !== activeTab) router.push(preset.tab === "products" ? pathname : `${pathname}?tab=${preset.tab}`, { scroll: false });
  }

  const counts: Record<SavedTab, number> = { products: savedProducts.length, stores: savedStores.length };
  const cardMotion = {
    layout: !reduce,
    initial: false as const,
    exit: reduce ? undefined : { opacity: 0, scale: 0.98 },
    transition: { duration: 0.18, ease: [0.2, 0, 0, 1] as const },
  };

  let content: ReactNode;
  if (status === "error") {
    content = <ErrorState onRetry={() => setStatus("ready")} />;
  } else if (activeTab === "products") {
    content =
      status === "loading" ? (
        <div className={grid.productGrid} aria-busy="true" aria-label="Loading saved products">
          <FeaturedProductSkeleton count={8} />
        </div>
      ) : savedProducts.length === 0 ? (
        <EmptyState
          icon={<Heart size={22} aria-hidden="true" />}
          title="No saved products yet"
          description="Save products you like and they’ll appear here."
          href="/featured-products"
          cta="Browse products"
        />
      ) : (
        <div className={grid.productGrid}>
          <AnimatePresence mode="popLayout">
            {savedProducts.map((product) => (
              <motion.div key={product.id} className={styles.cell} {...cardMotion}>
                {unavailable.includes(product.id) ? (
                  <UnavailableProduct product={product} onRemove={() => removeProduct(product.id)} />
                ) : (
                  <FeaturedProductCard product={product} onRemoveSaved={() => removeProduct(product.id)} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      );
  } else {
    content =
      status === "loading" ? (
        <div className={grid.storeGrid} aria-busy="true" aria-label="Loading saved stores">
          <FeaturedStoreSkeleton count={6} />
        </div>
      ) : savedStores.length === 0 ? (
        <EmptyState
          icon={<Store size={22} aria-hidden="true" />}
          title="No saved stores yet"
          description="Save stores you want to visit again and they’ll appear here."
          href="/featured-stores"
          cta="Browse stores"
        />
      ) : (
        <div className={grid.storeGrid}>
          <AnimatePresence mode="popLayout">
            {savedStores.map((store) => (
              <motion.div key={store.id} className={styles.cell} {...cardMotion}>
                {unavailable.includes(store.id) ? (
                  <UnavailableStore store={store} onRemove={() => removeStore(store.id)} />
                ) : (
                  <FeaturedStoreCard store={store} onRemoveSaved={() => removeStore(store.id)} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Saved</h1>
        <p>Products and stores you&rsquo;ve saved for later.</p>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Saved items">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            ref={(node) => {
              tabRefs.current[tab.id] = node;
            }}
            type="button"
            role="tab"
            id={`saved-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls="saved-panel"
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={styles.tab}
            onClick={() => selectTab(tab.id)}
            onKeyDown={handleTabKey}
          >
            {tab.label}
            <span className={styles.count}>{counts[tab.id]}</span>
          </button>
        ))}
      </div>

      <motion.div
        key={`${activeTab}-${status}`}
        id="saved-panel"
        role="tabpanel"
        aria-labelledby={`saved-tab-${activeTab}`}
        className={styles.panel}
        initial={reduce ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
      >
        {content}
      </motion.div>

      <div className={styles.toastRegion} aria-live="polite">
        {toast > 0 && (
          <span key={toast} className={styles.toast}>
            Removed from saved
          </span>
        )}
      </div>

      {SHOW_PREVIEW && <PreviewControl onPick={applyPreset} />}
    </main>
  );
}
