export interface StoreReview {
  id: string;
  storeId: string;
  avatar: string;
  username: string;
  givenStar: number; // 1 to 5
  tags: string[];
  content: string; // Max 360 characters
  date: string;
  verifiedPurchase?: boolean;
  helpfulCount?: number;
}

export const MAX_REVIEW_LENGTH = 360;

export const POPULAR_REVIEW_TAGS = [
  "Authentic Products",
  "Fast Delivery",
  "Careful Packaging",
  "Friendly Merchant",
  "Great Value",
  "Responsive Seller",
  "Fresh Stock",
  "Easy Return",
];

export const DEFAULT_STORE_REVIEWS: Record<string, StoreReview[]> = {
  s1: [
    {
      id: "rev-s1-1",
      storeId: "s1",
      avatar: "/figma/avatar.png",
      username: "Aarav Sharma",
      givenStar: 5,
      tags: ["Authentic Products", "Careful Packaging"],
      content: "Purchased the handcrafted Buddha carving wooden head. The quality and craftsmanship are genuinely exceptional. Arrived properly boxed with shock-absorbent wraps. Highly recommended local store in Kathmandu!",
      date: "2 days ago",
      verifiedPurchase: true,
      helpfulCount: 14,
    },
    {
      id: "rev-s1-2",
      storeId: "s1",
      avatar: "/figma/home/seller-phone.png",
      username: "Pooja Manandhar",
      givenStar: 5,
      tags: ["Fast Delivery", "Friendly Merchant"],
      content: "Super quick delivery across Lalitpur within 3 hours of placing my order. The seller was courteous on chat and shared close-up photos before dispatching.",
      date: "1 week ago",
      verifiedPurchase: true,
      helpfulCount: 9,
    },
    {
      id: "rev-s1-3",
      storeId: "s1",
      avatar: "/figma/results/store-imgAvatarImage1.png",
      username: "Bikash Thapa",
      givenStar: 4,
      tags: ["Great Value", "Authentic Products"],
      content: "Very fair prices compared to tourist markets around Thamel. Genuine handmade items and transparent pricing without hidden markups.",
      date: "2 weeks ago",
      verifiedPurchase: true,
      helpfulCount: 6,
    },
    {
      id: "rev-s1-4",
      storeId: "s1",
      avatar: "/figma/results/store-imgAvatarImage2.png",
      username: "Sunita Maharjan",
      givenStar: 5,
      tags: ["Careful Packaging", "Responsive Seller"],
      content: "Ordered delicate ceramic vases and they arrived safely without a single scratch. Excellent packaging and instant customer support.",
      date: "3 weeks ago",
      verifiedPurchase: true,
      helpfulCount: 11,
    },
  ],
  s2: [
    {
      id: "rev-s2-1",
      storeId: "s2",
      avatar: "/figma/avatar.png",
      username: "Rohan Shakya",
      givenStar: 5,
      tags: ["Authentic Products", "Great Value"],
      content: "Purchased studio headphones and an audio interface. Original brand warranty provided and verified on spot. Sound Haven is my go-to audio gear store.",
      date: "4 days ago",
      verifiedPurchase: true,
      helpfulCount: 8,
    },
    {
      id: "rev-s2-2",
      storeId: "s2",
      avatar: "/figma/results/store-imgAvatarImage.png",
      username: "Kritika Bajracharya",
      givenStar: 4,
      tags: ["Friendly Merchant", "Fast Delivery"],
      content: "Great staff who helped test cables and headphone pads before payment. Fast pickup from Putalisadak.",
      date: "1 month ago",
      verifiedPurchase: true,
      helpfulCount: 4,
    },
  ],
  s5: [
    {
      id: "rev-s5-1",
      storeId: "s5",
      avatar: "/figma/results/store-imgAvatarImage1.png",
      username: "Prabin Karki",
      givenStar: 5,
      tags: ["Fast Delivery", "Responsive Seller"],
      content: "Got a 10000mAh power bank delivered to New Baneshwor in under 45 minutes. Item was sealed with warranty stamp. Super reliable service.",
      date: "3 days ago",
      verifiedPurchase: true,
      helpfulCount: 15,
    },
    {
      id: "rev-s5-2",
      storeId: "s5",
      avatar: "/figma/avatar.png",
      username: "Dipendra KC",
      givenStar: 5,
      tags: ["Authentic Products", "Great Value"],
      content: "Tested the charging cable and power bank with multiple devices. High charging speeds as advertised. Trustworthy local electronics store.",
      date: "1 week ago",
      verifiedPurchase: true,
      helpfulCount: 7,
    },
  ],
};

// Generic fallback reviews for any store without bespoke reviews
export const GENERIC_STORE_REVIEWS: StoreReview[] = [
  {
    id: "rev-gen-1",
    storeId: "default",
    avatar: "/figma/avatar.png",
    username: "Anish Shrestha",
    givenStar: 5,
    tags: ["Authentic Products", "Careful Packaging"],
    content: "Excellent experience shopping from this store. The items received matched the product photos accurately and the seller was communicative throughout.",
    date: "1 week ago",
    verifiedPurchase: true,
    helpfulCount: 12,
  },
  {
    id: "rev-gen-2",
    storeId: "default",
    avatar: "/figma/results/store-imgAvatarImage2.png",
    username: "Sujata Gurung",
    givenStar: 5,
    tags: ["Fast Delivery", "Friendly Merchant"],
    content: "Placed an order in the morning and received it before afternoon. Very polite delivery and clean packaging.",
    date: "2 weeks ago",
    verifiedPurchase: true,
    helpfulCount: 8,
  },
  {
    id: "rev-gen-3",
    storeId: "default",
    avatar: "/figma/results/store-imgAvatarImage1.png",
    username: "Nabin Adhikari",
    givenStar: 4,
    tags: ["Great Value", "Responsive Seller"],
    content: "Good product quality and affordable price points. Answered all inquiries on chat promptly.",
    date: "3 weeks ago",
    verifiedPurchase: true,
    helpfulCount: 5,
  },
];

export function getInitialStoreReviews(storeId: string): StoreReview[] {
  if (DEFAULT_STORE_REVIEWS[storeId]) {
    return DEFAULT_STORE_REVIEWS[storeId];
  }
  return GENERIC_STORE_REVIEWS.map((rev, index) => ({
    ...rev,
    id: `rev-${storeId}-${index + 1}`,
    storeId,
  }));
}

export function validateReviewContent(content: string): { valid: boolean; error?: string } {
  const trimmed = content.trim();
  if (!trimmed) {
    return { valid: false, error: "Review content cannot be empty." };
  }
  if (trimmed.length > MAX_REVIEW_LENGTH) {
    return {
      valid: false,
      error: `Review content exceeds maximum limit of ${MAX_REVIEW_LENGTH} characters (currently ${trimmed.length}).`,
    };
  }
  return { valid: true };
}

