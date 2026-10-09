"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ShieldCheck, MapPin, ShoppingBag, ArrowRight, Sparkles, Clock, Heart } from "lucide-react";
import type { FeaturedStore } from "@/data/featured-data";
import styles from "./featured-store-card.module.css";

interface FeaturedStoreCardProps {
  store: FeaturedStore;
  /** When provided, the card shows a filled heart that removes the store from Saved. */
  onRemoveSaved?: () => void;
}

export function FeaturedStoreCard({ store, onRemoveSaved }: FeaturedStoreCardProps) {
  const [coverError, setCoverError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const isOpen = store.status === "open";
  const coverSrc = coverError
    ? "/products/bottle-main.svg"
    : store.cover;
  const logoSrc = logoError
    ? "/products/bottle-thumb-1.svg"
    : store.logo;

  return (
    <article className={styles.card} data-store-id={store.id}>
      {/* Cover Image & Badges */}
      <div className={styles.coverWrapper}>
        <Image
          src={coverSrc}
          alt={`${store.name} storefront`}
          width={400}
          height={160}
          className={styles.coverImage}
          onError={() => setCoverError(true)}
        />
        <div className={styles.coverOverlay} />

        {/* Top Badges */}
        <div className={styles.coverBadges}>
          {store.featured && (
            <span className={styles.featuredBadge}>
              <Sparkles size={11} aria-hidden="true" />
              Featured
            </span>
          )}
          <span
            className={`${styles.statusBadge} ${isOpen ? styles.statusOpen : styles.statusClosed}`}
          >
            <Clock size={11} aria-hidden="true" />
            {store.statusLabel}
          </span>
        </div>

        {onRemoveSaved && (
          <button
            type="button"
            className={styles.savedButton}
            onClick={onRemoveSaved}
            aria-label={`Remove store from saved: ${store.name}`}
            title="Remove from saved"
          >
            <Heart size={18} fill="currentColor" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Overlapping Store Logo */}
      <div className={styles.logoWrapper}>
        <Image
          src={logoSrc}
          alt=""
          width={54}
          height={54}
          className={styles.logoImage}
          onError={() => setLogoError(true)}
        />
      </div>

      {/* Card Content */}
      <div className={styles.cardBody}>
        {/* Header: Name, Verified, Category, Rating */}
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <Link href={`/store/${store.id}`} className={styles.storeTitleLink}>
              <h3 className={styles.storeTitle}>
                <span>{store.name}</span>
                {store.verified && (
                  <span
                    className={styles.verifiedIcon}
                    title="Verified Store"
                    aria-label="Verified Store"
                  >
                    <ShieldCheck size={16} fill="#3e63dd" color="#ffffff" />
                  </span>
                )}
              </h3>
            </Link>
            <span className={styles.categoryTag}>{store.category}</span>
          </div>

          {/* Rating */}
          <div className={styles.ratingPill} aria-label={`Rating ${store.rating} out of 5`}>
            <Star size={12} fill="#d97706" color="#d97706" />
            <span>{store.rating.toFixed(1)}</span>
            <span className={styles.reviewCount}>({store.reviewCount})</span>
          </div>
        </div>

        {/* Short description */}
        <p className={styles.description}>{store.description}</p>

        {/* Meta: Location & Shopping options */}
        <div className={styles.storeMeta}>
          <div className={styles.locationRow}>
            <MapPin size={13} color="#64748b" aria-hidden="true" />
            <span>
              {store.location} · <strong>{store.distance}</strong>
            </span>
          </div>
          <div className={styles.optionsRow}>
            <ShoppingBag size={13} aria-hidden="true" />
            <span>{store.shoppingOptionLabel}</span>
          </div>
        </div>

        {/* 3–4 Product preview thumbnails */}
        {store.previewImages && store.previewImages.length > 0 && (
          <div className={styles.previewsSection}>
            <div className={styles.previewsLabel}>Popular at this store</div>
            <div className={styles.previewsGrid}>
              {store.previewImages.slice(0, 4).map((img, idx) => (
                <div key={idx} className={styles.previewThumbWrapper}>
                  <Image
                    src={img}
                    alt=""
                    width={48}
                    height={48}
                    className={styles.previewThumb}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <div className={styles.cardActions}>
          <Link
            href={`/store/${store.id}`}
            className={styles.visitStoreBtn}
            aria-label={`Visit ${store.name}`}
          >
            <span>Visit Store</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
