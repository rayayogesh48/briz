import { CATEGORIES } from "./search-results-model";

export interface CategoryInfo {
  id: string;
  name: string;
  image: string;
}

const DEFAULT_CATEGORY_IMAGE = "/figma/home/category-sample.png";

// Specific images can be mapped here as new category assets are added
const CATEGORY_IMAGE_MAP: Record<string, string> = {
  "Renewable Energy": "/figma/home/category-sample.png",
  "Urban Development": "/figma/home/category-sample.png",
  "Healthcare & Wellness": "/figma/home/category-sample.png",
  "Education & Training": "/figma/home/category-sample.png",
  "Technology & Innovation": "/figma/home/category-sample.png",
  "Transportation & Logistics": "/figma/home/category-sample.png",
  "Environmental Conservation": "/figma/home/category-sample.png",
  "Finance & Banking": "/figma/home/category-sample.png",
  "Healthcare & Pharmaceuticals": "/figma/home/category-sample.png",
  "Technology & Software": "/figma/home/category-sample.png",
  "Office Supplies": "/figma/home/category-sample.png",
  "Electronics": "/figma/home/category-sample.png",
  "Groceries": "/figma/home/category-sample.png",
  "Sports & Fitness": "/figma/home/category-sample.png",
};

export function getCategoryImage(categoryName: string): string {
  return CATEGORY_IMAGE_MAP[categoryName] || DEFAULT_CATEGORY_IMAGE;
}

export const ALL_CATEGORY_ITEMS: CategoryInfo[] = CATEGORIES.map(name => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name,
  image: getCategoryImage(name),
}));

