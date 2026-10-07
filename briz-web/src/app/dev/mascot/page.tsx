"use client";

// Client page: the expression list is exported from a client module.
import { BrizShopper, SHOPPER_EXPRESSIONS } from "@/components/briz-shopper";

const cell = { display: "grid", justifyItems: "center", gap: 12, padding: 24, border: "1px solid var(--border)", borderRadius: 16, background: "var(--card)" } as const;

export default function MascotGallery() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 120px" }}>
      <h1 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-0.02em" }}>Briz shopper mascot</h1>
      <p style={{ margin: "0 0 32px", color: "var(--muted-foreground)" }}>One character, nine expressions. Bottom row shows the head-and-shoulders crop used in the request widget.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
        {SHOPPER_EXPRESSIONS.map((expression) => (
          <figure key={expression} style={{ ...cell, margin: 0 }}>
            <BrizShopper expression={expression} size={132} title={`Briz shopper, ${expression}`} />
            <figcaption style={{ fontSize: 14, fontWeight: 600 }}>{expression}</figcaption>
          </figure>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 32 }}>
        {SHOPPER_EXPRESSIONS.map((expression) => (
          <BrizShopper key={expression} expression={expression} crop="bust" size={56} />
        ))}
      </div>
    </main>
  );
}
