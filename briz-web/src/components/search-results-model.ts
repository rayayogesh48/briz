import { ALL_PRODUCTS, ALL_STORES, categoryLabel, matchesQuery, type Product, type Store } from "./search-data";

export const PRODUCT_SORTS = { relevance: "Relevance", nearest: "Nearest", newest: "New Arrivals", "price-asc": "Amount (Low - High)", "price-desc": "Amount (High - Low)", discount: "Discount" };
export const STORE_SORTS = { nearest: "Nearest", rating: "Top Rated", verified: "Verified", newest: "Newly Joined" };
// Display the Figma taxonomy while preserving existing Office Supplies URLs/data.
export const CATEGORIES = [...new Set([
  "Agriculture & Farming", "Arts & Handicrafts", "Bakery & Sweets", "Beauty & Cosmetics", "Books & Stationery", "Clothing & Apparel",
  ...ALL_PRODUCTS.map(product => categoryLabel(product.category!)),
])].sort((a, b) => a.localeCompare(b));
export const subcategoriesFor = (category: string) => {
  if (category === "Agriculture & Farming") {
    return ["Seeds", "Fertilizers", "Pesticides", "Farm Equipments", "Animal Feed", "Greenhouse Materials"];
  }
  return [...new Set(ALL_PRODUCTS.filter(product => !category || categoryLabel(product.category!) === categoryLabel(category)).map(product => product.subcategory!))];
};
export const money = (value: number) => `Rs. ${value.toLocaleString("en-IN")}`;
export const discountOf = (product: Product) => product.originalPrice && product.originalPrice > product.price && !product.askForPrice ? (product.originalPrice - product.price) / product.originalPrice : 0;
const distanceOf = (item: Product | Store) => Number.parseFloat(item.distance);
const priceParam = (value: string | null) => value?.trim() && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : undefined;
const relevance = (product: Product, query: string) => product.name.toLowerCase() === query.toLowerCase() ? 2 : product.name.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;

export function getSearchResults(params: Pick<URLSearchParams, "get">) {
  const query = params.get("q")?.trim() || "";
  const view = params.get("type") === "stores" ? "stores" : "products";
  const category = CATEGORIES.find(category => category === categoryLabel(params.get("category") || "")) || "";
  const subcategory = subcategoriesFor(category).find(item => item === params.get("subcategory")) || "";
  let min = priceParam(params.get("min"));
  let max = priceParam(params.get("max"));
  if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min];
  const sortOptions = view === "products" ? PRODUCT_SORTS : STORE_SORTS;
  const sort = Object.hasOwn(sortOptions, params.get("sort") || "") ? params.get("sort")! : view === "products" ? "relevance" : "nearest";
  const storeId = ALL_STORES.some(store => store.id === params.get("store")) ? params.get("store")! : "";
  const queriedProducts = ALL_PRODUCTS.filter(product => matchesQuery(`${product.name} ${product.storeName} ${product.category} ${categoryLabel(product.category || "")} ${product.subcategory}`, query));
  const queryStoreIds = new Set(queriedProducts.map(product => product.storeId));
  const queriedStores = ALL_STORES.filter(store => queryStoreIds.has(store.id) || matchesQuery(`${store.name} ${store.category} ${store.mainCategory} ${categoryLabel(store.mainCategory || "")}`, query));
  const matchesFilters = (product: Product) => (!category || categoryLabel(product.category!) === category) && (!subcategory || product.subcategory === subcategory) && (!storeId || product.storeId === storeId) && ((min === undefined && max === undefined) || (!product.askForPrice && (min === undefined || product.price >= min) && (max === undefined || product.price <= max)));
  const products = queriedProducts.filter(matchesFilters);
  const stores = queriedStores.filter(store => (!storeId || store.id === storeId) && ((!category && !subcategory && min === undefined && max === undefined) || ALL_PRODUCTS.some(product => product.storeId === store.id && matchesFilters(product))));
  products.sort((a, b) => {
    if (view === "stores") return 0;
    if (sort === "nearest") return distanceOf(a) - distanceOf(b);
    if (sort === "newest") return (b.addedAt || "").localeCompare(a.addedAt || "");
    if (sort === "discount") return discountOf(b) - discountOf(a);
    if (sort === "price-asc" || sort === "price-desc") {
      if (Boolean(a.askForPrice) !== Boolean(b.askForPrice)) return a.askForPrice ? 1 : -1;
      return sort === "price-asc" ? a.price - b.price : b.price - a.price;
    }
    return relevance(b, query) - relevance(a, query);
  });
  stores.sort((a, b) => {
    if (view === "stores" && sort === "rating") return (b.rating || 0) - (a.rating || 0);
    if (view === "stores" && sort === "verified") return Number(b.verified) - Number(a.verified) || distanceOf(a) - distanceOf(b);
    if (view === "stores" && sort === "newest") return (b.joinedAt || "").localeCompare(a.joinedAt || "");
    return distanceOf(a) - distanceOf(b);
  });
  return { query, view, category, subcategory, min, max, sort, storeId, products, stores };
}
