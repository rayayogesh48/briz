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
  for (const asset of ["apple.svg", "google.svg", "logout.svg", "trash.svg", "check-circle.svg", "avatar-placeholder.png"]) {
    assert.ok(existsSync(new URL(`../public/figma/profile/${asset}`, import.meta.url)), `profile asset ${asset} exists`);
  }
});
