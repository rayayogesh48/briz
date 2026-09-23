export interface ProductAttribute {
  label: string;
  value: string;
}

export interface ProductSeller {
  id: string;
  name: string;
  verified: boolean;
  rating?: number;
  reviewCount?: number;
  deliveryType: "online" | "pickup" | "both";
  address: string;
  storeSlug: string;
  logo?: string;
}

export interface DetailedProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string;
  currentPrice: number;
  originalPrice?: number;
  inStock: boolean;
  distance: string;
  distanceKm: number;
  shortSummary: string;
  description: string;
  attributes: ProductAttribute[];
  images: string[];
  seller: ProductSeller;
}

export interface SimilarProduct {
  id: string;
  slug: string;
  name: string;
  currentPrice: number;
  originalPrice?: number;
  image: string;
  storeName: string;
  distance: string;
  inStock: boolean;
}

export function formatPriceNPR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

export function calculateDiscount(currentPrice: number, originalPrice?: number): number {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

export const MAIN_PRODUCT: DetailedProduct = {
  id: "prod-water-bottle-750",
  slug: "insulated-stainless-steel-water-bottle-750ml",
  name: "Insulated Stainless Steel Water Bottle, 750 ml",
  category: "Home & Kitchen",
  subcategory: "Drinkware",
  currentPrice: 1250,
  originalPrice: 1650,
  inStock: true,
  distance: "1.8 km from your location",
  distanceKm: 1.8,
  shortSummary:
    "Keep your drinks hot or cold with a reusable stainless steel bottle made for work, travel, and everyday use.",
  description:
    "A reusable stainless steel bottle for your everyday routine. Its insulated design helps maintain drink temperature, while the screw-top lid makes it convenient to carry. Built with double-wall copper-plated vacuum insulation, it maintains hot beverages for up to 12 hours and refreshing cold drinks for up to 24 hours without external sweat. Crafted from premium 18/8 food-grade stainless steel that never retains odors or alters flavors.",
  attributes: [
    { label: "Capacity", value: "750 ml" },
    { label: "Material", value: "Stainless steel" },
    { label: "Colour", value: "Midnight blue" },
    { label: "Lid type", value: "Screw top" },
    { label: "Care", value: "Hand wash recommended" },
  ],
  images: [
    "/products/bottle-main.svg",
    "/products/bottle-angle.svg",
    "/products/bottle-detail.svg",
    "/products/bottle-lifestyle.svg",
    "/products/bottle-outdoor.svg",
  ],
  seller: {
    id: "s-urban-essentials",
    name: "Urban Essentials",
    verified: true,
    rating: 4.7,
    reviewCount: 128,
    deliveryType: "both",
    address: "New Baneshwor, Kathmandu",
    storeSlug: "s6",
    logo: "/figma/results/store-imgAvatarImage1.png",
  },
};

export const SIMILAR_PRODUCTS: SimilarProduct[] = [
  {
    id: "sim-1",
    slug: "vacuum-insulated-travel-tumbler-500ml",
    name: "Vacuum Insulated Travel Tumbler, 500 ml",
    currentPrice: 950,
    originalPrice: 1200,
    image: "/products/similar-1.svg",
    storeName: "Urban Essentials",
    distance: "1.8 km from your location",
    inStock: true,
  },
  {
    id: "sim-2",
    slug: "stainless-steel-sports-bottle-1l",
    name: "Stainless Steel Sports Bottle with Straw Lid, 1 L",
    currentPrice: 1450,
    originalPrice: 1800,
    image: "/products/similar-2.svg",
    storeName: "Sports Arena",
    distance: "0.9 km from your location",
    inStock: true,
  },
  {
    id: "sim-3",
    slug: "borosilicate-glass-water-bottle-650ml",
    name: "Borosilicate Glass Water Bottle with Silicone Sleeve, 650 ml",
    currentPrice: 850,
    image: "/products/similar-3.svg",
    storeName: "Himalayan Bazzar",
    distance: "1.6 km from your location",
    inStock: true,
  },
  {
    id: "sim-4",
    slug: "double-wall-coffee-travel-mug-400ml",
    name: "Double-Wall Coffee Travel Mug with Flip Lid, 400 ml",
    currentPrice: 1100,
    originalPrice: 1350,
    image: "/products/similar-4.svg",
    storeName: "Urban Essentials",
    distance: "1.8 km from your location",
    inStock: true,
  },
  {
    id: "sim-5",
    slug: "ceramic-lined-insulated-flask-750ml",
    name: "Ceramic Lined Insulated Flask, 750 ml",
    currentPrice: 1600,
    originalPrice: 2000,
    image: "/products/similar-5.svg",
    storeName: "Office Essentials",
    distance: "3.2 km from your location",
    inStock: true,
  },
  {
    id: "sim-6",
    slug: "wide-mouth-hydro-insulated-flask-900ml",
    name: "Wide-Mouth Hydro Insulated Flask, 900 ml",
    currentPrice: 1550,
    image: "/products/similar-6.svg",
    storeName: "Sound Haven",
    distance: "2.3 km from your location",
    inStock: true,
  },
];

export const EDGE_CASE_PRODUCTS: Record<string, DetailedProduct> = {
  "out-of-stock-bottle": {
    ...MAIN_PRODUCT,
    id: "prod-bottle-oos",
    slug: "out-of-stock-bottle",
    name: "Thermal Travel Infuser Flask, 600 ml (Out of Stock Demo)",
    inStock: false,
    originalPrice: undefined, // no discount edge case
    currentPrice: 1450,
    shortSummary: "Currently sold out. Check back next week or ask the merchant directly about restock dates.",
  },
  "single-image-tumbler": {
    ...MAIN_PRODUCT,
    id: "prod-single-img",
    slug: "single-image-tumbler",
    name: "Minimalist Matte Tumbler, 500 ml (Single Image Demo)",
    images: ["/products/similar-1.svg"],
    currentPrice: 950,
    originalPrice: 950, // no discount
  },
  "no-reviews-store-item": {
    ...MAIN_PRODUCT,
    id: "prod-no-reviews",
    slug: "no-reviews-store-item",
    name: "Artisan Ceramic Infuser Bottle, 700 ml (New Seller Demo)",
    seller: {
      id: "s-new-seller",
      name: "Kathmandu Artisan Pottery & Crafts",
      verified: false,
      deliveryType: "pickup",
      address: "Patan Durbar Square, Lalitpur",
      storeSlug: "s2",
    },
  },
};

export function getProductBySlug(slug: string): DetailedProduct | null {
  if (slug === MAIN_PRODUCT.slug || slug === MAIN_PRODUCT.id) {
    return MAIN_PRODUCT;
  }
  if (EDGE_CASE_PRODUCTS[slug]) {
    return EDGE_CASE_PRODUCTS[slug];
  }
  // Check similar products
  const sim = SIMILAR_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
  if (sim) {
    return {
      ...MAIN_PRODUCT,
      id: sim.id,
      slug: sim.slug,
      name: sim.name,
      currentPrice: sim.currentPrice,
      originalPrice: sim.originalPrice,
      images: [sim.image, ...MAIN_PRODUCT.images.slice(1)],
      distance: sim.distance,
      inStock: sim.inStock,
      seller: {
        ...MAIN_PRODUCT.seller,
        name: sim.storeName,
      },
    };
  }
  return null;
}

