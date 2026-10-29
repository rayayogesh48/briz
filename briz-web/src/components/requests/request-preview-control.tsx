"use client";

// Development tool: jumps the request prototype — widget, navbar badge, list and
// detail — to a named state, and can simulate time passing or a seller responding.
// Shown in development, or in a build started with NEXT_PUBLIC_REQUESTS_PREVIEW=1.

import { usePathname, useRouter } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { INITIAL_REQUEST_DRAFT, type RequestDraft } from "@/components/request-flow-data";
import { previewBrizRequestWidget, type RequestWidgetPreview } from "@/components/request-product-widget";
import { requestsStore, type RequestsState } from "@/store/requests-store";
import previewStyles from "@/components/navbar-preview-control.module.css";
import { MOCK_IMAGES, REQUEST_IDS, REQUEST_LIFETIME, buildMockRequests, withUnread, type BrizRequest } from "./request-data";
import styles from "./requests.module.css";

const SHOW = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_REQUESTS_PREVIEW === "1";

const FILLED: RequestDraft = {
  ...INITIAL_REQUEST_DRAFT,
  itemName: "Organic mustard seeds",
  quantity: 5,
  unit: "kg",
  rate: "2500",
  details: "Organic mustard seeds for farming use. Untreated, this season's stock.",
  imagePreviewUrl: MOCK_IMAGES.seeds,
  imageName: "mustard-seeds.jpg",
  imageSize: "0.8 MB",
  categoryId: null,
};
/** Fails the content check: the description has a blocked word. */
const OFFENSIVE: RequestDraft = { ...FILLED, details: "Need it fast, don’t send me stupid low quality seeds." };
const APPLE: RequestDraft = { ...INITIAL_REQUEST_DRAFT, itemName: "Apple", quantity: 2, rate: "1200", details: "Two fresh red apples." };

type Preset = {
  label: string;
  /** Page to show. Left out for widget states, which stay on the current page. */
  path?: string;
  state?: () => Partial<RequestsState>;
  /** Widget to show. Every non-widget state closes the panel. */
  widget?: RequestWidgetPreview;
};

const MAIN = REQUEST_IDS.multipleOffers;
const detail = (id: string) => `/requests/${id}`;

/** The mock data with exactly these unread counts (everything else read), optionally filtered. */
const data = (unread: Record<string, number> = {}, keep?: (request: BrizRequest) => boolean) => () => {
  const requests = withUnread(buildMockRequests(Date.now()), unread);
  return { requests: keep ? requests.filter(keep) : requests };
};
const only = (...ids: string[]) => (request: BrizRequest) => ids.includes(request.id);
/** The three-offer request keeping only the offers at these positions (1-based), all read. */
const mainWithOffers = (...positions: number[]) => () => ({
  requests: withUnread(buildMockRequests(Date.now()), {}).map((request) =>
    request.id === MAIN ? { ...request, offers: request.offers.filter((_, index) => positions.includes(index + 1)) } : request,
  ),
});
const everyOfferUnread = () => {
  const requests = buildMockRequests(Date.now());
  return { requests: withUnread(requests, Object.fromEntries(requests.map((request) => [request.id, request.offers.length]))) };
};
/** A freshly submitted request, for the widget's success screen. */
const submitted = () => {
  const now = Date.now();
  const request: BrizRequest = {
    id: "BR-REQ-011",
    itemName: FILLED.itemName,
    category: null,
    quantity: 5,
    unit: "kg",
    budget: 2500,
    description: FILLED.details,
    image: MOCK_IMAGES.seeds,
    status: "active",
    closureReason: null,
    createdAt: now,
    expiresAt: now + REQUEST_LIFETIME,
    closedAt: null,
    offers: [],
  };
  return { requests: [request, ...withUnread(buildMockRequests(now), {})] };
};

