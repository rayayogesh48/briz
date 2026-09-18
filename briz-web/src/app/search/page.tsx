import type { Metadata } from "next";
import { Suspense } from "react";
import { BrizHeader } from "@/components/briz-header";
import { BrizFooter } from "@/components/briz-footer";
import { SearchResults } from "@/components/search-results";
import { SearchResultsLoading } from "@/components/search-results-loading";

export const metadata: Metadata = { title: "Search products & stores — Briz", description: "Discover local products and stores. Compare prices, filter categories, and find sellers near you." };
export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = (Array.isArray(params.q) ? params.q[0] : params.q) || "";
  return <><BrizHeader searchQuery={query} /><Suspense fallback={<SearchResultsLoading />}><SearchResults /></Suspense><BrizFooter /></>;
}
