"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./home-components.module.css";

export function MarketplaceCta() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <section className={styles.section} aria-label="Marketplace community and seller tools">
      <div className={styles.marketplaceCtasGrid}>
        {/* Help shape Briz card */}
        <article className={`${styles.ctaCard} ${styles.ctaCardFeedback}`}>
          <div className={styles.ctaContent}>
            <span className={`${styles.badge} ${styles.badgeFeedback}`}>
              💬 HELP SHAPE BRIZ
            </span>
            <h3 className={styles.ctaHeading}>Help us make Briz better</h3>
            <p className={styles.ctaDesc}>
              Tell us what works, what doesn&apos;t, and what you&apos;d like us to improve.
            </p>
            <div className={styles.ctaActions}>
              <button
                type="button"
                className={styles.pillButtonPrimary}
                onClick={() => setFeedbackOpen(true)}
              >
                Share Feedback
              </button>
              <button
                type="button"
                className={styles.pillButtonSecondary}
                onClick={handleShare}
                aria-label="Share Briz link"
              >
                <span>🔗</span>
                <span>{copied ? "Copied Link!" : "Share with Friends"}</span>
              </button>
            </div>
          </div>
          <div className={styles.ctaImageWrapper}>
            <Image
              src="/figma/home/feedback-phone.png"
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 220px"
            />
          </div>
        </article>

        {/* Sell on Briz card */}
        <article className={`${styles.ctaCard} ${styles.ctaCardSeller}`}>
          <div className={styles.ctaContent}>
            <span className={`${styles.badge} ${styles.badgeSeller}`}>
              🛍️ SELL ON BRIZ
            </span>
            <h3 className={styles.ctaHeading}>Grow your store with Briz</h3>
            <p className={styles.ctaDesc}>
              Reach nearby customers, list your products, and respond to product requests.
            </p>
            <div className={styles.ctaActions}>
              <a
                href="/search?type=stores"
                className={styles.pillButtonSeller}
              >
                Become a Seller
              </a>
            </div>
          </div>
          <div className={styles.ctaImageWrapper}>
            <Image
              src="/figma/home/seller-phone.png"
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 220px"
            />
          </div>
        </article>
      </div>

      {feedbackOpen && (
        <dialog
          open
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 24,
            maxWidth: 420,
            background: "#fff",
            boxShadow: "0 20px 80px rgba(0,0,0,0.2)",
          }}
        >
          <h3 style={{ margin: "0 0 8px" }}>Share your feedback</h3>
          <p style={{ margin: "0 0 16px", color: "var(--muted-foreground)", fontSize: 14 }}>
            Thank you for helping us make Briz better! Please send your suggestions directly to our product team at support@briz.com.
          </p>
          <button
            type="button"
            className={styles.pillButtonPrimary}
            onClick={() => setFeedbackOpen(false)}
          >
            Close
          </button>
        </dialog>
      )}
    </section>
  );
}

