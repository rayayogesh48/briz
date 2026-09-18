"use client";

import { motion, useReducedMotion, type Transition } from "motion/react";
import { Asset } from "./catalog-cards";
import styles from "./search-results-loading.module.css";

// Exact Figma 2400ms timelines from 225:15896 and 252:19910.
const tracks = {
  image: { values: [1, 1, .92, 1], times: [0, .2292, .5208, 1] },
  distance: { values: [.16, .3, .11, .16], times: [0, .2958, .5875, 1] },
  productTitle: { values: [1, 1, .92, 1], times: [0, .3042, .5958, 1] },
  productSubtitle: { values: [.8, .92, .72, .8], times: [0, .3417, .6333, 1] },
  price: { values: [.8, .92, .72, .8], times: [0, .3792, .6708, 1] },
  storeTitle: { values: [1, 1, .92, 1], times: [0, .2625, .5542, 1] },
  category: { values: [1, 1, .92, 1], times: [0, .3292, .6208, 1] },
  rating: { values: [1, 1, .92, 1], times: [0, .3625, .6542, 1] },
  logo: { values: [1, 1, .92, 1], times: [0, .3958, .6875, 1] },
};
function Bar({ track, shape }: { track: keyof typeof tracks; shape: string }) {
  const reduced = useReducedMotion();
  const { values, times } = tracks[track];
  const transition: Transition = { opacity: { duration: 2.4, times, ease: values[0] === 1 ? ["linear", "easeInOut", "easeInOut"] : "easeInOut", repeat: Infinity } };
  return <motion.div className={`${styles.bar} ${styles[shape]}`} initial={{ opacity: values[0] }} animate={{ opacity: reduced ? values[0] : values }} transition={transition} />;
}
export function CatalogSkeleton({ kind }: { kind: "product" | "store" }) {
  const reduced = useReducedMotion();
  const store = kind === "store";
  const positions = store ? [-180, 280, 280] : [0, 360, 360];
  return <div aria-hidden className={`${styles.skeleton} ${store ? styles.store : styles.product}`}>
    <Bar track="image" shape={store ? "cover" : "image"} />
    <div className={styles.content}>{store ? <>
      <Bar track="logo" shape="logo" /><Bar track="storeTitle" shape="storeTitle" /><span className={styles.hiddenDistance}><Bar track="distance" shape="distance" /></span><Bar track="category" shape="category" /><div className={styles.ratingRow}><Asset name="store-imgRatingIconPlaceholder" size={11} /><Bar track="rating" shape="rating" /></div>
    </> : <><div className={styles.distancePill}><Asset name="product-imgLocationIconPlaceholder" size={8} /><Bar track="distance" shape="distance" /></div><Bar track="productTitle" shape="title" /><Bar track="productSubtitle" shape="subtitle" /><Bar track="price" shape="price" /></>}</div>
    {!reduced && <motion.div className={styles.shimmerPosition} initial={{ x: positions[0] }} animate={{ x: positions }} transition={{ x: { duration: 2.4, times: [0, .7292, 1], ease: "linear", repeat: Infinity } }}><div className={styles.shimmer} /></motion.div>}
  </div>;
}
export function SearchResultsLoading() {
  return <main className={styles.loading} aria-busy="true"><p role="status">Finding products and stores near you…</p><div className={styles.stores}>{[0, 1, 2].map(id => <CatalogSkeleton key={id} kind="store" />)}</div><div className={styles.products}>{[0, 1, 2, 3].map(id => <CatalogSkeleton key={id} kind="product" />)}</div></main>;
}
