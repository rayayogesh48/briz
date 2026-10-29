// Notifications: the model, the mock feed, and the helpers the navbar panel uses
// (All / Unread filter, day groups, relative time). There's no notifications page
// for now: the panel lists everything.

// The types are the ones in the Briz notification spec (Figma, "Notification Table"):
// the request flow (still looking, offer received, request expired) and the other
// triggers (re-activation reminder, Briz promotions).
export type NotificationType = "offer" | "reminder" | "expired" | "reactivation" | "promotion";

/**
 * A button on the notification. The row itself always opens `href`; a button is only
 * added when it does something else: starts a request, goes somewhere other than the
 * row, or leaves Briz. "View Request" on an offer would only repeat the row, so web
 * leaves it out.
 */
export type NotificationAction =
  | { kind: "link"; label: string; href: string }
  | { kind: "external"; label: string; href: string }
  /** Opens the request widget, prefilled with the item when there is one. */
  | { kind: "request"; label: string; itemName?: string };

export type BrizNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: number;
  unread: boolean;
  /** Where opening it goes. */
  href: string;
  /** The row opens a site outside Briz, in a new tab (promotions with an external link). */
  external?: boolean;
  /** Promotions can carry an image or a video (shown as its poster with a play badge). */
  media?: { kind: "image" | "video"; src: string; alt: string };
  actions?: NotificationAction[];
};

export type NotificationFilter = "all" | "unread";

