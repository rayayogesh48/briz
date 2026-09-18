// Local demo catalog. Replace these records with catalog API responses in production.
export type OperatingStatus = "open" | "closed" | "closed-today";
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  storeId: string;
  storeName: string;
  location: string;
  distance: string;
  inStock: boolean;
  category?: string;
  subcategory?: string;
  addedAt?: string;
  askForPrice?: boolean;
}
export interface Store {
  id: string;
  name: string;
  verified: boolean;
  category: string;
  location: string;
  distance: string;
  status: OperatingStatus;
  mainCategory?: string;
  subcategory?: string;
  rating?: number;
  reviewCount?: number;
  joinedAt?: string;
  cover?: string;
  logo?: string;
}
export const INITIAL_RECENT = [
  { id: "1", query: "Wireless headphones" },
  { id: "2", query: "Protein powder" },
  { id: "3", query: "Running shoes" },
  { id: "4", query: "Organic vegetables" },
];
export const SUGGESTIONS = ["Wireless earbuds", "Gift hampers", "Indoor plants", "Running shoes", "Phone charger"];
const image = "/figma/avatar.png";
export const DESIGN_PRODUCTS: Product[] = [
  { id: "p1", name: "Wireless Bluetooth Headphones", price: 500, originalPrice: 999, image, storeId: "s1", storeName: "Audio World Nepal", location: "Durbar Marg", distance: "1.6 KM", inStock: true },
  { id: "p2", name: "Wireless Bluetooth Headphones", price: 500, originalPrice: 999, image, storeId: "s2", storeName: "Sound Haven", location: "Putalisadak", distance: "1.6 KM", inStock: true },
];
export const DESIGN_STORES: Store[] = [
  { id: "s1", name: "Audio World Nepal", verified: false, category: "Audio & Music Equipment", location: "Durbar Marg", distance: "1.6 KM", status: "open" },
  { id: "s2", name: "Sound Haven", verified: false, category: "Musical Instruments Store", location: "Putalisadak", distance: "2.3 KM", status: "closed" },
];
const BASE_PRODUCTS: Product[] = [
  ...DESIGN_PRODUCTS,
  { id: "p3", name: "Wireless earbuds", price: 2499, originalPrice: 3299, image, storeId: "s1", storeName: "Audio World Nepal", location: "Durbar Marg", distance: "1.6 KM", inStock: true },
  { id: "p4", name: "Running shoes", price: 8999, originalPrice: 11500, image, storeId: "s3", storeName: "Sports Arena", location: "Thamel", distance: "0.9 KM", inStock: true },
  { id: "p5", name: "Organic vegetables", price: 450, image, storeId: "s4", storeName: "Green Basket", location: "Kalanki", distance: "5.2 KM", inStock: true },
  { id: "p6", name: "Phone charger", price: 999, originalPrice: 1299, image, storeId: "s5", storeName: "Kathmandu Electronics", location: "New Baneshwor", distance: "1.5 KM", inStock: true },
];
const BASE_STORES: Store[] = [
  ...DESIGN_STORES,
  { id: "s3", name: "Sports Arena", verified: true, category: "Sports & Fitness", location: "Thamel", distance: "0.9 KM", status: "closed-today" },
  { id: "s4", name: "Green Basket", verified: false, category: "Groceries & Fresh Produce", location: "Kalanki", distance: "5.2 KM", status: "open" },
  { id: "s5", name: "Kathmandu Electronics", verified: true, category: "Electronics & Accessories", location: "New Baneshwor", distance: "1.5 KM", status: "open" },
];
// Sample metadata is deterministic so filtering and every sort can be previewed.
const departments: Record<string, [string, string]> = {
  s1: ["Electronics", "Audio & Headphones"], s2: ["Electronics", "Audio & Headphones"],
  s3: ["Sports & Fitness", "Footwear"], s4: ["Groceries", "Fresh Produce"],
  s5: ["Electronics", "Mobile Accessories"],
};
export const ALL_PRODUCTS: Product[] = [
  ...BASE_PRODUCTS.map((product, index) => ({ ...product, category: departments[product.storeId][0], subcategory: departments[product.storeId][1], addedAt: `2026-08-${String(10 + index).padStart(2, "0")}` })),
  ...[
    ["Thermal Paper 58 mm (Pack of 10 Pcs)", 500, 650, "s6", "Office Supplies", "Thermal Paper", true],
    ["Thermal Paper 80 mm (Pack of 10 Pcs)", 850, 999, "s7", "Office Supplies", "Thermal Paper", true],
    ["Thermal Paper 58 mm (Pack of 5 Pcs)", 280, 0, "s8", "Office Supplies", "Thermal Paper", true],
    ["Thermal Paper 80 mm (Pack of 20 Pcs)", 1500, 1900, "s6", "Office Supplies", "Thermal Paper", true],
    ["Thermal Paper POS Receipt Rolls (Pack of 10)", 650, 850, "s7", "Office Supplies", "Receipt Rolls", true],
    ["Thermal Paper 57 mm (Pack of 10 Pcs)", 450, 0, "s8", "Office Supplies", "Thermal Paper", false],
    ["Thermal Paper Premium Receipt Rolls", 0, 0, "s9", "Office Supplies", "Receipt Rolls", true],
    ["Thermal Paper 58 mm (Carton of 50)", 2200, 2500, "s9", "Office Supplies", "Thermal Paper", true],
    ["Thermal Paper Self-Adhesive Labels", 750, 900, "s7", "Office Supplies", "Labels & Stickers", true],
    ["Thermal Paper Shipping Labels (100 Pcs)", 350, 0, "s8", "Office Supplies", "Labels & Stickers", true],
    ["Thermal Paper 80 mm (Single Roll)", 95, 120, "s6", "Office Supplies", "Receipt Rolls", true],
    ["Thermal Paper Bulk Receipt Rolls", 0, 0, "s9", "Office Supplies", "Receipt Rolls", false],
  ].map((row, index) => {
    const [name, price, originalPrice, storeId, category, subcategory, inStock] = row as [string, number, number, string, string, string, boolean];
    const store = { s6: ["Himalayan Bazzar", "New Baneshwor", "1.6 KM"], s7: ["Paper & Print Nepal", "Putalisadak", "2.3 KM"], s8: ["Kathmandu Stationery", "Koteshwor", "0.8 KM"], s9: ["Office Essentials", "Lalitpur", "3.2 KM"] }[storeId]!;
    return { id: `paper-${index + 1}`, name, price, originalPrice: originalPrice || undefined, storeId, category, subcategory, inStock, askForPrice: !price, image: "/figma/results/product-imgPhoneImage.png", storeName: store[0], location: store[1], distance: store[2], addedAt: `2026-09-${String(index + 1).padStart(2, "0")}` };
  }),
];
export const ALL_STORES: Store[] = [
  ...BASE_STORES.map((store, index) => ({ ...store, mainCategory: departments[store.id][0], subcategory: departments[store.id][1], rating: [4.8, 4.3, 4.9, 4.6, 4.7][index], reviewCount: 24 + index * 9, joinedAt: `2026-0${index + 1}-01` })),
  { id: "s6", name: "Himalayan Bazzar", verified: true, category: "Grocery & Office Supplies", mainCategory: "Office Supplies", subcategory: "Thermal Paper", location: "New Baneshwor", distance: "1.6 KM", status: "open", rating: 5, reviewCount: 32, joinedAt: "2025-06-12", cover: "/figma/results/store-imgImage1.png", logo: "/figma/results/store-imgAvatarImage1.png" },
  { id: "s7", name: "Paper & Print Nepal", verified: true, category: "Office Supplies", mainCategory: "Office Supplies", subcategory: "Receipt Rolls", location: "Putalisadak", distance: "2.3 KM", status: "open", rating: 4.8, reviewCount: 48, joinedAt: "2026-08-12" },
  { id: "s8", name: "Kathmandu Stationery", verified: false, category: "Stationery & Paper", mainCategory: "Office Supplies", subcategory: "Thermal Paper", location: "Koteshwor", distance: "0.8 KM", status: "closed", rating: 4.6, reviewCount: 19, joinedAt: "2026-09-10" },
  { id: "s9", name: "Office Essentials", verified: true, category: "Office Supplies", mainCategory: "Office Supplies", subcategory: "Receipt Rolls", location: "Lalitpur", distance: "3.2 KM", status: "open", rating: 4.9, reviewCount: 67, joinedAt: "2026-04-02" },
];
export const categoryLabel = (category: string) => category === "Office Supplies" ? "Books & Stationery" : category;

export function matchesQuery(text: string, query: string) {
  return query.trim().toLowerCase().split(/\s+/).every(word => text.toLowerCase().includes(word));
}
export function searchCatalog(query: string, showAll = false) {
  if (!query.trim()) return { products: [], stores: [] };
  const products = ALL_PRODUCTS.filter(product => matchesQuery(`${product.name} ${product.storeName} ${product.category} ${categoryLabel(product.category || "")} ${product.subcategory}`, query));
  const matchingStoreIds = new Set(products.map(product => product.storeId));
  const stores = ALL_STORES.filter(store => matchingStoreIds.has(store.id) || matchesQuery(`${store.name} ${store.category} ${categoryLabel(store.mainCategory || "")}`, query));
  return { products: showAll ? products : products.slice(0, 2), stores: showAll ? stores : stores.slice(0, 2) };
}
