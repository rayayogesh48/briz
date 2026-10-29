"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  EXTRA_OFFERS,
  REQUEST_LIFETIME,
  buildMockRequests,
  unreadOfferCount,
  type BrizRequest,
  type OfferStatus,
} from "@/components/requests/request-data";

// Single source of truth for the Request prototype: every request and offer
// (including each offer's read state), the open confirmation dialog, the
// new-offer toast and the simulated clock. The navbar badge and the request-card
// pills are derived from the offers here, never stored separately. It is
// in-memory only — nothing is sent anywhere and a refresh restores the mock data.

export type RequestDialog =
  | { type: "cancel"; requestId: string }
  | { type: "interest" | "decline"; requestId: string; offerId: string }
  | null;

export type RequestsState = {
  /** False on the server and for the first client render, so timestamps never hydrate mismatched. */
  ready: boolean;
  view: "ready" | "loading" | "error";
  /** How My requests lays out its cards. A display preference, so preview states leave it alone. */
  layout: "list" | "grid";
  /** Current time including any time skipped with the preview tools. */
  now: number;
  offset: number;
  requests: BrizRequest[];
  dialog: RequestDialog;
  toast: string;
  /** The "New offer received" toast, shown on any page until dismissed. */
  offerToast: { requestId: string; storeName: string } | null;
  /** Offers marked read during the current visit to a request; they keep a "New" tag for that visit. */
  justViewed: string[];
  viewVisit: number;
  /** Bumped whenever a preview state replaces the data, so an open detail page re-reads it. */
  loadId: number;
};

export type NewRequestInput = Pick<BrizRequest, "itemName" | "category" | "quantity" | "unit" | "budget" | "description" | "image">;

const SERVER_STATE: RequestsState = {
  ready: false,
  view: "ready",
  layout: "list",
  now: 0,
  offset: 0,
  requests: [],
  dialog: null,
  toast: "",
  offerToast: null,
  justViewed: [],
  viewVisit: 0,
  loadId: 0,
};

let state: RequestsState | null = null;
const listeners = new Set<() => void>();

function current(): RequestsState {
  if (!state) {
    const now = Date.now();
    state = { ...SERVER_STATE, ready: true, now, requests: buildMockRequests(now) };
  }
  return state;
}

/** A request must never stay Active past its expiry: close anything whose time is up. */
function closeExpired(requests: BrizRequest[], now: number) {
  if (!requests.some((request) => request.status === "active" && request.expiresAt <= now)) return requests;
  return requests.map((request) =>
    request.status === "active" && request.expiresAt <= now
      ? { ...request, status: "closed" as const, closureReason: "expired" as const, closedAt: request.expiresAt }
      : request,
  );
}

function set(patch: Partial<RequestsState>) {
  const next = { ...current(), ...patch };
  next.now = Date.now() + next.offset;
  next.requests = closeExpired(next.requests, next.now);
  state = next;
  listeners.forEach((listener) => listener());
}

const updateRequest = (id: string, change: (request: BrizRequest) => BrizRequest) =>
  current().requests.map((request) => (request.id === id ? change(request) : request));

