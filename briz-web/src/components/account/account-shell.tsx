"use client";

// Account pages (My requests, Profile, Saved) share this layout: a grouped
// sidebar beside the page, so moving between account pages is one click. It
// uses the same groups as the avatar menu, which covers the same ground on
// every other page and on small screens.

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  Globe,
  Heart,
  HelpCircle,
  LogIn,
  LogOut,
  MapPin,
  MessageCircle,
  Package,
  Store,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { openHeaderPanel, type HeaderPanel } from "@/components/header-panels";
import { badgeLabel } from "@/components/requests/request-data";
import { useCart } from "@/store/cart-store";
import { useFavourites } from "@/store/favourite-store";
import {
  LANGUAGES,
  MOCK_USER,
  navbarPreview,
  useNavbarPreview,
  type NavbarLanguage,
} from "@/store/navbar-preview-store";
import { useRequests, useUnreadOffers } from "@/store/requests-store";
import styles from "./account-shell.module.css";

const maskedPhone = `${MOCK_USER.phone.slice(5, 7)}••••••${MOCK_USER.phone.slice(-2)}`;

function NavLink({
  href,
  icon: Icon,
  label,
  badge,
  badgeNoun = "offer",
  indicator,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  /** What the badge counts, for its label: "3 unread offers". */
  badgeNoun?: string;
  indicator?: string;
}) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link href={href} className={styles.item} aria-current={current ? "page" : undefined}>
      <span className={styles.itemIconWrapper}>
        <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className={styles.itemLabel}>{label}</span>
      {indicator && <span className={styles.itemIndicator}>{indicator}</span>}
      {badge ? (
        <span
          className={styles.badge}
          aria-label={`${badge} unread ${badge === 1 ? badgeNoun : `${badgeNoun}s`}`}
        >
          {badgeLabel(badge)}
        </span>
      ) : null}
      <ChevronRight size={14} className={styles.itemChevron} aria-hidden="true" />
    </Link>
  );
}

function PanelButton({
  panel,
  icon: Icon,
  label,
  tag,
}: {
  panel: HeaderPanel;
  icon: LucideIcon;
  label: string;
  tag?: string;
}) {
  return (
    <button
      type="button"
      className={styles.item}
      onClick={() => openHeaderPanel(panel)}
    >
      <span className={styles.itemIconWrapper}>
        <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className={styles.itemLabel}>{label}</span>
      {tag && <span className={styles.itemTag}>{tag}</span>}
      <ChevronRight size={14} className={styles.itemChevron} aria-hidden="true" />
    </button>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.group} role="group" aria-label={label}>
      <p className={styles.groupLabel} aria-hidden="true">
        {label}
      </p>
      {children}
    </div>
  );
}

