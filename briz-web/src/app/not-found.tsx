import { BrizHeader } from "@/components/briz-header";
import { BrizFooter } from "@/components/briz-footer";
import { SystemState } from "@/components/system-state/system-state";

export default function NotFound() {
  return (
    <>
      <BrizHeader />
      <main id="main-content" aria-label="Page Not Found">
        <SystemState
          variant="neutral"
          iconName="FileQuestion"
          eyebrow="404"
          title="Page not found"
          description="The page you're looking for doesn't exist or may have moved."
          fullPage
          primaryAction={{
            label: "Go to home",
            href: "/",
            variant: "primary",
          }}
          secondaryAction={{
            label: "Search products",
            href: "/search",
            variant: "secondary",
          }}
          dataTestId="not-found-page"
        />
      </main>
      <BrizFooter />
    </>
  );
}
