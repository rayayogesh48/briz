"use client";

// Request card playground. "Property 1" picks one of the Figma component's states;
// the properties under it cover the content and the edge cases (long and
// unbroken names, broken photos, big numbers, the last seconds), driving the real card.

import { ComponentPlayground, type PlaygroundControl, type PlaygroundValues } from "@/components/playground/component-playground";
import { RequestCard } from "@/components/requests/request-card";
import { MOCK_IMAGES, REQUEST_LIFETIME, type BrizRequest, type SellerOffer } from "@/components/requests/request-data";
import requestStyles from "@/components/requests/requests.module.css";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

const NAMES: Record<string, string> = {
  Short: "Electric water pump 1 HP",
  Long: "Stainless steel insulated double-wall vacuum water bottle with bamboo lid, 750 ml (matte black)",
  "Very long":
    "Stainless steel insulated double-wall vacuum water bottle with bamboo lid, 750 ml (matte black), gift-boxed set of six in the same colour, with the company logo engraved and a spare lid for each",
  "No spaces": "SKU-HXP4429-WATERPUMP-1HP-SINGLEPHASE-COPPERWINDING-240V-NEPAL",
};
const PHOTOS: Record<string, string | null> = {
  Photo: MOCK_IMAGES.seeds,
  "No photo": null,
  // A link that doesn't load: the card falls back to the placeholder.
  "Broken link": "/figma/request-card/this-photo-does-not-exist.png",
};
const QUANTITIES: Record<string, number> = { "1": 1, "2": 2, "1,000": 1000 };
const BUDGETS: Record<string, number> = { "Rs. 500": 500, "Rs. 10,000": 10000, "Rs. 12,50,000": 1250000, "Rs. 1,25,00,000": 12500000 };
const TIME_LEFT: Record<string, number> = {
  "Just created": REQUEST_LIFETIME - 20 * 1000,
  "17h 34m": 17 * HOUR + 34 * MINUTE,
  "Under an hour": 10 * MINUTE + 31 * 1000,
  "Final seconds": 45 * 1000,
};
const OFFERS: Record<string, number> = { None: 0, One: 1, Multiple: 5, Many: 24 };
const NEW_OFFERS = ["None", "One", "Several", "All"];
const LOWEST: Record<string, number> = { "Below budget": 0.9, "On budget": 1, "Above budget": 1.15 };

/** Figma's Property 1 options, each setting the properties its variant shows. */
const FIGMA_STATES: Record<string, PlaygroundValues> = {
  "Waiting for offers": { name: "Short", productName: NAMES.Short, budget: "Rs. 10,000", status: "Active", timeLeft: "17h 34m", offers: "None", newOffers: "None", lowest: "Below budget" },
  "One offer": { name: "Short", productName: NAMES.Short, budget: "Rs. 10,000", status: "Active", timeLeft: "17h 34m", offers: "One", newOffers: "None", lowest: "Below budget" },
  "Multiple offers": { name: "Short", productName: NAMES.Short, budget: "Rs. 10,000", status: "Active", timeLeft: "17h 34m", offers: "Multiple", newOffers: "None", lowest: "Below budget" },
  "New Offer": { name: "Short", productName: NAMES.Short, budget: "Rs. 10,000", status: "Active", timeLeft: "17h 34m", offers: "Multiple", newOffers: "One", lowest: "Below budget" },
  "Expire soon": { name: "Long", productName: NAMES.Long, budget: "Rs. 12,50,000", status: "Active", timeLeft: "Under an hour", offers: "Multiple", newOffers: "None", lowest: "On budget" },
  "Edge case": { name: "Short", productName: NAMES.Short, budget: "Rs. 10,000", status: "Active", timeLeft: "Under an hour", offers: "Multiple", newOffers: "One", lowest: "Below budget" },
  "Expired with offers": { name: "Short", productName: NAMES.Short, budget: "Rs. 10,000", status: "Expired", offers: "Multiple", newOffers: "None", lowest: "Below budget" },
  Cancelled: { name: "Short", productName: NAMES.Short, budget: "Rs. 10,000", status: "Cancelled", offers: "Multiple", newOffers: "None", lowest: "Below budget" },
};

/** Picking a name length fills in the name, which stays editable. */
const NAME_PRESETS = Object.fromEntries(Object.entries(NAMES).map(([key, productName]) => [key, { productName }]));

