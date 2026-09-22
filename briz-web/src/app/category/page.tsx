import type { Metadata } from "next";
import { Suspense } from "react";
import { BrizHeader } from "@/components/briz-header";
import { BrizFooter } from "@/components/briz-footer";
import { CategoryPage } from "@/components/category-page";
import { SearchResultsLoading } from "@/components/search-results-loading";

export const metadata: Metadata = {
  title: "Categories — Briz",
  description: "Explore local products and stores by category. Find nearby sellers, compare prices, and order online.",
};

export default async function CategoryRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const category = (Array.isArray(params.category) ? params.category[0] : params.category) || "";

  return (
    <>
      <BrizHeader categoryContext={category || undefined} />
      <Suspense fallback={<SearchResultsLoading />}>
        <CategoryPage />
      </Suspense>
      <BrizFooter />
    </>
  );
}
