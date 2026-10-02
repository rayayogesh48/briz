/**
 * Data models, constants, and catalog for Featured Products & Featured Stores.
 * Tailored for Briz local marketplace in Kathmandu, Nepal.
 */

export interface FeaturedProduct {
  id: string;
  slug: string;
  name: string;
  category: "Groceries" | "Electronics" | "Health & Beauty" | "Fashion" | "Home & Living" | "Sports & Fitness" | "Books & Stationery";
  price: number;
  originalPrice?: number;
  discount?: number; // percentage e.g. 22
  image: string;
  featured: boolean;
  storeId: string;
  storeName: string;
  location: string;
  distance: string; // e.g. "1.2 km away"
  distanceKm: number;
  deliveryOption: "online" | "pickup" | "both";
  deliveryLabel: string; // e.g. "Online delivery available"
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  specialOffer?: boolean;
}

export interface FeaturedStore {
  id: string;
  name: string;
  category: "Grocery & Essentials" | "Electronics" | "Health & Beauty" | "Fashion" | "Home & Living" | "Bakery & Sweets" | "Office Supplies";
  description: string;
  cover: string;
  logo: string;
  featured: boolean;
  verified: boolean;
  rating: number;
  reviewCount: number;
  location: string;
  distance: string; // e.g. "1.5 km away"
  distanceKm: number;
  status: "open" | "closed";
  statusLabel: string; // e.g. "Open now" or "Closed"
  openToday: boolean;
  shoppingOption: "pickup" | "online" | "both";
  shoppingOptionLabel: string; // e.g. "Pickup and online delivery"
  previewImages: string[];
}

export const PRODUCT_CATEGORIES = [
  "Groceries",
  "Electronics",
  "Health & Beauty",
  "Fashion",
  "Home & Living",
  "Sports & Fitness",
] as const;

export const ALL_PRODUCT_CATEGORIES = [
  ...PRODUCT_CATEGORIES,
  "Books & Stationery",
] as const;

export const STORE_CATEGORIES = [
  "Grocery & Essentials",
  "Electronics",
  "Health & Beauty",
  "Fashion",
  "Home & Living",
  "Bakery & Sweets",
] as const;

export const ALL_STORE_CATEGORIES = [
  ...STORE_CATEGORIES,
  "Office Supplies",
] as const;

export const DISTANCE_OPTIONS = [
  { label: "Within 1 km", maxKm: 1 },
  { label: "Within 3 km", maxKm: 3 },
  { label: "Within 5 km", maxKm: 5 },
  { label: "Within 10 km", maxKm: 10 },
  { label: "Any distance", maxKm: Infinity },
] as const;

export type ProductSortOption =
  | "recommended"
  | "popular"
  | "nearest"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "discount";

export type StoreSortOption =
  | "recommended"
  | "nearest"
  | "popular"
  | "rating"
  | "recent";

export const PRODUCT_SORT_LABELS: Record<ProductSortOption, string> = {
  recommended: "Recommended",
  popular: "Most popular",
  nearest: "Nearest first",
  "price-asc": "Price: Low to high",
  "price-desc": "Price: High to low",
  rating: "Highest rated",
  discount: "Biggest discount",
};

export const STORE_SORT_LABELS: Record<StoreSortOption, string> = {
  recommended: "Recommended",
  nearest: "Nearest first",
  popular: "Most popular",
  rating: "Highest rated",
  recent: "Recently added",
};

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  maxDistanceKm?: number;
  availability: {
    inStockOnly?: boolean;
    pickupAvailable?: boolean;
    onlineDeliveryAvailable?: boolean;
  };
  offers: {
    discountOnly?: boolean;
    specialOffersOnly?: boolean;
  };
  minRating?: number; // 3 or 4
}

export interface StoreFilters {
  category?: string;
  maxDistanceKm?: number;
  availability: {
    openNow?: boolean;
    openToday?: boolean;
  };
  shoppingOptions: {
    pickup?: boolean;
    onlineDelivery?: boolean;
    both?: boolean;
  };
  verifiedOnly?: boolean;
  minRating?: number; // 3 or 4
}

export const DEFAULT_PRODUCT_FILTERS: ProductFilters = {
  category: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  maxDistanceKm: undefined,
  availability: {},
  offers: {},
  minRating: undefined,
};

export const DEFAULT_STORE_FILTERS: StoreFilters = {
  category: undefined,
  maxDistanceKm: undefined,
  availability: {},
  shoppingOptions: {},
  verifiedOnly: false,
  minRating: undefined,
};

