import type { Metadata } from "next";
import { Phase2Placeholder } from "@/components/phase2-placeholder";

export const metadata: Metadata = { title: "Profile — Briz" };

export default function Page() {
  return <Phase2Placeholder title="Profile" description="Your name, phone number and account settings will be managed here." />;
}
