import { CATEGORIES } from "./search-results-model";
import type { Product } from "./search-data";

export interface CategoryInfo {
  id: string;
  name: string;
  image: string;
}

const DEFAULT_CATEGORY_IMAGE = "/figma/home/category-sample.png";

// Exact 17 categories shown in Figma 836:3686 / 836:3699 in sequential order
export const FIGMA_ORDERED_CATEGORIES: string[] = [
  "Agriculture & Farming",
  "Financial Technology & Digital Banking",
  "Renewable Energy & Sustainable Tech",
  "Artificial Intelligence & Machine Learning",
  "Healthcare & Biotechnology",
  "Travel & Tourism",
  "Education & E-learning",
  "Cybersecurity & Data Protection",
  "Urban Development & Smart Cities",
  "Food Technology & Culinary Arts",
  "Space Exploration & Aerospace",
  "Fashion & Textile Design",
  "Environmental Conservation",
  "Sports & Fitness Technology",
  "Blockchain & Cryptocurrency",
  "Robotics & Automation",
  "Mental Health & Wellness",
];

// Specific images can be mapped here as new category assets are added
const CATEGORY_IMAGE_MAP: Record<string, string> = {
  "Renewable Energy & Sustainable Tech": "/figma/home/category-sample.png",
  "Urban Development & Smart Cities": "/figma/home/category-sample.png",
  "Healthcare & Biotechnology": "/figma/home/category-sample.png",
  "Education & E-learning": "/figma/home/category-sample.png",
  "Technology & Innovation": "/figma/home/category-sample.png",
  "Transportation & Logistics": "/figma/home/category-sample.png",
  "Environmental Conservation": "/figma/home/category-sample.png",
  "Financial Technology & Digital Banking": "/figma/home/category-sample.png",
  "Healthcare & Pharmaceuticals": "/figma/home/category-sample.png",
  "Technology & Software": "/figma/home/category-sample.png",
  "Office Supplies": "/figma/home/category-sample.png",
  "Electronics": "/figma/home/category-sample.png",
  "Groceries": "/figma/home/category-sample.png",
  "Sports & Fitness Technology": "/figma/home/category-sample.png",
  "Books & Stationery": "/figma/home/category-sample.png",
};

export function getCategoryImage(categoryName: string): string {
  return CATEGORY_IMAGE_MAP[categoryName] || DEFAULT_CATEGORY_IMAGE;
}

// Combine Figma ordered categories with any extra categories from model to preserve all URLs/data
const combinedCategories = [
  ...FIGMA_ORDERED_CATEGORIES,
  ...CATEGORIES.filter(cat => !FIGMA_ORDERED_CATEGORIES.includes(cat)),
];

export const ALL_CATEGORY_ITEMS: CategoryInfo[] = combinedCategories.map(name => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name,
  image: getCategoryImage(name),
}));

// 8 Showcase products from Figma node 836:3771 for Agriculture & Farming
export const FIGMA_SHOWCASE_PRODUCTS: Product[] = [
  {
    id: "figma-p1",
    name: "Buddha Face Carving Wooden Buddha Head",
    price: 500,
    originalPrice: 750,
    image: "/figma/results/product-imgPhoneImage.png",
    storeId: "s1",
    storeName: "Heritage Arts Nepal",
    location: "Boudha",
    distance: "1.6 KM",
    inStock: true,
    featured: true,
    category: "Agriculture & Farming",
    subcategory: "Farm Equipments",
  },
  {
    id: "figma-p2",
    name: "Portable Power Bank 10000mAh",
    price: 500,
    originalPrice: 850,
    image: "/figma/results/store-imgImage.png",
    storeId: "s5",
    storeName: "Kathmandu Electronics",
    location: "New Baneshwor",
    distance: "3.1 KM",
    inStock: true,
    featured: true,
    category: "Agriculture & Farming",
    subcategory: "Farm Equipments",
  },
  {
    id: "figma-p3",
    name: "Wooden carving Temple of Pashupatinath",
    price: 500,
    originalPrice: 900,
    image: "/figma/results/store-imgImage1.png",
    storeId: "s1",
    storeName: "Heritage Arts Nepal",
    location: "Patan",
    distance: "1.6 KM",
    inStock: true,
    featured: true,
    category: "Agriculture & Farming",
    subcategory: "Farm Equipments",
  },
  {
    id: "figma-p4",
    name: "Wireless Bluetooth Headphones",
    price: 500,
    originalPrice: 999,
    image: "/figma/avatar.png",
    storeId: "s2",
    storeName: "Sound Haven",
    location: "Putalisadak",
    distance: "2.3 KM",
    inStock: true,
    featured: true,
    category: "Agriculture & Farming",
    subcategory: "Farm Equipments",
  },
  {
    id: "figma-p5",
    name: "USB-C Charging Cable (1.5 meters)",
    price: 500,
    originalPrice: 650,
    image: "/figma/results/store-imgImage2.png",
    storeId: "s5",
    storeName: "Kathmandu Electronics",
    location: "New Baneshwor",
    distance: "4.8 KM",
    inStock: true,
    featured: true,
    category: "Agriculture & Farming",
    subcategory: "Farm Equipments",
  },
  {
    id: "figma-p6",
    name: "Handcrafted Ceramic Vase with Floral Patterns",
    price: 750,
    originalPrice: 1100,
    image: "/figma/results/product-imgPhoneImage.png",
    storeId: "s1",
    storeName: "Clay Art Studio",
    location: "Bhaktapur",
    distance: "3.2 KM",
    inStock: true,
    featured: true,
    category: "Agriculture & Farming",
    subcategory: "Farm Equipments",
  },
  {
    id: "figma-p7",
    name: "Vintage Leather-bound Journal Notebook",
    price: 1200,
    originalPrice: 1600,
    image: "/figma/home/category-sample.png",
    storeId: "s6",
    storeName: "Himalayan Papers",
    location: "Thamel",
    distance: "0.8 KM",
    inStock: true,
    featured: true,
    category: "Agriculture & Farming",
    subcategory: "Farm Equipments",
  },
  {
    id: "figma-p8",
    name: "Artisan Woven Cotton Throw Blanket",
    price: 650,
    originalPrice: 950,
    image: "/figma/results/store-imgImage1.png",
    storeId: "s4",
    storeName: "Loom & Craft Nepal",
    location: "Jawalakhel",
    distance: "2.5 KM",
    inStock: true,
    featured: true,
    category: "Agriculture & Farming",
    subcategory: "Farm Equipments",
  },
];
