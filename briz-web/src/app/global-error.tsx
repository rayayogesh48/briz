"use client";

import { useEffect } from "react";
import { SystemState } from "@/components/system-state/system-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Global Error Boundary caught:", error);
    }
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", backgroundColor: "#f9f9f9" }}>
        <main id="main-content" aria-label="System Error">
          <SystemState
            variant="error"
            iconName="AlertCircle"
            eyebrow="System Error"
            title="Something went wrong"
            description="We couldn't load this page right now. Please try again."
            fullPage
            isolated
            minimalHeader
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
            dataTestId="global-error-page"
          />
        </main>
      </body>
    </html>
  );
}
