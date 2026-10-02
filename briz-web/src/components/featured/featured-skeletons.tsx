"use client";

import React from "react";
import styles from "./featured-skeletons.module.css";

export function FeaturedProductSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={styles.productSkeletonCard} aria-hidden="true">
          <div className={styles.productSkeletonImage} />
          <div className={styles.productSkeletonBody}>
            <div className={`${styles.shimmer} ${styles.lineSm}`} />
            <div className={`${styles.shimmer} ${styles.lineMd}`} />
            <div className={`${styles.shimmer} ${styles.lineLg}`} />
            <div className={`${styles.shimmer} ${styles.lineSm}`} style={{ width: "50%" }} />
            <div className={`${styles.shimmer} ${styles.lineBtn}`} />
          </div>
        </div>
      ))}
    </>
  );
}

export function FeaturedStoreSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={styles.storeSkeletonCard} aria-hidden="true">
          <div className={styles.storeSkeletonCover} />
          <div className={styles.storeSkeletonBody}>
            <div className={`${styles.shimmer} ${styles.storeSkeletonLogo}`} />
            <div className={`${styles.shimmer} ${styles.lineMd}`} />
            <div className={`${styles.shimmer} ${styles.lineSm}`} />
            <div className={`${styles.shimmer} ${styles.lineSm}`} style={{ width: "70%" }} />
            <div className={styles.thumbsRow}>
              {[...Array(4)].map((_, j) => (
                <div key={j} className={`${styles.shimmer} ${styles.thumbBox}`} />
              ))}
            </div>
            <div className={`${styles.shimmer} ${styles.lineBtn}`} />
          </div>
        </div>
      ))}
    </>
  );
}
