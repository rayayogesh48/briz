import type { Metadata } from "next";
import { Suspense } from "react";
import { BrizHeader } from "@/components/briz-header";
import { BrizFooter } from "@/components/briz-footer";
import { AllCategoriesPage } from "@/components/all-categories-page";
import { SearchResultsLoading } from "@/components/search-results-loading";

export const metadata: Metadata = {
  title: "All Categories — Briz",
  description: "Explore all product and store categories on Briz. Find local sellers, compare prices, and order online.",
};

export default function CategoriesRoute() {
  return (
    <>
      <BrizHeader />
      <Suspense fallback={<SearchResultsLoading />}>
        <AllCategoriesPage />
      </Suspense>
      <BrizFooter />
    </>
  );
}

