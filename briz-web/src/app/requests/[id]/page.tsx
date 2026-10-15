import type { Metadata } from "next";
import { BrizFooter } from "@/components/briz-footer";
import { BrizHeader } from "@/components/briz-header";
import { RequestDetail } from "@/components/requests/request-detail";

export const metadata: Metadata = { title: "Request details | Briz" };

export default function RequestDetailPage() {
  return (
    <>
      <BrizHeader />
      <RequestDetail />
      <BrizFooter />
    </>
  );
}
