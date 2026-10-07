import type { Metadata } from "next";
import { FeedbackPage } from "@/components/feedback/feedback-page";

export const metadata: Metadata = {
  title: "Send us feedback — Briz",
  description: "Share feedback, ideas, or issues with the Briz team.",
};

export default function Feedback() {
  return <FeedbackPage />;
}
