import type { Metadata } from "next";
import { AboutPage } from "@/components/about/about-page";

export const metadata: Metadata = {
  title: "About Briz — Find it nearby. Or request it.",
  description:
    "Briz is a local marketplace for Nepal, starting with Kathmandu. Discover products from nearby stores, or request what you need and let local sellers respond.",
};

export default function About() {
  return <AboutPage />;
}
