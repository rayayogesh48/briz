export type FeatureMode = "web" | "app-only";

export interface MarketplaceFeatureConfig {
  cart: FeatureMode;
  favourites: FeatureMode;
  chat: FeatureMode;
  appStoreUrl: string;
  playStoreUrl: string;
}

export const FEATURE_CONFIG: MarketplaceFeatureConfig = {
  cart: "web",
  favourites: "web",
  chat: "web", // can be toggled to "app-only" to preview mobile app requirement dialog
  appStoreUrl: "https://apps.apple.com/app/briz",
  playStoreUrl: "https://play.google.com/store/apps/details?id=com.briz.app",
};

export interface AppFeatureDialogInfo {
  featureKey: "cart" | "favourites" | "chat";
  title: string;
  description: string;
}

export const APP_FEATURE_DESCRIPTIONS: Record<"cart" | "favourites" | "chat", AppFeatureDialogInfo> = {
  chat: {
    featureKey: "chat",
    title: "Chat on the Briz app",
    description: "Message this store and ask about the product in the Briz mobile app.",
  },
  cart: {
    featureKey: "cart",
    title: "Checkout on the Briz app",
    description: "Add products to your cart and complete checkout with local doorstep delivery in the Briz mobile app.",
  },
  favourites: {
    featureKey: "favourites",
    title: "Save items on the Briz app",
    description: "Save this item to your wishlist and receive restock notifications in the Briz mobile app.",
  },
};

