/**
 * Data structures, category taxonomy, mock matching engine,
 * and prototype preset states for the Briz "Request a Product" flow.
 */

export type RequestFlowStep =
  | "form"
  | "matching"
  | "ambiguity"
  | "review"
  | "submitting"
  | "success"
  | "error";

export type PrototypeState =
  | "form-empty"
  | "form-filled"
  | "validation-error"
  | "image-uploading"
  | "image-attached"
  | "matching"
  | "ambiguity"
  | "ambiguity-selected"
  | "review"
  | "submitting"
  | "success"
  | "error";

export interface RequestDraft {
  itemName: string;
  quantity: number;
  rate: string; // e.g. "2500"
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

/**
 * Prototype mock submission helper.
 * Simulates network submission delay.
 */
export async function submitRequest(
  _data: RequestDraft
): Promise<{ success: boolean; id: string }> {
  void _data;
  await new Promise((resolve) => setTimeout(resolve, 800));
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

/**
 * Realistic mock data preset for "form-filled" and "review".
 */
export const MOCK_FILLED_DRAFT: RequestDraft = {
  itemName: "iPhone 15 Pro case",
  quantity: 2,
  rate: "2500",
  details: "Black silicone case, MagSafe compatible.",
  image: null,
  imagePreviewUrl: null,
  categoryId: "electronics",
};

/**
 * Realistic mock data preset for "image-attached".
 */
export const MOCK_ATTACHED_IMAGE_DRAFT: RequestDraft = {
  ...MOCK_FILLED_DRAFT,
  imageName: "product-photo.jpg",
  imageSize: "1.2 MB",
  imagePreviewUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' rx='12' fill='%23eff4ff'/><rect x='28' y='22' width='44' height='56' rx='8' fill='%233e63dd'/><circle cx='50' cy='38' r='7' fill='%23ffffff'/><rect x='44' y='52' width='12' height='16' rx='2' fill='%23ffffff'/></svg>",
};

/**
 * Preset data for ambiguous demo state.
 */
export const MOCK_AMBIGUOUS_DRAFT: RequestDraft = {
  itemName: "Apple",
  quantity: 1,
  rate: "",
  details: "",
  image: null,
  imagePreviewUrl: null,
  categoryId: null,
};

/**
 * Preset data for ambiguous with category selected.
 */
export const MOCK_AMBIGUOUS_SELECTED_DRAFT: RequestDraft = {
  itemName: "Apple",
  quantity: 1,
  rate: "",
  details: "",
  image: null,
  imagePreviewUrl: null,
  categoryId: "electronics",
};

