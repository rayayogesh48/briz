import Link from "next/link";
import { BrizHeader } from "@/components/briz-header";
import { BrizFooter } from "@/components/briz-footer";
import { Asset } from "@/components/catalog-cards";
import { HomeBanners } from "@/components/home/home-banners";
import { PopularCategories } from "@/components/home/popular-categories";
import { FeaturedProductsSection } from "@/components/home/featured-products-section";
import { StoreCarousel } from "@/components/home/store-carousel";
import { ProductCarousel } from "@/components/home/product-carousel";
import { MarketplaceCta } from "@/components/home/marketplace-cta";
import { RequestOnBriz } from "@/components/home/request-on-briz";
import { AppDownloadBanner } from "@/components/home/app-download-banner";
import {
  ARTS_HANDICRAFTS_PRODUCTS,
  ELECTRONICS_PRODUCTS,
  BEAUTY_COSMETICS_PRODUCTS,
} from "@/components/home/home-data";
import styles from "./home.module.css";
import compStyles from "@/components/home/home-components.module.css";

export default function Home() {
  return (
    <>
      <BrizHeader />

      <main className={styles.home} aria-label="Storefront">
        {/* Hero & Promo Banners */}
        <HomeBanners />

        {/* Popular Categories */}
        <PopularCategories />

        {/* Featured Products (Enclosed in #f1f1f1 container) */}
        <FeaturedProductsSection />

        {/* Featured Stores */}
        <StoreCarousel />

        {/* Category Carousel: Arts & Handicrafts */}
        <ProductCarousel
          title="Arts & Handicrafts"
          category="Arts & Handicrafts"
          products={ARTS_HANDICRAFTS_PRODUCTS}
        />

        {/* Category Carousel: Electronics & Appliances */}
        <ProductCarousel
          title="Electronics & Appliances"
          category="Electronics & Appliances"
          products={ELECTRONICS_PRODUCTS}
        />

        {/* Marketplace CTAs: Help shape Briz & Sell on Briz */}
        <MarketplaceCta />

        {/* Category Carousel: Beauty & Cosmetics */}
        <ProductCarousel
          title="Beauty & Cosmetics"
          category="Beauty & Cosmetics"
          products={BEAUTY_COSMETICS_PRODUCTS}
        />

        {/* Load More Categories Button */}
        <div className={compStyles.loadMoreContainer}>
          <Link href="/search" className={compStyles.loadMoreBtn}>
            <span>Load More Categories</span>
            <span style={{ transform: "rotate(90deg)", display: "inline-flex" }}>
              <Asset name="footer-imgChevron" size={16} />
            </span>
          </Link>
        </div>
      </main>

      {/* Value Proposition / Request on Briz */}
      <RequestOnBriz />

      {/* Mobile App Download Banner */}
      <AppDownloadBanner />

      {/* Footer */}
      <BrizFooter />
    </>
  );
}