const GROUPS: { group: string; items: Preset[] }[] = [
  {
    group: "Widget",
    items: [
      { label: "1. Collapsed widget", widget: {} },
      { label: "2. Expanded introduction", widget: { hint: true } },
      { label: "3. Empty request form", widget: { step: "form", draft: INITIAL_REQUEST_DRAFT } },
      { label: "4. Partially completed form", widget: { step: "form", draft: { ...INITIAL_REQUEST_DRAFT, itemName: "Organic mustard seeds", quantity: 5, unit: "kg" } } },
      { label: "5. Validation errors", widget: { step: "form", draft: INITIAL_REQUEST_DRAFT, showErrors: true } },
      { label: "6. Ambiguous product", widget: { step: "ambiguity", draft: APPLE } },
      { label: "7. Category selected", widget: { step: "ambiguity", draft: { ...APPLE, categoryId: "fruits-vegetables" } } },
      { label: "8. Request review", widget: { step: "review", draft: FILLED } },
      { label: "8b. Submitting", widget: { step: "submitting", draft: FILLED } },
      { label: "9. Submission success", state: submitted, widget: { step: "success", draft: FILLED, createdId: "BR-REQ-011" } },
      { label: "9b. Offensive content detected", widget: { step: "offensive", draft: OFFENSIVE, flagged: ["details"] } },
      { label: "9c. Editing flagged words", widget: { step: "form", draft: OFFENSIVE, flagged: ["details"] } },
    ],
  },
  {
    group: "Navbar",
    items: [
      { label: "10. No active requests", path: "/requests", state: data({}, (request) => request.status === "closed") },
      { label: "11. Active request, waiting for offers", path: "/requests", state: data({}, only(REQUEST_IDS.noOffers)) },
      { label: "12. Active request with no notification badge", path: "/requests", state: data({}, only(MAIN)) },
      { label: "13. One unread offer — badge 1", path: "/requests", state: data({ [MAIN]: 1 }) },
      { label: "14. Multiple unread offers — badge 3", path: "/requests", state: data({ [MAIN]: 3 }) },
      { label: "15. Badge capped at 9+", path: "/requests", state: everyOfferUnread },
      { label: "16. Multiple requests with unread offers", path: "/requests", state: data({ [MAIN]: 2, [REQUEST_IDS.oneOffer]: 1 }) },
      { label: "17. Offers viewed — badge cleared", path: "/requests", state: data({}) },
      {
        label: "18. Offer toast visible",
        path: "/requests",
        state: () => ({ ...data({ [MAIN]: 1 })(), offerToast: { requestId: MAIN, storeName: "Everest Agro Store" } }),
      },
      { label: "19. Closed request with an unread historical offer", path: "/requests?tab=closed", state: data({ [REQUEST_IDS.expiredWithOffers]: 1 }) },
    ],
  },
  {
    group: "Request list",
    items: [
      { label: "20. Active requests with no offers", path: "/requests", state: data({}, only(REQUEST_IDS.noOffers)) },
      { label: "21. Active request with one offer", path: "/requests", state: data({}, only(REQUEST_IDS.oneOffer)) },
      { label: "22. Active request with multiple offers", path: "/requests", state: data({}, only(MAIN)) },
      { label: "23. Request card with one new offer", path: "/requests", state: data({ [MAIN]: 1 }, only(MAIN)) },
      { label: "24. Request card with multiple new offers", path: "/requests", state: data({ [MAIN]: 2 }, only(MAIN)) },
      { label: "25. Request card after offers have been viewed", path: "/requests", state: data({}, only(MAIN)) },
      { label: "26. Closed request due to expiration", path: "/requests?tab=closed", state: data({}, (request) => request.closureReason === "expired") },
      { label: "27. Closed request due to cancellation", path: "/requests?tab=closed", state: data({}, (request) => request.closureReason === "cancelled") },
      { label: "28. Active empty state", path: "/requests", state: data({}, (request) => request.status === "closed") },
      { label: "29. Closed empty state", path: "/requests?tab=closed", state: data({}, (request) => request.status === "active") },
      { label: "29b. List loading", path: "/requests", state: () => ({ view: "loading" }) },
      { label: "29c. List couldn't load", path: "/requests", state: () => ({ view: "error" }) },
    ],
  },
  {
    group: "Request detail",
    items: [
      { label: "30. Waiting for offers", path: detail(REQUEST_IDS.noOffers), state: data({}) },
      { label: "31. One seller offer", path: detail(REQUEST_IDS.oneOffer), state: data({ [REQUEST_IDS.oneOffer]: 1 }) },
      { label: "32. Multiple seller offers", path: detail(MAIN), state: data({ [MAIN]: 2 }) },
      { label: "33. Lowest and average price comparison", path: detail(MAIN), state: data({}) },
      { label: "34. Offer within budget", path: detail(MAIN), state: mainWithOffers(1) },
      { label: "35. Offer over budget", path: detail(MAIN), state: mainWithOffers(3) },
      { label: "36. Interested confirmation", path: detail(MAIN), state: () => ({ ...data({})(), dialog: { type: "interest", requestId: MAIN, offerId: `${MAIN}-O1` } }) },
      { label: "37. Interested state", path: detail(REQUEST_IDS.interested), state: data({}) },
      { label: "38. Decline confirmation", path: detail(MAIN), state: () => ({ ...data({})(), dialog: { type: "decline", requestId: MAIN, offerId: `${MAIN}-O3` } }) },
      { label: "39. Declined state", path: detail(REQUEST_IDS.declined), state: data({}) },
      { label: "40. Cancel confirmation", path: detail(MAIN), state: () => ({ ...data({})(), dialog: { type: "cancel", requestId: MAIN } }) },
      { label: "40b. Cancelled request", path: detail(REQUEST_IDS.cancelled), state: data({}) },
      {
        label: "41. Request close to expiration (45 seconds left)",
        path: detail(MAIN),
        state: () => {
          const now = Date.now();
          return {
            requests: withUnread(buildMockRequests(now), {}).map((request) =>
              request.id === MAIN ? { ...request, createdAt: now + 45_000 - REQUEST_LIFETIME, expiresAt: now + 45_000 } : request,
            ),
          };
        },
      },
      { label: "42. Expired request with offers", path: detail(REQUEST_IDS.expiredWithOffers), state: data({}) },
      { label: "43. Expired request without offers", path: detail(REQUEST_IDS.expiredNoOffers), state: data({}) },
      { label: "43b. Detail loading", path: detail(MAIN), state: () => ({ view: "loading" }) },
      { label: "43c. Request not found", path: detail("BR-REQ-404") },
    ],
  },
];

