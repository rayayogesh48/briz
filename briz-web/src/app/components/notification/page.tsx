import type { Metadata } from "next";
import { BrizFooter } from "@/components/briz-footer";
import { BrizHeader } from "@/components/briz-header";
import { NotificationLibrary } from "./notification-library";

export const metadata: Metadata = {
  title: "Notification | Briz components",
  description: "Every type and state of the Briz notification row, at navbar panel and phone widths.",
};

export default function NotificationPage() {
  return (
    <>
      <BrizHeader />
      <NotificationLibrary />
      <BrizFooter />
    </>
  );
}
