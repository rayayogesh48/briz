"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Inbox, LayoutGrid, List, Plus } from "lucide-react";
import { useRef, type KeyboardEvent } from "react";
import { openBrizRequest } from "@/components/request-product-widget";
import { requestsStore, useRequestClock, useRequests } from "@/store/requests-store";
import type { BrizRequest, RequestStatus } from "./request-data";
import { RequestCard, RequestCardSkeleton } from "./request-card";
import { LoadError, MessageState, RequestDialogs, RequestToast } from "./request-parts";
import { RequestPreviewControl } from "./request-preview-control";
import styles from "./requests.module.css";

const TABS: { id: RequestStatus; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "closed", label: "Closed" },
];

export function RequestList() {
  useRequestClock();
  const { ready, view, layout, requests, now } = useRequests();
  const router = useRouter();
  const pathname = usePathname();
  // The tab lives in the URL (/requests?tab=closed) so it survives refresh, back and forward.
  const tab: RequestStatus = useSearchParams().get("tab") === "closed" ? "closed" : "active";
  const tabRefs = useRef<Record<RequestStatus, HTMLButtonElement | null>>({ active: null, closed: null });

  const byStatus: Record<RequestStatus, BrizRequest[]> = {
    // Active: soonest to expire first. Closed: most recently closed first.
    active: requests.filter((request) => request.status === "active").sort((a, b) => a.expiresAt - b.expiresAt),
    closed: requests.filter((request) => request.status === "closed").sort((a, b) => (b.closedAt ?? 0) - (a.closedAt ?? 0)),
  };

  const selectTab = (next: RequestStatus) => {
    if (next !== tab) router.push(next === "active" ? pathname : `${pathname}?tab=closed`, { scroll: false });
  };

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next: RequestStatus = event.key === "Home" ? "active" : event.key === "End" ? "closed" : tab === "active" ? "closed" : "active";
    selectTab(next);
    tabRefs.current[next]?.focus();
  }

  const loading = !ready || view === "loading";
  const items = byStatus[tab];

  return (
    <main className={styles.page}>
      <header className={`${styles.pageHeader} ${styles.listHeader}`}>
        <div>
          <h1>My requests</h1>
          <p>Track your requests and compare offers from local sellers.</p>
        </div>
        {/* Requests are created in the floating widget; this just opens it. */}
        <button type="button" className={styles.outlineButton} onClick={() => openBrizRequest()}>
          <Plus size={18} aria-hidden="true" /> Request a product
        </button>
      </header>

      <div className={styles.tabsRow}>
        <div className={styles.tabs} role="tablist" aria-label="Requests by status">
          {TABS.map((item) => (
            <button
              key={item.id}
              ref={(node) => {
                tabRefs.current[item.id] = node;
              }}
              type="button"
              role="tab"
              id={`requests-tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls="requests-panel"
              tabIndex={tab === item.id ? 0 : -1}
              className={styles.tab}
              onClick={() => selectTab(item.id)}
              onKeyDown={handleTabKey}
            >
              {item.label}
              {!loading && view !== "error" && <span className={styles.count}>{byStatus[item.id].length}</span>}
            </button>
          ))}
        </div>
        <div className={styles.layoutToggle} role="group" aria-label="Layout">
          <button type="button" aria-pressed={layout === "list"} aria-label="List view" title="List view" onClick={() => requestsStore.setLayout("list")}>
            <List size={18} aria-hidden="true" />
          </button>
          <button type="button" aria-pressed={layout === "grid"} aria-label="Grid view" title="Grid view" onClick={() => requestsStore.setLayout("grid")}>
            <LayoutGrid size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="requests-panel" role="tabpanel" aria-labelledby={`requests-tab-${tab}`} className={styles.panel}>
        {loading ? (
          <div className={styles.cards} data-layout={layout} aria-busy="true" aria-label="Loading requests">
            {[0, 1, 2].map((index) => (
              <RequestCardSkeleton key={index} />
            ))}
          </div>
        ) : view === "error" ? (
          <LoadError />
        ) : items.length === 0 ? (
          tab === "active" ? (
            <MessageState
              icon={<Inbox size={22} aria-hidden="true" />}
              title="No active requests"
              description="Can’t find a product? Request it and let local sellers send you offers."
            >
              <button type="button" className={styles.primaryButton} onClick={() => openBrizRequest()}>
                Request a product
              </button>
            </MessageState>
          ) : (
            <MessageState
              icon={<Inbox size={22} aria-hidden="true" />}
              title="No closed requests"
              description="Your expired and cancelled requests will appear here."
            />
          )
        ) : (
          <ul className={styles.cards} data-layout={layout}>
            {items.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                now={now}
                onCancel={() => requestsStore.openDialog({ type: "cancel", requestId: request.id })}
                // Opens the widget with the same details; nothing is created until the user submits it.
                onRequestAgain={() =>
                  openBrizRequest({
                    itemName: request.itemName,
                    quantity: request.quantity,
                    unit: request.unit,
                    rate: String(request.budget),
                    details: request.description,
                  })
                }
              />
            ))}
          </ul>
        )}
      </div>

      <RequestDialogs />
      <RequestToast />
      <RequestPreviewControl />
    </main>
  );
}