// Rich catalog of 24 Featured Products
export const FEATURED_PRODUCTS: FeaturedProduct[] = [
  {
    id: "fp-1",
    slug: "wireless-bluetooth-headphones",
    name: "Wireless Bluetooth Headphones",
    category: "Electronics",
    price: 2499,
    originalPrice: 3200,
    discount: 22,
    image: "/figma/results/product-imgPhoneImage.png",
    featured: true,
    storeId: "s5",
    storeName: "Kathmandu Electronics",
    location: "New Baneshwor",
    distance: "1.2 km away",
    distanceKm: 1.2,
    deliveryOption: "online",
    deliveryLabel: "Online delivery available",
    rating: 4.8,
    reviewCount: 84,
    inStock: true,
    specialOffer: true,
  },
  {
    id: "fp-2",
    slug: "insulated-stainless-steel-water-bottle-750ml",
    name: "Insulated Stainless Steel Water Bottle, 750 ml",
    category: "Home & Living",
    price: 1250,
    originalPrice: 1650,
    discount: 24,
    image: "/products/bottle-main.svg",
    featured: true,
    storeId: "s6",
    storeName: "Urban Essentials",
    location: "New Baneshwor",
    distance: "1.8 km away",
    distanceKm: 1.8,
    deliveryOption: "both",
    deliveryLabel: "Pickup and delivery",
    rating: 4.9,
    reviewCount: 128,
    inStock: true,
    specialOffer: true,
  },
  {
    id: "fp-3",
    slug: "organic-mountain-green-tea-pack",
    name: "Organic Mountain Green Tea (100g Tin)",
    category: "Groceries",
    price: 450,
    originalPrice: 550,
    discount: 18,
    image: "/figma/home/category-sample.png",
    featured: true,
    storeId: "s4",
    storeName: "Green Basket",
    location: "Kalanki",
    distance: "2.5 km away",
    distanceKm: 2.5,
    deliveryOption: "both",
    deliveryLabel: "Pickup and delivery",
    rating: 4.7,
    reviewCount: 42,
    inStock: true,
    specialOffer: false,
  },
  {
    id: "fp-4",
    slug: "mens-breathable-running-shoes",
    name: "Men's Breathable Road Running Shoes",
    category: "Sports & Fitness",
    price: 4999,
    originalPrice: 6500,
    discount: 23,
    image: "/figma/results/fashion-p1.png",
    featured: true,
    storeId: "s3",
    storeName: "Sports Arena",
    location: "Thamel",
    distance: "0.9 km away",
    distanceKm: 0.9,
    deliveryOption: "online",
    deliveryLabel: "Online delivery available",
    rating: 4.6,
    reviewCount: 96,
    inStock: true,
    specialOffer: true,
  },
  {
    id: "fp-5",
    slug: "natural-herbal-face-glow-serum",
    name: "Natural Herbal Face Glow Serum (30ml)",
    category: "Health & Beauty",
    price: 850,
    originalPrice: 1100,
    discount: 23,
    image: "/products/similar-1.svg",
    featured: true,
    storeId: "s10",
    storeName: "AyurVeda Organic Care",
    location: "Baluwatar",
    distance: "2.1 km away",
    distanceKm: 2.1,
    deliveryOption: "online",
    deliveryLabel: "Online delivery available",
    rating: 4.8,
    reviewCount: 63,
    inStock: true,
    specialOffer: false,
  },
  {
    id: "fp-6",
    slug: "cotton-oversized-streetwear-hoodie",
    name: "Heavyweight Cotton Streetwear Hoodie",
    category: "Fashion",
    price: 2800,
    originalPrice: 3500,
    discount: 20,
    image: "/figma/results/fashion-p2.png",
    featured: true,
    storeId: "s11",
    storeName: "Vibe Streetwear Nepal",
    location: "Jhamsikhel",
    distance: "1.4 km away",
    distanceKm: 1.4,
    deliveryOption: "both",
    deliveryLabel: "Pickup and delivery",
    rating: 4.7,
    reviewCount: 115,
    inStock: true,
    specialOffer: true,
  },
  {
    id: "fp-7",
    slug: "smart-fitness-tracker-watch",
    name: "Smart AMOLED Fitness Tracker Watch",
    category: "Electronics",
    price: 3899,
    originalPrice: 5200,
    discount: 25,
    image: "/figma/results/product-imgPhoneImage.png",
    featured: true,
    storeId: "s1",
    storeName: "Audio World Nepal",
    location: "Durbar Marg",
    distance: "1.6 km away",
    distanceKm: 1.6,
    deliveryOption: "online",
    deliveryLabel: "Online delivery available",
    rating: 4.5,
    reviewCount: 71,
    inStock: true,
    specialOffer: true,
  },
  {
    id: "fp-8",
    slug: "pure-himalayan-multiflora-honey-500g",
    name: "Pure Himalayan Raw Honey (500g)",
    category: "Groceries",
    price: 750,
    image: "/figma/home/category-sample.png",
    featured: true,
    storeId: "s4",
    storeName: "Green Basket",
    location: "Kalanki",
    distance: "2.5 km away",
    distanceKm: 2.5,
    deliveryOption: "both",
    deliveryLabel: "Store pickup available",
    rating: 4.9,
    reviewCount: 154,
    inStock: true,
    specialOffer: false,
  },
  {
    id: "fp-9",
    slug: "ceramic-pour-over-coffee-dripper",
    name: "Handcrafted Ceramic Coffee Pour-Over Set",
    category: "Home & Living",
    price: 1850,
    originalPrice: 2200,
    discount: 16,
    image: "/products/bottle-detail.svg",
    featured: true,
    storeId: "s6",
    storeName: "Urban Essentials",
    location: "New Baneshwor",
    distance: "1.8 km away",
    distanceKm: 1.8,
    deliveryOption: "pickup",
    deliveryLabel: "Store pickup available",
    rating: 4.8,
    reviewCount: 39,
    inStock: true,
    specialOffer: false,
  },
  {
    id: "fp-10",
    slug: "adjustable-neoprene-yoga-mat-10mm",
    name: "Extra Thick Non-Slip Eco Yoga Mat (10mm)",
    category: "Sports & Fitness",
    price: 1650,
    originalPrice: 2100,
    discount: 21,
    image: "/products/similar-2.svg",
    featured: true,
    storeId: "s3",
    storeName: "Sports Arena",
    location: "Thamel",
    distance: "0.9 km away",
    distanceKm: 0.9,
    deliveryOption: "both",
    deliveryLabel: "Pickup and delivery",
    rating: 4.6,
    reviewCount: 52,
    inStock: true,
    specialOffer: true,
  },
  {
    id: "fp-11",
    slug: "unisex-vintage-denim-jacket",
    name: "Washed Vintage Relaxed Denim Jacket",
    category: "Fashion",
    price: 3600,
    originalPrice: 4500,
    discount: 20,
    image: "/figma/results/fashion-p4.png",
    featured: true,
    storeId: "s11",
    storeName: "Vibe Streetwear Nepal",
    location: "Jhamsikhel",
    distance: "1.4 km away",
    distanceKm: 1.4,
    deliveryOption: "both",
    deliveryLabel: "Pickup and delivery",
    rating: 4.8,
    reviewCount: 88,
    inStock: true,
    specialOffer: false,
  },
  {
    id: "fp-12",
    slug: "active-noise-cancelling-wireless-earbuds",
    name: "ANC True Wireless Stereo Earbuds",
    category: "Electronics",
    price: 3200,
    originalPrice: 4200,
    discount: 24,
    image: "/figma/results/product-imgPhoneImage.png",
    featured: true,
    storeId: "s5",
    storeName: "Kathmandu Electronics",
    location: "New Baneshwor",
    distance: "1.2 km away",
    distanceKm: 1.2,
    deliveryOption: "online",
    deliveryLabel: "Online delivery available",
    rating: 4.7,
    reviewCount: 110,
    inStock: true,
    specialOffer: true,
  },
  {
    id: "fp-13",
    slug: "cold-pressed-virgin-coconut-oil",
    name: "Extra Virgin Cold-Pressed Coconut Oil (500ml)",
    category: "Health & Beauty",
    price: 650,
    originalPrice: 800,
    discount: 19,
    image: "/products/similar-3.svg",
    featured: true,
    storeId: "s10",
    storeName: "AyurVeda Organic Care",
    location: "Baluwatar",
    distance: "2.1 km away",
    distanceKm: 2.1,
    deliveryOption: "both",
    deliveryLabel: "Pickup and delivery",
    rating: 4.9,
    reviewCount: 94,
    inStock: true,
    specialOffer: false,
  },
  {
    id: "fp-14",
    slug: "bamboo-fiber-kitchen-storage-jars",
    name: "Eco Bamboo Fiber Airtight Storage Jars (Set of 4)",
    category: "Home & Living",
    price: 1950,
    originalPrice: 2400,
    discount: 19,
    image: "/products/bottle-lifestyle.svg",
    featured: true,
    storeId: "s6",
    storeName: "Urban Essentials",
    location: "New Baneshwor",
    distance: "1.8 km away",
    distanceKm: 1.8,
    deliveryOption: "both",
    deliveryLabel: "Pickup and delivery",
    rating: 4.6,
    reviewCount: 31,
    inStock: true,
    specialOffer: false,
  },
  {
    id: "fp-15",
    slug: "avocado-and-quinoa-salad-pack",
    name: "Fresh Valley Organic Salad Greens & Avocado Box",
    category: "Groceries",
    price: 520,
    image: "/figma/home/category-sample.png",
    featured: true,
    storeId: "s4",
    storeName: "Green Basket",
    location: "Kalanki",
    distance: "2.5 km away",
    distanceKm: 2.5,
    deliveryOption: "online",
    deliveryLabel: "Online delivery available",
    rating: 4.8,
    reviewCount: 47,
    inStock: true,
    specialOffer: false,
  },
  {
    id: "fp-16",
    slug: "thermal-paper-pos-receipt-rolls-pack-10",
    name: "Thermal Paper 80mm POS Rolls (Pack of 10)",
    category: "Books & Stationery",
    price: 850,
    originalPrice: 999,
    discount: 15,
    image: "/figma/results/product-imgPhoneImage.png",
    featured: true,
    storeId: "s7",
    storeName: "Paper & Print Nepal",
    location: "Putalisadak",
    distance: "2.3 km away",
    distanceKm: 2.3,
    deliveryOption: "both",
    deliveryLabel: "Pickup and delivery",
    rating: 4.9,
    reviewCount: 48,
    inStock: true,
    specialOffer: false,
  },
  {
    id: "fp-17",
    slug: "resistance-exercise-bands-set-5",
    name: "Heavy Duty Latex Resistance Bands (Set of 5)",
    category: "Sports & Fitness",
    price: 999,
    originalPrice: 1450,
    discount: 31,
    image: "/products/similar-4.svg",
    featured: true,
    storeId: "s3",
    storeName: "Sports Arena",
    location: "Thamel",
    distance: "0.9 km away",
    distanceKm: 0.9,
    deliveryOption: "online",
    deliveryLabel: "Online delivery available",
    rating: 4.7,
    reviewCount: 82,
    inStock: true,
    specialOffer: true,
  },
  {
    id: "fp-18",
    slug: "handwoven-nepali-dhaka-scarf",
    name: "Handwoven Nepali Pure Dhaka Shawl",
    category: "Fashion",
    price: 1850,
    originalPrice: 2200,
    discount: 16,
    image: "/figma/results/fashion-p6.png",
    featured: true,
    storeId: "s11",
    storeName: "Vibe Streetwear Nepal",
    location: "Jhamsikhel",
    distance: "1.4 km away",
    distanceKm: 1.4,
    deliveryOption: "both",
    deliveryLabel: "Pickup and delivery",
    rating: 4.9,
    reviewCount: 65,
    inStock: true,
    specialOffer: false,
  },
  {
    id: "fp-19",
    slug: "portable-fast-wireless-powerbank-10000mah",
    name: "20W Magnetic Wireless Powerbank (10000mAh)",
    category: "Electronics",
    price: 2650,
    originalPrice: 3400,
    discount: 22,
    image: "/figma/results/product-imgPhoneImage.png",
    featured: true,
    storeId: "s5",
    storeName: "Kathmandu Electronics",
    location: "New Baneshwor",
    distance: "1.2 km away",
    distanceKm: 1.2,
    deliveryOption: "online",
    deliveryLabel: "Online delivery available",
    rating: 4.6,
    reviewCount: 78,
    inStock: true,
    specialOffer: true,
  },
  {
    id: "fp-20",
    slug: "organic-aloe-vera-moisturizer-gel",
    name: "Pure Soothing Aloe Vera Hydrating Gel (250ml)",
    category: "Health & Beauty",
    price: 490,
    originalPrice: 600,
    discount: 18,
    image: "/products/similar-5.svg",
    featured: true,
    storeId: "s10",
    storeName: "AyurVeda Organic Care",
    location: "Baluwatar",
    distance: "2.1 km away",
    distanceKm: 2.1,
    deliveryOption: "both",
    deliveryLabel: "Store pickup available",
    rating: 4.7,
    reviewCount: 56,
    inStock: true,
    specialOffer: false,
  },
  {
    id: "fp-21",
    slug: "double-wall-glass-tea-infuser-bottle",
    name: "Borosilicate Double-Wall Glass Tea Infuser Bottle",
    category: "Home & Living",
    price: 1550,
    originalPrice: 1950,
    discount: 21,
    image: "/products/bottle-angle.svg",
    featured: true,
    storeId: "s6",
    storeName: "Urban Essentials",
    location: "New Baneshwor",
    distance: "1.8 km away",
    distanceKm: 1.8,
    deliveryOption: "both",
    deliveryLabel: "Pickup and delivery",
    rating: 4.8,
    reviewCount: 73,
    inStock: true,
    specialOffer: true,
  },
  {
    id: "fp-22",
    slug: "roasted-almonds-and-walnut-mix-400g",
    name: "Dry Roasted California Almonds & Walnut Mix (400g)",
    category: "Groceries",
    price: 980,
    originalPrice: 1200,
    discount: 18,
    image: "/figma/home/category-sample.png",
    featured: true,
    storeId: "s4",
    storeName: "Green Basket",
    location: "Kalanki",
    distance: "2.5 km away",
    distanceKm: 2.5,
    deliveryOption: "both",
    deliveryLabel: "Pickup and delivery",
    rating: 4.9,
    reviewCount: 112,
    inStock: true,
    specialOffer: false,
  },
  {
    id: "fp-23",
    slug: "cotton-athletic-compression-socks",
    name: "Anti-Blister Running Crew Socks (3 Pairs)",
    category: "Sports & Fitness",
    price: 750,
    originalPrice: 990,
    discount: 24,
    image: "/products/similar-6.svg",
    featured: true,
    storeId: "s3",
    storeName: "Sports Arena",
    location: "Thamel",
    distance: "0.9 km away",
    distanceKm: 0.9,
    deliveryOption: "online",
    deliveryLabel: "Online delivery available",
    rating: 4.5,
    reviewCount: 38,
    inStock: false,
    specialOffer: false,
  },
  {
    id: "fp-24",
    slug: "cargo-jogger-pants-khaki",
    name: "Tactical Cotton Cargo Jogger Pants (Khaki)",
    category: "Fashion",
    price: 2400,
    originalPrice: 2999,
    discount: 20,
    image: "/figma/results/fashion-p7.png",
    featured: true,
    storeId: "s11",
    storeName: "Vibe Streetwear Nepal",
    location: "Jhamsikhel",
    distance: "1.4 km away",
    distanceKm: 1.4,
    deliveryOption: "both",
    deliveryLabel: "Pickup and delivery",
    rating: 4.7,
    reviewCount: 92,
    inStock: true,
    specialOffer: true,
  },
];

