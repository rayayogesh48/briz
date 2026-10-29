"use client";

import Link from "next/link";
import { useState } from "react";
import requestStyles from "@/components/requests/requests.module.css";
import { useRequestClock, useRequests } from "@/store/requests-store";
import docStyles from "../product-category-list/component-doc.module.css";
import styles from "../library.module.css";
import { NotificationPlayground } from "./notification-playground";

/** The NotificationItem API, with the Figma property each field drives. */
const PROPS = [
  { name: "item", type: "BrizNotification", figma: "—", description: "The notification. Its fields are below." },
  { name: "item.type", type: "\"offer\" | \"reminder\" | \"expired\" | \"reactivation\" | \"promotion\"", figma: "Type", description: "The spec type: sets the icon and its tile colour." },
  { name: "item.unread", type: "boolean", figma: "State", description: "Unread adds the tint, the bold title and the dot." },
  { name: "item.title / item.body", type: "string", figma: "Title, Body", description: "The body is clamped to 2 lines." },
  { name: "item.createdAt", type: "number", figma: "Time", description: "When it arrived; shown as “2 min ago”, “Yesterday”, “Mon”, then “12 Oct”." },
  { name: "item.href", type: "string", figma: "—", description: "Where the whole row goes when opened." },
  { name: "item.external", type: "boolean", figma: "External link", description: "The row opens outside Briz, in a new tab." },
  { name: "item.media", type: "{ kind: \"image\" | \"video\"; src; alt }", figma: "Media, Video", description: "A promotion image, or a video poster with a play badge, as a 3:1 strip." },
  { name: "item.actions", type: "NotificationAction[]", figma: "CTA, Second CTA, CTA 1, CTA 2", description: "Buttons, only when they do more than open the row: start a request (Create New Request, Create a Request), go elsewhere (Browse Shops) or leave Briz (Open Link)." },
  { name: "now", type: "number", figma: "Time", description: "Current time in ms, for the relative time." },
  { name: "onOpen", type: "() => void", figma: "—", description: "Runs when the row or a button is used: in the navbar it marks the notification read and closes the panel." },
];

export function NotificationLibrary() {
  // Shares the requests clock so the relative time stays current, and renders after hydration so times never mismatch.
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
            <span className={docStyles.breadcrumbActive}>Notification</span>
          </div>
        </nav>

        <header className={docStyles.docHeader}>
          <h1 className={docStyles.title}>Notification</h1>
          <p className={docStyles.description}>
            One row in the navbar notification panel: the type&rsquo;s icon, title, body, any promotion image or video, buttons when they
            do more than open the row, and when it arrived. Pick a Type to load its copy from the notification spec, then try every state.
          </p>
        </header>

        <p className={styles.lastAction} aria-live="polite">
          {lastAction}
        </p>

        <div className={docStyles.sectionsList}>
          <section id="playground" className={styles.group} aria-label="Playground">
            {ready ? (
              <NotificationPlayground now={now} onAction={setLastAction} />
            ) : (
              <span className={requestStyles.bone} style={{ height: 420, borderRadius: 16 }} aria-hidden="true" />
            )}
          </section>

          <section id="props" className={styles.group} aria-labelledby="props-title">
            <div className={docStyles.sectionMeta}>
              <h2 id="props-title" className={docStyles.sectionTitle}>
                Props
              </h2>
              <p className={docStyles.sectionDescription}>
                <code>{"<NotificationItem item={…} now={…} onOpen={…} />"}</code> from{" "}
                <code>@/components/notifications/notification-item</code>, inside a{" "}
                <code>{"<ul>"}</code>.
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
