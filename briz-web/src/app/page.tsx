"use client";

import { useState } from "react";
import Link from "next/link";
import { BrizHeader } from "@/components/briz-header";
import { BrizFooter } from "@/components/briz-footer";
import { ShareDialog } from "@/components/share-dialog";
import styles from "./home.module.css";

const REDIRECTION_PAGES = [
  {
    title: "Search Results Page",
    description: "Search products & stores across Kathmandu with faceted filters, dual-thumb price slider, and quick views.",
    href: "/search?q=thermal",
    cta: "Go to Search Results",
    icon: "🔍",
  },
  {
    title: "Category Page",
    description: "Category browsing with 260px sticky sidebar, in-category live search, and 4-column product grid.",
    href: "/category?category=Office+Supplies",
    cta: "Go to Category Page",
    icon: "📁",
  },
  {
    title: "All Categories Page",
    description: "Comprehensive 6-column directory of all product categories with instant search filter.",
    href: "/categories",
    cta: "Go to All Categories",
    icon: "🏷️",
  },
  {
    title: "Store Detail Page",
    description: "Desktop store profile (Figma 885:95254) with cover banner, weekly hours popover, messaging, and 5-column catalog.",
    href: "/store/s6",
    cta: "Go to Store Detail",
    icon: "🏪",
  },
  {
    title: "Product Detail Page",
    description: "Responsive product detail page with 5-angle packshot gallery, accessible lightbox, sticky mobile action bar, and Urban Essentials seller profile.",
    href: "/products/insulated-stainless-steel-water-bottle-750ml",
    cta: "Go to Product Detail",
    icon: "🍶",
  },
];

export default function Home() {
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <>
      <BrizHeader />

      <main className={styles.home} aria-label="Briz Navigation Hub">
        {/* Navigation & Redirection Portal Header */}
        <section className={styles.portalHeader} aria-labelledby="portal-heading">
          <div className={styles.headerRow}>
            <div>
              <h1 id="portal-heading" className={styles.portalTitle}>
                Briz Web Application Navigation Hub
              </h1>
              <p className={styles.portalSubtitle}>
                Select any page, component, or interactive dialog below to test and inspect.
              </p>
            </div>
            <button
              type="button"
              className={styles.shareCtaButton}
              onClick={() => setIsShareOpen(true)}
              aria-label="Open share dialog from header"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span>Share Application</span>
            </button>
          </div>
        </section>

        {/* Dialogs & Interactive CTAs */}
        <section className={styles.sectionGroup} aria-label="Dialogs and Actions">
          <h2 className={styles.sectionHeading}>Dialogs & Actions</h2>
          <div className={styles.actionCard}>
            <div className={styles.actionCardBody}>
              <div className={styles.actionIconWrapper} aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </div>
              <div>
                <h3 className={styles.actionCardTitle}>Share Dialog</h3>
                <p className={styles.actionCardDescription}>
                  Social media sharing modal supporting Facebook, Instagram, WhatsApp, Email, copy-to-clipboard, and native Web Share.
                </p>
              </div>
            </div>
            <button
              type="button"
              className={styles.openDialogBtn}
              onClick={() => setIsShareOpen(true)}
              aria-label="Open Share Dialog"
            >
              Open Share Dialog ↗
            </button>
          </div>
        </section>

        {/* Core Application Pages Grid */}
        <section className={styles.sectionGroup} aria-label="Application Pages">
          <h2 className={styles.sectionHeading}>Pages</h2>
          <div className={styles.redirectGrid}>
            {REDIRECTION_PAGES.map((page) => (
              <Link key={page.href} href={page.href} className={styles.redirectCard}>
                <div>
                  <span className={styles.cardIcon} aria-hidden>{page.icon}</span>
                  <h3 className={styles.cardTitle}>{page.title}</h3>
                  <p className={styles.cardDescription}>{page.description}</p>
                </div>
                <span className={styles.cardButton}>{page.cta} →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Component Redirection Card */}
        <section className={styles.sectionGroup} aria-label="Design System Components">
          <h2 className={styles.sectionHeading}>Components</h2>
          <Link
            href="/components/product-category-list"
            className={styles.componentCard}
            aria-label="View Product Category List Component Documentation and Live Previews"
          >
            <div className={styles.componentCardBody}>
              <div className={styles.badgeRow}>
                <span className={styles.componentBadge}>Component · Figma 946:103107</span>
              </div>
              <h3 className={styles.componentTitle}>Product Category List</h3>
              <p className={styles.componentDescription}>
                Horizontal scrollable pill navigation with 152px gradient fade masks, auto-scrolling, chevron controls, and active text expansion for long category names.
              </p>
            </div>
            <span className={styles.componentButton}>
              View Component Docs & Preview →
            </span>
          </Link>
        </section>
      </main>

      {/* Share Dialog Modal */}
      <ShareDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Briz — Discover & Shop Local in Kathmandu"
        description="Find authentic stores, real-time stock, and local pickup in Kathmandu on Briz."
      />

      <BrizFooter />
    </>
  );
}