export function matchesFilter(item: BrizNotification, filter: NotificationFilter) {
  return filter === "all" || item.unread;
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const startOfDay = (ms: number) => {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

/** "Just now", "12 min ago", "3 hr ago", "Yesterday", "Mon", then "12 Oct". */
export function formatNotificationTime(createdAt: number, now: number) {
  const ago = now - createdAt;
  if (ago < MINUTE) return "Just now";
  if (ago < HOUR) return `${Math.floor(ago / MINUTE)} min ago`;
  const today = startOfDay(now);
  if (createdAt >= today) return `${Math.floor(ago / HOUR)} hr ago`;
  if (createdAt >= today - DAY) return "Yesterday";
  if (createdAt >= today - 6 * DAY) return new Date(createdAt).toLocaleDateString("en-GB", { weekday: "short" });
  return new Date(createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export type NotificationGroup = { label: string; items: BrizNotification[] };

/** Newest first, grouped into Today, Yesterday, This week and Earlier; empty groups are left out. */
export function groupByDay(items: BrizNotification[], now: number): NotificationGroup[] {
  const today = startOfDay(now);
  const groups: NotificationGroup[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "This week", items: [] },
    { label: "Earlier", items: [] },
  ];
  for (const item of items) {
    const index = item.createdAt >= today ? 0 : item.createdAt >= today - DAY ? 1 : item.createdAt >= today - 6 * DAY ? 2 : 3;
    groups[index].items.push(item);
  }
  return groups.filter((group) => group.items.length > 0);
}

type Template = Omit<BrizNotification, "id" | "createdAt" | "unread">;

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=640&h=320&q=70`;

/** Copy follows the spec; [Store Name], [Product Name] and [Count] are filled from the mock requests. */
const TEMPLATES: Template[] = [
  {
    type: "offer",
    title: "Offer Received",
    body: "Everest Agro Store responded to your request and sent an offer for Organic mustard seeds.",
    href: "/requests/BR-REQ-001#offers",
  },
  {
    type: "reminder",
    title: "Still Looking for Offers",
    body: "We’re still reaching out to sellers for Electric water pump 1 HP.",
    href: "/requests/BR-REQ-002",
  },
  {
    // Several sellers at once: one notification with the count, not one each.
    type: "offer",
    title: "Offer Received",
    body: "3 sellers responded to your request and sent offers for Organic mustard seeds.",
    href: "/requests/BR-REQ-001#offers",
  },
  {
    type: "expired",
    title: "Request Expired",
    body: "Your request for Handmade Dhaka topi has expired. You can create a new one anytime.",
    href: "/requests/BR-REQ-009",
    actions: [{ kind: "request", label: "Create New Request", itemName: "Handmade Dhaka topi" }],
  },
  {
    type: "promotion",
    title: "Festive offers on Briz",
    body: "Get ready for festive offers on Briz. Shop now and get up to 70% off.",
    href: "/featured-products",
    media: { kind: "image", src: photo("1542838132-92c53300491e"), alt: "Fresh produce at a local shop" },
  },
  {
    type: "reactivation",
    title: "🛍 Need Something Today?",
    body: "Find products from nearby shops — request an item and get offers instantly.",
    href: "/featured-stores",
    actions: [
      { kind: "request", label: "Create a Request" },
      { kind: "link", label: "Browse Shops", href: "/featured-stores" },
    ],
  },
  {
    type: "offer",
    title: "Offer Received",
    body: "Mobile Hub Nepal responded to your request and sent an offer for iPhone 15 Pro case.",
    href: "/requests/BR-REQ-004#offers",
  },
  {
    type: "promotion",
    title: "How to get the best offers",
    body: "Five tips for writing a request sellers love to answer.",
    href: "https://www.example.com/briz/request-tips",
    external: true,
    actions: [{ kind: "external", label: "Open Link", href: "https://www.example.com/briz/request-tips" }],
  },
  {
    type: "expired",
    title: "Request Expired",
    body: "Your request for Pressure cooker 5 L has expired. You can create a new one anytime.",
    href: "/requests/BR-REQ-008",
    actions: [{ kind: "request", label: "Create New Request", itemName: "Pressure cooker 5 L" }],
  },
  {
    type: "promotion",
    title: "See how Briz works",
    body: "Request any product and let nearby shops compete with offers. Watch the 1-minute guide.",
    href: "https://www.example.com/briz/how-it-works",
    external: true,
    media: { kind: "video", src: photo("1556742049-0cfed4f6a45d"), alt: "A shopkeeper serving a customer" },
  },
  {
    type: "promotion",
    title: "New stores near you",
    body: "12 new stores in New Baneshwor joined Briz this week.",
    href: "/featured-stores",
  },
];

/** How long ago each mock notification arrived: a few today, then spread over a month. */
const AGES = [
  2 * MINUTE, 18 * MINUTE, 55 * MINUTE, 3 * HOUR, 6 * HOUR, 26 * HOUR, 30 * HOUR, 2 * DAY, 3 * DAY, 4 * DAY, 5 * DAY + 2 * HOUR,
  8 * DAY, 9 * DAY, 11 * DAY, 12 * DAY, 14 * DAY, 15 * DAY, 17 * DAY, 18 * DAY, 20 * DAY, 21 * DAY, 23 * DAY, 24 * DAY,
  26 * DAY, 27 * DAY, 29 * DAY, 31 * DAY, 33 * DAY, 35 * DAY, 38 * DAY, 41 * DAY, 44 * DAY, 47 * DAY, 50 * DAY, 54 * DAY, 58 * DAY,
];

/** The mock feed, newest first; the first `unread` are unread. */
export function buildMockNotifications(now: number, count = 36, unread = 4): BrizNotification[] {
  return Array.from({ length: Math.min(count, AGES.length) }, (_, index) => ({
    ...TEMPLATES[index % TEMPLATES.length],
    id: `N-${index + 1}`,
    createdAt: now - AGES[index],
    unread: index < unread,
  }));
}

let arrivals = 0;

/** A notification arriving now, for the preview's "new notification" action. */
export function incomingNotification(now: number): BrizNotification {
  arrivals += 1;
  return {
    id: `N-NEW-${arrivals}`,
    type: "offer",
    title: "Offer Received",
    body: "Himalayan Seeds Co. responded to your request and sent an offer for Organic mustard seeds.",
    href: "/requests/BR-REQ-001#offers",
    createdAt: now,
    unread: true,
  };
}
