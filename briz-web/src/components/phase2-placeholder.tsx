import Link from "next/link";
import { BrizFooter } from "./briz-footer";
import { BrizHeader } from "./briz-header";

/** Stand-in destination for Phase 2 pages the navbar links to before they are built. */
export function Phase2Placeholder({ title, description }: { title: string; description: string }) {
  return (
    <>
      <BrizHeader />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "72px 24px 40px" }}>
        <p
          style={{
            display: "inline-block",
            margin: "0 0 16px",
            padding: "4px 10px",
            border: "1px solid var(--border)",
            borderRadius: 999,
            background: "var(--card)",
            color: "var(--muted-foreground)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Phase 2 preview · placeholder
        </p>
        <h1 style={{ margin: "0 0 10px", fontSize: 32, fontWeight: 650, letterSpacing: "-0.03em" }}>{title}</h1>
        <p style={{ margin: "0 0 24px", color: "var(--muted-foreground)", fontSize: 16, lineHeight: "24px" }}>{description}</p>
        <Link href="/" style={{ color: "var(--primary)", fontWeight: 600 }}>
          Back to Briz
        </Link>
      </main>
      <BrizFooter />
    </>
  );
}
