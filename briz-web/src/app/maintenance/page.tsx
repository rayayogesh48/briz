import type { Metadata } from "next";
import { SystemState } from "@/components/system-state/system-state";

export const metadata: Metadata = {
  title: "Under Maintenance — Briz",
  description: "Briz is temporarily unavailable while we perform system improvements.",
};

interface MaintenancePageProps {
  searchParams?: Promise<{ eta?: string }>;
}

export default async function MaintenancePage({ searchParams }: MaintenancePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const etaParam = resolvedSearchParams?.eta;

  let formattedEta: string | undefined;
  if (etaParam) {
    try {
      const parsedDate = new Date(etaParam);
      if (!isNaN(parsedDate.getTime())) {
        formattedEta = parsedDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      }
    } catch {
      // Ignore parsing errors and don't invent downtime
    }
  }

  const description = formattedEta
    ? `We're temporarily unavailable while we make improvements. Estimated return time: ${formattedEta}. Please check back shortly.`
    : "We're temporarily unavailable while we make improvements. Please check back shortly.";

  return (
    <main id="main-content" aria-label="Maintenance in Progress">
      <SystemState
        variant="info"
        iconName="Wrench"
        eyebrow="Maintenance"
        title="Briz is getting a quick tune-up"
        description={description}
        fullPage
        isolated
        minimalHeader
        primaryAction={{
          label: "Try again",
          href: "/",
          variant: "primary",
        }}
        dataTestId="maintenance-page"
      />
    </main>
  );
}
