import type { Metadata } from "next";
import { AuthPreview } from "@/components/auth/auth-preview";

export const metadata: Metadata = {
  title: "Sign in — Briz (prototype)",
  description: "Frontend-only preview of the Briz authentication screens.",
};

export default function AuthPage() {
  return <AuthPreview />;
}