// Rich catalog of 16 Featured Stores
export const FEATURED_STORES: FeaturedStore[] = [
  {
    id: "s5",
    name: "Kathmandu Electronics",
    category: "Electronics",
    description: "Authorized digital gadgets, high-end Bluetooth gear, premium cables, smart watch displays, and genuine smartphone accessories.",
    cover: "/figma/results/store-imgImage2.png",
    logo: "/figma/results/store-imgAvatarImage2.png",
    featured: true,
    verified: true,
    rating: 4.8,
    reviewCount: 124,
    location: "New Baneshwor",
    distance: "1.5 km away",
    distanceKm: 1.5,
    status: "open",
    statusLabel: "Open now",
    openToday: true,
    shoppingOption: "both",
    shoppingOptionLabel: "Pickup and online delivery",
    previewImages: [
      "/figma/results/product-imgPhoneImage.png",
      "/products/bottle-detail.svg",
      "/figma/results/product-imgPhoneImage.png",
      "/figma/results/fashion-p1.png",
    ],
  },
  {
    id: "s6",
    name: "Urban Essentials",
    category: "Home & Living",
    description: "Modern eco-friendly drinkware, double-walled bottles, handcrafted kitchenware, and sustainable household goods.",
    cover: "/figma/results/store-imgImage1.png",
    logo: "/figma/results/store-imgAvatarImage1.png",
    featured: true,
    verified: true,
    rating: 4.9,
    reviewCount: 182,
    location: "Jhamsikhel",
    distance: "1.8 km away",
    distanceKm: 1.8,
    status: "open",
    statusLabel: "Open now",
    openToday: true,
    shoppingOption: "both",
    shoppingOptionLabel: "Pickup and online delivery",
    previewImages: [
      "/products/bottle-main.svg",
      "/products/bottle-angle.svg",
      "/products/bottle-detail.svg",
      "/products/bottle-lifestyle.svg",
    ],
  },
  {
    id: "s4",
    name: "Green Basket",
    category: "Grocery & Essentials",
    description: "Certified chemical-free farm produce, Himalayan raw honey, fresh organic greens, cold-pressed oils, and gourmet staples.",
    cover: "/figma/home/hero-banner.png",
    logo: "/figma/results/store-imgAvatarImage1.png",
    featured: true,
    verified: true,
    rating: 4.7,
    reviewCount: 96,
    location: "Kalanki",
    distance: "2.5 km away",
    distanceKm: 2.5,
    status: "open",
    statusLabel: "Open now",
    openToday: true,
    shoppingOption: "both",
    shoppingOptionLabel: "Pickup and online delivery",
    previewImages: [
      "/figma/home/category-sample.png",
      "/products/similar-1.svg",
      "/products/similar-2.svg",
      "/figma/home/category-sample.png",
    ],
  },
  {
    id: "s3",
    name: "Sports Arena",
    category: "Home & Living",
    description: "Performance sportswear, running trainers, fitness bands, professional gym weights, and yoga essentials.",
    cover: "/figma/results/store-imgImage2.png",
    logo: "/figma/results/store-imgAvatarImage2.png",
    featured: true,
    verified: true,
    rating: 4.8,
    reviewCount: 145,
    location: "Thamel",
    distance: "0.9 km away",
    distanceKm: 0.9,
    status: "open",
    statusLabel: "Open now",
    openToday: true,
    shoppingOption: "both",
    shoppingOptionLabel: "Pickup and online delivery",
    previewImages: [
      "/figma/results/fashion-p1.png",
      "/products/similar-4.svg",
      "/products/similar-6.svg",
      "/products/similar-2.svg",
    ],
  },
  {
    id: "s11",
    name: "Vibe Streetwear Nepal",
    category: "Fashion",
    description: "Contemporary oversized apparel, streetwear hoodies, distressed denim, graphic tees, and trendy accessories.",
    cover: "/figma/results/fashion-store-cover.png",
    logo: "/figma/results/fashion-store-logo.png",
    featured: true,
    verified: true,
    rating: 4.7,
    reviewCount: 168,
    location: "Durbar Marg",
    distance: "1.4 km away",
    distanceKm: 1.4,
    status: "open",
    statusLabel: "Open now",
    openToday: true,
    shoppingOption: "both",
    shoppingOptionLabel: "Pickup and online delivery",
    previewImages: [
      "/figma/results/fashion-p2.png",
      "/figma/results/fashion-p4.png",
      "/figma/results/fashion-p6.png",
      "/figma/results/fashion-p7.png",
    ],
  },
  {
    id: "s10",
    name: "AyurVeda Organic Care",
    category: "Health & Beauty",
    description: "Ayurvedic wellness formulas, natural skincare serums, virgin coconut oils, botanical hair tonics, and herbal soaps.",
    cover: "/figma/results/store-imgImage1.png",
    logo: "/figma/results/store-imgAvatarImage1.png",
    featured: true,
    verified: true,
    rating: 4.9,
    reviewCount: 78,
    location: "Lazimpat",
    distance: "2.1 km away",
    distanceKm: 2.1,
    status: "open",
    statusLabel: "Open now",
    openToday: true,
    shoppingOption: "online",
    shoppingOptionLabel: "Online delivery",
    previewImages: [
      "/products/similar-1.svg",
      "/products/similar-3.svg",
      "/products/similar-5.svg",
      "/products/bottle-detail.svg",
    ],
  },
  {
    id: "s12",
    name: "Himalayan Bakery & Confectionery",
    category: "Bakery & Sweets",
    description: "Artisan sourdough loaves, European pastries, fresh strawberry tarts, custom celebration cakes, and savory croissants.",
    cover: "/figma/home/hero-banner.png",
    logo: "/figma/results/store-imgAvatarImage2.png",
    featured: true,
    verified: true,
    rating: 4.9,
    reviewCount: 210,
    location: "Baluwatar",
    distance: "2.8 km away",
    distanceKm: 2.8,
    status: "open",
    statusLabel: "Open now",
    openToday: true,
    shoppingOption: "both",
    shoppingOptionLabel: "Pickup and online delivery",
    previewImages: [
      "/figma/home/category-sample.png",
      "/products/similar-1.svg",
      "/products/similar-2.svg",
      "/figma/home/promo-banner-1.png",
    ],
  },
  {
    id: "s1",
    name: "Audio World Nepal",
    category: "Electronics",
    description: "Premium studio headphones, monitor speakers, USB podcast mics, DAC amplifiers, and audio cables.",
    cover: "/figma/results/store-imgImage2.png",
    logo: "/figma/results/store-imgAvatarImage1.png",
    featured: true,
    verified: false,
    rating: 4.5,
    reviewCount: 65,
    location: "Putalisadak",
    distance: "1.6 km away",
    distanceKm: 1.6,
    status: "closed",
    statusLabel: "Closed",
    openToday: true,
    shoppingOption: "pickup",
    shoppingOptionLabel: "Store pickup",
    previewImages: [
      "/figma/results/product-imgPhoneImage.png",
      "/products/similar-4.svg",
      "/products/bottle-main.svg",
      "/figma/results/product-imgPhoneImage.png",
    ],
  },
  {
    id: "s7",
    name: "Paper & Print Nepal",
    category: "Office Supplies",
    description: "Commercial paper rolls, thermal POS billing consumables, self-adhesive courier barcodes, and retail point-of-sale papers.",
    cover: "/figma/results/store-imgImage1.png",
    logo: "/figma/results/store-imgAvatarImage2.png",
    featured: true,
    verified: true,
    rating: 4.8,
    reviewCount: 48,
    location: "Putalisadak",
    distance: "2.3 km away",
    distanceKm: 2.3,
    status: "open",
    statusLabel: "Open now",
    openToday: true,
    shoppingOption: "both",
    shoppingOptionLabel: "Pickup and online delivery",
    previewImages: [
      "/figma/results/product-imgPhoneImage.png",
      "/figma/results/store-imgImage1.png",
      "/figma/results/store-imgImage2.png",
      "/figma/home/category-sample.png",
    ],
  },
  {
    id: "s13",
    name: "Kathmandu Artisan Bakery",
    category: "Bakery & Sweets",
    description: "Fresh French baguettes, dark chocolate babka, almond cookies, and gourmet birthday treats baked daily.",
    cover: "/figma/home/promo-banner-2.png",
    logo: "/figma/results/store-imgAvatarImage1.png",
    featured: true,
    verified: false,
    rating: 4.6,
    reviewCount: 54,
    location: "Sanepa",
    distance: "3.5 km away",
    distanceKm: 3.5,
    status: "open",
    statusLabel: "Open now",
    openToday: true,
    shoppingOption: "both",
    shoppingOptionLabel: "Pickup and online delivery",
    previewImages: [
      "/figma/home/category-sample.png",
      "/products/bottle-detail.svg",
      "/products/similar-3.svg",
      "/figma/home/promo-banner-3.png",
    ],
  },
  {
    id: "s9",
    name: "Office Essentials",
    category: "Office Supplies",
    description: "Bulk office procurement, high quality stationery, desk organizers, laser printers, and thermal paper rolls.",
    cover: "/figma/results/store-imgImage2.png",
    logo: "/figma/results/store-imgAvatarImage2.png",
    featured: true,
    verified: true,
    rating: 4.9,
    reviewCount: 67,
    location: "Lalitpur",
    distance: "3.2 km away",
    distanceKm: 3.2,
    status: "open",
    statusLabel: "Open now",
    openToday: true,
    shoppingOption: "both",
    shoppingOptionLabel: "Pickup and online delivery",
    previewImages: [
      "/figma/results/product-imgPhoneImage.png",
      "/products/bottle-dimensions.svg",
      "/figma/results/store-imgImage1.png",
      "/figma/home/category-sample.png",
    ],
  },
  {
    id: "s14",
    name: "Pure Bloom Cosmetics",
    category: "Health & Beauty",
    description: "Dermatologically tested mineral cosmetics, lip tints, gentle cleansers, and organic rosewater facial mists.",
    cover: "/figma/results/store-imgImage1.png",
    logo: "/figma/results/store-imgAvatarImage1.png",
    featured: true,
    verified: true,
    rating: 4.7,
    reviewCount: 89,
    location: "New Road",
    distance: "1.1 km away",
    distanceKm: 1.1,
    status: "open",
    statusLabel: "Open now",
    openToday: true,
    shoppingOption: "both",
    shoppingOptionLabel: "Pickup and online delivery",
    previewImages: [
      "/products/similar-1.svg",
      "/products/similar-5.svg",
      "/products/bottle-detail.svg",
      "/products/similar-3.svg",
    ],
  },
];

