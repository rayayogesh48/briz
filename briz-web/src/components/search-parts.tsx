"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { SUGGESTIONS, type OperatingStatus, type Product, type Store } from "./search-data";
import styles from "./navbar-search.module.css";

export function SearchIcon({ name }: { name: "ai" | "clock" | "close" | "arrow" | "request" }) {
  return <Image src={`/figma/search-${name}.svg`} width={20} height={20} alt="" unoptimized className={styles.icon} />;
}

export function OperatingHours({ status }: { status: OperatingStatus }) {
  return <span className={status === "open" ? styles.open : styles.closed}>{status === "open" ? "OPEN NOW" : status === "closed-today" ? "CLOSED TODAY" : "CLOSED"}</span>;
}

export function ProductRow({ product, onSelect, hovered = false }: { product: Product; onSelect: () => void; hovered?: boolean }) {
  return <button data-search-item className={styles.result} data-hover={hovered || undefined} aria-label={`View ${product.name}`} onClick={onSelect}>
    <Image className={styles.productImage} src={product.image} alt="" width={48} height={48} />
    <span className={styles.resultText}>
      <span className={styles.rowLine}><span className={styles.name}>{product.name}</span><span className={styles.distance}>{product.distance}</span></span>
      <span className={styles.price}>Rs. {product.price.toLocaleString("en-IN")}{product.originalPrice !== undefined && <del>Rs. {product.originalPrice.toLocaleString("en-IN")}</del>}</span>
    </span>
  </button>;
}

export function StoreRow({ store, onSelect, hovered = false }: { store: Store; onSelect: () => void; hovered?: boolean }) {
  return <button data-search-item className={styles.result} data-hover={hovered || undefined} aria-label={`View ${store.name} store`} onClick={onSelect}>
    <span className={styles.resultText}>
      <span className={styles.rowLine}><span className={styles.sellerName}><span className={styles.name}>{store.name}</span>{store.verified && <span className={styles.verified} aria-label="Verified"><SearchIcon name="request" /></span>}</span><span className={styles.distance}>{store.distance}</span></span>
      <span className={styles.rowLine}><span className={styles.category}>{store.category}</span><OperatingHours status={store.status} /></span>
    </span>
  </button>;
}

export function SearchSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className={styles.results}><h3>{title}</h3><div className={styles.resultList}>{children}</div></section>;
}

export function RecentSearches({ recent, onChoose, onClear, onRemove }: {
  recent: { id: string; query: string }[];
  onChoose: (query: string) => void;
  onClear: () => void;
  onRemove: (id: string) => void;
}) {
  return <section className={styles.recentSection}>
    <div className={styles.sectionHeading}><h3>Recent searches</h3>{recent.length > 0 && <button className={styles.clearAll} onClick={onClear}>Clear All</button>}</div>
    {recent.length ? <div className={styles.recentList}>{recent.map(item => <div className={styles.recent} key={item.id}>
      <button data-search-item onClick={() => onChoose(item.query)}><SearchIcon name="clock" />{item.query}</button>
      <button className={styles.remove} aria-label={`Remove "${item.query}"`} onClick={() => onRemove(item.id)}><SearchIcon name="close" /></button>
    </div>)}</div> : <p className={styles.emptyHistory}>No recent searches yet</p>}
  </section>;
}

export function Suggestions({ onChoose }: { onChoose: (query: string) => void }) {
  return <section className={styles.suggestions}>
    <h3>✨ Suggestions for you</h3><p>Explore products you might need.</p>
    <div className={styles.chips}>{SUGGESTIONS.map(label => <button data-search-item key={label} onClick={() => onChoose(label)}><SearchIcon name="ai" />{label}</button>)}</div>
  </section>;
}

export function RequestBanner({ query, onRequest }: { query: string; onRequest: () => void }) {
  return <section className={styles.requestSection}><div className={styles.banner}>
    <div className={styles.bannerContent}>
      <div><h3>Can’t find what you need?</h3><p>Request “{query}” and nearby sellers can send offers.</p></div>
      <button className={styles.textButton} onClick={onRequest}>Request this product</button>
    </div>
  </div></section>;
}

export function ResultsFooter({ query, all = false, onSelect }: { query: string; all?: boolean; onSelect: () => void }) {
  return <footer className={styles.footer}><button className={styles.textButton} onClick={onSelect}><span>{all ? `Showing all results for “${query}”` : `View all results for “${query}”`}</span><SearchIcon name="arrow" /></button></footer>;
}

// Figma motion: 2000ms shared loop; exact opacity keyframes and easing from
// 753:50423 / 743:40328. The parent starts all skeleton tracks together.
const curve = [0.4, 0, 0.6, 1] as const;
const tracks: Variants[] = [
  { rest: { opacity: 1 }, pulse: { opacity: [1, .35, 1, 1], transition: { opacity: { duration: 2, times: [0, .24, .48, 1], ease: [curve, curve, "linear"], repeat: Infinity } } } },
  { rest: { opacity: 1 }, pulse: { opacity: [1, 1, .35, 1, 1], transition: { opacity: { duration: 2, times: [0, .04, .28, .52, 1], ease: ["linear", curve, curve, "linear"], repeat: Infinity } } } },
  { rest: { opacity: 1 }, pulse: { opacity: [1, 1, .35, 1, 1], transition: { opacity: { duration: 2, times: [0, .08, .32, .56, 1], ease: ["linear", curve, curve, "linear"], repeat: Infinity } } } },
  { rest: { opacity: 1 }, pulse: { opacity: [1, 1, .35, 1, 1], transition: { opacity: { duration: 2, times: [0, .12, .36, .6, 1], ease: ["linear", curve, curve, "linear"], repeat: Infinity } } } },
];
function SkeletonBar({ shape, phase }: { shape: string; phase: number }) {
  return <motion.span className={`${styles.skeletonBar} ${styles[shape]}`} variants={tracks[phase]} data-phase={phase} />;
}
export function SkeletonGroup({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  return <motion.div initial="rest" animate={reducedMotion ? "rest" : "pulse"} className={styles.skeletonGroup}>{children}</motion.div>;
}
export function SkeletonRow({ kind }: { kind: "product" | "store" }) {
  const product = kind === "product";
  return <div className={styles.skeletonRow} aria-hidden>
    {product && <SkeletonBar shape="skeletonImage" phase={0} />}
    <div className={styles.skeletonText}><SkeletonBar shape={product ? "skeletonName" : "skeletonStoreName"} phase={product ? 1 : 0} /><SkeletonBar shape={product ? "skeletonPrice" : "skeletonCategory"} phase={product ? 2 : 1} /></div>
    <div className={styles.skeletonMeta}><SkeletonBar shape="skeletonDistance" phase={product ? 3 : 2} />{product ? <span className={styles.skeletonSpacer} /> : <SkeletonBar shape="skeletonBadge" phase={3} />}</div>
  </div>;
}
export function SkeletonResults() {
  return <SkeletonGroup><span className={styles.status} role="status">Searching…</span>
    <SearchSection title="Products"><SkeletonRow kind="product" /><SkeletonRow kind="product" /></SearchSection>
    <div className={styles.divider} />
    <SearchSection title="Stores"><SkeletonRow kind="store" /><SkeletonRow kind="store" /></SearchSection>
  </SkeletonGroup>;
}
