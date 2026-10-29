import type { Metadata } from "next";
import { BrizFooter } from "@/components/briz-footer";
import { BrizHeader } from "@/components/briz-header";
import { RequestCardLibrary } from "./request-card-library";

export const metadata: Metadata = {
  title: "Request card | Briz components",
  description: "Every state of the Briz request card, in list and grid layouts.",
};

export default function RequestCardPage() {
  return (
    <>
      <BrizHeader />
      <RequestCardLibrary />
      <BrizFooter />
    </>
  );
}
