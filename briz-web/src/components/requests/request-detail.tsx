"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BadgeCheck, Check, Clock, Hourglass, SearchX, Star, Store, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { openBrizRequest } from "@/components/request-product-widget";
import { nextRequestVisit, requestsStore, useRequestClock, useRequests } from "@/store/requests-store";
import {
  FULFILMENT_LABEL,
  MATCH_LABEL,
  formatAgo,
  formatDateTime,
  formatQuantity,
  formatRemaining,
  formatRs,
  offerStats,
  overBudget,
  type BrizRequest,
  type SellerOffer,
} from "./request-data";
import { LoadError, MessageState, NewOffersPill, RequestDialogs, RequestThumb, RequestToast, StatusBadge } from "./request-parts";
import { RequestPreviewControl } from "./request-preview-control";
import styles from "./requests.module.css";

const LONG_DESCRIPTION = 150;

function OfferCard({ offer, request, now, isNew }: { offer: SellerOffer; request: BrizRequest; now: number; isNew: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const over = overBudget(offer, request);
  const long = offer.description.length > LONG_DESCRIPTION;
  const open = request.status === "active" && offer.status === "pending";
  const initials = offer.storeName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return (
    <li className={styles.offer} data-status={offer.status}>
      <div className={styles.offerHead}>
        <span className={styles.storeLogo}>
          {offer.storeLogo ? <Image src={offer.storeLogo} width={44} height={44} alt="" /> : <span aria-hidden="true">{initials}</span>}
        </span>
        <div className={styles.storeText}>
          <h3>
            <span>{offer.storeName}</span>
            {offer.verified && <BadgeCheck size={16} className={styles.verified} aria-label="Verified seller" />}
          </h3>
          <p>
            <Star size={13} className={styles.star} aria-hidden="true" />
            <span aria-label={`Rated ${offer.rating} out of 5`}>{offer.rating.toFixed(1)}</span> · {offer.distanceKm.toFixed(1)} km away
          </p>
        </div>
        <div className={styles.offerPrice}>
          <strong>{formatRs(offer.price)}</strong>
          <span>Total offer price</span>
        </div>
      </div>

      <div className={styles.chips}>
        {isNew && <span className={styles.chip} data-tone="new">New</span>}
        <span className={styles.chip} data-tone={over > 0 ? "over" : "within"}>
          {over > 0 ? `${formatRs(over)} over budget` : "Within budget"}
        </span>
        <span className={styles.chip} data-tone={offer.match === "exact" ? "exact" : "neutral"}>
          {MATCH_LABEL[offer.match]}
        </span>
        {offer.fulfilment.map((method) => (
          <span key={method} className={styles.chip} data-tone="plain">
            {method === "delivery" ? <Truck size={14} aria-hidden="true" /> : <Store size={14} aria-hidden="true" />}
            {FULFILMENT_LABEL[method]}
          </span>
        ))}
      </div>

      <p className={styles.offerDescription} data-clamped={long && !expanded}>
        {offer.description}
      </p>
      {long && (
        <button type="button" className={styles.linkButton} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show less" : "Show more"}
        </button>
      )}

      <div className={styles.offerFoot}>
        <span className={styles.received}>Received {formatAgo(now - offer.receivedAt)}</span>
        {offer.status === "interested" ? (
          <span className={styles.offerState} data-status="interested">
            <Check size={15} strokeWidth={3} aria-hidden="true" /> You&rsquo;re interested
          </span>
        ) : offer.status === "declined" ? (
          <span className={styles.offerState} data-status="declined">
            Declined
          </span>
        ) : open ? (
          <div className={styles.offerActions}>
            <button
              type="button"
              className={styles.outlineButton}
              aria-label={`Decline offer from ${offer.storeName}`}
              onClick={() => requestsStore.openDialog({ type: "decline", requestId: request.id, offerId: offer.id })}
            >
              Decline
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              aria-label={`Interested in offer from ${offer.storeName}`}
              onClick={() => requestsStore.openDialog({ type: "interest", requestId: request.id, offerId: offer.id })}
            >
              Interested
            </button>
          </div>
        ) : (
          <span className={styles.offerState}>Request closed</span>
        )}
      </div>
    </li>
  );
}

export function RequestDetail() {
  useRequestClock();
  const { id } = useParams<{ id: string }>();
  const { ready, view, requests, now, justViewed, loadId } = useRequests();
  const request = requests.find((item) => item.id === id);
  const found = Boolean(request);

  // Opening the page marks the offers it shows as read, which clears this request's
  // pill and lowers the navbar badge. Offers arriving later stay unread.
  const [visit] = useState(nextRequestVisit);
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
    const stats = offerStats(request);
    const remaining = request.expiresAt - now;
    // Offers still in play first, declined ones last; newest first inside each group.
    const offers = [...request.offers].sort(
      (a, b) => Number(a.status === "declined") - Number(b.status === "declined") || b.receivedAt - a.receivedAt,
    );
    const cancel = () => requestsStore.openDialog({ type: "cancel", requestId: request.id });
    // "New" covers offers still unread plus the ones this visit has just marked read.
    const isNew = (offer: SellerOffer) => !offer.isRead || justViewed.includes(offer.id);
    const newCount = request.offers.filter(isNew).length;

    content = (
      <>
        <header className={styles.pageHeader}>
          <Link href={active ? "/requests" : "/requests?tab=closed"} className={styles.back}>
            <ArrowLeft size={18} aria-hidden="true" /> My requests
          </Link>
          <div className={styles.detailTitle}>
            <h1>{request.itemName}</h1>
            <StatusBadge request={request} />
          </div>
          <p>Request {request.id}</p>
        </header>

        {!active && (
          <div className={styles.notice} data-tone="closed" role="status">
            <Clock size={18} aria-hidden="true" />
            <div>
              <strong>{request.closureReason === "cancelled" ? "Request cancelled" : "This request has expired"}</strong>
              <p>
                {request.closureReason === "cancelled"
                  ? "You cancelled this request. It is no longer accepting offers, but you can still review the offers you received."
                  : "The 24-hour request window has ended. You can still review the offers received before it expired."}
              </p>
            </div>
          </div>
        )}

        <div className={styles.detailGrid}>
          <aside className={styles.summaryCard} aria-label="Request summary">
            <div className={styles.summaryTop}>
              <RequestThumb src={request.image} size="large" />
              <div>
                <p className={styles.summaryName}>{request.itemName}</p>
                {request.category && <p className={styles.hint}>{request.category}</p>}
              </div>
            </div>

            <p className={styles.expiry} data-tone={active ? (remaining < 60 * 60 * 1000 ? "soon" : "active") : "closed"} aria-live="off">
              <Clock size={16} aria-hidden="true" />
              {active
                ? `Request expires in ${formatRemaining(remaining)}`
                : request.closureReason === "cancelled"
                ? "Request cancelled"
                : "Request expired"}
            </p>

            <dl className={styles.facts}>
              <div>
                <dt>Quantity</dt>
                <dd>{formatQuantity(request)}</dd>
              </div>
              <div>
                <dt>Budget</dt>
                <dd>{formatRs(request.budget)}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDateTime(request.createdAt)}</dd>
              </div>
              <div>
                <dt>{active ? "Expires" : request.closureReason === "cancelled" ? "Cancelled" : "Expired"}</dt>
                <dd>{formatDateTime(active ? request.expiresAt : request.closedAt ?? request.expiresAt)}</dd>
              </div>
            </dl>

            <div className={styles.summaryDescription}>
              <h2>Product details</h2>
              <p>{request.description}</p>
            </div>

            {active && (
              <button type="button" className={styles.cancelLink} onClick={cancel}>
                Cancel request
              </button>
            )}
          </aside>

          <section id="offers" className={styles.offersColumn} aria-labelledby="offers-heading">
            <h2 id="offers-heading" className={styles.sectionTitle}>
              Seller offers
              <NewOffersPill count={newCount} />
            </h2>

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

            {offers.length === 0 ? (
              active ? (
                <MessageState
                  icon={<Hourglass size={22} aria-hidden="true" />}
                  title="Waiting for seller offers"
                  description={`Your request is active. Sellers can respond during the next ${formatRemaining(remaining)}.`}
                >
                  <Link href="/" className={styles.outlineButton}>
                    Continue browsing
                  </Link>
                  <button type="button" className={styles.outlineButton} data-tone="danger" onClick={cancel}>
                    Cancel request
                  </button>
                </MessageState>
              ) : (
                <MessageState
                  icon={<SearchX size={22} aria-hidden="true" />}
                  title="No offers received"
                  description={
                    request.closureReason === "cancelled"
                      ? "This request was cancelled before a seller responded."
                      : "This request expired before a seller responded."
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
                    <OfferCard key={offer.id} offer={offer} request={request} now={now} isNew={isNew(offer)} />
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
    <main className={styles.page}>
      {content}
      <RequestDialogs />
      <RequestToast />
      <RequestPreviewControl />
    </main>
  );
}
