"use client";

// Request Details, built to Figma 2673:60936: breadcrumb, back link, the product,
// then the request card (state banner, facts, cancel) beside the seller offers.

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ChevronDown, Clock, SearchX, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { openBrizRequest } from "@/components/request-product-widget";
import { nextRequestVisit, requestsStore, useRequestClock, useRequests } from "@/store/requests-store";
import { formatCountdown, formatDateTime, formatRemaining, formatRs, offerStats, type SellerOffer } from "./request-data";
import { LoadError, MessageState, NewOffersPill, RequestDialogs, RequestThumb, RequestToast } from "./request-parts";
import { OfferCard } from "./offer-card";
import { EXPIRING_SOON } from "./request-card";
import { RequestPreviewControl } from "./request-preview-control";
import styles from "./requests.module.css";

export function RequestDetail() {
  useRequestClock();
  const { id } = useParams<{ id: string }>();
  const { ready, view, requests, now, justViewed, loadId } = useRequests();
  const request = requests.find((item) => item.id === id);
  const found = Boolean(request);

  // Opening the page marks the offers it shows as read, which clears this request's
  // pill and lowers the navbar badge. Offers arriving later stay unread.
  const [visit] = useState(nextRequestVisit);
  // Phones: the request card starts collapsed to the product and the timer.
  const [detailsOpen, setDetailsOpen] = useState(false);
  useEffect(() => {
    if (ready && found) requestsStore.viewRequest(id, visit);
  }, [ready, found, id, loadId, visit]);

  let content: React.ReactNode;

  if (!ready || view === "loading") {
    content = (
      <div className={styles.detailGrid} aria-busy="true" aria-label="Loading request">
        <span className={styles.bone} style={{ height: 360, borderRadius: 16 }} />
        <span className={styles.bone} style={{ height: 420, borderRadius: 16 }} />
      </div>
    );
  } else if (view === "error") {
    content = <LoadError />;
  } else if (!request) {
    content = (
      <MessageState
        icon={<SearchX size={22} aria-hidden="true" />}
        title="Request not found"
        description="This request doesn’t exist in the preview data. Requests created in the prototype are cleared when the page is refreshed."
      >
        <Link href="/requests" className={styles.primaryButton}>
          My requests
        </Link>
      </MessageState>
    );
  } else {
    const active = request.status === "active";
    const cancelled = request.closureReason === "cancelled";
    const stats = offerStats(request);
    const remaining = request.expiresAt - now;
    const soon = active && remaining < EXPIRING_SOON;
    // Offers still in play first, declined ones last; newest first inside each group.
    const offers = [...request.offers].sort(
      (a, b) => Number(a.status === "declined") - Number(b.status === "declined") || b.receivedAt - a.receivedAt,
    );
    const cancel = () => requestsStore.openDialog({ type: "cancel", requestId: request.id });
    // "New" covers offers still unread plus the ones this visit has just marked read.
    const isNew = (offer: SellerOffer) => !offer.isRead || justViewed.includes(offer.id);
    const newCount = request.offers.filter(isNew).length;
    // "Lowest price": the cheapest offer still in play (not declined), once there are two or more to compare.
    const openPrices = request.offers.filter((offer) => offer.status !== "declined").map((offer) => offer.price);
    const lowestOpen = openPrices.length >= 2 ? openPrices.reduce((min, price) => (price < min ? price : min), openPrices[0]) : null;
    const closedAt = request.closedAt ?? request.expiresAt;

    content = (
      <>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href={active ? "/requests" : "/requests?tab=closed"}>My requests</Link>
            </li>
            <li aria-current="page">Request Details</li>
          </ol>
        </nav>

        {/* Phones get a back link in place of the breadcrumb; both lead to My requests. */}
        <Link href={active ? "/requests" : "/requests?tab=closed"} className={styles.back}>
          <ArrowLeft size={20} strokeWidth={1.5} aria-hidden="true" /> My Requests
        </Link>

        {/* On phones the product and the request card read as one card, collapsed to the
            product and the timer; the toggle shows the rest. Wider screens show it all. */}
        <div className={styles.detailGrid} data-expanded={detailsOpen}>
          <header className={styles.detailProduct}>
            <RequestThumb src={request.image} size="large" />
            <div>
              <h1>{request.itemName}</h1>
              <p>
                {request.category && (
                  <>
                    {request.category}
                    <span aria-hidden="true"> · </span>
                  </>
                )}
                <span className={styles.noWrap}>Request {request.id}</span>
              </p>
            </div>
            <button
              type="button"
              className={styles.detailToggle}
              aria-expanded={detailsOpen}
              aria-controls="request-details"
              onClick={() => setDetailsOpen((open) => !open)}
            >
              <ChevronDown size={20} aria-hidden="true" />
              <span className={styles.srOnly}>Request details</span>
            </button>
          </header>

          <aside className={styles.summaryCard} aria-label="Request summary">
            {/* Banner: the request's state and, while active, a live countdown (red in the last hour). */}
            <div className={styles.detailBanner} data-tone={active ? (soon ? "soon" : undefined) : "closed"}>
              <Clock size={20} strokeWidth={1.5} aria-hidden="true" />
              <p>{active ? "Waiting for seller offers" : cancelled ? "Request cancelled" : "Request expired"}</p>
              {active && (
                <span className={styles.detailCountdown} aria-hidden="true">
                  {formatCountdown(remaining)}
                </span>
              )}
              {active && <span className={styles.srOnly}>Expires in {formatRemaining(remaining)}</span>}
            </div>

            <div id="request-details" className={styles.detailMore}>
              <div>
                <dl className={styles.facts}>
                  <div>
                    <dt>Qty x Rate</dt>
                    <dd>
                      {request.quantity.toLocaleString("en-IN")} x {formatRs(request.budget / request.quantity)}
                    </dd>
                  </div>
                  <div>
                    <dt>Total Amount</dt>
                    <dd>{formatRs(request.budget)}</dd>
                  </div>
                  {request.description.trim() && (
                    <div data-span="full">
                      <dt>Product details</dt>
                      <dd className={styles.factText}>{request.description}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Requested on</dt>
                    <dd>{formatDateTime(request.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>{active ? "Expires on" : cancelled ? "Cancelled on" : "Expired on"}</dt>
                    <dd>{formatDateTime(active ? request.expiresAt : closedAt)}</dd>
                  </div>
                </dl>

                {active && (
                  <button type="button" className={styles.cancelLink} onClick={cancel}>
                    Cancel Request
                  </button>
                )}
              </div>
            </div>
          </aside>

          <section id="offers" className={styles.offersColumn} aria-labelledby="offers-heading">
            <h2 id="offers-heading" className={styles.sectionTitle}>
              Seller offers
              <NewOffersPill count={newCount} />
            </h2>

            {stats.count > 0 && (
              <dl className={styles.stats}>
                <div>
                  <dt>Lowest offer</dt>
                  <dd>{stats.lowest === null ? "—" : formatRs(stats.lowest)}</dd>
                </div>
                <div>
                  <dt>Average offer</dt>
                  <dd>{stats.average === null ? "—" : formatRs(stats.average)}</dd>
                </div>
                <div>
                  <dt>Seller offers</dt>
                  <dd>{stats.count}</dd>
                </div>
              </dl>
            )}

            {offers.length === 0 ? (
              active ? (
                <MessageState
                  tone="searching"
                  icon={<Send size={22} aria-hidden="true" />}
                  title="Your request is out to nearby sellers"
                  description={`We’ll let you know as soon as the first offer arrives. Sellers can respond for the next ${formatRemaining(remaining)}.`}
                >
                  <Link href="/" className={styles.outlineButton}>
                    Continue browsing
                  </Link>
                </MessageState>
              ) : (
                <MessageState
                  icon={<SearchX size={22} aria-hidden="true" />}
                  title="No offers received"
                  description={
                    cancelled ? "This request was cancelled before a seller responded." : "This request expired before a seller responded."
                  }
                >
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() =>
                      // Opens the widget with the same details; nothing is created until the user submits it.
                      openBrizRequest({
                        itemName: request.itemName,
                        quantity: request.quantity,
                        unit: request.unit,
                        rate: String(request.budget),
                        details: request.description,
                      })
                    }
                  >
                    Request again
                  </button>
                </MessageState>
              )
            ) : (
              <>
                <ul className={styles.offers}>
                  {offers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      request={request}
                      now={now}
                      isNew={isNew(offer)}
                      isLowest={offer.status !== "declined" && offer.price === lowestOpen}
                      onInterested={() => requestsStore.openDialog({ type: "interest", requestId: request.id, offerId: offer.id })}
                      onDecline={() => requestsStore.openDialog({ type: "decline", requestId: request.id, offerId: offer.id })}
                      // Messaging isn't built yet; say so rather than doing nothing.
                      onViewConversation={() => requestsStore.showToast(`Chat with ${offer.storeName} isn’t connected in this preview yet`)}
                    />
                  ))}
                </ul>
                {active && request.offers.every((offer) => offer.status === "declined") && (
                  <p className={styles.notice} data-tone="info">
                    You&rsquo;ve declined every offer so far. New offers can still arrive until the request expires.
                  </p>
                )}
              </>
            )}
          </section>
        </div>
      </>
    );
  }

  return (
    <main className={styles.page} data-width="wide">
      {content}
      <RequestDialogs />
      <RequestToast />
      <RequestPreviewControl />
    </main>
  );
}
