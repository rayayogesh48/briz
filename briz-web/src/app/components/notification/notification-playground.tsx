"use client";

// Notification playground: the same properties as the "Notification Item" Figma
// component (Type, State, Media, Video, CTA, Second CTA, External link and the texts),
// driving the real NotificationItem at the navbar panel's width. Picking a Type fills
// in that type's copy and buttons from the notification spec; everything stays editable.

import type { MouseEvent } from "react";
import { ComponentPlayground, type PlaygroundControl, type PlaygroundValues } from "@/components/playground/component-playground";
import type { BrizNotification, NotificationAction, NotificationType } from "@/components/notifications/notification-data";
import { NotificationItem } from "@/components/notifications/notification-item";
import notificationStyles from "@/components/notifications/notifications.module.css";
import styles from "../library.module.css";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const RECEIVED: Record<string, number> = {
  "Just now": 20 * 1000,
  "18 min ago": 18 * MINUTE,
  "3 hr ago": 3 * HOUR,
  Yesterday: 26 * HOUR,
  "This week": 3 * DAY,
  Earlier: 20 * DAY,
};

const TYPES: Record<string, NotificationType> = {
  Offer: "offer",
  Reminder: "reminder",
  Expired: "expired",
  Reactivation: "reactivation",
  Promotion: "promotion",
};

const PROMO_IMAGE = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=640&h=320&q=70";
const PROMO_VIDEO = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=640&h=320&q=70";

/** Figma's Type options, each filling in the spec copy and the buttons that type gets. */
const TYPE_PRESETS: Record<string, PlaygroundValues> = {
  Offer: {
    title: "Offer Received",
    body: "Everest Agro Store responded to your request and sent an offer for Organic mustard seeds.",
    media: "None",
    cta: "None",
    external: false,
  },
  Reminder: {
    title: "Still Looking for Offers",
    body: "We’re still reaching out to sellers for Electric water pump 1 HP.",
    media: "None",
    cta: "None",
    external: false,
  },
  Expired: {
    title: "Request Expired",
    body: "Your request for Handmade Dhaka topi has expired. You can create a new one anytime.",
    media: "None",
    cta: "One",
    cta1: "Create New Request",
    external: false,
  },
  Reactivation: {
    title: "🛍 Need Something Today?",
    body: "Find products from nearby shops — request an item and get offers instantly.",
    media: "None",
    cta: "Two",
    cta1: "Create a Request",
    cta2: "Browse Shops",
    external: false,
  },
  Promotion: {
    title: "Festive offers on Briz",
    body: "Get ready for festive offers on Briz. Shop now and get up to 70% off.",
    media: "Image",
    cta: "None",
    external: false,
  },
};

export const NOTIFICATION_CONTROLS: PlaygroundControl[] = [
  { type: "variant", key: "type", label: "Type", options: Object.keys(TYPES), presets: TYPE_PRESETS, hint: "Fills in the spec copy" },
  { type: "variant", key: "state", label: "State", options: ["Unread", "Read"] },
  { type: "text", key: "title", label: "Title" },
  { type: "text", key: "body", label: "Body", multiline: true, hint: "Clamped to 2 lines" },
  { type: "variant", key: "received", label: "Received", options: Object.keys(RECEIVED) },
  { type: "group", label: "Media" },
  { type: "variant", key: "media", label: "Media", options: ["None", "Image", "Video"], hint: "Promotions" },
  { type: "group", label: "Buttons" },
  { type: "variant", key: "cta", label: "CTA", options: ["None", "One", "Two"], hint: "Only when it does more than open the row" },
  { type: "text", key: "cta1", label: "CTA 1" },
  { type: "text", key: "cta2", label: "CTA 2" },
  { type: "boolean", key: "external", label: "External link", hint: "Row and CTA 1 open outside Briz" },
];

export const NOTIFICATION_DEFAULTS: PlaygroundValues = {
  type: "Offer",
  state: "Unread",
  received: "18 min ago",
  cta1: "Create New Request",
  cta2: "Browse Shops",
  ...TYPE_PRESETS.Offer,
};

const EXTERNAL_HREF = "https://www.example.com/briz/request-tips";

/** Turns playground values into the notification the real row takes. */
export function buildNotificationFromControls(values: PlaygroundValues, now: number): BrizNotification {
  const external = Boolean(values.external);
  const type = TYPES[String(values.type)] ?? "offer";
  const actions: NotificationAction[] = [];
  if (values.cta !== "None") {
    const label = String(values.cta1).trim() || "Button";
    actions.push(
      external
        ? { kind: "external", label, href: EXTERNAL_HREF }
        : type === "expired" || type === "reactivation"
          ? { kind: "request", label, itemName: type === "expired" ? "Handmade Dhaka topi" : undefined }
          : { kind: "link", label, href: "/featured-stores" },
    );
  }
  if (values.cta === "Two") actions.push({ kind: "link", label: String(values.cta2).trim() || "Button", href: "/featured-stores" });
  const media = values.media === "Image" ? "image" : values.media === "Video" ? "video" : null;
  return {
    id: "N-PLAY",
    type,
    title: String(values.title).trim() || "Notification title",
    body: String(values.body),
    createdAt: now - (RECEIVED[String(values.received)] ?? 18 * MINUTE),
    unread: values.state === "Unread",
    href: external ? EXTERNAL_HREF : type === "promotion" || type === "reactivation" ? "/featured-stores" : "/requests/BR-REQ-001",
    external,
    media: media ? { kind: media, src: media === "image" ? PROMO_IMAGE : PROMO_VIDEO, alt: "Promotion image" } : undefined,
    actions: actions.length ? actions : undefined,
  };
}

export function NotificationPlayground({ now, onAction }: { now: number; onAction: (message: string) => void }) {
  // Links report what they'd do instead of leaving the playground. "Create …" buttons
  // aren't links: they open the real request widget.
  const catchLinks = (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as Element).closest("a");
    if (!link) return;
    event.preventDefault();
    const href = link.getAttribute("href");
    onAction(
      link.target === "_blank"
        ? `Opens ${href} in a new tab and marks the notification read.`
        : `Goes to ${href} and marks the notification read; in the navbar the panel closes.`,
    );
  };

  return (
    <ComponentPlayground
      title="Notification"
      controls={NOTIFICATION_CONTROLS}
      defaults={NOTIFICATION_DEFAULTS}
      // The navbar panel is 380px; on phones it's a sheet with an 8px gutter.
      widths={{ desktop: 380, phone: 359 }}
      render={(values) => (
        <div className={styles.notificationPanel} onClickCapture={catchLinks}>
          <ul className={notificationStyles.list}>
            <NotificationItem item={buildNotificationFromControls(values, now)} now={now} onOpen={() => {}} />
          </ul>
        </div>
      )}
    />
  );
}
