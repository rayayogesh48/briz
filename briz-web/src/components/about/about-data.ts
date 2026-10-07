// Demo content for the About page. Photography is hotlinked from Unsplash as a
// stand-in — replace PHOTOS with Briz's own Kathmandu photography before launch.
const unsplash = (id: string, width: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=75`;

export type Photo = { src: string; alt: string };

export const PHOTOS = {
  street: {
    src: unsplash("1765784607115-022fa2ab6648", 1100),
    alt: "Two people walking down a narrow street lined with small shops",
  },
  shopkeeper: {
    src: unsplash("1768314669044-db26a9f47468", 1800),
    alt: "A shopkeeper sitting at the counter of a shop packed with goods",
  },
  vendor: {
    src: unsplash("1708364171666-77e1a8e611bc", 900),
    alt: "A vendor sorting produce at a street stall",
  },
  storefront: {
    src: unsplash("1777016939441-905e3a156417", 1200),
    alt: "A small shop with blue wooden doors and a dog resting outside",
  },
  market: {
    src: unsplash("1781637851987-314fe0a2481c", 1400),
    alt: "A busy market street with shops on both sides",
  },
  fabric: {
    src: unsplash("1705475815904-9955cd589e4b", 900),
    alt: "Shelves stacked with colourful rolls of fabric",
  },
} satisfies Record<string, Photo>;

export const PRODUCT_IMAGES = {
  paper: "/figma/results/product-imgPhoneImage.png",
  bottle: "/products/bottle-main.svg",
  craft: "/figma/results/fashion-p3.png",
};

export const DIAGRAM_STORES = [
  { name: "Himalayan Bazzar", area: "New Baneshwor" },
  { name: "Sports Arena", area: "Thamel" },
  { name: "Paper & Print Nepal", area: "Putalisadak" },
  { name: "Green Basket", area: "Kalanki" },
  { name: "Kathmandu Electronics", area: "New Baneshwor" },
  { name: "Audio World Nepal", area: "Durbar Marg" },
];

export const SEARCH_RESULTS = [
  {
    name: "Thermal Paper 58 mm (Pack of 10)",
    store: "Himalayan Bazzar",
    price: "Rs. 500",
    distance: "350 m",
    image: PRODUCT_IMAGES.paper,
  },
  {
    name: "Thermal Paper 80 mm (Pack of 5)",
    store: "Paper & Print Nepal",
    price: "Rs. 640",
    distance: "1.2 km",
    image: PRODUCT_IMAGES.paper,
  },
];

export const REQUEST = {
  title: "Ink bottle set for Epson L3210",
  note: "Original, all four colours. Need it by tomorrow.",
  area: "New Baneshwor",
};

export const OFFERS = [
  {
    store: "Kathmandu Electronics",
    area: "New Baneshwor",
    distance: "0.4 km",
    price: "Rs. 2,150",
    note: "In stock. Pick up in 20 minutes.",
    tag: "Closest",
  },
  {
    store: "Paper & Print Nepal",
    area: "Putalisadak",
    distance: "1.2 km",
    price: "Rs. 1,980",
    note: "Sealed original set. Can deliver today.",
    tag: "Lowest price",
  },
  {
    store: "Office Essentials",
    area: "Thapathali",
    distance: "2.1 km",
    price: "Rs. 2,300",
    note: "Available with warranty card.",
    tag: "With warranty",
  },
];

export const CHOSEN_OFFER = 1;

export const MAP_PLACES = [
  { name: "Thamel", x: 264, y: 210 },
  { name: "Asan", x: 288, y: 252 },
  { name: "Maharajgunj", x: 322, y: 138 },
  { name: "Boudha", x: 412, y: 186 },
  { name: "New Baneshwor", x: 356, y: 296, home: true },
  { name: "Koteshwor", x: 438, y: 330 },
  { name: "Patan", x: 296, y: 364 },
  { name: "Kalanki", x: 138, y: 292 },
  { name: "Swayambhu", x: 128, y: 194 },
];

export const TRUST_POINTS = [
  { key: "verified", title: "Verified stores", body: "A badge that means Briz has checked the store is real." },
  { key: "business", title: "Business verification", body: "Registration details are reviewed before the badge appears." },
  { key: "info", title: "Store information", body: "Address, hours and contact details, in one place." },
  { key: "reviews", title: "Ratings & reviews", body: "What nearby customers said after buying." },
  { key: "fulfilment", title: "Clear pickup and delivery options", body: "Know how you'll get it before you ask." },
] as const;

export type TrustKey = (typeof TRUST_POINTS)[number]["key"];
