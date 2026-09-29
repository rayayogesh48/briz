import type { Metadata } from "next";
import { BrizHeader } from "@/components/briz-header";
import { BrizFooter } from "@/components/briz-footer";
import { ProductShowcase } from "@/components/image-previewer";

export const metadata: Metadata = {
  title: "Product Image Previewer — Briz Marketplace",
  description:
    "Clean, modern e-commerce product image previewer with full-screen lightbox, swipe gestures, keyboard navigation, and responsive controls.",
};

export default function PreviewerPage() {
  return (
    <>
      <BrizHeader categoryContext="Home & Kitchen" />
      <main id="main-content" aria-label="Product Image Previewer Demo">
        <ProductShowcase />
      </main>
      <BrizFooter />
    </>
  );
}
