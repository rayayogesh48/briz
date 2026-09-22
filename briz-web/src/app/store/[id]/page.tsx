import type { Metadata } from "next";
import { Suspense } from "react";
import { BrizHeader } from "@/components/briz-header";
import { BrizFooter } from "@/components/briz-footer";
import { StoreDetailPage } from "@/components/store-detail-page";
import { SearchResultsLoading } from "@/components/search-results-loading";
import { ALL_STORES } from "@/components/search-data";

interface StoreRouteProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: StoreRouteProps): Promise<Metadata> {
  const { id } = await params;
  const store = ALL_STORES.find(s => s.id === id) || ALL_STORES[0];

  return {
    title: `${store.name} — Briz Store`,
    description: `Shop local products from ${store.name} in ${store.location}. View store hours, gallery, message the merchant, and order with delivery or store pickup.`,
  };
}

export default async function StoreDetailRoute({ params }: StoreRouteProps) {
  const { id } = await params;
  const store = ALL_STORES.find(s => s.id === id) || ALL_STORES[0];

  return (
    <>
      <BrizHeader categoryContext={store.mainCategory || store.category} />
      <Suspense fallback={<SearchResultsLoading />}>
        <StoreDetailPage storeId={id} />
      </Suspense>
      <BrizFooter />
    </>
  );
}

