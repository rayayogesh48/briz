"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, CheckCircle2, Star, ShieldCheck } from "lucide-react";
import styles from "./featured-banner.module.css";

interface FeaturedBannerProps {
  type: "products" | "stores";
  eyebrow?: string;
  heading?: string;
  description?: string;
  supportingLabel?: string;
}

export function FeaturedBanner({
  type,
  eyebrow,
  heading,
  description,
  supportingLabel,
}: FeaturedBannerProps) {
  const isProducts = type === "products";

  const defaultEyebrow = isProducts ? "FEATURED PRODUCTS" : "FEATURED STORES";
  const defaultHeading = isProducts
    ? "Popular picks from stores near you"
    : "Discover trusted stores near you";
  const defaultDescription = isProducts
    ? "Explore products selected for their popularity, value, and availability from local stores."
    : "Shop from selected local stores offering popular products, great service, and convenient shopping options.";
  const defaultSupporting = isProducts ? "Updated regularly" : "Verified local merchants";

  return (
    <section className={styles.banner} aria-labelledby="featured-banner-heading">
      <div className={styles.content}>
        <div className={styles.eyebrowRow}>
          <span className={styles.eyebrow}>
            <Sparkles size={12} aria-hidden="true" />
            {eyebrow || defaultEyebrow}
          </span>
          <span className={styles.supportingBadge}>
            <CheckCircle2 size={12} aria-hidden="true" />
            {supportingLabel || defaultSupporting}
          </span>
        </div>

        <h1 id="featured-banner-heading" className={styles.heading}>
          {heading || defaultHeading}
        </h1>

        <p className={styles.description}>
          {description || defaultDescription}
        </p>
      </div>

      {/* Decorative right-side visual composition */}
      <div className={styles.visualWrapper} aria-hidden="true">
        {isProducts ? (
          <div className={styles.productCluster}>
            {/* Card 1: Left tilted */}
            <div className={`${styles.clusterCard} ${styles.clusterCard1}`}>
              <Image
                src="/products/bottle-main.svg"
                alt=""
                width={80}
                height={80}
                className={styles.clusterImage}
                priority
              />
            </div>

            {/* Card 2: Center elevated */}
            <div className={`${styles.clusterCard} ${styles.clusterCard2}`}>
              <Image
                src="/products/bottle-thumb-1.svg"
                alt=""
                width={95}
                height={95}
                className={styles.clusterImage}
                priority
              />
            </div>

            {/* Card 3: Right tilted */}
            <div className={`${styles.clusterCard} ${styles.clusterCard3}`}>
              <Image
                src="/products/bottle-thumb-2.svg"
                alt=""
                width={80}
                height={80}
                className={styles.clusterImage}
                priority
              />
            </div>

            {/* Floating rating / popularity pill */}
            <div className={styles.pillFloat}>
              <Star size={12} fill="#3E63DD" color="#3E63DD" />
              <span>Selected for you</span>
            </div>
          </div>
        ) : (
          <div className={styles.storeCluster}>
            {/* Background store card */}
            <div className={`${styles.storeGraphicCard} ${styles.storeCardBack}`}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
                }}
              />
            </div>

            {/* Foreground store card */}
            <div className={`${styles.storeGraphicCard} ${styles.storeCardFront}`}>
              <div
                className={styles.storeCardCover}
                style={{
                  background: "linear-gradient(135deg, #3e63dd 0%, #6366f1 100%)",
                }}
              />
              <div className={styles.storeCardBody}>
                <div
                  className={styles.storeCardLogo}
                  style={{
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    color: "#3e63dd",
                    fontSize: "12px",
                  }}
                >
                  B
                </div>
                <div>
                  <div className={styles.storeCardTitle}>Briz Store Hub</div>
                  <div className={styles.storeCardBadge}>
                    <ShieldCheck size={11} />
                    <span>Verified · Open now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
