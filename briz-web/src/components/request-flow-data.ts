/**
 * Data structures, category taxonomy and the mock matching engine
 * for the Briz "Request a Product" flow.
 */

export type RequestFlowStep =
  | "form"
  | "matching"
  | "ambiguity"
  | "review"
  | "submitting"
  | "success"
  | "error"
  /** The request was rejected by the content check. */
  | "offensive";

export interface RequestDraft {
  itemName: string;
  quantity: number;
  /** Unit for the quantity; "Pieces" when not set. */
  unit?: string;
  rate: string; // total budget for the requested quantity, e.g. "2500"
  details: string;
  image: File | null;
  imagePreviewUrl: string | null;
  imageName?: string;
  imageSize?: string;
  categoryId: string | null;
}

export interface CategoryOption {
  id: string;
  name: string;
  description: string;
  iconName: "produce" | "electronics" | "automotive" | "clothing" | "books" | "general";
}

export const CATEGORY_OPTIONS: Record<string, CategoryOption> = {
  "fruits-vegetables": {
    id: "fruits-vegetables",
    name: "Fruits & Vegetables",
    description: "Fresh produce, fruits and organic foods",
    iconName: "produce",
  },
  electronics: {
    id: "electronics",
    name: "Electronics",
    description: "Phones, computers, audio and gadgets",
    iconName: "electronics",
  },
  automotive: {
    id: "automotive",
    name: "Automotive & Motor",
    description: "Vehicles, parts, chargers and accessories",
    iconName: "automotive",
  },
  clothing: {
    id: "clothing",
    name: "Clothing & Apparel",
    description: "Men, women and kids fashion & footwear",
    iconName: "clothing",
  },
  books: {
    id: "books",
    name: "Books & Stationery",
    description: "Novels, textbooks, notebooks and office supplies",
    iconName: "books",
  },
  general: {
    id: "general",
    name: "General Marketplace",
    description: "Home essentials, lifestyle and local store items",
    iconName: "general",
  },
};

/**
 * Mock category matching rules.
 * Demonstrates:
 * 1. Ambiguous query "apple" -> Fruits & Vegetables vs Electronics
 * 2. Ambiguous query "charger" -> Electronics vs Automotive
 * 3. Clear/unambiguous matches -> single category
 * 4. Fallback -> single default category
 */
export const MOCK_AMBIGUOUS_MATCHES: Record<string, string[]> = {
  apple: ["fruits-vegetables", "electronics"],
  charger: ["electronics", "automotive"],
};

export const MOCK_UNAMBIGUOUS_KEYWORDS: Record<string, string> = {
  case: "electronics",
  iphone: "electronics",
  phone: "electronics",
  laptop: "electronics",
  mouse: "electronics",
  keyboard: "electronics",
  headphones: "electronics",
  earbuds: "electronics",
  mango: "fruits-vegetables",
  banana: "fruits-vegetables",
  tomato: "fruits-vegetables",
  potato: "fruits-vegetables",
  shirt: "clothing",
  jacket: "clothing",
  shoes: "clothing",
  book: "books",
  pen: "books",
  notebook: "books",
};

/**
 * Prototype matcher function.
 * Returns 1+ category options.
 */
export function findCategoryMatches(itemName: string): CategoryOption[] {
  const normalized = (itemName || "").trim().toLowerCase();

  // 1. Check explicit ambiguous demo cases
  for (const [key, categoryIds] of Object.entries(MOCK_AMBIGUOUS_MATCHES)) {
    if (normalized === key || normalized.includes(key)) {
      return categoryIds.map((id) => CATEGORY_OPTIONS[id]).filter(Boolean);
    }
  }

  // 2. Check keyword matches
  for (const [kw, categoryId] of Object.entries(MOCK_UNAMBIGUOUS_KEYWORDS)) {
    if (normalized.includes(kw)) {
      const match = CATEGORY_OPTIONS[categoryId];
      if (match) return [match];
    }
  }

  // 3. Default fallback category if unambiguous
  return [CATEGORY_OPTIONS["general"]];
}

/** The text fields the content check reads. */
export type ModeratedField = "itemName" | "details";

export const MODERATED_FIELD_LABEL: Record<ModeratedField, string> = {
  itemName: "Item name",
  details: "Item description",
};

/**
 * Placeholder blocklist for the prototype. The real check runs on the server when the
 * request is submitted; this only lets the flow be tried out.
 */
const BLOCKED_WORDS = ["idiot", "stupid", "bastard", "damn", "crap"];

/** Fields whose text contains a blocked word (whole words, any case), in form order. */
export function findOffensiveFields(data: Pick<RequestDraft, "itemName" | "details">): ModeratedField[] {
  const pattern = new RegExp(`\\b(${BLOCKED_WORDS.join("|")})\\b`, "i");
  return (["itemName", "details"] as const).filter((field) => pattern.test(data[field]));
}

/** Thrown by submitRequest when the content check rejects the request. */
export class OffensiveContentError extends Error {
  constructor(public readonly fields: ModeratedField[]) {
    super("Offensive content detected");
    this.name = "OffensiveContentError";
  }
}

/**
 * Prototype mock submission helper.
 * Simulates network submission delay, then the server's content check.
 */
export async function submitRequest(
  data: RequestDraft
): Promise<{ success: boolean; id: string }> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const flagged = findOffensiveFields(data);
  if (flagged.length > 0) throw new OffensiveContentError(flagged);
  return { success: true, id: `req_${Date.now()}` };
}

/**
 * Initial empty draft state.
 */
export const INITIAL_REQUEST_DRAFT: RequestDraft = {
  itemName: "",
  quantity: 1,
  rate: "",
  details: "",
  image: null,
  imagePreviewUrl: null,
  imageName: undefined,
  imageSize: undefined,
  categoryId: null,
};

/** Units offered beside the quantity field. */
export const REQUEST_UNITS = ["Pieces", "kg", "g", "L", "ml", "Packs", "Boxes"];
export const REQUEST_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const REQUEST_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
