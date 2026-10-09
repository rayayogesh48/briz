import type { Metadata } from "next";
import { Suspense } from "react";
import { BrizFooter } from "@/components/briz-footer";
import { BrizHeader } from "@/components/briz-header";
import { SavedPage } from "@/components/saved/saved-page";

export const metadata: Metadata = {
  title: "Saved | Briz",
  description: "Products and stores you've saved for later.",
};

export default function Saved() {
  return (
    <>
      <BrizHeader />
      {/* SavedPage reads ?tab= from the URL, which needs a Suspense boundary. */}
      <Suspense fallback={null}>
        <SavedPage />
      </Suspense>
      <BrizFooter />
    </>
  );
}
