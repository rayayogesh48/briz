import type { Metadata } from "next";
import { Phase2Placeholder } from "@/components/phase2-placeholder";

export const metadata: Metadata = { title: "Notifications — Briz" };

export default function Page() {
  return <Phase2Placeholder title="Notifications" description="All updates about your requests, offers and Briz activity will be listed here." />;
}
