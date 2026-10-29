"use client";

import Link from "next/link";
import { useState } from "react";
import requestStyles from "@/components/requests/requests.module.css";
import { useRequestClock, useRequests } from "@/store/requests-store";
import docStyles from "../product-category-list/component-doc.module.css";
import styles from "../library.module.css";
import { RequestCardPlayground } from "./request-card-playground";

/** The RequestCard API, with the Figma variant content each prop drives. */
const PROPS = [
  { name: "request", type: "BrizRequest", figma: "Property 1", description: "The request: product name, photo, quantity and unit, budget, status, closure reason, timestamps and offers. Which Figma state shows follows from these." },
  { name: "request.offers", type: "SellerOffer[]", figma: "One offer, Multiple offers, New Offer", description: "How many sellers responded, how many are unread (the “New Offer” badge) and the lowest price." },
  { name: "request.status", type: "\"active\" | \"closed\"", figma: "Expired with offers, Cancelled", description: "Active shows the countdown with Cancel and View Request / View Offer; closed shows when and why it closed, with View Request and Request Again." },
  { name: "now", type: "number", figma: "Expire soon", description: "Current time in ms. The countdown is worked out from it and turns red in the last hour." },
  { name: "onCancel", type: "() => void", figma: "—", description: "Cancel pressed (active requests). On My requests this opens the cancel confirmation." },
  { name: "onRequestAgain", type: "() => void", figma: "—", description: "Optional. Request Again pressed (closed requests). On My requests this opens the request form with the same details." },
  { name: "headingLevel", type: "2 | 3 | 4", figma: "—", description: "Heading level of the product name, to fit the page outline. Defaults to 2." },
];

export function RequestCardLibrary() {
  // Shares the requests clock so countdowns tick live, and renders after hydration so times never mismatch.
  useRequestClock();
  const { ready, now } = useRequests();
  const [lastAction, setLastAction] = useState("");

  return (
    <main className={docStyles.page}>
      <div className={docStyles.container}>
        <nav className={docStyles.breadcrumbSection} aria-label="Breadcrumb">
          <div className={docStyles.breadcrumb}>
            <Link href="/">Home</Link>
            <span className={docStyles.breadcrumbSeparator} aria-hidden>›</span>
            <span>Components</span>
            <span className={docStyles.breadcrumbSeparator} aria-hidden>›</span>
            <span className={docStyles.breadcrumbActive}>Request card</span>
          </div>
        </nav>

        <header className={docStyles.docHeader}>
          <h1 className={docStyles.title}>Request card</h1>
          <p className={docStyles.description}>
            One request on My requests: the product with its quantity and budget, how sellers have responded, then the time left and what the
            user can do next. Try every state in the playground.
          </p>
        </header>

        <p className={styles.lastAction} aria-live="polite">
          {lastAction}
        </p>

        <div className={docStyles.sectionsList}>
          <section id="playground" className={styles.group} aria-label="Playground">
            {ready ? (
              <RequestCardPlayground now={now} onAction={setLastAction} />
            ) : (
              <span className={requestStyles.bone} style={{ height: 560, borderRadius: 16 }} aria-hidden="true" />
            )}
          </section>

          <section id="props" className={styles.group} aria-labelledby="props-title">
            <div className={docStyles.sectionMeta}>
              <h2 id="props-title" className={docStyles.sectionTitle}>
                Props
              </h2>
              <p className={docStyles.sectionDescription}>
                <code>{"<RequestCard request={…} now={…} onCancel={…} onRequestAgain={…} />"}</code> from{" "}
                <code>@/components/requests/request-card</code>.
              </p>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.props}>
                <thead>
                  <tr>
                    <th scope="col">Prop</th>
                    <th scope="col">Type</th>
                    <th scope="col">Figma</th>
                    <th scope="col">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {PROPS.map((prop) => (
                    <tr key={prop.name}>
                      <td>
                        <code>{prop.name}</code>
                      </td>
                      <td>
                        <code>{prop.type}</code>
                      </td>
                      <td>{prop.figma}</td>
                      <td>{prop.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