/**
 * Filter and sort algorithm for Featured Products
 */
export function filterAndSortFeaturedProducts(
  products: FeaturedProduct[],
  filters: ProductFilters,
  sortOption: ProductSortOption = "recommended",
  searchQuery = ""
): FeaturedProduct[] {
  let list = [...products];

  // Search query filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.storeName.toLowerCase().includes(q)
    );
  }

  // Category filter
  if (filters.category && filters.category !== "all") {
    list = list.filter((p) => p.category === filters.category);
  }

  // Price range
  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    list = list.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    list = list.filter((p) => p.price <= filters.maxPrice!);
  }

  // Distance
  if (filters.maxDistanceKm !== undefined && filters.maxDistanceKm < Infinity) {
    list = list.filter((p) => p.distanceKm <= filters.maxDistanceKm!);
  }

  // Availability filters
  if (filters.availability.inStockOnly) {
    list = list.filter((p) => p.inStock);
  }
  if (filters.availability.pickupAvailable) {
    list = list.filter((p) => p.deliveryOption === "pickup" || p.deliveryOption === "both");
  }
  if (filters.availability.onlineDeliveryAvailable) {
    list = list.filter((p) => p.deliveryOption === "online" || p.deliveryOption === "both");
  }

  // Offers filters
  if (filters.offers.discountOnly) {
    list = list.filter((p) => (p.discount || 0) > 0);
  }
  if (filters.offers.specialOffersOnly) {
    list = list.filter((p) => Boolean(p.specialOffer));
  }

  // Rating filter
  if (filters.minRating !== undefined && filters.minRating > 0) {
    list = list.filter((p) => (p.rating || 0) >= filters.minRating!);
  }

  // Sorting
  switch (sortOption) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "nearest":
      list.sort((a, b) => a.distanceKm - b.distanceKm);
      break;
    case "popular":
      list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      break;
    case "rating":
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case "discount":
      list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
      break;
    case "recommended":
    default:
      // Featured priority first, then high rating
      list.sort((a, b) => (b.rating || 0) * (b.reviewCount || 1) - (a.rating || 0) * (a.reviewCount || 1));
      break;
  }

  return list;
}