export const REQUEST_CARD_CONTROLS: PlaygroundControl[] = [
  { type: "variant", key: "state", label: "Property 1", options: Object.keys(FIGMA_STATES), presets: FIGMA_STATES, hint: "Figma state" },
  { type: "group", label: "Product" },
  { type: "variant", key: "name", label: "Name", options: Object.keys(NAMES), presets: NAME_PRESETS },
  { type: "text", key: "productName", label: "Product name", multiline: true },
  { type: "variant", key: "photo", label: "Photo", options: Object.keys(PHOTOS) },
  { type: "variant", key: "quantity", label: "Quantity", options: Object.keys(QUANTITIES) },
  { type: "variant", key: "budget", label: "Budget", options: Object.keys(BUDGETS) },
  { type: "group", label: "Status" },
  { type: "variant", key: "status", label: "Status", options: ["Active", "Expired", "Cancelled"] },
  { type: "variant", key: "timeLeft", label: "Time left", options: Object.keys(TIME_LEFT), hint: "Active only; red in the last hour" },
  { type: "group", label: "Offers" },
  { type: "variant", key: "offers", label: "Offers", options: Object.keys(OFFERS), hint: "None, 1, 5 or 24 sellers" },
  { type: "variant", key: "newOffers", label: "New offers", options: NEW_OFFERS, hint: "Unread: none, 1, 3 or all" },
  { type: "variant", key: "lowest", label: "Lowest offer", options: Object.keys(LOWEST), hint: "Shown once there are offers" },
];

export const REQUEST_CARD_DEFAULTS: PlaygroundValues = {
  state: "Waiting for offers",
  photo: "Photo",
  quantity: "2",
  ...FIGMA_STATES["Waiting for offers"],
};

/** Turns playground values into the request the real card takes. */
export function buildRequestFromControls(values: PlaygroundValues, now: number): BrizRequest {
  const status = String(values.status);
  const closedReason = status === "Cancelled" ? "cancelled" : status === "Expired" ? "expired" : null;
  const expiresAt = closedReason === "expired" ? now - 6 * HOUR : now + (TIME_LEFT[String(values.timeLeft)] ?? TIME_LEFT["17h 34m"]);
  const createdAt = closedReason === "cancelled" ? now - 10 * HOUR : expiresAt - REQUEST_LIFETIME;
  const budget = BUDGETS[String(values.budget)] ?? 10000;
  const count = OFFERS[String(values.offers)] ?? 0;
  const newChoice = String(values.newOffers);
  const unread = Math.min(count, newChoice === "All" ? count : newChoice === "Several" ? 3 : newChoice === "One" ? 1 : 0);
  const lowest = Math.round((budget * (LOWEST[String(values.lowest)] ?? 0.9)) / 50) * 50;
  const offers: SellerOffer[] = Array.from({ length: count }, (_, index) => ({
    id: `PLAY-O${index + 1}`,
    storeName: `Seller ${index + 1}`,
    storeLogo: null,
    verified: true,
    rating: 4.6,
    distanceKm: 1.2,
    fulfilment: ["pickup"],
    description: "",
    match: "exact",
    // The first offer is the lowest; the rest cost a little more.
    price: index === 0 ? lowest : Math.round(lowest * (1 + index * 0.03)),
    receivedAt: now - (index + 1) * 20 * MINUTE,
    status: "pending",
    isRead: index >= unread,
  }));
  return {
    id: "BR-REQ-PLAY",
    itemName: String(values.productName).trim() || "Product name",
    category: null,
    quantity: QUANTITIES[String(values.quantity)] ?? 2,
    unit: "Pieces",
    budget,
    description: "",
    image: String(values.photo) in PHOTOS ? PHOTOS[String(values.photo)] : MOCK_IMAGES.seeds,
    status: closedReason ? "closed" : "active",
    closureReason: closedReason,
    createdAt,
    expiresAt,
    closedAt: closedReason === "cancelled" ? now - 4 * HOUR : closedReason === "expired" ? expiresAt : null,
    offers,
  };
}

export function RequestCardPlayground({ now, onAction }: { now: number; onAction: (message: string) => void }) {
  return (
    <ComponentPlayground
      title="Request Card"
      controls={REQUEST_CARD_CONTROLS}
      defaults={REQUEST_CARD_DEFAULTS}
      widths={{ desktop: 1056, phone: 375 }}
      render={(values) => (
        <ul className={requestStyles.cards} data-layout="list">
          <RequestCard
            request={buildRequestFromControls(values, now)}
            now={now}
            headingLevel={4}
            onCancel={() => onAction("Cancel pressed. On My requests this opens the cancel confirmation.")}
            onRequestAgain={() => onAction("Request Again pressed. On My requests this opens the request form with the same details.")}
          />
        </ul>
      )}
    />
  );
}
