"use client";

// The request card used by My requests, built to the "Request Card Componnet" Figma
// component, with a props playground at /components/request-card. Pure
// presentation: the caller owns what Cancel and Request Again do.

import Link from "next/link";
import { formatDateTime, formatRemaining, formatRs, offerStats, type BrizRequest } from "./request-data";
import { RequestThumb } from "./request-parts";
import styles from "./requests.module.css";

/** Under this much time left, the countdown turns red. */
export const EXPIRING_SOON = 60 * 60 * 1000;

/** Icons exported from the Figma component (Briz Web design system). */
const ICON = {
  dot: "/figma/request-card/dot.svg",
  budget: "/figma/request-card/budget.svg",
  sellers: "/figma/request-card/sellers.svg",
  bell: "/figma/request-card/bell.svg",
  tag: "/figma/request-card/tag.svg",
  clock: "/figma/request-card/clock.svg",
  clockSoon: "/figma/request-card/clock-soon.svg",
  clockClosed: "/figma/request-card/clock-closed.svg",
};

function FigmaIcon({ src, size }: { src: string; size: number }) {
  // eslint-disable-next-line @next/next/no-img-element -- small static SVG from Figma
  return <img src={src} width={size} height={size} alt="" aria-hidden="true" className={styles.figmaIcon} />;
}

/** "Qty: 2": the number only, as in Figma. */
export const quantityLabel = (request: Pick<BrizRequest, "quantity">) => request.quantity.toLocaleString("en-IN");

/**
 * Card: the product (photo, name, quantity · budget), the offers (how many sellers
 * responded, any new ones, the lowest price), then the time and the actions.
 */
export function RequestCard({
  request,
  now,
  onCancel,
  onRequestAgain,
  headingLevel = 2,
}: {
  request: BrizRequest;
  now: number;
  onCancel: () => void;
  /** Closed requests offer to start the same request again. */
  onRequestAgain?: () => void;
  /** Heading level of the product name, to fit the page's outline. */
  headingLevel?: 2 | 3 | 4;
}) {
  const Heading = `h${headingLevel}` as const;
  const { count, unread, lowest } = offerStats(request);
  const active = request.status === "active";
  const soon = active && request.expiresAt - now < EXPIRING_SOON;
  const href = `/requests/${request.id}`;
  const cancelled = request.closureReason === "cancelled";

  return (
    <li className={styles.card}>
      <div className={styles.cardHead}>
        <RequestThumb src={request.image} size="small" />
        <div className={styles.cardMain}>
          <Heading className={styles.cardTitle}>
            <Link href={href}>{request.itemName}</Link>
          </Heading>
          <p className={styles.cardLine}>
            <span>
              Qty: <strong>{quantityLabel(request)}</strong>
            </span>
            <FigmaIcon src={ICON.dot} size={4} />
            <span className={styles.cardBudget}>
              <FigmaIcon src={ICON.budget} size={16} />
              <span className={styles.srOnly}>Budget </span>
              {formatRs(request.budget)}
            </span>
          </p>
        </div>
      </div>

      <ul className={styles.cardFacts}>
        <li>
          <FigmaIcon src={ICON.sellers} size={20} />
          {count === 0 ? (
            <span className={styles.cardMuted}>{active ? "No offers yet" : "No offers received"}</span>
          ) : (
            <span>
              {count} <span className={styles.cardMuted}>{count === 1 ? "Seller has sent offer" : "Sellers have sent offer"}</span>
            </span>
          )}
          {unread > 0 && (
            <span className={styles.cardNewBadge}>
              <FigmaIcon src={ICON.bell} size={14} />
              {unread} New {unread === 1 ? "Offer" : "Offers"}
            </span>
          )}
        </li>
        {lowest !== null && (
          <li>
            <FigmaIcon src={ICON.tag} size={20} />
            <span>
              <span className={styles.cardMuted}>Lowest offer</span> {formatRs(lowest)}
            </span>
          </li>
        )}
      </ul>

      <div className={styles.cardFoot}>
        {/* The time says the status: a countdown while active (red in the last hour), when and why once closed. */}
        <p className={styles.cardExpiry} data-tone={active ? (soon ? "soon" : undefined) : "closed"}>
          <FigmaIcon src={active ? (soon ? ICON.clockSoon : ICON.clock) : ICON.clockClosed} size={20} />
          {active
            ? `Expires in ${formatRemaining(request.expiresAt - now)}`
            : `${cancelled ? "Cancelled" : "Expired"} ${formatDateTime(request.closedAt ?? request.expiresAt)}`}
        </p>
        <div className={styles.cardActions}>
          {active ? (
            <>
              <button type="button" className={styles.outlineButton} aria-label={`Cancel request: ${request.itemName}`} onClick={onCancel}>
                Cancel
              </button>
              {/* "View Offer" lands on the offers section of the same detail page. */}
              <Link href={count > 0 ? `${href}#offers` : href} className={count > 0 ? styles.primaryButton : styles.outlineButton}>
                {count > 0 ? "View Offer" : "View Request"}
              </Link>
            </>
          ) : (
            <>
              <Link href={href} className={styles.outlineButton}>
                View Request
              </Link>
              <button type="button" className={styles.primaryButton} aria-label={`Request again: ${request.itemName}`} onClick={onRequestAgain}>
                Request Again
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

/** Loading placeholder with the card's shape: photo and title, two facts, footer. */
export function RequestCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.bone} style={{ width: 56, height: 56, borderRadius: 12, flex: "none" }} />
        <div className={styles.cardMain}>
          <span className={styles.bone} style={{ width: "60%", height: 20 }} />
          <span className={styles.bone} style={{ width: 160, height: 14 }} />
        </div>
      </div>
      <div className={styles.cardFacts}>
        {[170, 150].map((width) => (
          <span key={width} className={styles.bone} style={{ width, height: 16 }} />
        ))}
      </div>
      <div className={styles.cardFoot}>
        <span className={styles.bone} style={{ width: 150, height: 18 }} />
        <span className={styles.bone} style={{ width: 160, height: 40, borderRadius: 12 }} />
      </div>
    </div>
  );
}
