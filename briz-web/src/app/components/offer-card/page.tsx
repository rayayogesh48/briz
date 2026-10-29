import type { Metadata } from "next";
import { BrizFooter } from "@/components/briz-footer";
import { BrizHeader } from "@/components/briz-header";
import { OfferCardLibrary } from "./offer-card-library";

export const metadata: Metadata = {
  title: "Seller offer card | Briz components",
  description: "Every state of the Briz seller offer card, at detail-page and phone widths.",
};

export default function OfferCardPage() {
  return (
    <>
      <BrizHeader />
      <OfferCardLibrary />
      <BrizFooter />
    </>
  );
}
