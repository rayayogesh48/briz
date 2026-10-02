import type { Metadata } from "next";
import { Suspense } from "react";
import { BrizHeader } from "@/components/briz-header";
import { BrizFooter } from "@/components/briz-footer";
import { FeaturedStoresView } from "@/components/featured/featured-stores-view";
import { SearchResultsLoading } from "@/components/search-results-loading";

export const metadata: Metadata = {
  title: "Featured Stores — Briz Local Marketplace",
  description:
    "Discover trusted local stores near you offering popular products, great service, and convenient shopping options in Kathmandu.",
};

export default function FeaturedStoresPage() {
  return (
    <>
      <BrizHeader />
      <Suspense fallback={<SearchResultsLoading />}>
        <FeaturedStoresView />
      </Suspense>
      <BrizFooter />
    </>
  );
}
