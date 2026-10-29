"use client";

// A seller's offer on a request, used on the request detail page and documented
// with every state at /components/offer-card. Pure presentation: the caller owns
// what Interested and Decline do (on the detail page, a confirmation).

import Image from "next/image";
import { Check, Expand, FileText, Info, MapPin, MessageCircleMore, Package, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MATCH_LABEL, budgetComparison, formatAgo, formatDateTime, formatDistance, formatQuantity, formatReviews, formatRs, fulfilmentSummary, type BrizRequest, type SellerOffer } from "./request-data";
import styles from "./requests.module.css";

/** Icons exported from the "Seller Offer Card v2" Figma component (Briz Web design system, heroicons). */
const ICON = {
  verified: "/figma/offer-card/verified.svg",
  star: "/figma/offer-card/star.svg",
  dot: "/figma/offer-card/dot.svg",
  pin: "/figma/offer-card/map-pin.svg",
  trend: "/figma/offer-card/trending-down.svg",
  pickup: "/figma/offer-card/shopping-bag-speed.svg",
  delivery: "/figma/offer-card/delivery-truck-speed.svg",
  expand: "/figma/offer-card/arrows-pointing-out.svg",
  clock: "/figma/offer-card/clock.svg",
};

/** A design-exported icon at its own size; decorative unless given a label. */
function FigmaIcon({ src, size, label }: { src: string; size: number; label?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- small static SVG from Figma
  return <img src={src} width={size} height={size} alt={label ?? ""} aria-hidden={label ? undefined : true} className={styles.figmaIcon} />;
}

/** "Store Pickup Only" / "Online Delivery Only" / "Online Delivery Available": one chip for how the product is handed over. */
function FulfilmentChip({ offer }: { offer: SellerOffer }) {
  const { kind, label } = fulfilmentSummary(offer.fulfilment);
  return (
    <span className={styles.chip} data-tone="fulfilment">
      <span className={styles.chipIcon}>
        <FigmaIcon src={kind === "pickup" ? ICON.pickup : ICON.delivery} size={16} />
      </span>
      {label}
    </span>
  );
}

/** Store initials, shown when the seller has no logo. */
const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

function StoreLogo({ offer, large = false }: { offer: SellerOffer; large?: boolean }) {
  const size = large ? 56 : 44;
  return (
    <span className={styles.storeLogo} data-size={large ? "large" : undefined}>
      {offer.storeLogo ? <Image src={offer.storeLogo} width={size} height={size} alt="" /> : <span aria-hidden="true">{initialsOf(offer.storeName)}</span>}
    </span>
  );
}

/** Total price, then the saving against the budget, "On budget", or nothing when it's over. An optional label goes last. */
function OfferPrice({ offer, request, label }: { offer: SellerOffer; request: BrizRequest; label?: string }) {
  const budget = budgetComparison(offer, request);
  return (
    <div className={styles.offerPrice}>
      <strong>{formatRs(offer.price)}</strong>
      {budget.kind === "save" && (
        <span className={styles.saving}>
          <s>
            <span className={styles.srOnly}>Budget </span>
            {formatRs(request.budget)}
          </s>
          <span className={styles.savingPercent}>Save {budget.percent}%</span>
        </span>
      )}
      {budget.kind === "on" && <span className={styles.onBudget}>On budget</span>}
      {label && <span className={styles.priceLabel}>{label}</span>}
    </div>
  );
}

/** Native <dialog> driven by `open`: focus trap, Escape and the backdrop come from the browser. */
function Modal({ open, onClose, label, className, children }: { open: boolean; onClose: () => void; label: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Land on the dialog's title when it has one, so it's announced and no button shows a focus ring.
      dialog.querySelector<HTMLElement>("[data-initial-focus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${className ?? ""}`}
      aria-label={label}
      // Only a close the user made (Escape, backdrop) reports back; closing because `open`
      // turned false must not, or switching straight to another dialog would cancel it.
      onClose={() => {
        if (open) onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      {open && children}
    </dialog>
  );
}

/**
 * The seller's product photo, square. Clicking it opens a full-size preview on a
 * dark backdrop; Escape, the close button or a click outside the photo closes it.
 */
export function OfferPhoto({ src, storeName, variant = "thumb" }: { src: string; storeName: string; variant?: "thumb" | "full" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={styles.offerPhoto} data-variant={variant} aria-label={`View photo from ${storeName}`} onClick={() => setOpen(true)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- mock asset or a seller upload */}
        <img src={src} alt="" />
        <span className={styles.offerPhotoHint} aria-hidden="true">
          {variant === "full" ? (
            <>
              <Expand size={14} />
              View photo
            </>
          ) : (
            <FigmaIcon src={ICON.expand} size={20} />
          )}
        </span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} label={`Photo from ${storeName}`} className={styles.lightbox}>
        <figure className={styles.lightboxFigure}>
          {/* eslint-disable-next-line @next/next/no-img-element -- mock asset or a seller upload */}
          <img src={src} alt={`Product photo sent by ${storeName}`} />
          <figcaption>Photo from {storeName}</figcaption>
        </figure>
        <button type="button" className={styles.lightboxClose} aria-label="Close photo" onClick={() => setOpen(false)}>
          <X size={22} aria-hidden="true" />
        </button>
      </Modal>
    </>
  );
}

/**
 * The top of an offer: the store and its price, the tags, the seller's note and
 * their photo. Shared by the offer card and the Interested dialog so both read the same.
 */
export function OfferSummary({
  offer,
  request,
  isNew = false,
  isLowest = false,
  headingLevel = 3,
}: {
  offer: SellerOffer;
  request: BrizRequest;
  isNew?: boolean;
  isLowest?: boolean;
  headingLevel?: 2 | 3 | 4;
}) {
  const Heading = `h${headingLevel}` as const;
  const [expanded, setExpanded] = useState(false);
  const long = offer.description.length > LONG_DESCRIPTION;

  return (
    <>
        <div className={styles.offerHead}>
          <StoreLogo offer={offer} />
          <div className={styles.storeText}>
            <Heading className={styles.storeName}>
              <span>{offer.storeName}</span>
              {offer.verified && <FigmaIcon src={ICON.verified} size={18} label="Verified seller" />}
            </Heading>
            <p className={styles.storeMeta}>
              <span className={styles.rating}>
                <FigmaIcon src={ICON.star} size={14} />
                <span aria-label={`Rated ${offer.rating} out of 5`}>{offer.rating.toFixed(1)}</span>
                {offer.reviewCount !== undefined && <span aria-label={formatReviews(offer.reviewCount)}>({offer.reviewCount.toLocaleString("en-IN")})</span>}
              </span>
              <FigmaIcon src={ICON.dot} size={4} />
              <span className={styles.distance}>
                <FigmaIcon src={ICON.pin} size={14} />
                {formatDistance(offer.distanceKm)}
              </span>
            </p>
          </div>
          <OfferPrice offer={offer} request={request} />
        </div>

        <div className={styles.chips}>
          {isNew && <span className={styles.chip} data-tone="new">New</span>}
          {isLowest && (
            <span className={styles.chip} data-tone="lowest">
              <FigmaIcon src={ICON.trend} size={14} />
              Lowest price
            </span>
          )}
          <FulfilmentChip offer={offer} />
        </div>

        {/* The seller's note (when they wrote one), then their photo (square) when they sent one. */}
        {offer.description && (
          <div className={styles.offerMessage}>
            <p className={styles.offerDescription} data-clamped={long && !expanded}>
              {offer.description}
            </p>
            {long && (
              <button type="button" className={styles.linkButton} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}
        {offer.image && <OfferPhoto src={offer.image} storeName={offer.storeName} />}
    </>
  );
}

/** Descriptions longer than this are clamped with "Show more". */
export const LONG_DESCRIPTION = 150;

export function OfferCard({
  offer,
  request,
  now,
  isNew,
  isLowest = false,
  onInterested,
  onDecline,
  onViewConversation,
  headingLevel = 3,
}: {
  offer: SellerOffer;
  /** The request it answers: decides budget difference and whether the offer can still be acted on. */
  request: BrizRequest;
  now: number;
  /** Unread, or read during this visit: shows the "New" tag. */
  isNew: boolean;
  /** The cheapest offer still open on its request: shows "Lowest price". */
  isLowest?: boolean;
  onInterested: () => void;
  onDecline: () => void;
  /** Shown once the user is interested: opens the conversation with the seller. */
  onViewConversation?: () => void;
  /** Heading level of the store name, to fit the page's outline. */
  headingLevel?: 3 | 4;
}) {
  const open = request.status === "active" && offer.status === "pending";

  return (
    <li className={styles.offer} data-status={offer.status}>
      <OfferSummary offer={offer} request={request} isNew={isNew} isLowest={isLowest} headingLevel={headingLevel} />

      <div className={styles.offerFoot}>
        <span className={styles.received}>
          <FigmaIcon src={ICON.clock} size={20} />
          Received{" "}
          <time dateTime={new Date(offer.receivedAt).toISOString()} title={formatDateTime(offer.receivedAt)}>
            {formatAgo(now - offer.receivedAt)}
          </time>
        </span>
        {offer.status === "interested" ? (
          // Interested: the next step is talking to the seller.
          <button type="button" className={styles.mutedButton} onClick={onViewConversation}>
            View Conversation
          </button>
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
              onClick={onDecline}
            >
              Decline
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              aria-label={`Interested in offer from ${offer.storeName}`}
              onClick={onInterested}
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

/**
 * The confirmation shown when the user taps Interested, after the mobile app.
 * Title bar; the store and its price against the budget; the request it answers;
 * the seller's note; their photo ("Is this what you're looking for?"); what
 * happens next; then the actions, pinned. With a photo on a wide screen it splits
 * into two columns, photo on the left, so nothing needs scrolling.
 */
export function OfferConfirmation({
  offer,
  request,
  onClose,
  onInterested,
  onDecline,
}: {
  offer: SellerOffer;
  request: BrizRequest;
  onClose: () => void;
  onInterested: () => void;
  onDecline: () => void;
}) {
  return (
    <div className={styles.confirm} data-photo={Boolean(offer.image)}>
      <div className={styles.confirmBar}>
        <h2 tabIndex={-1} data-initial-focus>
          Review offer
        </h2>
        <button type="button" className={styles.iconButton} aria-label="Close" onClick={onClose}>
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.confirmBody}>
        <div className={styles.confirmDetails}>
          <div className={styles.confirmHead}>
            <StoreLogo offer={offer} large />
            <div className={styles.confirmStore}>
              <h3 className={styles.storeName}>
                <span>{offer.storeName}</span>
                {offer.verified && <FigmaIcon src={ICON.verified} size={18} label="Verified seller" />}
              </h3>
              <p>
                <FigmaIcon src={ICON.star} size={14} />
                <span aria-label={`Rated ${offer.rating} out of 5`}>{offer.rating.toFixed(1)}</span>
                {offer.reviewCount !== undefined && <span>({formatReviews(offer.reviewCount)})</span>}
              </p>
              <p>
                <MapPin size={15} aria-hidden="true" />
                {formatDistance(offer.distanceKm)}
              </p>
            </div>
          </div>

          <div className={styles.confirmDeal}>
            <OfferPrice offer={offer} request={request} label={`Total for ${formatQuantity(request)}`} />
            <div className={styles.chips}>
              <span className={styles.chip} data-tone={offer.match === "exact" ? "exact" : "neutral"}>
                {MATCH_LABEL[offer.match]}
              </span>
              <FulfilmentChip offer={offer} />
            </div>
          </div>

          {/* The request this answers, so the user knows what they're deciding on. */}
          <div className={styles.confirmRequest}>
            <span className={styles.confirmRequestThumb} aria-hidden="true">
              {request.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- mock asset or a local object URL
                <img src={request.image} alt="" />
              ) : (
                <Package size={18} />
              )}
            </span>
            <span className={styles.confirmRequestText}>
              <span>Your request</span>
              <strong>{request.itemName}</strong>
              <span>
                {formatQuantity(request)} · Budget {formatRs(request.budget)}
              </span>
            </span>
          </div>

          <div className={styles.confirmNote}>
            <p className={styles.confirmLabel}>
              <FileText size={16} aria-hidden="true" />
              Seller&rsquo;s note
            </p>
            <p className={styles.confirmNoteText}>{offer.description}</p>
          </div>
        </div>

        {/* After the note in reading order; on wide screens the grid moves it to the left column. */}
        {offer.image && (
          <div className={styles.confirmPhoto}>
            <p className={styles.confirmLabel}>Is this what you&rsquo;re looking for?</p>
            <OfferPhoto src={offer.image} storeName={offer.storeName} variant="full" />
          </div>
        )}
      </div>

      <div className={styles.confirmFoot}>
        <p className={styles.confirmNext}>
          <Info size={15} aria-hidden="true" />
          <span>
            We&rsquo;ll let {offer.storeName} know you&rsquo;re interested. Your other offers stay open.
          </span>
        </p>
        <div className={styles.confirmActions}>
          <button type="button" className={styles.softDangerButton} onClick={onDecline}>
            Decline
          </button>
          <button type="button" className={styles.confirmButton} onClick={onInterested}>
            <Check size={18} strokeWidth={2.5} aria-hidden="true" />
            I&rsquo;m interested
          </button>
        </div>
      </div>
    </div>
  );
}

/** The confirmation as a modal: centred on desktop (wider with a photo), full screen on phones. */
export function OfferConfirmationDialog({
  open,
  ...props
}: { open: boolean } & Parameters<typeof OfferConfirmation>[0]) {
  return (
    <Modal
      open={open}
      onClose={props.onClose}
      label={`Offer from ${props.offer.storeName}`}
      className={`${styles.confirmDialog} ${props.offer.image ? styles.confirmDialogWide : ""}`}
    >
      <OfferConfirmation {...props} />
    </Modal>
  );
}

/** What the message box starts with; the user can change it before sending. */
export const INTEREST_MESSAGE = "Hi! I’m interested in ordering this product. Is this still available?";
const MESSAGE_LIMIT = 500;

/**
 * "Interested in this offer?", after the mobile app (Dev Briz 40016514:3379): the
 * store, its price against the budget and the seller's note, then a message to the
 * seller, prefilled, and Send Message. Sending marks the offer as interested.
 */
export function InterestedMessage({
  offer,
  request,
  onClose,
  onSend,
}: {
  offer: SellerOffer;
  request: BrizRequest;
  onClose: () => void;
  onSend: (message: string) => void;
}) {
  const [message, setMessage] = useState(INTEREST_MESSAGE);
  const empty = message.trim() === "";

  return (
    <form
      className={styles.interest}
      onSubmit={(event) => {
        event.preventDefault();
        if (!empty) onSend(message.trim());
      }}
    >
      <div className={styles.interestBar}>
        <h2 tabIndex={-1} data-initial-focus>
          Interested in this offer?
        </h2>
        <button type="button" className={styles.iconButton} aria-label="Close" onClick={onClose}>
          <X size={22} aria-hidden="true" />
        </button>
      </div>

      {/* The same card the offers list shows, without its actions. */}
      <div className={styles.offers}>
        <div className={styles.offer}>
          <OfferSummary offer={offer} request={request} />
        </div>
      </div>

      <label className={styles.interestLabel} htmlFor={`interest-message-${offer.id}`}>
        <MessageCircleMore size={20} aria-hidden="true" />
        Send a message to the seller
      </label>
      <textarea
        id={`interest-message-${offer.id}`}
        className={styles.interestMessage}
        value={message}
        maxLength={MESSAGE_LIMIT}
        rows={3}
        onChange={(event) => setMessage(event.target.value)}
      />

      <button type="submit" className={`${styles.primaryButton} ${styles.interestSend}`} disabled={empty}>
        Send Message
      </button>
    </form>
  );
}

/** The message dialog as a modal: centred on wider screens, a bottom sheet on phones. */
export function InterestedMessageDialog({ open, ...props }: { open: boolean } & Parameters<typeof InterestedMessage>[0]) {
  return (
    <Modal open={open} onClose={props.onClose} label={`Interested in the offer from ${props.offer.storeName}`} className={styles.interestDialog}>
      <InterestedMessage {...props} />
    </Modal>
  );
}
