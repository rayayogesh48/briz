import assert from "node:assert/strict";
import { after, test } from "node:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

// Compile the pure request data module with the project's existing TypeScript toolchain
const directory = mkdtempSync(join(tmpdir(), "briz-requests-tests-"));
const dataTs = readFileSync(new URL("../src/components/requests/request-data.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(dataTs, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
writeFileSync(join(directory, "request-data.js"), outputText);
const data = createRequire(import.meta.url)(join(directory, "request-data.js"));
after(() => rmSync(directory, { recursive: true, force: true }));

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const HOUR = 60 * 60 * 1000;

test("Mock requests derive status, closure reason and expiry from timestamps", () => {
  const now = Date.UTC(2026, 9, 15, 12);
  const requests = data.buildMockRequests(now);
  const byId = Object.fromEntries(requests.map((request) => [request.id, request]));
  const { REQUEST_IDS } = data;

  for (const request of requests) {
    assert.equal(request.expiresAt - request.createdAt, data.REQUEST_LIFETIME, `${request.id} lives 24 hours`);
    if (request.status === "active") {
      assert.ok(request.expiresAt > now, `${request.id} is only active before expiry`);
      assert.equal(request.closureReason, null);
    } else {
      assert.ok(request.closureReason, `${request.id} has a closure reason`);
      assert.ok(request.closedAt, `${request.id} has a closed time`);
    }
  }

  assert.equal(byId[REQUEST_IDS.expiredWithOffers].closureReason, "expired");
  assert.equal(byId[REQUEST_IDS.expiredNoOffers].closureReason, "expired");
  assert.equal(byId[REQUEST_IDS.cancelled].closureReason, "cancelled");
  assert.equal(byId[REQUEST_IDS.noOffers].offers.length, 0);
  assert.equal(byId[REQUEST_IDS.multipleOffers].status, "active");
});

test("Offer stats count every offer, and the navbar badge counts unread offers", () => {
  const requests = data.buildMockRequests(Date.now());
  const main = requests.find((request) => request.id === data.REQUEST_IDS.multipleOffers);
  const stats = data.offerStats(main);
  assert.equal(stats.count, 3);
  assert.equal(stats.unread, 2);
  assert.equal(stats.lowest, 2200);
  assert.equal(stats.average, (2200 + 2500 + 2800) / 3);

  // Declined offers still count toward the stats.
  const declined = requests.find((request) => request.id === data.REQUEST_IDS.declined);
  assert.equal(data.offerStats(declined).count, declined.offers.length);

  assert.equal(data.unreadOfferCount(requests), 3);
  const cleared = data.withUnread(requests, {});
  assert.equal(data.unreadOfferCount(cleared), 0);
  const one = data.withUnread(requests, { [main.id]: 1 });
  assert.equal(data.unreadOfferCount(one), 1);
  // withUnread marks the newest offer unread.
  const newest = [...main.offers].sort((a, b) => b.receivedAt - a.receivedAt)[0];
  assert.equal(one.find((request) => request.id === main.id).offers.find((offer) => !offer.isRead).id, newest.id);

  // A very long offer list must not overflow the call stack (Math.min(...list) would).
  const many = { ...main, offers: Array.from({ length: 200000 }, (_, index) => ({ ...main.offers[0], price: 5000 + (index % 97), isRead: true })) };
  assert.equal(data.offerStats(many).lowest, 5000);

  const empty = { ...main, offers: [] };
  assert.deepEqual(data.offerStats(empty), { count: 0, unread: 0, lowest: null, average: null });
});

test("Request formatting helpers", () => {
  assert.equal(data.formatRs(1250000), "Rs. 12,50,000");
  assert.equal(data.formatQuantity({ quantity: 1, unit: "Pieces" }), "1 Piece");
  assert.equal(data.formatQuantity({ quantity: 5, unit: "kg" }), "5 kg");
  assert.equal(data.formatRemaining(23 * HOUR + 42 * 60 * 1000), "23h 42m");
  assert.equal(data.formatRemaining(42 * 60 * 1000 + 10_000), "42m 10s");
  assert.equal(data.formatRemaining(45_000), "45s");
  assert.equal(data.formatRemaining(-5), "0s");
  assert.equal(data.formatAgo(30_000), "just now");
  assert.equal(data.formatAgo(HOUR), "1 hour ago");
  assert.equal(data.formatAgo(50 * HOUR), "2 days ago");
  assert.equal(data.offerCountLabel(0), "No offers yet");
  assert.equal(data.offerCountLabel(1), "1 seller offer");
  assert.equal(data.newOfferLabel(2), "2 new offers");
  assert.equal(data.badgeLabel(9), "9");
  assert.equal(data.badgeLabel(10), "9+");
  assert.equal(data.formatDistance(0.4), "400 m away");
  assert.equal(data.formatDistance(1.2), "1.2 km away");
  assert.equal(data.formatReviews(1), "1 review");
  assert.equal(data.formatReviews(1250), "1,250 reviews");
});

test("Requests routes, navbar badge and widget are wired to the shared store", () => {
  assert.ok(existsSync(new URL("../src/app/requests/[id]/page.tsx", import.meta.url)), "/requests/[id] route exists");
  assert.match(read("src/app/requests/page.tsx"), /<Suspense[\s\S]*<RequestList \/>/, "List reads ?tab= inside Suspense");
  assert.match(read("src/app/requests/[id]/page.tsx"), /<RequestDetail \/>/);

  const header = read("src/components/briz-header.tsx");
  assert.match(header, /useUnreadOffers\(\)/, "Navbar badge reads unread offers from the store");
  assert.match(header, /href="\/requests"/, "Navbar links to /requests");

  assert.match(read("src/app/layout.tsx"), /<OfferToast \/>/, "Offer toast is mounted globally");

  const widget = read("src/components/request-product-widget.tsx");
  assert.match(widget, /requestsStore\.create\(/, "Submitting the widget creates a request");
  assert.match(widget, /href=\{createdId \? `\/requests\/\$\{createdId\}`/, "Success links to the new request");

  const store = read("src/store/requests-store.ts");
  assert.match(store, /useSyncExternalStore/);
  assert.match(store, /closeExpired/, "Expired requests are closed as the clock ticks");
});

test("Profile page replaces the phase 2 placeholder", () => {
  const route = read("src/app/profile/page.tsx");
  assert.doesNotMatch(route, /Phase2Placeholder/);
  assert.match(route, /<ProfilePage \/>/);

  // Log out lives in the avatar menu; Delete account waits inside a collapsed accordion.
  const profile = read("src/components/profile/profile-page.tsx");
  assert.doesNotMatch(profile, /logoutButton|Log out of Briz/);
  assert.match(profile, /<details[\s\S]*className=\{styles\.dangerZone\}[\s\S]*open=\{state\.deleteOpen\}/);
  for (const asset of ["apple.svg", "google.svg", "check-circle.svg", "avatar-placeholder.png"]) {
    assert.ok(existsSync(new URL(`../public/figma/profile/${asset}`, import.meta.url)), `profile asset ${asset} exists`);
  }
});

test("Request card follows the Figma component, and its playground offers every Figma state", () => {
  const card = read("src/components/requests/request-card.tsx");
  assert.match(card, /export function RequestCard\(/);
  assert.match(card, /export function RequestCardSkeleton\(/);
  assert.match(card, /onClick=\{onCancel\}/, "Cancel is delegated to the caller");
  assert.match(card, /onClick=\{onRequestAgain\}/, "Request Again is delegated to the caller");
  for (const icon of ["dot", "budget", "sellers", "bell", "tag", "clock", "clock-soon", "clock-closed"]) {
    assert.ok(existsSync(new URL(`../public/figma/request-card/${icon}.svg`, import.meta.url)), `Figma icon ${icon}.svg is in the project`);
    assert.match(card, new RegExp(`/figma/request-card/${icon}\\.svg`), `card uses ${icon}.svg`);
  }
  for (const text of ["Qty:", "No offers yet", "Sellers have sent offer", "Lowest offer", "View Offer", "View Request", "Request Again"]) {
    assert.ok(card.includes(text), `card shows “${text}”`);
  }
  const css = read("src/components/requests/requests.module.css");
  assert.match(css, /\.cardExpiry\[data-tone="soon"\] \{[^}]*var\(--destructive\)/, "the last hour is red");
  assert.match(css, /\.cardNewBadge \{[^}]*var\(--info-container\)/, "New Offer badge uses the info colours");
  const list = read("src/components/requests/request-list.tsx");
  assert.match(list, /from "\.\/request-card"/, "My requests uses the shared card");
  assert.match(list, /onRequestAgain=\{\(\) =>\s*openBrizRequest\(/, "Request Again reopens the form with the same details");

  const playground = read("src/app/components/request-card/request-card-playground.tsx");
  for (const state of ["Waiting for offers", "One offer", "Multiple offers", "New Offer", "Expire soon", "Edge case", "Expired with offers", "Cancelled"]) {
    assert.ok(playground.includes(`"${state}"`) || playground.includes(`${state}:`), `playground offers the Figma state ${state}`);
  }
  assert.match(playground, /label: "Property 1"/);
  assert.doesNotMatch(playground, /label: "Unit"/, "no unit control: quantity is a plain number");
  for (const label of ["Name", "Product name", "Photo", "Quantity", "Budget", "Status", "Time left", "Offers", "New offers", "Lowest offer"]) {
    assert.match(playground, new RegExp(`label: "${label}"`), `playground has the ${label} property`);
  }
  for (const edge of ["Very long", "No spaces", "Broken link", "Rs. 1,25,00,000", "Final seconds", "Many", "Above budget"]) {
    assert.ok(playground.includes(`"${edge}"`) || playground.includes(`${edge}:`), `playground covers the edge case “${edge}”`);
  }
  assert.match(card, /active \? "No offers yet" : "No offers received"/, "closed requests without offers say so");
  assert.match(read("src/components/requests/request-parts.tsx"), /onError=\{\(\) => setFailed\(src\)\}/, "a broken photo falls back to the placeholder");
  assert.match(card, /quantityLabel = \(request: Pick<BrizRequest, "quantity">\) => request\.quantity\.toLocaleString\("en-IN"\)/, "Qty shows the number only");
  assert.match(read("src/components/playground/component-playground.tsx"), /presets\?: Record<string, PlaygroundValues>/, "variant options can fill in presets");

  const library = read("src/app/components/request-card/request-card-library.tsx");
  assert.match(library, /<RequestCardPlayground /, "the page previews states in the playground");
  assert.doesNotMatch(library, /STATE_GROUPS/, "no separate state sections");
  assert.ok(!existsSync(new URL("../src/components/requests/request-card-states.ts", import.meta.url)), "the old state fixtures are gone");
  assert.match(read("src/app/page.tsx"), /href[=:] ?"\/components\/request-card"/, "Home links to the library");
});

test("Seller offer card budget rules and wiring", () => {
  const request = { budget: 2500 };
  const compare = (price) => data.budgetComparison({ price }, request);
  assert.deepEqual(compare(2000), { kind: "save", percent: 20 });
  assert.deepEqual(compare(2490), { kind: "save", percent: 1 }, "a 0.4% saving rounds up to 1%");
  assert.deepEqual(compare(2500), { kind: "on" });
  assert.deepEqual(compare(2800), { kind: "over" });
  assert.deepEqual(data.budgetComparison({ price: 1150000 }, { budget: 1250000 }), { kind: "save", percent: 8 });

  const card = read("src/components/requests/offer-card.tsx");
  assert.match(card, /export function OfferCard\(/);
  assert.match(card, /onClick=\{onInterested\}/, "Interested is delegated to the caller");
  assert.match(card, /onClick=\{onDecline\}/, "Decline is delegated to the caller");
  assert.match(card, /budget\.kind === "save"[\s\S]*<s>[\s\S]*Save \{budget\.percent\}%/, "Below budget: crossed-out budget and the saving");
  assert.match(card, /budget\.kind === "on" && <span className=\{styles\.onBudget\}>On budget<\/span>/);
  assert.doesNotMatch(card, /over budget|Within budget/, "Over budget shows nothing, and the budget chip is gone");
  assert.match(read("src/components/requests/request-detail.tsx"), /from "\.\/offer-card"/, "The detail page uses the shared card");
  assert.match(read("src/components/requests/requests.module.css"), /@container offers \(max-width: 520px\)/, "The card adapts to its container width");

  const library = read("src/app/components/offer-card/offer-card-library.tsx");
  assert.match(library, /<OfferCardPlayground /, "the page previews states in the playground");
  assert.doesNotMatch(library, /STATE_GROUPS|OFFER_CONFIRMATION_STATES/, "no separate state sections");
  assert.ok(!existsSync(new URL("../src/components/requests/offer-card-states.ts", import.meta.url)), "the old state fixtures are gone");
  assert.match(read("src/app/page.tsx"), /href[=:] ?"\/components\/offer-card"/, "Home links to the library");
});

test("Offers can carry a seller photo, and Interested opens the mobile-style confirmation", () => {
  const now = Date.UTC(2026, 9, 15, 12);
  // Mock data: some seller offers come with photos and review counts.
  const offers = data.buildMockRequests(now).flatMap((request) => request.offers);
  assert.ok(offers.some((offer) => offer.image), "some mock offers have photos");
  assert.ok(offers.some((offer) => !offer.image), "some mock offers have none");

  const card = read("src/components/requests/offer-card.tsx");
  assert.match(card, /export function OfferPhoto\(/, "a shared square photo with a preview");
  assert.match(card, /className=\{styles\.offerPhoto\}[\s\S]*className=\{styles\.lightbox\}/, "clicking the photo opens the lightbox");
  assert.ok(card.indexOf("{offer.description}") < card.indexOf("<OfferPhoto src={offer.image}"), "on the card the photo comes after the note");
  const confirmStart = card.indexOf("export function OfferConfirmation(");
  assert.ok(card.indexOf("Seller&rsquo;s note", confirmStart) < card.indexOf('variant="full"', confirmStart), "in the confirmation the photo comes after the note");
  assert.match(read("src/components/requests/requests.module.css"), /\.offerPhoto \{[^}]*aspect-ratio: 1 \/ 1/, "photos are square");
  assert.match(card, /We&rsquo;ll let \{offer\.storeName\} know you&rsquo;re interested\. Your other offers stay open\./, "says what happens next");
  assert.match(card, /I&rsquo;m interested/);
  assert.match(card, /isLowest && \([\s\S]*Lowest price/, "the cheapest open offer is marked");
  assert.match(card, /<time dateTime=/, "received time is a real time element");
  const detail = read("src/components/requests/request-detail.tsx");
  assert.match(detail, /offer\.status !== "declined"\)\.map\(\(offer\) => offer\.price\)/, "declined offers don't compete for lowest price");
  assert.match(detail, /openPrices\.length >= 2/, "lowest price needs at least two open offers");
  assert.match(card, /Your request<\/span>/, "shows the request the offer answers");
  assert.match(card, /label=\{`Total for \$\{formatQuantity\(request\)\}`\}/, "the price says what it covers");
  assert.match(card, /data-initial-focus/, "focus lands on the title when it opens");
  assert.match(read("src/components/requests/requests.module.css"), /@container confirm \(min-width: 720px\)/, "two columns when the confirmation is wide enough");
  assert.match(card, /export function OfferConfirmation\(/);
  assert.match(card, /Is this what you&rsquo;re looking for\?/);
  assert.match(card, /export function OfferConfirmationDialog\(/);

  const parts = read("src/components/requests/request-parts.tsx");
  assert.match(parts, /<InterestedMessageDialog[\s\S]*open=\{live\?\.type === "interest"\}/, "Interested opens the message dialog");
  assert.match(parts, /onSend=\{[\s\S]*setOfferStatus\(request\.id, offer\.id, "interested"\)/, "sending the message marks the offer as interested");

  const playground = read("src/app/components/offer-card/offer-card-playground.tsx");
  assert.match(playground, /onInterested=\{\(\) => setConfirming\(built\)\}/, "Interested in the playground opens the real dialog");
  assert.match(playground, /<InterestedMessageDialog/);
});

test("Interested opens the mobile app's message dialog (Dev Briz 40016514:3379)", () => {
  const card = read("src/components/requests/offer-card.tsx");
  const start = card.indexOf("export function InterestedMessage(");
  assert.ok(start > 0);
  const dialog = card.slice(start);
  assert.match(dialog, /Interested in this offer\?/);
  assert.match(dialog, /Send a message to the seller/);
  assert.match(dialog, /Send Message/);
  assert.match(card, /INTEREST_MESSAGE = "Hi! I’m interested in ordering this product\. Is this still available\?"/, "the message starts prefilled");
  assert.match(dialog, /disabled=\{empty\}/, "an empty message can't be sent");
  assert.match(dialog, /<OfferSummary offer=\{offer\} request=\{request\} \/>/, "shows the offer with the card's own pieces");
  assert.match(card, /<li className=\{styles\.offer\}[\s\S]*<OfferSummary /, "the card uses the same summary");
  assert.match(read("src/components/requests/requests.module.css"), /\.dialog\.interestDialog \{[^}]*border-radius: 20px 20px 0 0/, "a bottom sheet on phones");
});

test("Seller offer card follows the Figma component, and its playground exposes the Figma properties", () => {
  // Fulfilment: one chip, worded as the Figma "Delivery Type State" variants.
  assert.deepEqual(data.fulfilmentSummary(["pickup"]), { kind: "pickup", label: "Store Pickup Only" });
  assert.deepEqual(data.fulfilmentSummary(["delivery"]), { kind: "delivery", label: "Online Delivery Only" });
  assert.deepEqual(data.fulfilmentSummary(["delivery", "pickup"]), { kind: "both", label: "Online Delivery Available" });

  const card = read("src/components/requests/offer-card.tsx");
  for (const icon of ["verified", "star", "dot", "map-pin", "trending-down", "shopping-bag-speed", "delivery-truck-speed", "arrows-pointing-out", "clock"]) {
    assert.ok(existsSync(new URL(`../public/figma/offer-card/${icon}.svg`, import.meta.url)), `Figma icon ${icon}.svg is in the project`);
    assert.match(card, new RegExp(`/figma/offer-card/${icon}\\.svg`), `card uses ${icon}.svg`);
  }
  assert.match(card, /View Conversation/, "Interested offers lead to the conversation");
  assert.match(card, /onClick=\{onViewConversation\}/);
  assert.doesNotMatch(card, /You&rsquo;re interested/, "the old interested label is gone");
  assert.match(card, /\{offer\.description && \(/, "Note off hides the seller's note");
  const css = read("src/components/requests/requests.module.css");
  assert.match(css, /\.offer \{[^}]*padding: 20px/, "card padding from Figma");
  assert.match(css, /\.chip\[data-tone="lowest"\] \{[^}]*var\(--info-container\)/, "Lowest price chip uses the info colours");
  assert.match(css, /\.offerPhoto \{[^}]*width: 100px/, "100px photo");

  const playground = read("src/components/playground/component-playground.tsx");
  assert.match(playground, /export function ComponentPlayground\(/, "a reusable playground");
  assert.match(playground, /role="switch"/, "boolean properties are switches");
  assert.match(playground, /aria-label="Reset all properties"/);

  const offerPlayground = read("src/app/components/offer-card/offer-card-playground.tsx");
  for (const label of ["Status", "Budget", "Note", "New", "Lowest price", "Photo", "Verified", "Store name", "Budget price", "Seller note", "Received", "Property 1"]) {
    assert.match(offerPlayground, new RegExp(`label: "${label}"`), `playground has the Figma property ${label}`);
  }
  assert.match(read("src/app/components/offer-card/offer-card-library.tsx"), /<OfferCardPlayground /, "the library shows the playground");
  assert.match(offerPlayground, /options: \["Awaiting", "Interested"\]/, "Status matches Figma: Awaiting and Interested only");
  assert.doesNotMatch(offerPlayground, /Declined|Request closed/);
});

test("Account pages share a grouped sidebar; the avatar menu uses the same groups; distance lives with the location", () => {
  const shell = read("src/components/account/account-shell.tsx");
  for (const label of ["Your activity", "Settings", "More from Briz", "My requests", "My orders", "Saved", "Chat", "Profile", "Language", "Become a seller", "Download app", "Log out", "Log in"]) {
    assert.ok(shell.includes(label), `sidebar has “${label}”`);
  }
  assert.match(shell, /aria-current=\{current \? "page" : undefined\}/, "the current page is marked");
  assert.match(shell, /openHeaderPanel\(panel\)/, "orders, chat, seller and app open the header panels");
  for (const page of ["requests", "profile", "saved"]) {
    assert.match(read(`src/app/${page}/page.tsx`), /<AccountShell>/, `/${page} uses the account layout`);
  }
  assert.match(read("src/components/account/account-shell.module.css"), /@media \(min-width: 1024px\)/, "the sidebar shows on wide screens only");

  const menu = read("src/components/navbar-account.tsx");
  for (const label of ["Your activity", "Settings", "More from Briz"]) assert.match(menu, new RegExp(`aria-label="${label}"`), `avatar menu group ${label}`);

  const header = read("src/components/briz-header.tsx");
  assert.match(header, /window\.addEventListener\(OPEN_HEADER_PANEL, open\)/, "the header opens panels on request");
  assert.match(header, /Shopping from · within \{radius\} km/, "the location shows the search radius");
  assert.match(header, /role="radiogroup"/, "the radius is chosen in the location dialog");
});

test("Request detail follows Figma 2673:60936: breadcrumb, product, banner countdown and facts", () => {
  const detail = read("src/components/requests/request-detail.tsx");
  assert.match(detail, /aria-label="Breadcrumb"[\s\S]*Request Details/);
  assert.match(detail, /Waiting for seller offers/);
  for (const label of ["Qty x Rate", "Total Amount", "Product details", "Requested on", "Expires on", "Cancel Request"]) {
    assert.ok(detail.includes(label), `shows ${label}`);
  }
  assert.equal(data.formatCountdown((10 * 3600 + 50 * 60 + 18) * 1000), "10h : 50m : 18s");
  assert.equal(data.formatCountdown(-5), "0h : 00m : 00s");
});
