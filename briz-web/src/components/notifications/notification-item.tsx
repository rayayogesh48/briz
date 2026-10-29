"use client";

// One notification row in the navbar panel: type icon, title, body, any media and
// buttons, time and the unread dot. The whole row opens it, which also marks it
// read; buttons sit above the row link and mark it read too.

import Link from "next/link";
import { Clock, ExternalLink, Megaphone, Play, ShoppingBag, Tag, TriangleAlert } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { openBrizRequest } from "@/components/request-product-widget";
import { formatNotificationTime, type BrizNotification, type NotificationAction, type NotificationType } from "./notification-data";
import styles from "./notifications.module.css";

const ICON: Record<NotificationType, ReactNode> = {
  offer: <Tag size={16} aria-hidden="true" />,
  reminder: <Clock size={16} aria-hidden="true" />,
  expired: <TriangleAlert size={16} aria-hidden="true" />,
  reactivation: <ShoppingBag size={16} aria-hidden="true" />,
  promotion: <Megaphone size={16} aria-hidden="true" />,
};

/** A notification's button: a link, a link out of Briz, or "start a request". */
function ActionButton({ action, onOpen }: { action: NotificationAction; onOpen: () => void }) {
  if (action.kind === "request") {
    return (
      <button
        type="button"
        className={styles.cta}
        onClick={() => {
          onOpen();
          openBrizRequest(action.itemName ? { itemName: action.itemName } : undefined);
        }}
      >
        {action.label}
      </button>
    );
  }
  if (action.kind === "external") {
    return (
      <a href={action.href} className={styles.cta} target="_blank" rel="noopener noreferrer" onClick={onOpen}>
        {action.label}
        <ExternalLink size={14} aria-hidden="true" />
        <span className={styles.srOnly}> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={action.href} className={styles.cta} onClick={onOpen}>
      {action.label}
    </Link>
  );
}

/** The current time, refreshed every minute so "2 min ago" stays true. */
export function useNow(interval = 60 * 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(timer);
  }, [interval]);
  return now;
}

export function NotificationItem({
  item,
  now,
  onOpen,
}: {
  item: BrizNotification;
  now: number;
  /** Runs before navigating: marks it read, closes the panel. */
  onOpen: () => void;
}) {
  return (
    <li className={styles.item} data-unread={item.unread} data-type={item.type}>
      <span className={styles.icon}>{ICON[item.type]}</span>
      <span className={styles.text}>
        {/* The link covers the whole row; the title is its name. */}
        {item.external ? (
          <a href={item.href} className={styles.link} target="_blank" rel="noopener noreferrer" onClick={onOpen}>
            {item.title}
            {item.unread && <span className={styles.srOnly}>, unread</span>}
            <span className={styles.srOnly}> (opens in a new tab)</span>
          </a>
        ) : (
          <Link href={item.href} className={styles.link} onClick={onOpen}>
            {item.title}
            {item.unread && <span className={styles.srOnly}>, unread</span>}
          </Link>
        )}
        <span className={styles.body}>{item.body}</span>
        {item.media && (
          <span className={styles.media} data-kind={item.media.kind}>
            {/* eslint-disable-next-line @next/next/no-img-element -- remote promo image */}
            <img src={item.media.src} alt={item.media.alt} loading="lazy" />
            {item.media.kind === "video" && (
              <span className={styles.play} aria-hidden="true">
                <Play size={16} fill="currentColor" />
              </span>
            )}
          </span>
        )}
        {item.actions && item.actions.length > 0 && (
          <span className={styles.ctas}>
            {item.actions.map((action) => (
              <ActionButton key={action.label} action={action} onOpen={onOpen} />
            ))}
          </span>
        )}
        <time dateTime={new Date(item.createdAt).toISOString()} title={new Date(item.createdAt).toLocaleString("en-GB")}>
          {formatNotificationTime(item.createdAt, now)}
        </time>
      </span>
      {item.unread && <span className={styles.dot} aria-hidden="true" />}
    </li>
  );
}
