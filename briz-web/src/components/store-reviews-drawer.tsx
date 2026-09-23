"use client";

import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import type { Store } from "./search-data";
import {
  type StoreReview,
  POPULAR_REVIEW_TAGS,
  MAX_REVIEW_LENGTH,
} from "@/data/store-reviews-data";
import styles from "./store-reviews-drawer.module.css";

interface StoreReviewsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store;
  reviews: StoreReview[];
}

export function StoreReviewsDrawer({
  isOpen,
  onClose,
  store,
  reviews,
}: StoreReviewsDrawerProps) {
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});

  // Close on Escape key press & prevent background scroll when open
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Average Rating
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return store.rating || 5.0;
    const sum = reviews.reduce((acc, r) => acc + r.givenStar, 0);
    return sum / reviews.length;
  }, [reviews, store.rating]);

  // Star Distribution
  const starDistribution = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of reviews) {
      const star = Math.min(5, Math.max(1, Math.round(r.givenStar)));
      counts[star] = (counts[star] || 0) + 1;
    }
    return counts;
  }, [reviews]);

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    let list = reviews;
    if (selectedStarFilter !== null) {
      list = list.filter(r => Math.round(r.givenStar) === selectedStarFilter);
    }
    if (selectedTagFilter) {
      list = list.filter(r => r.tags.includes(selectedTagFilter));
    }
    return list;
  }, [reviews, selectedStarFilter, selectedTagFilter]);

  function handleTagFilterToggle(tag: string) {
    setSelectedTagFilter(prev => (prev === tag ? null : tag));
  }

  function handleStarFilterToggle(star: number) {
    setSelectedStarFilter(prev => (prev === star ? null : star));
  }

  function handleToggleHelpful(reviewId: string) {
    setHelpfulVotes(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  }

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label={`Customer reviews for ${store.name}`}
    >
      <div
        className={styles.drawer}
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Drawer Header */}
        <header className={styles.drawerHeader}>
          <div className={styles.headerInfo}>
            <div className={styles.headerTitleRow}>
              <h2 className={styles.drawerTitle}>Customer Reviews</h2>
              <span className={styles.reviewsCountBadge}>
                {reviews.length}
              </span>
            </div>
            <p className={styles.storeSubtitle}>
              <span>{store.name}</span>
              <span className={styles.storeDot} aria-hidden />
              <span>{store.location}</span>
            </p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close reviews panel"
          >
            ✕
          </button>
        </header>

        {/* Drawer Body */}
        <div className={styles.drawerBody}>
          {/* Rating Overview Card */}
          <div className={styles.ratingOverviewCard}>
            <div className={styles.scoreRow}>
              <div className={styles.scoreCol}>
                <span className={styles.ratingScoreHuge}>
                  {averageRating.toFixed(1)}
                </span>
                <div className={styles.scoreMeta}>
                  <div
                    className={styles.ratingStarsRow}
                    aria-label={`Rating: ${averageRating.toFixed(1)} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        style={{
                          fontSize: "18px",
                          color: star <= Math.round(averageRating) ? "#f59e0b" : "#d1d5db",
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className={styles.ratingCountSub}>
                    {reviews.length} verified reviews
                  </p>
                </div>
              </div>

              <span className={styles.readOnlyBadge}>
                👁️ View-only
              </span>
            </div>

            {/* Star Breakdown Bars */}
            <div className={styles.starBarsCol}>
              {[5, 4, 3, 2, 1].map(star => {
                const count = starDistribution[star] || 0;
                const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                const isSelected = selectedStarFilter === star;

                return (
                  <button
                    key={star}
                    type="button"
                    className={`${styles.starBarRow} ${isSelected ? styles.starBarRowActive : ""}`}
                    onClick={() => handleStarFilterToggle(star)}
                    title={`Filter by ${star} star reviews`}
                  >
                    <span className={styles.starBarLabel}>
                      <span>{star}</span>
                      <span style={{ color: "#f59e0b" }}>★</span>
                    </span>
                    <div className={styles.starBarTrack}>
                      <div className={styles.starBarFill} style={{ width: `${percent}%` }} />
                    </div>
                    <span className={styles.starBarCount}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Popular Feedback Tags Cloud */}
          <div className={styles.reviewFilterSection}>
            <div className={styles.filterHeaderRow}>
              <h3 className={styles.filterHeading}>Filter by Highlights</h3>
              {(selectedTagFilter || selectedStarFilter !== null) && (
                <button
                  type="button"
                  className={styles.clearFilterLink}
                  onClick={() => {
                    setSelectedTagFilter(null);
                    setSelectedStarFilter(null);
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className={styles.tagsFilterCloud}>
              <button
                type="button"
                className={`${styles.tagFilterChip} ${!selectedTagFilter && selectedStarFilter === null ? styles.tagFilterChipActive : ""}`}
                onClick={() => {
                  setSelectedTagFilter(null);
                  setSelectedStarFilter(null);
                }}
              >
                <span>All Reviews</span>
                <span className={styles.tagFilterBadge}>{reviews.length}</span>
              </button>
              {POPULAR_REVIEW_TAGS.map(tag => {
                const count = reviews.filter(r => r.tags?.includes(tag)).length;
                if (count === 0) return null;
                const isSelected = selectedTagFilter === tag;

                return (
                  <button
                    key={tag}
                    type="button"
                    className={`${styles.tagFilterChip} ${isSelected ? styles.tagFilterChipActive : ""}`}
                    onClick={() => handleTagFilterToggle(tag)}
                  >
                    <span>{tag}</span>
                    <span className={styles.tagFilterBadge}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          {filteredReviews.length > 0 ? (
            <div className={styles.reviewsList}>
              {filteredReviews.map(review => {
                const isHelpful = helpfulVotes[review.id];
                const count = (review.helpfulCount || 0) + (isHelpful ? 1 : 0);

                return (
                  <article key={review.id} className={styles.reviewCard}>
                    <div className={styles.reviewCardHeader}>
                      <div className={styles.reviewAuthorBlock}>
                        {/* 1. Avatar */}
                        <div className={styles.reviewAvatarWrapper}>
                          {review.avatar ? (
                            <Image
                              src={review.avatar}
                              alt={`${review.username}'s avatar`}
                              width={40}
                              height={40}
                              className={styles.reviewAvatarImg}
                              unoptimized
                            />
                          ) : (
                            <span className={styles.reviewAvatarFallback}>
                              {review.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className={styles.reviewMeta}>
                          <div className={styles.reviewAuthorRow}>
                            {/* 2. Username */}
                            <h4 className={styles.reviewAuthorName}>{review.username}</h4>
                            {review.verifiedPurchase && (
                              <span className={styles.verifiedBadge}>
                                ✓ Verified
                              </span>
                            )}
                          </div>
                          {/* 6. Review Date */}
                          <span className={styles.reviewDateText}>{review.date}</span>
                        </div>
                      </div>

                      {/* 3. Given Star */}
                      <div className={styles.reviewRatingBlock}>
                        <div
                          className={styles.reviewStarsRow}
                          aria-label={`${review.givenStar} out of 5 stars`}
                        >
                          {[1, 2, 3, 4, 5].map(star => (
                            <span
                              key={star}
                              style={{
                                color: star <= review.givenStar ? "#f59e0b" : "#d1d5db",
                                fontSize: "14px",
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className={styles.reviewScoreBadge}>{review.givenStar}.0</span>
                      </div>
                    </div>

                    {/* 4. Tags */}
                    {review.tags && review.tags.length > 0 && (
                      <div className={styles.reviewTagsList}>
                        {review.tags.map(tag => (
                          <span key={tag} className={styles.reviewTagBadge}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 5. Review Content (strictly capped at max 360 characters) */}
                    <p className={styles.reviewContentText}>
                      {review.content.slice(0, MAX_REVIEW_LENGTH)}
                    </p>

                    <div className={styles.reviewCardFooter}>
                      <button
                        type="button"
                        className={`${styles.helpfulBtn} ${isHelpful ? styles.helpfulBtnActive : ""}`}
                        onClick={() => handleToggleHelpful(review.id)}
                        aria-label="Mark review as helpful"
                      >
                        <span>👍</span>
                        <span>Helpful ({count})</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyReviews}>
              <h4 className={styles.emptyReviewsTitle}>No reviews match this filter</h4>
              <p className={styles.emptyReviewsSubtitle}>
                Try selecting a different rating or highlight tag to see customer feedback.
              </p>
              <button
                type="button"
                className={styles.resetButton}
                onClick={() => {
                  setSelectedTagFilter(null);
                  setSelectedStarFilter(null);
                }}
              >
                View all reviews
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

