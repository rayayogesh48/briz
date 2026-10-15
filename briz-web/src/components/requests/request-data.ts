// Request flow prototype: types, mock records and the pure helpers every screen
// shares. Status, closure reason, offer status, timestamps and prices are kept as
// separate fields; the UI strings are derived from them.

export type RequestStatus = "active" | "closed";
export type ClosureReason = "expired" | "cancelled";
export type OfferStatus = "pending" | "interested" | "declined";
export type OfferMatch = "exact" | "similar" | "alternative";
export type Fulfilment = "delivery" | "pickup";

export type SellerOffer = {
  id: string;
  storeName: string;
  storeLogo: string | null;
  verified: boolean;
  rating: number;
  distanceKm: number;
  fulfilment: Fulfilment[];
  description: string;
  match: OfferMatch;
  /** Total price for the requested quantity, in rupees. */
  price: number;
  receivedAt: number;
  status: OfferStatus;
  /** False until the user has opened the request and seen this offer. */
  isRead: boolean;
};

export type BrizRequest = {
  id: string;
  itemName: string;
  /** Category name, when one was matched or chosen. */
  category: string | null;
  quantity: number;
  unit: string;
  /** Total budget for the requested quantity, in rupees. */
  budget: number;
  description: string;
  image: string | null;
  status: RequestStatus;
  closureReason: ClosureReason | null;
  createdAt: number;
  expiresAt: number;
  closedAt: number | null;
  offers: SellerOffer[];
};

export const REQUEST_LIFETIME = 24 * 60 * 60 * 1000;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

// Category names used by the mock records. Matching and ambiguity live in the request widget.
const CATEGORY_NAME: Record<string, string> = {
  electronics: "Phones & Electronics",
  agriculture: "Agriculture & Farming",
  home: "Home & Kitchen",
  fashion: "Clothing & Fashion",
  grocery: "Grocery & Staples",
};

// ---------- Formatting ----------

export const formatRs = (amount: number) => `Rs. ${Math.round(amount).toLocaleString("en-IN")}`;

export const formatQuantity = (request: Pick<BrizRequest, "quantity" | "unit">) =>
  `${request.quantity.toLocaleString("en-IN")} ${request.quantity === 1 && request.unit.endsWith("s") ? request.unit.slice(0, -1) : request.unit}`;

