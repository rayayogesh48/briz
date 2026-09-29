"use client";

import { useEffect } from "react";
import { BrizHeader } from "@/components/briz-header";
import { BrizFooter } from "@/components/briz-footer";
import { SystemState } from "@/components/system-state/system-state";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error securely without exposing details to user interface
    if (process.env.NODE_ENV === "development") {
      console.error("App Router Error Boundary:", error);
    }
  }, [error]);

  return (
    <>
      <BrizHeader />
      <main id="main-content" aria-label="Application Error">
        <SystemState
          variant="error"
          iconName="AlertCircle"
          eyebrow="500"
          title="Something went wrong"
          description="We couldn't load this page right now. Please try again."
          fullPage
          primaryAction={{
            label: "Try again",
            onClick: reset,
            variant: "primary",
          }}
          secondaryAction={{
            label: "Go to home",
            href: "/",
            variant: "secondary",
          }}
          dataTestId="error-page"
        />
      </main>
      <BrizFooter />
    </>
  );
}
