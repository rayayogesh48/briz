"use client";

// Client page: the expression list is exported from a client module.
import { BrizShopper, SHOPPER_EXPRESSIONS } from "@/components/briz-shopper";
import { BrizFace } from "@/components/briz-face";
import { BrizSprite, SPRITE_DIRECTIONS, SPRITE_HAS_EXPRESSIONS } from "@/components/briz-sprite";

const cell = { display: "grid", justifyItems: "center", gap: 12, padding: 24, border: "1px solid var(--border)", borderRadius: 16, background: "var(--card)" } as const;

export default function MascotGallery() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 120px" }}>
      {/* Highlights the expression opened from the States Preview menu (/dev/mascot#name). */}
      <style>{`.mascot-cell{scroll-margin-top:120px}.mascot-cell:target{border-color:var(--primary)!important;box-shadow:0 0 0 4px var(--primary-container)}`}</style>
      <h1 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-0.02em" }}>Briz mascot v2 — illustrated</h1>
      <p style={{ margin: "0 0 32px", color: "var(--muted-foreground)" }}>The illustrated character: nine expressions, then the nine head directions it uses to follow the cursor.</p>
      {SPRITE_HAS_EXPRESSIONS && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
          {SHOPPER_EXPRESSIONS.map((expression) => (
            <figure key={expression} style={{ ...cell, margin: 0 }}>
              <BrizSprite expression={expression} size={132} title={`Briz illustrated mascot, ${expression}`} />
              <figcaption style={{ fontSize: 14, fontWeight: 600 }}>{expression}</figcaption>
            </figure>
          ))}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 64 }}>
        {SPRITE_DIRECTIONS.map((direction) => (
          <BrizSprite key={direction} direction={direction} size={SPRITE_HAS_EXPRESSIONS ? 72 : 120} title={`Looking ${direction}`} />
        ))}
      </div>

      <h1 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-0.02em" }}>Briz mascot v2 — seller</h1>
      <p style={{ margin: "0 0 32px", color: "var(--muted-foreground)" }}>The v2 face, a little older, as a shopkeeper.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 64 }}>
        {SHOPPER_EXPRESSIONS.map((expression) => (
          <figure key={expression} style={{ ...cell, margin: 0 }}>
            <BrizFace persona="seller" expression={expression} size={132} title={`Briz seller mascot, ${expression}`} />
            <figcaption style={{ fontSize: 14, fontWeight: 600 }}>{expression}</figcaption>
          </figure>
        ))}
      </div>

      <h1 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-0.02em" }}>Briz mascot v2 — face</h1>
      <p style={{ margin: "0 0 32px", color: "var(--muted-foreground)" }}>Face-only character, the same nine expressions.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 64 }}>
        {SHOPPER_EXPRESSIONS.map((expression) => (
          <figure key={expression} id={`v2-${expression}`} className="mascot-cell" style={{ ...cell, margin: 0 }}>
            <BrizFace expression={expression} size={132} title={`Briz face mascot, ${expression}`} />
            <figcaption style={{ fontSize: 14, fontWeight: 600 }}>{expression}</figcaption>
          </figure>
        ))}
      </div>

      <h1 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-0.02em" }}>Briz shopper mascot</h1>
      <p style={{ margin: "0 0 32px", color: "var(--muted-foreground)" }}>One character, nine expressions. Bottom row shows the head-and-shoulders crop used in the request widget.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
        {SHOPPER_EXPRESSIONS.map((expression) => (
          <figure key={expression} id={expression} className="mascot-cell" style={{ ...cell, margin: 0 }}>
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
