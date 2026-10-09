import type { Metadata } from "next";
import { Phase2Placeholder } from "@/components/phase2-placeholder";

export const metadata: Metadata = { title: "My requests — Briz" };

export default function Page() {
  return <Phase2Placeholder title="My requests" description="Your product requests and the offers sellers send back will be listed here." />;
}
