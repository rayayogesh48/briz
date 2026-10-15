"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Clock, Inbox, LayoutGrid, List, Plus } from "lucide-react";
import { useRef, type KeyboardEvent } from "react";
import { openBrizRequest } from "@/components/request-product-widget";
import { requestsStore, useRequestClock, useRequests } from "@/store/requests-store";
import { formatQuantity, formatRemaining, formatRs, offerCountLabel, offerStats, type BrizRequest, type RequestStatus } from "./request-data";
import { ListSkeleton, LoadError, MessageState, NewOffersPill, RequestDialogs, RequestThumb, RequestToast, StatusBadge } from "./request-parts";
import { RequestPreviewControl } from "./request-preview-control";
import styles from "./requests.module.css";

const TABS: { id: RequestStatus; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "closed", label: "Closed" },
];

function RequestCard({ request, now }: { request: BrizRequest; now: number }) {
  const { count, unread } = offerStats(request);
  const active = request.status === "active";
  const href = `/requests/${request.id}`;
  return (
    <li className={styles.card}>
      <div className={styles.cardHead}>
        <RequestThumb src={request.image} size="small" />
        <div className={styles.cardMain}>
          <h2 className={styles.cardTitle}>
            <Link href={href}>{request.itemName}</Link>
          </h2>
          <p className={styles.cardLine}>
            {formatQuantity(request)} · Budget {formatRs(request.budget)}
          </p>
        </div>
      </div>
      <div className={styles.cardInfo}>
        <p className={styles.cardStatus}>
          <StatusBadge request={request} />
          {active && (
            <span className={styles.countdown}>
              <Clock size={14} aria-hidden="true" />
              Expires in {formatRemaining(request.expiresAt - now)}
            </span>
          )}
        </p>
        <p className={styles.cardOffers} data-empty={count === 0}>
          {offerCountLabel(count)}
          <NewOffersPill count={unread} />
        </p>
      </div>
      <div className={styles.cardActions}>
        {active && (
          <button
            type="button"
            className={styles.outlineButton}
            aria-label={`Cancel request: ${request.itemName}`}
            onClick={() => requestsStore.openDialog({ type: "cancel", requestId: request.id })}
          >
            Cancel
          </button>
        )}
        {/* "View offers" lands on the offers section of the same detail page. */}
        <Link href={active && count > 0 ? `${href}#offers` : href} className={active && count > 0 ? styles.primaryButton : styles.outlineButton}>
          {active && count > 0 ? "View offers" : "View request"}
        </Link>
      </div>
    </li>
  );
}

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
          <ListSkeleton layout={layout} />
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
              <RequestCard key={request.id} request={request} now={now} />
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
