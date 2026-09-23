"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DetailedProduct, SIMILAR_PRODUCTS } from "@/data/product-detail-data";
import { ProductGallery } from "./product-gallery";
import { ProductInformation } from "./product-information";
import { ProductActions } from "./product-actions";
import { MobileProductActionBar } from "./mobile-product-action-bar";
import { SellerDetails } from "./seller-details";
import { ProductDescription } from "./product-description";
import { BrizBenefits } from "./briz-benefits";
import { SimilarProducts } from "./similar-products";
import { ShareProductDialog } from "./share-product-dialog";
import { StoreChatDrawer } from "./store-chat-drawer";
import { AppFeatureDialog } from "./app-feature-dialog";

interface ProductDetailPageProps {
  product: DetailedProduct;
}

export function ProductDetailPage({ product }: ProductDetailPageProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [appDialogFeature, setAppDialogFeature] = useState<"cart" | "chat" | null>(null);
  const [locationAvailable] = useState(true);

  return (
    <main
      className="w-full bg-[#f9f9f9] text-[#202020] min-h-screen px-4 sm:px-8 lg:px-12 py-4 sm:py-6 pb-28 md:pb-16"
      aria-label={`${product.name} detail page`}
    >
      <div className="max-w-[1280px] mx-auto flex flex-col gap-6 sm:gap-10">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs sm:text-sm text-[#646464] overflow-hidden py-1"
        >
          <Link href="/" className="hover:text-[#3e63dd] transition flex-shrink-0">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />

          <Link
            href={`/category?category=${encodeURIComponent(product.category)}`}
            className="hover:text-[#3e63dd] transition flex-shrink-0"
          >
            {product.category}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />

          <Link
            href={`/category?category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent(
              product.subcategory
            )}`}
            className="hover:text-[#3e63dd] transition flex-shrink-0"
          >
            {product.subcategory}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />

          <span
            aria-current="page"
            className="font-semibold text-[#202020] truncate max-w-[180px] sm:max-w-xs md:max-w-md"
          >
            {product.name}
          </span>
        </nav>

        {/* 2-Column Section: First = Image, Second = Details (Store Detail at last) */}
        <section
          aria-label="Product Overview and Details"
          className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12"
        >
          {/* First Column: Image Gallery (sticky on desktop) */}
          <div className="w-full lg:w-[52%] lg:sticky lg:top-24 flex-shrink-0">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Second Column: All Details with Store Detail at last */}
          <div className="w-full lg:w-[48%] flex flex-col gap-6">
            {/* Product Information */}
            <ProductInformation
              product={product}
              onOpenShare={() => setIsShareOpen(true)}
              locationAvailable={locationAvailable}
            />

            {/* Desktop Actions */}
            <ProductActions
              product={product}
              onOpenChat={() => setIsChatOpen(true)}
              onRequireAppDialog={(feature) => setAppDialogFeature(feature)}
            />

            {/* Product Description */}
            <ProductDescription
              description={product.description}
            />

            {/* Why Shop on Briz Benefits */}
            <BrizBenefits />

            {/* Store Detail (at the last of second column) */}
            <SellerDetails seller={product.seller} />
          </div>
        </section>

        {/* Bottom Full 1-Column Section: Similar Items */}
        <section
          className="w-full pt-8 border-t border-[#ebebeb]"
          aria-label="Similar Products Section"
        >
          <SimilarProducts
            products={SIMILAR_PRODUCTS}
            locationAvailable={locationAvailable}
          />
        </section>
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <MobileProductActionBar
        product={product}
        onOpenChat={() => setIsChatOpen(true)}
        onRequireAppDialog={(feature) => setAppDialogFeature(feature)}
      />

      {/* Modals and Slide-Over Drawers */}
      <ShareProductDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        product={product}
      />

      <StoreChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        product={product}
      />

      {appDialogFeature && (
        <AppFeatureDialog
          isOpen={!!appDialogFeature}
          onClose={() => setAppDialogFeature(null)}
          featureKey={appDialogFeature}
        />
      )}
    </main>
  );
}
