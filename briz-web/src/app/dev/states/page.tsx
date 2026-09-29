import type { Metadata } from "next";
import { Suspense } from "react";
import { StatesGalleryClient } from "./states-gallery-client";

export const metadata: Metadata = {
  title: "System States & Error Experience Gallery — Briz Dev",
  description: "Interactive preview gallery for all Briz system states, error experiences, empty states, and loading skeletons.",
};

export default function StatesGalleryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading state preview gallery...</div>}>
      <StatesGalleryClient />
    </Suspense>
  );
}