/**
 * Filter and sort algorithm for Featured Stores
 */
export function filterAndSortFeaturedStores(
  stores: FeaturedStore[],
  filters: StoreFilters,
  sortOption: StoreSortOption = "recommended",
  searchQuery = ""
): FeaturedStore[] {
  let list = [...stores];

  // Search query filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }

  // Category filter
  if (filters.category && filters.category !== "all") {
    list = list.filter((s) => s.category === filters.category);
  }

  // Distance filter
  if (filters.maxDistanceKm !== undefined && filters.maxDistanceKm < Infinity) {
    list = list.filter((s) => s.distanceKm <= filters.maxDistanceKm!);
  }

  // Store availability
  if (filters.availability.openNow) {
    list = list.filter((s) => s.status === "open");
  }
  if (filters.availability.openToday) {
    list = list.filter((s) => s.openToday);
  }

  // Shopping options
  if (filters.shoppingOptions.pickup) {
    list = list.filter((s) => s.shoppingOption === "pickup" || s.shoppingOption === "both");
  }
  if (filters.shoppingOptions.onlineDelivery) {
    list = list.filter((s) => s.shoppingOption === "online" || s.shoppingOption === "both");
  }
  if (filters.shoppingOptions.both) {
    list = list.filter((s) => s.shoppingOption === "both");
  }

  // Verification filter
  if (filters.verifiedOnly) {
    list = list.filter((s) => s.verified);
  }

  // Rating filter
  if (filters.minRating !== undefined && filters.minRating > 0) {
    list = list.filter((s) => s.rating >= filters.minRating!);
  }

  // Sorting
  switch (sortOption) {
    case "nearest":
      list.sort((a, b) => a.distanceKm - b.distanceKm);
      break;
    case "popular":
      list.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case "rating":
      list.sort((a, b) => b.rating - a.rating);
      break;
    case "recent":
      list.sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0));
      break;
    case "recommended":
    default:
      list.sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount));
      break;
  }

  return list;
}
