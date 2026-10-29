import assert from "node:assert/strict";
import { after, test } from "node:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

// Compile the pure notification data module with the project's TypeScript toolchain.
const directory = mkdtempSync(join(tmpdir(), "briz-notifications-tests-"));
const source = readFileSync(new URL("../src/components/notifications/notification-data.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
writeFileSync(join(directory, "notification-data.js"), outputText);
const data = createRequire(import.meta.url)(join(directory, "notification-data.js"));
after(() => rmSync(directory, { recursive: true, force: true }));

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
// Midday local time, so "today" has room either side.
const now = new Date(2026, 9, 28, 12, 0, 0).getTime();

test("Mock feed: newest first, the first few unread, every row links somewhere", () => {
  const feed = data.buildMockNotifications(now);
  assert.equal(feed.length, 36);
  assert.deepEqual(feed.map((item) => item.createdAt), [...feed.map((item) => item.createdAt)].sort((a, b) => b - a));
  assert.equal(feed.filter((item) => item.unread).length, 4);
  assert.ok(feed.slice(0, 4).every((item) => item.unread));
  assert.ok(feed.every((item) => (item.external ? item.href.startsWith("https://") : item.href.startsWith("/"))), "in-app paths, or https links out");
  assert.equal(new Set(feed.map((item) => item.id)).size, feed.length, "ids are unique");
  assert.equal(data.buildMockNotifications(now, 3, 0).filter((item) => item.unread).length, 0);
});

test("Relative time: minutes, hours, yesterday, weekday, then a date", () => {
  assert.equal(data.formatNotificationTime(now - 20 * 1000, now), "Just now");
  assert.equal(data.formatNotificationTime(now - 18 * MINUTE, now), "18 min ago");
  assert.equal(data.formatNotificationTime(now - 3 * HOUR, now), "3 hr ago");
  assert.equal(data.formatNotificationTime(now - 20 * HOUR, now), "Yesterday");
  assert.match(data.formatNotificationTime(now - 3 * DAY, now), /^[A-Z][a-z]{2}$/, "a weekday within the week");
  assert.equal(data.formatNotificationTime(now - 20 * DAY, now), "8 Oct");
});

test("Day groups: Today, Yesterday, This week, Earlier; empty groups left out", () => {
  const feed = data.buildMockNotifications(now);
  const groups = data.groupByDay(feed, now);
  assert.deepEqual(groups.map((group) => group.label), ["Today", "Yesterday", "This week", "Earlier"]);
  assert.equal(groups.reduce((sum, group) => sum + group.items.length, 0), feed.length, "nothing lost");
  assert.deepEqual(data.groupByDay(feed.slice(0, 2), now).map((group) => group.label), ["Today"]);
});

test("Filters: All, or Unread only", () => {
  const feed = data.buildMockNotifications(now);
  assert.equal(feed.filter((item) => data.matchesFilter(item, "all")).length, 36);
  assert.equal(feed.filter((item) => data.matchesFilter(item, "unread")).length, 4);
});

test("Spec types only, and a button only when it does more than open the row", () => {
  const feed = data.buildMockNotifications(now);
  assert.deepEqual([...new Set(feed.map((item) => item.type))].sort(), ["expired", "offer", "promotion", "reactivation", "reminder"]);
  for (const item of feed) {
    for (const action of item.actions ?? []) {
      assert.ok(!(action.kind === "link" && action.href === item.href && item.type !== "reactivation"), `${item.title}: a button that repeats the row`);
    }
  }
  assert.ok(feed.filter((item) => item.type === "offer").every((item) => !item.actions), "offers: the row is the View Request");
  assert.ok(feed.filter((item) => item.type === "reminder").every((item) => !item.actions), "reminders: the row is the View Request");
  assert.ok(feed.filter((item) => item.type === "expired").every((item) => item.actions?.[0].kind === "request" && item.actions[0].label === "Create New Request"));
  const reactivation = feed.find((item) => item.type === "reactivation");
  assert.deepEqual(reactivation.actions.map((action) => action.label), ["Create a Request", "Browse Shops"]);
  assert.ok(feed.some((item) => item.media?.kind === "image") && feed.some((item) => item.media?.kind === "video"), "promotions with image and video");
  assert.ok(feed.filter((item) => item.external).every((item) => item.href.startsWith("https://")), "external promotions link out");
  assert.ok(feed.some((item) => item.body.startsWith("3 sellers responded")), "several offers become one notification with the count");
});

test("Navbar panel lists every notification, grouped by day; no notifications page for now", () => {
  const navbar = read("src/components/navbar-account.tsx");
  assert.match(navbar, /groupByDay\(\s*notifications\.filter\(\(item\) => matchesFilter\(item, filter\)\),\s*now,?\s*\)/, "all of them, not a slice");
  assert.doesNotMatch(navbar, /PANEL_LIMIT|href="\/notifications"/, "no cap and no View all");
  assert.match(navbar, /aria-pressed=\{filter === "unread"\}/);
  assert.match(navbar, /You&rsquo;re all caught up/, "Unread with nothing unread");
  assert.match(navbar, /setNotificationRead\(item\.id, true\);\s*navbarPreview\.closePopover\(\)/, "opening one marks it read and closes the panel");
  const css = read("src/components/navbar-account.module.css");
  assert.match(css, /\.notificationScroll \{[^}]*overflow-y: auto/, "the list scrolls inside the panel");
  assert.match(css, /\.groupTitle \{[^}]*position: sticky/, "day labels stay pinned while scrolling");
  assert.match(css, /\/\* Unread: a small dot, never a count\. \*\//, "the bell keeps its dot");
  assert.ok(!existsSync(new URL("../src/app/notifications/page.tsx", import.meta.url)), "the /notifications page is gone");
  assert.doesNotMatch(read("src/components/account/account-shell.tsx"), /\/notifications/, "and nothing links to it");
});

test("Notification playground mirrors the Figma component and drives the real row", () => {
  const playground = read("src/app/components/notification/notification-playground.tsx");
  for (const label of ["Type", "State", "Title", "Body", "Received", "Media", "CTA", "CTA 1", "CTA 2", "External link"]) {
    assert.ok(playground.includes(`label: "${label}"`), label);
  }
  assert.match(playground, /options: \["None", "Image", "Video"\]/);
  assert.match(playground, /presets: TYPE_PRESETS/, "picking a Type fills in the spec copy");
  assert.match(playground, /<NotificationItem item=\{buildNotificationFromControls\(values, now\)\}/);
  assert.match(playground, /widths=\{\{ desktop: 380, phone: 359 \}\}/, "panel and phone-sheet widths");
  assert.match(playground, /event\.preventDefault\(\)/, "links report instead of leaving the playground");
  assert.match(read("src/app/components/notification/page.tsx"), /<NotificationLibrary \/>/);
  assert.match(read("src/app/page.tsx"), /href[=:] ?"\/components\/notification"/, "listed with the other components");
});

test("Live site lists only the components that have a playground", () => {
  const home = read("src/app/page.tsx");
  assert.match(home, /const SHOW_ALL = process\.env\.NODE_ENV !== "production" \|\| process\.env\.NEXT_PUBLIC_SHOW_ALL_PAGES === "1"/);
  assert.match(home, /COMPONENTS\.filter\(\(component\) => SHOW_ALL \|\| component\.playground\)/);
  assert.equal((home.match(/\{SHOW_ALL && \(/g) ?? []).length, 2, "Dialogs and Pages are development-only");
  for (const href of ["request-card", "offer-card", "notification"]) {
    assert.match(home, new RegExp(`href: "/components/${href}",\\s*label: "[^"]+",\\s*playground: true`), href);
  }
  assert.match(home, /href: "\/components\/product-category-list",\s*label: "[^"]+",\s*playground: false/, "docs without a playground stay off the live site");
});

test("Live site blocks every page except home and the playgrounds; dev serves everything", () => {
  const proxy = read("src/proxy.ts");
  assert.match(proxy, /const LOCKED = process\.env\.NODE_ENV === "production" && process\.env\.NEXT_PUBLIC_SHOW_ALL_PAGES !== "1"/);
  assert.match(proxy, /return NextResponse\.rewrite\(new URL\("\/__not-on-live-site", request\.url\)\)/, "blocked pages get the 404 page");
  assert.match(proxy, /matcher: \["\/\(\(\?!_next\/static\|_next\/image\|\.\*\\\\\.\.\*\)\.\*\)"\]/, "assets and Next files pass through");
  // The allowlist matches the playground components listed on the live home page.
  const allowed = JSON.parse(proxy.match(/new Set\((\[[^\]]+\])\)/)[1]).sort();
  const home = read("src/app/page.tsx");
  const playgrounds = [...home.matchAll(/href: "([^"]+)",\s*label: "[^"]+",\s*playground: true/g)].map((match) => match[1]);
  assert.deepEqual(allowed, ["/", ...playgrounds].sort());
});
