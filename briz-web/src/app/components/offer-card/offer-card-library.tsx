"use client";

import Link from "next/link";
import { useState } from "react";
import requestStyles from "@/components/requests/requests.module.css";
import { useRequestClock, useRequests } from "@/store/requests-store";
import docStyles from "../product-category-list/component-doc.module.css";
import styles from "../library.module.css";
import { OfferCardPlayground } from "./offer-card-playground";

/** The OfferCard API, with the Figma property each prop drives. */
const PROPS = [
  { name: "offer", type: "SellerOffer", figma: "Store name, Verified, Seller note, Photo, Fulfilment", description: "The offer: store, logo, verified, rating and review count, distance, fulfilment, the seller’s note and optional photo, total price and when it arrived." },
  { name: "offer.status", type: "\"pending\" | \"interested\"", figma: "Status", description: "Pending shows Decline and Interested; interested shows View Conversation." },
  { name: "offer.image", type: "string | null", figma: "Photo", description: "Optional photo from the seller, shown square under the note. Clicking it opens a full-size preview." },
  { name: "offer.description", type: "string", figma: "Note, Seller note", description: "The seller’s note. Empty hides it." },
  { name: "request", type: "BrizRequest", figma: "Budget, Budget price, Saving", description: "The request the offer answers. Its budget sets what shows under the price: the crossed-out budget and saving, On budget, or nothing when over." },
  { name: "now", type: "number", figma: "Received", description: "Current time in ms, for “Received … ago”." },
  { name: "isNew", type: "boolean", figma: "New", description: "Shows the “New” chip: unread, or read during the current visit." },
  { name: "isLowest", type: "boolean", figma: "Lowest price", description: "Shows “Lowest price”: the cheapest open offer, when there are two or more. Defaults to false." },
  { name: "onInterested", type: "() => void", figma: "—", description: "Interested pressed. On the request page this opens the Interested confirmation." },
  { name: "onDecline", type: "() => void", figma: "—", description: "Decline pressed. On the request page this opens the decline confirmation." },
  { name: "onViewConversation", type: "() => void", figma: "—", description: "Optional. View Conversation pressed, once the user is interested." },
  { name: "headingLevel", type: "3 | 4", figma: "—", description: "Heading level of the store name, to fit the page outline. Defaults to 3." },
];

export function OfferCardLibrary() {
  // Shares the requests clock so "Received … ago" stays current, and renders after hydration so times never mismatch.
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
            <span className={docStyles.breadcrumbActive}>Seller offer card</span>
          </div>
        </nav>

        <header className={docStyles.docHeader}>
          <h1 className={docStyles.title}>Seller offer card</h1>
          <p className={docStyles.description}>
            One seller’s offer on a request detail page: the store, the price against the budget, the offer’s chips, the seller’s note and
            photo, then when it arrived and what the user can do next. Try every state in the playground.
          </p>
        </header>

        <p className={styles.lastAction} aria-live="polite">
          {lastAction}
        </p>

        <div className={docStyles.sectionsList}>
          <section id="playground" className={styles.group} aria-label="Playground">
            {ready ? (
              <OfferCardPlayground now={now} onAction={setLastAction} />
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
                <code>{"<OfferCard offer={…} request={…} now={…} isNew={…} onInterested={…} onDecline={…} />"}</code> from{" "}
                <code>@/components/requests/offer-card</code>.
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
