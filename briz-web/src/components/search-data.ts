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
}
export interface Store {
  id: string;
  name: string;
  verified: boolean;
  category: string;
  location: string;
  distance: string;
  status: OperatingStatus;
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
export const ALL_PRODUCTS: Product[] = [
  ...DESIGN_PRODUCTS,
  { id: "p3", name: "Wireless earbuds", price: 2499, originalPrice: 3299, image, storeId: "s1", storeName: "Audio World Nepal", location: "Durbar Marg", distance: "1.6 KM", inStock: true },
  { id: "p4", name: "Running shoes", price: 8999, originalPrice: 11500, image, storeId: "s3", storeName: "Sports Arena", location: "Thamel", distance: "0.9 KM", inStock: true },
  { id: "p5", name: "Organic vegetables", price: 450, image, storeId: "s4", storeName: "Green Basket", location: "Kalanki", distance: "5.2 KM", inStock: true },
  { id: "p6", name: "Phone charger", price: 999, originalPrice: 1299, image, storeId: "s5", storeName: "Kathmandu Electronics", location: "New Baneshwor", distance: "1.5 KM", inStock: true },
];
export const ALL_STORES: Store[] = [
  ...DESIGN_STORES,
  { id: "s3", name: "Sports Arena", verified: true, category: "Sports & Fitness", location: "Thamel", distance: "0.9 KM", status: "closed-today" },
  { id: "s4", name: "Green Basket", verified: false, category: "Groceries & Fresh Produce", location: "Kalanki", distance: "5.2 KM", status: "open" },
  { id: "s5", name: "Kathmandu Electronics", verified: true, category: "Electronics & Accessories", location: "New Baneshwor", distance: "1.5 KM", status: "open" },
];
export function searchCatalog(query: string, showAll = false) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return { products: [], stores: [] };
  const products = ALL_PRODUCTS.filter(product => `${product.name} ${product.storeName}`.toLowerCase().includes(normalized));
  const matchingStoreIds = new Set(products.map(product => product.storeId));
  const stores = ALL_STORES.filter(store => matchingStoreIds.has(store.id) || `${store.name} ${store.category}`.toLowerCase().includes(normalized));
  return { products: showAll ? products : products.slice(0, 2), stores: showAll ? stores : stores.slice(0, 2) };
}
