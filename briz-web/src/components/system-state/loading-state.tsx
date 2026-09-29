"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { SystemState } from "./system-state";
import styles from "./loading-state.module.css";

export interface SlowLoadingNoticeProps {
  delayMs?: number;
  onRetry?: () => void;
  title?: string;
  description?: string;
  className?: string;
}

export function SlowLoadingNotice({
  delayMs = 3500,
  onRetry,
  title = "This is taking longer than usual",
  description = "We’re still trying to load your results.",
  className = "",
}: SlowLoadingNoticeProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${styles.slowNoticeContainer} ${className}`}
      role="status"
    >
      <SystemState
        variant="info"
        iconName="Clock"
        eyebrow="Loading"
        title={title}
        description={description}
        compact
        primaryAction={
          onRetry
            ? {
                label: "Try again",
                onClick: onRetry,
                variant: "primary",
              }
            : undefined
        }
      />
    </motion.div>
  );
}

export function ShimmerBar({
  className = "",
  width = "100%",
  height = "16px",
  radius = "6px",
}: {
  className?: string;
  width?: string;
  height?: string;
  radius?: string;
}) {
  return (
    <div
      className={`${styles.shimmerBar} ${className}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className={styles.productSkeleton} aria-hidden="true" data-testid="product-card-skeleton">
      <div className={styles.productImageSkeleton} />
      <div className={styles.productMeta}>
        <ShimmerBar width="45%" height="12px" radius="4px" />
        <ShimmerBar width="85%" height="16px" radius="6px" />
        <ShimmerBar width="60%" height="14px" radius="6px" />
        <div className={styles.skeletonPriceRow}>
          <ShimmerBar width="40%" height="18px" radius="6px" />
          <ShimmerBar width="25%" height="12px" radius="4px" />
        </div>
      </div>
    </div>
  );
}

export function StoreCardSkeleton() {
  return (
    <div className={styles.storeSkeleton} aria-hidden="true" data-testid="store-card-skeleton">
      <div className={styles.storeCoverSkeleton} />
      <div className={styles.storeMeta}>
        <div className={styles.storeLogoSkeleton} />
        <div className={styles.storeInfo}>
          <ShimmerBar width="70%" height="16px" radius="6px" />
          <ShimmerBar width="45%" height="12px" radius="4px" />
          <ShimmerBar width="35%" height="12px" radius="4px" />
        </div>
      </div>
    </div>
  );
}

export function RequestCardSkeleton() {
  return (
    <div className={styles.requestSkeleton} aria-hidden="true" data-testid="request-card-skeleton">
      <div className={styles.requestHeader}>
        <ShimmerBar width="60%" height="18px" radius="6px" />
        <ShimmerBar width="20%" height="14px" radius="10px" />
      </div>
      <ShimmerBar width="90%" height="14px" radius="4px" />
      <div className={styles.requestFooter}>
        <ShimmerBar width="30%" height="12px" radius="4px" />
        <ShimmerBar width="25%" height="12px" radius="4px" />
      </div>
    </div>
  );
}

export function LoadingSpinner({
  size = 20,
  label = "Loading...",
  className = "",
}: {
  size?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`${styles.spinnerWrapper} ${className}`} role="status">
      <div
        className={styles.spinnerCircle}
        style={{ width: size, height: size }}
      />
      <span className={styles.srOnly}>{label}</span>
    </div>
  );
}
