"use client";

// Pieces shared by the request list, detail and create screens.

import Link from "next/link";
import { BellDot, CircleAlert, Package, X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { requestsStore, useRequests } from "@/store/requests-store";
import { formatRs, newOfferLabel, type BrizRequest } from "./request-data";
import styles from "./requests.module.css";

export function RequestThumb({ src, size = "medium" }: { src: string | null; size?: "small" | "medium" | "large" }) {
  return (
    <span className={styles.thumb} data-size={size}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- mock asset or a local object URL
        <img src={src} alt="" />
      ) : (
        <Package size={size === "large" ? 32 : 22} aria-hidden="true" />
      )}
    </span>
  );
}

export function StatusBadge({ request }: { request: BrizRequest }) {
  if (request.status === "active") return <span className={styles.badge} data-tone="active">Active</span>;
  return (
    <span className={styles.badge} data-tone="closed">
      Closed · {request.closureReason === "cancelled" ? "Cancelled" : "Expired"}
    </span>
  );
}

/** Native <dialog>: focus trap, Escape and the backdrop come from the browser. */
export function ConfirmDialog({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className={styles.dialogBody}>
          <h2 id={titleId}>{title}</h2>
          {children}
        </div>
      )}
    </dialog>
  );
}

/** The three confirmations. Which one is open lives in the store so any screen (or preview state) can raise it. */
export function RequestDialogs() {
  const { dialog, requests } = useRequests();
  const request = dialog ? requests.find((item) => item.id === dialog.requestId) : undefined;
  // If the request expires or is closed while a confirmation is open, the action no longer applies.
  const live = request?.status === "active" ? dialog : null;
  const offer = live && live.type !== "cancel" ? request?.offers.find((item) => item.id === live.offerId) : undefined;
  const close = requestsStore.closeDialog;

  useEffect(() => {
    if (dialog && !live) requestsStore.closeDialog();
  }, [dialog, live]);

  return (
    <>
      <ConfirmDialog open={live?.type === "cancel"} title="Cancel this request?" onClose={close}>
        <p>Your request will close and stop accepting new seller offers.</p>
        <div className={styles.dialogActions}>
          <button type="button" className={styles.outlineButton} onClick={close}>
            Keep request
          </button>
          <button type="button" className={styles.dangerButton} onClick={() => live && requestsStore.cancel(live.requestId)}>
            Cancel request
          </button>
        </div>
      </ConfirmDialog>

      <ConfirmDialog open={live?.type === "interest" && Boolean(offer)} title="Interested in this offer?" onClose={close}>
        <p>You&rsquo;ve shown interest in this seller&rsquo;s offer. You can review the offer details before continuing.</p>
        {offer && (
          <p className={styles.dialogOffer}>
            <span>{offer.storeName}</span>
            <strong>{formatRs(offer.price)}</strong>
          </p>
        )}
        <div className={styles.dialogActions}>
          <button type="button" className={styles.outlineButton} onClick={close}>
            Go back
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => live && live.type === "interest" && requestsStore.setOfferStatus(live.requestId, live.offerId, "interested")}
          >
            Confirm interest
          </button>
        </div>
      </ConfirmDialog>

      <ConfirmDialog open={live?.type === "decline" && Boolean(offer)} title="Decline this offer?" onClose={close}>
        <p>You won&rsquo;t be able to select this offer again in this request.</p>
        {offer && (
          <p className={styles.dialogOffer}>
            <span>{offer.storeName}</span>
            <strong>{formatRs(offer.price)}</strong>
          </p>
        )}
        <div className={styles.dialogActions}>
          <button type="button" className={styles.outlineButton} onClick={close}>
            Keep offer
          </button>
          <button
            type="button"
            className={styles.dangerButton}
            onClick={() => live && live.type === "decline" && requestsStore.setOfferStatus(live.requestId, live.offerId, "declined")}
          >
            Decline offer
          </button>
        </div>
      </ConfirmDialog>
    </>
  );
}

export function RequestToast() {
  const { toast } = useRequests();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(requestsStore.clearToast, 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className={styles.toastRegion} aria-live="polite">
      {toast && (
        <span key={toast} className={styles.toast}>
          {toast}
        </span>
      )}
    </div>
  );
}

export function MessageState({
  icon,
  tone,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  tone?: "error";
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.message} role={tone === "error" ? "alert" : undefined}>
      <span className={styles.messageIcon} data-tone={tone}>
        {icon}
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {children && <div className={styles.messageActions}>{children}</div>}
    </div>
  );
}

export function LoadError() {
  return (
    <MessageState
      tone="error"
      icon={<CircleAlert size={22} aria-hidden="true" />}
      title="Couldn’t load your requests"
      description="Check your connection and try again."
    >
      <button type="button" className={styles.primaryButton} onClick={() => requestsStore.setView("ready")}>
        Try again
      </button>
    </MessageState>
  );
}

export function ListSkeleton({ rows = 3, layout = "list" }: { rows?: number; layout?: "list" | "grid" }) {
  return (
    <div className={styles.cards} data-layout={layout} aria-busy="true" aria-label="Loading requests">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.bone} style={{ width: 48, height: 48, borderRadius: 10, flex: "none" }} />
            <div className={styles.cardMain}>
              <span className={styles.bone} style={{ width: "70%", height: 18 }} />
              <span className={styles.bone} style={{ width: "45%", height: 14 }} />
            </div>
          </div>
          <div className={styles.cardInfo}>
            <span className={styles.bone} style={{ width: 150, height: 16 }} />
            <span className={styles.bone} style={{ width: 100, height: 16 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** "N new offers": text and an icon, so the state never depends on colour alone. */
export function NewOffersPill({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className={styles.newPill}>
      <BellDot size={13} aria-hidden="true" />
      {newOfferLabel(count)}
    </span>
  );
}

/**
 * "New offer received". Mounted once in the root layout so it shows on whichever
 * page the user is on; it stays until dismissed or the request is opened.
 */
export function OfferToast() {
  const { offerToast } = useRequests();
  if (!offerToast) return null;
  return (
    <div className={styles.offerToast} role="status">
      <span className={styles.offerToastIcon}>
        <BellDot size={18} aria-hidden="true" />
      </span>
      <div className={styles.offerToastText}>
        <strong>New offer received</strong>
        <span>A seller has responded to your request.</span>
      </div>
      <Link href={`/requests/${offerToast.requestId}#offers`} className={styles.offerToastLink} onClick={requestsStore.dismissOfferToast}>
        View offer
      </Link>
      <button type="button" className={styles.offerToastClose} aria-label="Dismiss" onClick={requestsStore.dismissOfferToast}>
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