/** "23h 42m", then "42m 10s" inside the last hour, then "45s". */
export function formatRemaining(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

export function formatAgo(ms: number) {
  if (ms < MINUTE) return "just now";
  if (ms < HOUR) {
    const minutes = Math.floor(ms / MINUTE);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }
  if (ms < 24 * HOUR) {
    const hours = Math.floor(ms / HOUR);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  const days = Math.floor(ms / (24 * HOUR));
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

export const formatDateTime = (time: number) =>
  new Date(time)
    .toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true })
    .replace(/\b(am|pm)\b/, (meridiem) => meridiem.toUpperCase());

export const offerCountLabel = (count: number) => (count === 0 ? "No offers yet" : count === 1 ? "1 seller offer" : `${count} seller offers`);

export const newOfferLabel = (count: number) => (count === 1 ? "1 new offer" : `${count} new offers`);

/** Navbar badge text: the real count up to 9, then "9+". */
export const badgeLabel = (count: number) => (count > 9 ? "9+" : String(count));

export const MATCH_LABEL: Record<OfferMatch, string> = {
  exact: "Exact match",
  similar: "Similar product",
  alternative: "Alternative available",
};

export const FULFILMENT_LABEL: Record<Fulfilment, string> = { delivery: "Online delivery", pickup: "Store pickup" };

// ---------- Offer maths ----------

/**
 * Counting rule, used by the list and the detail page alike. Every offer received
 * counts, whatever the user did with it: marking an offer Interested or Declined
 * never removes it from the count, the lowest price or the average.
 */
export function offerStats(request: BrizRequest) {
  const prices = request.offers.map((offer) => offer.price);
  return {
    count: prices.length,
    unread: request.offers.filter((offer) => !offer.isRead).length,
    lowest: prices.length ? Math.min(...prices) : null,
    average: prices.length ? prices.reduce((sum, price) => sum + price, 0) / prices.length : null,
  };
}

/** The navbar badge: unread offers across every request, open or closed. */
export const unreadOfferCount = (requests: BrizRequest[]) =>
  requests.reduce((total, request) => total + request.offers.filter((offer) => !offer.isRead).length, 0);

/** Positive = rupees over budget; zero or negative = within budget. */
export const overBudget = (offer: SellerOffer, request: BrizRequest) => offer.price - request.budget;

// ---------- Mock records ----------

// Unsplash photos that roughly match each product; requests without a fitting photo use the placeholder.
const photo = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=240&h=240&q=70`;

export const MOCK_IMAGES = {
  seeds: photo("1574323347407-f5e1ad6d020b"),
  phoneCase: photo("1601784551446-20c9e07cdbdb"),
  bedsheet: photo("1522771739844-6a9f6d5f14af"),
  rice: photo("1586201375761-83865001e31c"),
  backpack: photo("1553062407-98eeb64c6a62"),
  bottle: "/products/bottle-main.svg",
};
const IMG = MOCK_IMAGES;

const LOGO = ["/figma/results/store-imgAvatarImage1.png", "/figma/results/store-imgAvatarImage2.png", "/figma/results/fashion-store-logo.png"];

type OfferSeed = Omit<SellerOffer, "id" | "receivedAt" | "status" | "storeLogo" | "verified" | "isRead"> &
  Partial<Pick<SellerOffer, "status" | "storeLogo" | "verified">> & { hoursAgo: number; unread?: boolean };

type RequestSeed = Omit<BrizRequest, "category" | "status" | "closureReason" | "createdAt" | "expiresAt" | "closedAt" | "offers"> & {
  categoryId: string | null;
  hoursAgo: number;
  cancelledHoursAgo?: number;
  offers: OfferSeed[];
};

const SEEDS: RequestSeed[] = [
  {
    id: "BR-REQ-001",
    itemName: "Organic mustard seeds",
    categoryId: "agriculture",
    quantity: 5,
    unit: "kg",
    budget: 2500,
    description: "Organic mustard seeds for farming use. Untreated, this season's stock, in sealed packs if possible.",
    image: IMG.seeds,
    hoursAgo: 5.6,
    offers: [
      {
        storeName: "Everest Agro Store",
        storeLogo: LOGO[0],
        verified: true,
        rating: 4.8,
        distanceKm: 1.2,
        fulfilment: ["pickup"],
        description: "We have the requested variety available in 5 kg packs.",
        match: "exact",
        price: 2200,
        hoursAgo: 0.4,
        unread: true,
      },
      {
        storeName: "Green Valley Supplies",
        storeLogo: LOGO[1],
        verified: true,
        rating: 4.6,
        distanceKm: 2.4,
        fulfilment: ["delivery"],
        description: "Certified organic mustard seed, packed last month. We can deliver inside the valley by tomorrow evening.",
        match: "exact",
        price: 2500,
        hoursAgo: 1.2,
        unread: true,
      },
      {
        storeName: "Local Farm Mart",
        rating: 4.5,
        distanceKm: 3.1,
        fulfilment: ["pickup"],
        description:
          "We don't stock the organic variety right now, but we have a high-yield hybrid mustard seed that many farmers nearby use. It comes in 1 kg packs, so you would get five packs. Germination rate is printed on each pack and we can show you the batch before you buy.",
        match: "similar",
        price: 2800,
        hoursAgo: 4.2,
      },
    ],
  },
  {
    id: "BR-REQ-002",
    itemName: "Electric water pump 1 HP",
    categoryId: "agriculture",
    quantity: 1,
    unit: "Pieces",
    budget: 18000,
    description: "Single-phase 1 HP pump for a ground-floor water tank. Copper winding preferred.",
    image: null,
    hoursAgo: 0.35,
    offers: [],
  },
  {
    id: "BR-REQ-003",
    itemName: "Cotton bedsheet set",
    categoryId: "home",
    quantity: 2,
    unit: "Pieces",
    budget: 3000,
    description: "King size, pure cotton, plain light colours. Two pillow covers with each sheet.",
    image: IMG.bedsheet,
    hoursAgo: 9.2,
    offers: [
      {
        storeName: "Patan Home Furnishing",
        storeLogo: LOGO[2],
        verified: true,
        rating: 4.7,
        distanceKm: 0.9,
        fulfilment: ["delivery", "pickup"],
        description: "King size cotton sets in white, cream and sky blue. Two pillow covers included.",
        match: "exact",
        price: 2900,
        hoursAgo: 0.8,
        unread: true,
      },
    ],
  },
  {
    id: "BR-REQ-004",
    itemName: "iPhone 15 Pro case",
    categoryId: "electronics",
    quantity: 2,
    unit: "Pieces",
    budget: 2500,
    description: "Black silicone case, MagSafe compatible.",
    image: IMG.phoneCase,
    hoursAgo: 14,
    offers: [
      {
        storeName: "Everest Electronics",
        storeLogo: LOGO[1],
        verified: true,
        rating: 4.9,
        distanceKm: 1.6,
        fulfilment: ["delivery", "pickup"],
        description: "Original-fit silicone MagSafe cases in black. Two in stock today.",
        match: "exact",
        price: 2400,
        hoursAgo: 11,
        status: "interested",
      },
      {
        storeName: "Mobile Hub New Road",
        rating: 4.3,
        distanceKm: 4.8,
        fulfilment: ["pickup"],
        description: "We have a matte TPU case with MagSafe ring, not silicone.",
        match: "alternative",
        price: 1800,
        hoursAgo: 12.5,
      },
    ],
  },
  {
    id: "BR-REQ-005",
    itemName: "Basmati rice",
    categoryId: "grocery",
    quantity: 25,
    unit: "kg",
    budget: 4500,
    description: "Long-grain aged basmati, one 25 kg sack.",
    image: IMG.rice,
    hoursAgo: 19.5,
    offers: [
      {
        storeName: "Green Basket",
        storeLogo: LOGO[0],
        verified: true,
        rating: 4.7,
        distanceKm: 2.0,
        fulfilment: ["delivery"],
        description: "One-year aged basmati, 25 kg sack, free delivery in Lalitpur.",
        match: "exact",
        price: 4400,
        hoursAgo: 15,
      },
      {
        storeName: "Baneshwor Kirana Pasal",
        rating: 4.2,
        distanceKm: 0.6,
        fulfilment: ["pickup"],
        description: "Regular long-grain rice, 25 kg sack.",
        match: "similar",
        price: 3600,
        hoursAgo: 17,
        status: "declined",
      },
      {
        storeName: "Himalayan Wholesale Traders",
        verified: true,
        rating: 4.5,
        distanceKm: 5.3,
        fulfilment: ["delivery", "pickup"],
        description: "Premium aged basmati in a sealed 25 kg sack.",
        match: "exact",
        price: 4900,
        hoursAgo: 18,
      },
    ],
  },
  {
    id: "BR-REQ-006",
    itemName: "Stainless steel insulated double-wall vacuum water bottle with bamboo lid, 750 ml (matte black)",
    categoryId: "home",
    quantity: 6,
    unit: "Pieces",
    budget: 7200,
    description: "For an office gift set. All six should be the same colour.",
    image: IMG.bottle,
    hoursAgo: 21.4,
    offers: [
      {
        storeName: "Urban Essentials Home, Kitchen & Lifestyle Store — Jhamsikhel Branch",
        storeLogo: LOGO[0],
        verified: true,
        rating: 4.9,
        distanceKm: 1.8,
        fulfilment: ["delivery"],
        description: "Six matte black 750 ml bottles with bamboo lids, gift boxed.",
        match: "exact",
        price: 7200,
        hoursAgo: 8,
      },
      {
        storeName: "Thamel Outdoor Gear",
        rating: 4.4,
        distanceKm: 6.2,
        fulfilment: ["pickup"],
        description: "Same size and finish with a steel lid instead of bamboo.",
        match: "similar",
        price: 7200,
        hoursAgo: 10,
      },
    ],
  },
  {
    id: "BR-REQ-007",
    itemName: "Commercial rice mill machine",
    categoryId: "agriculture",
    quantity: 1,
    unit: "Pieces",
    budget: 1250000,
    description: "Combined huller and polisher, around 1 tonne per hour, with installation.",
    image: null,
    hoursAgo: 3,
    offers: [
      {
        storeName: "Terai Agro Machinery",
        verified: true,
        rating: 4.6,
        distanceKm: 12.5,
        fulfilment: ["delivery"],
        description: "1.2 tonne per hour combined mill with installation and one year of service.",
        match: "similar",
        price: 1385000,
        hoursAgo: 1,
      },
    ],
  },
  {
    id: "BR-REQ-008",
    itemName: "Pressure cooker 5 L",
    categoryId: "home",
    quantity: 1,
    unit: "Pieces",
    budget: 3200,
    description: "Induction-base aluminium cooker with a spare gasket.",
    image: null,
    hoursAgo: 31,
    offers: [
      {
        storeName: "Patan Home Furnishing",
        storeLogo: LOGO[2],
        verified: true,
        rating: 4.7,
        distanceKm: 0.9,
        fulfilment: ["pickup"],
        description: "5 L induction-base cooker with a spare gasket and safety valve.",
        match: "exact",
        price: 2950,
        hoursAgo: 26,
        status: "interested",
      },
      {
        storeName: "Kitchen Corner Kalimati",
        rating: 4.1,
        distanceKm: 3.7,
        fulfilment: ["delivery"],
        description: "5 L stainless steel model, slightly heavier.",
        match: "similar",
        price: 3600,
        hoursAgo: 28,
      },
    ],
  },
  {
    id: "BR-REQ-009",
    itemName: "Handmade Dhaka topi",
    categoryId: null,
    quantity: 3,
    unit: "Pieces",
    budget: 1800,
    description: "Traditional Palpali Dhaka pattern, sizes 56 to 58.",
    image: null,
    hoursAgo: 52,
    offers: [],
  },
  {
    id: "BR-REQ-010",
    itemName: "Kids school backpack",
    categoryId: "fashion",
    quantity: 1,
    unit: "Pieces",
    budget: 1500,
    description: "Lightweight, for a seven-year-old, with a bottle pocket.",
    image: IMG.backpack,
    hoursAgo: 40,
    cancelledHoursAgo: 33,
    offers: [
      {
        storeName: "Vibe Streetwear Nepal",
        storeLogo: LOGO[2],
        verified: true,
        rating: 4.5,
        distanceKm: 2.9,
        fulfilment: ["delivery", "pickup"],
        description: "Kids 18 L backpack with two bottle pockets, five colours.",
        match: "exact",
        price: 1350,
        hoursAgo: 36,
      },
    ],
  },
];

export const REQUEST_IDS = {
  multipleOffers: "BR-REQ-001",
  noOffers: "BR-REQ-002",
  oneOffer: "BR-REQ-003",
  interested: "BR-REQ-004",
  declined: "BR-REQ-005",
  expiredWithOffers: "BR-REQ-008",
  expiredNoOffers: "BR-REQ-009",
  cancelled: "BR-REQ-010",
};

/** Builds the mock dataset relative to `now`, so countdowns are always derived from real timestamps. */
export function buildMockRequests(now: number): BrizRequest[] {
  return SEEDS.map(({ hoursAgo, cancelledHoursAgo, offers, categoryId, ...seed }) => {
    const createdAt = now - hoursAgo * HOUR;
    const expiresAt = createdAt + REQUEST_LIFETIME;
    const cancelledAt = cancelledHoursAgo === undefined ? null : now - cancelledHoursAgo * HOUR;
    const expired = expiresAt <= now;
    return {
      ...seed,
      category: categoryId ? CATEGORY_NAME[categoryId] : null,
      createdAt,
      expiresAt,
      status: cancelledAt || expired ? "closed" : "active",
      closureReason: cancelledAt ? "cancelled" : expired ? "expired" : null,
      closedAt: cancelledAt ?? (expired ? expiresAt : null),
      offers: offers.map(({ hoursAgo: offerHoursAgo, unread, ...offer }, index) => ({
        storeLogo: null,
        verified: false,
        status: "pending",
        isRead: !unread,
        ...offer,
        id: `${seed.id}-O${index + 1}`,
        receivedAt: now - offerHoursAgo * HOUR,
      })),
    };
  });
}

/**
 * Preview helper: sets exactly how many offers are unread on each request (newest
 * first) and marks every other offer read.
 */
export function withUnread(requests: BrizRequest[], unread: Record<string, number>): BrizRequest[] {
  return requests.map((request) => {
    const newest = [...request.offers].sort((a, b) => b.receivedAt - a.receivedAt).slice(0, unread[request.id] ?? 0);
    return { ...request, offers: request.offers.map((offer) => ({ ...offer, isRead: !newest.includes(offer) })) };
  });
}

/** Pool the "Add a seller offer" preview tool draws from. Prices are a share of the request budget. */
export const EXTRA_OFFERS: (Omit<SellerOffer, "id" | "receivedAt" | "status" | "price" | "isRead"> & { budgetShare: number })[] = [
  {
    storeName: "Kathmandu Electronics",
    storeLogo: LOGO[1],
    verified: true,
    rating: 4.8,
    distanceKm: 1.5,
    fulfilment: ["delivery", "pickup"],
    description: "We have this in stock and can hold it for you until tomorrow.",
    match: "exact",
    budgetShare: 0.94,
  },
  {
    storeName: "Sajha Bazaar",
    storeLogo: null,
    verified: false,
    rating: 4.2,
    distanceKm: 3.9,
    fulfilment: ["pickup"],
    description: "A close alternative from another brand is available today.",
    match: "alternative",
    budgetShare: 0.82,
  },
  {
    storeName: "Lalitpur Trade Centre",
    storeLogo: LOGO[0],
    verified: true,
    rating: 4.6,
    distanceKm: 2.7,
    fulfilment: ["delivery"],
    description: "Available in the quantity you asked for, with delivery inside Ring Road.",
    match: "similar",
    budgetShare: 1.12,
  },
];