export const requestsStore = {
  get: current,

  /** Advances the clock; called once a second while a request screen is open. */
  tick: () => set({}),

  /** Creates the mock request: Active now, expiring exactly 24 hours later, with no offers. */
  create: (input: NewRequestInput) => {
    const { requests, offset } = current();
    const createdAt = Date.now() + offset;
    const number = Math.max(0, ...requests.map((request) => Number(request.id.slice(-3)) || 0)) + 1;
    const request: BrizRequest = {
      ...input,
      id: `BR-REQ-${String(number).padStart(3, "0")}`,
      status: "active",
      closureReason: null,
      createdAt,
      expiresAt: createdAt + REQUEST_LIFETIME,
      closedAt: null,
      offers: [],
    };
    set({ requests: [request, ...requests] });
    return request.id;
  },

  /** Only an Active request can be cancelled; an expired one keeps its Expired reason. */
  cancel: (id: string) => {
    const now = Date.now() + current().offset;
    set({
      dialog: null,
      toast: "Request cancelled",
      requests: updateRequest(id, (request) =>
        request.status === "active" && request.expiresAt > now
          ? { ...request, status: "closed", closureReason: "cancelled", closedAt: now }
          : request,
      ),
    });
  },

  /** Interested and Declined are final, and only available offers on an Active request can change. */
  setOfferStatus: (requestId: string, offerId: string, status: Exclude<OfferStatus, "pending">) =>
    set({
      dialog: null,
      toast: status === "interested" ? "Marked as interested" : "Offer declined",
      requests: updateRequest(requestId, (request) =>
        request.status !== "active"
          ? request
          : {
              ...request,
              offers: request.offers.map((offer) => (offer.id === offerId && offer.status === "pending" ? { ...offer, status } : offer)),
            },
      ),
    }),

  /**
   * Opening a request's detail page: the offers it has right now become read.
   * Offers that arrive afterwards stay unread until the request is opened again.
   * `visit` identifies one stay on the page, so React re-running the effect during
   * the same stay adds to the "New" tags instead of wiping them.
   */
  viewRequest: (requestId: string, visit: number) => {
    const { requests, offerToast, justViewed, viewVisit } = current();
    const request = requests.find((item) => item.id === requestId);
    const unread = request?.offers.filter((offer) => !offer.isRead).map((offer) => offer.id) ?? [];
    set({
      viewVisit: visit,
      justViewed: visit === viewVisit ? [...justViewed, ...unread] : unread,
      offerToast: offerToast?.requestId === requestId ? null : offerToast,
      requests: unread.length
        ? updateRequest(requestId, (item) => ({ ...item, offers: item.offers.map((offer) => ({ ...offer, isRead: true })) }))
        : requests,
    });
  },

  openDialog: (dialog: RequestDialog) => set({ dialog }),
  closeDialog: () => set({ dialog: null }),
  clearToast: () => set({ toast: "" }),
  /** A short confirmation in the toast region. */
  showToast: (toast: string) => set({ toast }),
  dismissOfferToast: () => set({ offerToast: null }),
  setView: (view: RequestsState["view"]) => set({ view }),
  setLayout: (layout: RequestsState["layout"]) => set({ layout }),

  // ----- Preview tools -----
  /** Replaces the mock state wholesale; time skipped so far is discarded. */
  load: (patch: Partial<RequestsState>) => {
    const now = Date.now();
    state = {
      ...SERVER_STATE,
      ready: true,
      now,
      requests: buildMockRequests(now),
      layout: current().layout,
      loadId: current().loadId + 1,
      ...patch,
    };
    set({});
  },
  /** Simulates time passing. */
  advance: (ms: number) => set({ offset: current().offset + ms }),
  /** Simulates one seller responding: an unread offer plus the toast. Closed requests never receive offers. */
  addOffer: (requestId: string) => {
    const request = current().requests.find((item) => item.id === requestId);
    if (request?.status !== "active") return;
    const now = Date.now() + current().offset;
    const { budgetShare, ...offer } = EXTRA_OFFERS[request.offers.length % EXTRA_OFFERS.length];
    set({
      offerToast: { requestId, storeName: offer.storeName },
      requests: updateRequest(requestId, (item) => ({
        ...item,
        offers: [
          ...item.offers,
          {
            ...offer,
            id: `${item.id}-O${item.offers.length + 1}`,
            price: Math.round((item.budget * budgetShare) / 50) * 50,
            receivedAt: now,
            status: "pending",
            isRead: false,
          },
        ],
      })),
    });
  },
};

let visits = 0;
/** A fresh id for one stay on a request's detail page. */
export const nextRequestVisit = () => ++visits;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useRequests() {
  return useSyncExternalStore(subscribe, current, () => SERVER_STATE);
}

/** Unread offers across all requests. A number, so the navbar only re-renders when it changes. */
export function useUnreadOffers() {
  return useSyncExternalStore(
    subscribe,
    () => unreadOfferCount(current().requests),
    () => 0,
  );
}

/** Keeps countdowns live and closes requests the moment they expire. */
export function useRequestClock() {
  useEffect(() => {
    const timer = setInterval(requestsStore.tick, 1000);
    return () => clearInterval(timer);
  }, []);
}