export function RequestPreviewControl() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  if (!SHOW) return null;

  // Tools act on the request being viewed, or the first active one from the list.
  const viewedId = pathname.match(/^\/requests\/(BR-REQ-\d+)/)?.[1];
  const target = () => {
    const { requests } = requestsStore.get();
    return requests.find((request) => request.id === viewedId) ?? requests.find((request) => request.status === "active");
  };

  const tools: { label: string; run: () => void }[] = [
    {
      label: "A seller offer arrives",
      run: () => {
        const request = target();
        if (request) requestsStore.addOffer(request.id);
      },
    },
    { label: "Skip 1 hour", run: () => requestsStore.advance(60 * 60 * 1000) },
    { label: "Skip 6 hours", run: () => requestsStore.advance(6 * 60 * 60 * 1000) },
    {
      label: "Jump to 10 seconds before expiry",
      run: () => {
        const request = target();
        if (request?.status === "active") requestsStore.advance(request.expiresAt - requestsStore.get().now - 10_000);
      },
    },
  ];

  function pick(item: Preset) {
    if (item.state || item.path) requestsStore.load(item.state?.() ?? {});
    previewBrizRequestWidget(item.widget ?? {});
    setCurrent(item.label);
    setOpen(false);
    if (item.path) router.push(item.path);
  }

  return (
    <div className={`${previewStyles.root} ${styles.previewOffset}`} ref={root}>
      {open && (
        <div className={`${previewStyles.menu} ${styles.previewMenu}`} role="menu" aria-label="Request preview states">
          {GROUPS.map(({ group, items }) => (
            <div key={group} className={styles.previewGroup} role="group" aria-label={group}>
              <p className={styles.previewLabel}>{group}</p>
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitemradio"
                  aria-checked={item.label === current}
                  className={previewStyles.item}
                  onClick={() => pick(item)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
          <div className={styles.previewGroup} role="group" aria-label="Simulate">
            <p className={styles.previewLabel}>Simulate</p>
            {tools.map((tool) => (
              <button key={tool.label} type="button" role="menuitem" className={previewStyles.item} onClick={tool.run}>
                {tool.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <button type="button" className={previewStyles.trigger} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        Preview states <ChevronUp size={15} data-open={open} aria-hidden="true" />
      </button>
    </div>
  );
}