export function AccountSidebar() {
  const { userState, language, signedInWithGoogle } = useNavbarPreview();
  const unread = useUnreadOffers();
  const { requests } = useRequests();
  const { favouriteIds } = useFavourites();
  const { totalCount: cartCount } = useCart();
  const signedIn = userState === "authenticated";

  return (
    <nav className={styles.sidebar} aria-label="Account">
      {/* User Identity Profile Card */}
      {signedIn ? (
        <div className={styles.profileCard}>
          <Link href="/profile" className={styles.profileHeaderLink} title="Manage your profile">
            <div className={styles.avatarWrapper}>
              <span className={styles.avatar} aria-hidden="true">
                {MOCK_USER.initials}
              </span>
              <span className={styles.onlineStatus} aria-label="Active status" />
            </div>
            <div className={styles.profileInfo}>
              <div className={styles.profileNameRow}>
                <strong className={styles.profileName}>{MOCK_USER.name}</strong>
                <CheckCircle2 size={13} className={styles.verifiedBadge} aria-label="Verified account" />
              </div>
              <span className={styles.profileIdentifier}>
                {signedInWithGoogle ? MOCK_USER.email : maskedPhone}
              </span>
              <span className={styles.profileLocation}>
                <MapPin size={11} aria-hidden="true" />
                <span>Kathmandu, Nepal</span>
              </span>
            </div>
            <ChevronRight size={16} className={styles.profileArrow} aria-hidden="true" />
          </Link>

          {/* Quick Metrics / Activity Stat Ribbon */}
          <div className={styles.statsRibbon} role="region" aria-label="Account quick overview">
            <Link href="/requests" className={styles.statTile} title="View all requests">
              <span className={styles.statNumber}>
                {requests.length}
                {unread > 0 && <span className={styles.statPulseDot} />}
              </span>
              <span className={styles.statText}>Requests</span>
            </Link>
            <div className={styles.statSeparator} />
            <Link href="/saved" className={styles.statTile} title="View saved items">
              <span className={styles.statNumber}>{favouriteIds.length}</span>
              <span className={styles.statText}>Saved</span>
            </Link>
            <div className={styles.statSeparator} />
            <button
              type="button"
              className={styles.statTile}
              onClick={() => openHeaderPanel("orders")}
              title="View my orders"
            >
              <span className={styles.statNumber}>{cartCount}</span>
              <span className={styles.statText}>Cart</span>
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.guestCard}>
          <div className={styles.guestIcon}>
            <UserRound size={22} strokeWidth={1.8} />
          </div>
          <div className={styles.guestInfo}>
            <strong className={styles.guestTitle}>Welcome to Briz</strong>
            <p className={styles.guestDesc}>
              Sign in to view orders, track requests, and access saved products.
            </p>
          </div>
          <button
            type="button"
            className={styles.guestLoginBtn}
            onClick={navbarPreview.openAuth}
          >
            <LogIn size={15} strokeWidth={2} />
            <span>Log in</span>
          </button>
        </div>
      )}

      {/* Navigation Group 1: Activity */}
      <Group label="Your activity">
        <NavLink href="/requests" icon={ClipboardList} label="My requests" badge={unread} />
        <PanelButton panel="orders" icon={Package} label="My orders" tag="Track" />
        <NavLink
          href="/saved"
          icon={Heart}
          label="Saved"
          indicator={favouriteIds.length > 0 ? String(favouriteIds.length) : undefined}
        />
        <PanelButton panel="chat" icon={MessageCircle} label="Chat" tag="Live" />
      </Group>

      {/* Navigation Group 2: Settings */}
      <Group label="Settings">
        <NavLink href="/profile" icon={UserRound} label="Profile" />
        <div className={styles.language}>
          <span className={styles.languageLabel} id="account-language">
            <span className={styles.itemIconWrapper}>
              <Globe size={18} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className={styles.itemLabel}>Language</span>
          </span>
          <div
            className={styles.segmented}
            role="radiogroup"
            aria-labelledby="account-language"
          >
            {(Object.keys(LANGUAGES) as NavbarLanguage[]).map((code) => (
              <button
                key={code}
                type="button"
                role="radio"
                aria-checked={code === language}
                lang={code}
                title={LANGUAGES[code].name}
                onClick={() => navbarPreview.setLanguage(code)}
              >
                {LANGUAGES[code].short}
              </button>
            ))}
          </div>
        </div>
      </Group>

      {/* Navigation Group 3: More from Briz */}
      <Group label="More from Briz">
        <PanelButton panel="seller" icon={Store} label="Become a seller" tag="Earn" />
        <PanelButton panel="download" icon={Download} label="Download app" tag="App" />
      </Group>

      {/* Customer Support Helper Card */}
      <div className={styles.supportCard}>
        <div className={styles.supportHeader}>
          <HelpCircle size={15} className={styles.supportIcon} aria-hidden="true" />
          <span className={styles.supportTitle}>Need Help?</span>
        </div>
        <p className={styles.supportSub}>Sun–Fri, 10:00 AM – 5:00 PM</p>
        <a href="tel:+9779812345678" className={styles.supportPhone}>
          +977 9812345678
        </a>
      </div>

      {/* Session Action: Log out / Log in */}
      <div className={styles.session}>
        {signedIn ? (
          <button type="button" className={`${styles.item} ${styles.logoutItem}`} onClick={navbarPreview.logOut}>
            <span className={styles.itemIconWrapper}>
              <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className={styles.itemLabel}>Log out</span>
          </button>
        ) : (
          <button type="button" className={`${styles.item} ${styles.loginItem}`} onClick={navbarPreview.openAuth}>
            <span className={styles.itemIconWrapper}>
              <LogIn size={18} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className={styles.itemLabel}>Log in</span>
          </button>
        )}
      </div>
    </nav>
  );
}

/** Wraps an account page: the sidebar on wide screens, responsive subnav on mobile, and content below. */
export function AccountShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const unread = useUnreadOffers();
  const { favouriteIds } = useFavourites();

  return (
    <div className={styles.shell}>
      <AccountSidebar />
      <div className={styles.content}>
        {/* Mobile Horizontal Subnav (< 1024px) */}
        <nav className={styles.mobileNav} aria-label="Account navigation">
          <Link
            href="/requests"
            className={styles.mobileNavItem}
            aria-current={pathname === "/requests" || pathname.startsWith("/requests/") ? "page" : undefined}
          >
            <ClipboardList size={15} strokeWidth={1.8} />
            <span>My requests</span>
            {unread > 0 && <span className={styles.mobileNavBadge}>{badgeLabel(unread)}</span>}
          </Link>
          <Link
            href="/saved"
            className={styles.mobileNavItem}
            aria-current={pathname === "/saved" || pathname.startsWith("/saved/") ? "page" : undefined}
          >
            <Heart size={15} strokeWidth={1.8} />
            <span>Saved</span>
            {favouriteIds.length > 0 && <span className={styles.mobileNavCount}>{favouriteIds.length}</span>}
          </Link>
          <Link
            href="/profile"
            className={styles.mobileNavItem}
            aria-current={pathname === "/profile" || pathname.startsWith("/profile/") ? "page" : undefined}
          >
            <UserRound size={15} strokeWidth={1.8} />
            <span>Profile</span>
          </Link>
        </nav>
        {children}
      </div>
    </div>
  );
}
