import type { Metadata } from "next";
import { Suspense } from "react";
import { BrizHeader } from "@/components/briz-header";
import { BrizFooter } from "@/components/briz-footer";
import { FeaturedProductsView } from "@/components/featured/featured-products-view";
import { SearchResultsLoading } from "@/components/search-results-loading";

export const metadata: Metadata = {
  title: "Featured Products — Briz Local Marketplace",
  description:
    "Explore products selected for their popularity, value, and availability from local stores near Kathmandu.",
};

export default function FeaturedProductsPage() {
  return (
    <>
      <BrizHeader />
      <Suspense fallback={<SearchResultsLoading />}>
        <FeaturedProductsView />
      </Suspense>
      <BrizFooter />
    </>
  );
}
