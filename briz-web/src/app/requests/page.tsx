import type { Metadata } from "next";
import { Suspense } from "react";
import { BrizFooter } from "@/components/briz-footer";
import { BrizHeader } from "@/components/briz-header";
import { RequestList } from "@/components/requests/request-list";

export const metadata: Metadata = {
  title: "My requests | Briz",
  description: "Track your product requests and compare offers from local sellers.",
};

export default function Requests() {
  return (
    <>
      <BrizHeader />
      {/* RequestList reads ?tab= from the URL, which needs a Suspense boundary. */}
      <Suspense fallback={null}>
        <RequestList />
      </Suspense>
      <BrizFooter />
    </>
  );
}
