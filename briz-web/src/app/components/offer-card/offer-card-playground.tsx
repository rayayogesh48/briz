"use client";

// Seller offer card playground: the same properties as the "Seller Offer Card v2"
// Figma component, driving the real OfferCard. Interested opens the real
// confirmation for the offer as currently configured.

import { useState } from "react";

import { ComponentPlayground, type PlaygroundControl, type PlaygroundValues } from "@/components/playground/component-playground";
import { InterestedMessageDialog, OfferCard } from "@/components/requests/offer-card";
import { OFFER_PHOTOS, REQUEST_LIFETIME, type BrizRequest, type Fulfilment, type SellerOffer } from "@/components/requests/request-data";
import requestStyles from "@/components/requests/requests.module.css";

const MINUTE = 60 * 1000;
const RECEIVED: Record<string, number> = {
  "just now": 20 * 1000,
  "25 minutes ago": 25 * MINUTE,
  "5 hours ago": 5 * 60 * MINUTE,
  "2 days ago": 50 * 60 * MINUTE,
};
const FULFILMENT: Record<string, Fulfilment[]> = {
  "store pickup": ["pickup"],
  "online delivery": ["delivery"],
  both: ["delivery", "pickup"],
};

export const OFFER_CARD_CONTROLS: PlaygroundControl[] = [
  { type: "variant", key: "status", label: "Status", options: ["Awaiting", "Interested"] },
  { type: "variant", key: "budget", label: "Budget", options: ["Save", "On budget", "Over"] },
  { type: "boolean", key: "note", label: "Note" },
  { type: "boolean", key: "isNew", label: "New" },
  { type: "boolean", key: "lowest", label: "Lowest price" },
  { type: "boolean", key: "photo", label: "Photo" },
  { type: "boolean", key: "verified", label: "Verified" },
  { type: "text", key: "storeName", label: "Store name" },
  { type: "text", key: "budgetPrice", label: "Budget price", inputMode: "numeric", hint: "Price and saving follow from it" },
  { type: "text", key: "sellerNote", label: "Seller note", multiline: true },
  { type: "variant", key: "received", label: "Received", options: Object.keys(RECEIVED) },
  { type: "group", label: "Seller" },
  { type: "text", key: "rating", label: "Rating", inputMode: "decimal" },
  { type: "text", key: "reviews", label: "Reviews", inputMode: "numeric" },
  { type: "text", key: "distance", label: "Distance (km)", inputMode: "decimal" },
  { type: "group", label: "Fulfilment" },
  { type: "variant", key: "fulfilment", label: "Property 1", options: Object.keys(FULFILMENT) },
];

export const OFFER_CARD_DEFAULTS: PlaygroundValues = {
  status: "Awaiting",
  budget: "Save",
  note: true,
  isNew: false,
  lowest: false,
  photo: true,
  verified: true,
  storeName: "Everest Agro Store",
  budgetPrice: "2500",
  sellerNote: "We have the requested variety available in 5 kg packs.",
  received: "25 minutes ago",
  rating: "4.8",
  reviews: "32",
  distance: "1.2",
  fulfilment: "store pickup",
};

const number = (value: unknown, fallback: number) => {
  const parsed = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const roundTo50 = (amount: number) => Math.max(50, Math.round(amount / 50) * 50);

/** Turns playground values into the offer and request the real card takes. */
export function buildOfferFromControls(values: PlaygroundValues, now: number): { offer: SellerOffer; request: BrizRequest } {
  const budget = number(values.budgetPrice, 2500);
  const price = values.budget === "Save" ? roundTo50(budget * 0.88) : values.budget === "Over" ? roundTo50(budget * 1.12) : budget;
  const expiresAt = now + 18 * 60 * MINUTE;
  return {
    request: {
      id: "BR-REQ-PLAY",
      itemName: "Organic mustard seeds",
      category: "Agriculture & Farming",
      quantity: 5,
      unit: "kg",
      budget,
      description: "",
      image: null,
      status: "active",
      closureReason: null,
      createdAt: expiresAt - REQUEST_LIFETIME,
      expiresAt,
      closedAt: null,
      offers: [],
    },
    offer: {
      id: "BR-REQ-PLAY-O1",
      storeName: String(values.storeName) || "Store name",
      storeLogo: "/figma/results/store-imgAvatarImage1.png",
      verified: Boolean(values.verified),
      rating: Math.min(5, number(values.rating, 4.8)),
      reviewCount: Math.round(number(values.reviews, 32)),
      distanceKm: number(values.distance, 1.2),
      fulfilment: FULFILMENT[String(values.fulfilment)] ?? ["pickup"],
      description: values.note ? String(values.sellerNote) : "",
      match: "exact",
      price,
      receivedAt: now - (RECEIVED[String(values.received)] ?? 25 * MINUTE),
      status: values.status === "Interested" ? "interested" : "pending",
      isRead: !values.isNew,
      image: values.photo ? OFFER_PHOTOS.seeds : null,
    },
  };
}

export function OfferCardPlayground({ now, onAction }: { now: number; onAction: (message: string) => void }) {
  /** The offer the Interested dialog is showing, when it's open. */
  const [confirming, setConfirming] = useState<ReturnType<typeof buildOfferFromControls> | null>(null);
  return (
    <>
      <ComponentPlayground
        title="Seller Offer Card"
        controls={OFFER_CARD_CONTROLS}
        defaults={OFFER_CARD_DEFAULTS}
        render={(values) => {
          const built = buildOfferFromControls(values, now);
          return (
            <ul className={requestStyles.offers}>
              <OfferCard
                offer={built.offer}
                request={built.request}
                now={now}
                isNew={Boolean(values.isNew)}
                isLowest={Boolean(values.lowest)}
                headingLevel={4}
                onInterested={() => setConfirming(built)}
                onDecline={() => onAction("Decline pressed. On the request page this opens the decline confirmation.")}
                onViewConversation={() => onAction("View Conversation pressed.")}
              />
            </ul>
          );
        }}
      />
      {/* Inside .offers so the confirmation gets the card's colour tokens. */}
      <div className={requestStyles.offers}>
        {confirming && (
          <InterestedMessageDialog
            open
            offer={confirming.offer}
            request={confirming.request}
            onClose={() => setConfirming(null)}
            onSend={(message) => {
              setConfirming(null);
              onAction(`Message sent: “${message}”. In the app the offer becomes Interested: set Status to Interested to see it.`);
            }}
          />
        )}
      </div>
    </>
  );
}
