import Link from "next/link";
import { BrizHeader } from "@/components/briz-header";
import { BrizFooter } from "@/components/briz-footer";
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
];

export default function Home() {
  return (
    <>
      <BrizHeader />

      <main className={styles.home} aria-label="Briz Navigation Hub">
        {/* Navigation & Redirection Portal Header */}
        <section className={styles.portalHeader} aria-labelledby="portal-heading">
          <h1 id="portal-heading" className={styles.portalTitle}>
            Briz Web Application Navigation Hub
          </h1>
          <p className={styles.portalSubtitle}>
            Select any page or component below to navigate directly to that specific section.
          </p>
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

      <BrizFooter />
    </>
  );
}
