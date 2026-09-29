export type SystemStateVariant =
  | "neutral"
  | "info"
  | "warning"
  | "error"
  | "success";

export interface SystemStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "danger";
  disabled?: boolean;
  loading?: boolean;
}

export interface SystemStatePreset {
  id: string;
  category: "pages" | "commerce" | "requests" | "forms" | "upload" | "loading" | "platform";
  variant: SystemStateVariant;
  eyebrow?: string;
  title: string;
  description: string;
  iconName: string;
  primaryAction?: SystemStateAction;
  secondaryAction?: SystemStateAction;
  fullPageRecommended?: boolean;
  contextNote?: string;
}

export const SYSTEM_STATE_PRESETS: Record<string, SystemStatePreset> = {
  // ─── PAGES ───
  "not-found": {
    id: "not-found",
    category: "pages",
    variant: "neutral",
    eyebrow: "404",
    title: "Page not found",
    description: "The page you're looking for doesn't exist or may have moved.",
    iconName: "FileQuestion",
    primaryAction: {
      label: "Go to home",
      href: "/",
      variant: "primary",
    },
    secondaryAction: {
      label: "Search products",
      href: "/search",
      variant: "secondary",
    },
    fullPageRecommended: true,
    contextNote: "Framework 404 handler (not-found.tsx). Route could not be resolved.",
  },
  "server-error": {
    id: "server-error",
    category: "pages",
    variant: "error",
    eyebrow: "500",
    title: "Something went wrong",
    description: "We couldn't load this page right now. Please try again.",
    iconName: "AlertCircle",
    primaryAction: {
      label: "Try again",
      variant: "primary",
    },
    secondaryAction: {
      label: "Go to home",
      href: "/",
      variant: "secondary",
    },
    fullPageRecommended: true,
    contextNote: "Framework error boundary (error.tsx). Never exposes stack traces or technical secrets.",
  },
  offline: {
    id: "offline",
    category: "pages",
    variant: "warning",
    eyebrow: "Offline",
    title: "You're offline",
    description: "Check your internet connection and try again.",
    iconName: "WifiOff",
    primaryAction: {
      label: "Try again",
      variant: "primary",
    },
    secondaryAction: {
      label: "Go to home",
      href: "/",
      variant: "secondary",
    },
    fullPageRecommended: true,
    contextNote: "Monitors navigator.onLine & online/offline window events. Preserves unsaved state.",
  },
  maintenance: {
    id: "maintenance",
    category: "pages",
    variant: "info",
    eyebrow: "Maintenance",
    title: "Briz is getting a quick tune-up",
    description: "We're temporarily unavailable while we make improvements. Please check back shortly.",
    iconName: "Wrench",
    primaryAction: {
      label: "Try again",
      variant: "primary",
    },
    fullPageRecommended: true,
    contextNote: "Dedicated /maintenance route with minimal Briz branding. Supports optional estimatedReturn.",
  },
  "access-denied": {
    id: "access-denied",
    category: "pages",
    variant: "warning",
    eyebrow: "403",
    title: "You don't have access to this page",
    description: "This page isn't available for your account.",
    iconName: "Lock",
    primaryAction: {
      label: "Go back",
      variant: "secondary",
    },
    secondaryAction: {
      label: "Go to home",
      href: "/",
      variant: "primary",
    },
    fullPageRecommended: true,
    contextNote: "Authorization failure. Where seller context is known, suggests seller account.",
  },
  "session-expired": {
    id: "session-expired",
    category: "pages",
    variant: "info",
    eyebrow: "Session",
    title: "Your session has expired",
    description: "Log in again to continue where you left off.",
    iconName: "Clock",
    primaryAction: {
      label: "Log in",
      href: "/login",
      variant: "primary",
    },
    secondaryAction: {
      label: "Go to home",
      href: "/",
      variant: "secondary",
    },
    fullPageRecommended: true,
    contextNote: "Preserves user returnUrl so user lands back right where they left off.",
  },
  "too-many-requests": {
    id: "too-many-requests",
    category: "pages",
    variant: "warning",
    eyebrow: "429",
    title: "Too many attempts",
    description: "Please wait a moment before trying again.",
    iconName: "Timer",
    primaryAction: {
      label: "Try again",
      variant: "primary",
    },
    fullPageRecommended: false,
    contextNote: "Rate limiting for OTP, form submissions, and repeated queries. Supports retryAfter.",
  },

  // ─── COMMERCE ───
  "product-unavailable": {
    id: "product-unavailable",
    category: "commerce",
    variant: "neutral",
    eyebrow: "Catalog",
    title: "This product isn't available right now",
    description: "You can keep browsing or request what you're looking for from local sellers.",
    iconName: "PackageX",
    primaryAction: {
      label: "Request this product",
      variant: "primary",
    },
    secondaryAction: {
      label: "Browse similar products",
      href: "/search",
      variant: "secondary",
    },
    fullPageRecommended: false,
    contextNote: "In-context inventory shortage. Keeps product name/image visible and routes to Request widget.",
  },
  "product-removed": {
    id: "product-removed",
    category: "commerce",
    variant: "neutral",
    eyebrow: "Unlisted",
    title: "This product is no longer listed",
    description: "The seller may have removed it, but you can request a similar item from nearby sellers.",
    iconName: "PackageX",
    primaryAction: {
      label: "Request a product",
      variant: "primary",
    },
    secondaryAction: {
      label: "Explore similar products",
      href: "/search",
      variant: "secondary",
    },
    fullPageRecommended: false,
    contextNote: "Permanent delisting. Routes user directly to the local marketplace Request flow.",
  },
  "store-unavailable": {
    id: "store-unavailable",
    category: "commerce",
    variant: "neutral",
    eyebrow: "Store",
    title: "This store isn't available right now",
    description: "The store may be temporarily unavailable or no longer active on Briz.",
    iconName: "Store",
    primaryAction: {
      label: "Explore other stores",
      href: "/search?tab=stores",
      variant: "primary",
    },
    secondaryAction: {
      label: "Go to home",
      href: "/",
      variant: "secondary",
    },
    fullPageRecommended: false,
    contextNote: "Store temporarily inactive. Does not claim permanent closure unless verified.",
  },
  "no-search-results": {
    id: "no-search-results",
    category: "commerce",
    variant: "neutral",
    eyebrow: "Search",
    title: "We couldn't find that product",
    description: "Try another search, or request it from nearby sellers.",
    iconName: "Search",
    primaryAction: {
      label: "Request this product",
      variant: "primary",
    },
    secondaryAction: {
      label: "Clear search",
      variant: "secondary",
    },
    fullPageRecommended: false,
    contextNote: "Zero search results fallback. Automatically forwards search query to Request draft.",
  },
  "empty-category": {
    id: "empty-category",
    category: "commerce",
    variant: "neutral",
    eyebrow: "Category",
    title: "No products listed yet",
    description: "Stores in this category may still be able to help. Request what you're looking for.",
    iconName: "FolderOpen",
    primaryAction: {
      label: "Request a product",
      variant: "primary",
    },
    secondaryAction: {
      label: "Browse other categories",
      href: "/categories",
      variant: "secondary",
    },
    fullPageRecommended: false,
    contextNote: "Category with no current stock. Keeps category visible and prompts request.",
  },
  "empty-saved-products": {
    id: "empty-saved-products",
    category: "commerce",
    variant: "neutral",
    eyebrow: "Saved",
    title: "No saved products yet",
    description: "Save products you want to come back to later.",
    iconName: "ShoppingBag",
    primaryAction: {
      label: "Explore products",
      href: "/search",
      variant: "primary",
    },
    fullPageRecommended: false,
    contextNote: "Empty wishlist / saved collection state.",
  },
  "empty-saved-stores": {
    id: "empty-saved-stores",
    category: "commerce",
    variant: "neutral",
    eyebrow: "Favorites",
    title: "No saved stores yet",
    description: "Save local stores you want to find again quickly.",
    iconName: "Store",
    primaryAction: {
      label: "Explore stores",
      href: "/search?tab=stores",
      variant: "primary",
    },
    fullPageRecommended: false,
    contextNote: "Empty saved stores list.",
  },

  // ─── REQUESTS ───
  "request-expired": {
    id: "request-expired",
    category: "requests",
    variant: "neutral",
    eyebrow: "Request",
    title: "This request has expired",
    description: "Sellers can no longer respond to this request. You can create a new one if you still need the item.",
    iconName: "Clock",
    primaryAction: {
      label: "Create new request",
      variant: "primary",
    },
    secondaryAction: {
      label: "View my requests",
      href: "/#requests",
      variant: "secondary",
    },
    fullPageRecommended: false,
    contextNote: "Expired marketplace request. Seamlessly pre-populates previous request details on retry.",
  },
  "request-cancelled": {
    id: "request-cancelled",
    category: "requests",
    variant: "neutral",
    eyebrow: "Request",
    title: "Request cancelled",
    description: "This request is no longer active.",
    iconName: "FileX",
    primaryAction: {
      label: "Create another request",
      variant: "primary",
    },
    secondaryAction: {
      label: "View my requests",
      href: "/#requests",
      variant: "secondary",
    },
    fullPageRecommended: false,
    contextNote: "User-initiated cancellation. Calm tone without implying system failure.",
  },
  "no-requests": {
    id: "no-requests",
    category: "requests",
    variant: "neutral",
    eyebrow: "Requests",
    title: "No requests yet",
    description: "Can't find something? Create a request and let local sellers respond.",
    iconName: "Inbox",
    primaryAction: {
      label: "Request a product",
      variant: "primary",
    },
    fullPageRecommended: false,
    contextNote: "Empty request history state.",
  },
  "waiting-for-offers": {
    id: "waiting-for-offers",
    category: "requests",
    variant: "info",
    eyebrow: "Active Request",
    title: "Waiting for offers",
    description: "Your request is active. We'll show seller offers here when they arrive.",
    iconName: "Clock",
    fullPageRecommended: false,
    contextNote: "Calm waiting state. Does not guarantee offers or treat delay as an error.",
  },
  "request-submit-failed": {
    id: "request-submit-failed",
    category: "requests",
    variant: "error",
    eyebrow: "Submission",
    title: "Couldn't send your request",
    description: "Your information is still here. Please try again.",
    iconName: "AlertCircle",
    primaryAction: {
      label: "Try again",
      variant: "primary",
    },
    fullPageRecommended: false,
    contextNote: "Request submission network failure. Strictly preserves user input draft.",
  },

  // ─── FORMS ───
  "form-submission-failed": {
    id: "form-submission-failed",
    category: "forms",
    variant: "error",
    eyebrow: "Form",
    title: "Couldn't submit your form",
    description: "Your information is still here. Please try again.",
    iconName: "AlertCircle",
    primaryAction: {
      label: "Try again",
      variant: "primary",
    },
    fullPageRecommended: false,
    contextNote: "Reusable form-level failure banner. Retains all entered fields.",
  },

  // ─── UPLOADS ───
  "uploading": {
    id: "uploading",
    category: "upload",
    variant: "info",
    eyebrow: "Upload",
    title: "Uploading image...",
    description: "Optimizing and securing your image for local sellers.",
    iconName: "UploadCloud",
    primaryAction: {
      label: "Cancel upload",
      variant: "secondary",
    },
    fullPageRecommended: false,
    contextNote: "Active upload with thumbnail and determinate/indeterminate progress indicator.",
  },
  "unsupported-file": {
    id: "unsupported-file",
    category: "upload",
    variant: "warning",
    eyebrow: "Upload",
    title: "This file type isn't supported",
    description: "Upload a JPG, PNG, or WebP image.",
    iconName: "ImageOff",
    primaryAction: {
      label: "Choose another file",
      variant: "primary",
    },
    fullPageRecommended: false,
    contextNote: "Validation error for disallowed MIME types.",
  },
  "file-too-large": {
    id: "file-too-large",
    category: "upload",
    variant: "warning",
    eyebrow: "Upload",
    title: "This image is too large",
    description: "Maximum file size is 5MB. Please choose a smaller photo.",
    iconName: "ImageOff",
    primaryAction: {
      label: "Choose smaller image",
      variant: "primary",
    },
    fullPageRecommended: false,
    contextNote: "Validation error when image exceeds real server limit.",
  },
  "upload-failed": {
    id: "upload-failed",
    category: "upload",
    variant: "error",
    eyebrow: "Upload",
    title: "Couldn't upload this image",
    description: "Check your connection and try again.",
    iconName: "ImageOff",
    primaryAction: {
      label: "Try again",
      variant: "primary",
    },
    secondaryAction: {
      label: "Remove",
      variant: "secondary",
    },
    fullPageRecommended: false,
    contextNote: "Network or server failure during upload. Keeps selected file selected.",
  },

  // ─── LOADING ───
  "slow-loading": {
    id: "slow-loading",
    category: "loading",
    variant: "info",
    eyebrow: "Loading",
    title: "This is taking longer than usual",
    description: "We're still trying to load your results.",
    iconName: "Clock",
    primaryAction: {
      label: "Try again",
      variant: "primary",
    },
    fullPageRecommended: false,
    contextNote: "Appears only after a configurable delay (e.g. 3000ms). Never displays prematurely.",
  },

  // ─── PLATFORM ───
  "service-unavailable": {
    id: "service-unavailable",
    category: "platform",
    variant: "warning",
    eyebrow: "Service",
    title: "Chat is temporarily unavailable",
    description: "You can keep browsing while we reconnect.",
    iconName: "AlertCircle",
    primaryAction: {
      label: "Try again",
      variant: "primary",
    },
    fullPageRecommended: false,
    contextNote: "Isolated micro-service degradation. Does not lock out the rest of the application.",
  },
  "mobile-app-required": {
    id: "mobile-app-required",
    category: "platform",
    variant: "info",
    eyebrow: "Mobile App",
    title: "Available on the Briz mobile app",
    description: "Chat with sellers from the Briz mobile app.",
    iconName: "Smartphone",
    primaryAction: {
      label: "Get mobile app",
      href: "/#download",
      variant: "primary",
    },
    fullPageRecommended: false,
    contextNote: "Feature bounded to mobile app. Directs desktop users cleanly without fake URLs.",
  },
  "coming-soon": {
    id: "coming-soon",
    category: "platform",
    variant: "neutral",
    eyebrow: "Coming Soon",
    title: "Coming soon",
    description: "We're still working on this feature.",
    iconName: "Sparkles",
    primaryAction: {
      label: "Go back",
      variant: "secondary",
    },
    fullPageRecommended: false,
    contextNote: "Used exclusively for intentionally planned upcoming capabilities, not unexpected bugs.",
  },
  "restricted-seller-category": {
    id: "restricted-seller-category",
    category: "platform",
    variant: "info",
    eyebrow: "Seller Setup",
    title: "Coming soon for your business category",
    description: "Your store isn't live on Briz yet because we're completing the required setup for this category.",
    iconName: "Store",
    primaryAction: {
      label: "View onboarding status",
      href: "/seller",
      variant: "primary",
    },
    fullPageRecommended: false,
    contextNote: "Seller compliance / regulated category hold without treating it as an error.",
  },
};

export const SYSTEM_STATE_CATEGORIES = [
  { id: "pages", label: "Pages", count: 7 },
  { id: "commerce", label: "Commerce", count: 7 },
  { id: "requests", label: "Requests", count: 5 },
  { id: "forms", label: "Forms", count: 1 },
  { id: "upload", label: "Uploads", count: 4 },
  { id: "loading", label: "Loading", count: 1 },
  { id: "platform", label: "Platform", count: 4 },
] as const;
