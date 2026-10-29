"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ClipboardList, MapPin, Search, ShoppingCart } from "lucide-react";
import NavbarSearch from "./navbar-search";
import { useCart } from "@/store/cart-store";
import { navbarPreview, useNavbarPreview } from "@/store/navbar-preview-store";
import { useUnreadOffers } from "@/store/requests-store";
import { badgeLabel } from "./requests/request-data";
import { AuthDialog } from "./auth/auth-preview";
import { NavbarAccount, useNavbarPopoverDismiss } from "./navbar-account";
import { OPEN_HEADER_PANEL, type HeaderPanel } from "./header-panels";
import styles from "./briz-header.module.css";
type Panel = "location" | "search" | "orders" | "cart" | "chat" | "account" | "seller" | "download";
type Props = { searchQuery?: string; categoryContext?: string };
const locations = ["New Baneshwor, Kathmandu", "Lalitpur, Patan", "Bhaktapur"];
/** How far from the location to look for products and sellers, in km. */
const RADII = [1, 3, 5, 10];
const titles: Record<Panel, string> = { location: "Shopping location", search: "Search Briz", orders: "My Orders", cart: "Your Cart", chat: "Chat", account: "Your account", seller: "Become a Seller", download: "Download the Briz app" };
export function BrizHeader({ searchQuery = "", categoryContext }: Props) {
  const [location, setLocation] = useState(locations[0]);
  const [radius, setRadius] = useState(5);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { totalCount, items } = useCart();
  // Phase 2 prototype: mock account state.
  const { userState, authOpen } = useNavbarPreview();
  const authenticated = userState === "authenticated";
  useNavbarPopoverDismiss();
  // Requests badge: unread seller offers, derived from the shared request data.
  const unreadOffers = useUnreadOffers();
  const requestsLabel = unreadOffers > 0 ? `My requests, ${unreadOffers} unread ${unreadOffers === 1 ? "offer" : "offers"}` : "My requests";
  const cartLabel = `Your cart, ${totalCount} ${totalCount === 1 ? "item" : "items"}`;
  const requestsLink = <Link className={styles.iconAction} href="/requests" data-tip="My requests" aria-label={requestsLabel}>
      <span className={styles.badgeAnchor}><ClipboardList size={22} strokeWidth={1.75} aria-hidden="true" />{unreadOffers > 0 && <span className={styles.navBadge} aria-hidden="true">{badgeLabel(unreadOffers)}</span>}</span>
    </Link>;
  const cartButton = <button className={styles.iconAction} data-tip="Your cart" aria-label={cartLabel} onClick={() => setPanel("cart")}>
    <span className={styles.badgeAnchor}><ShoppingCart size={22} strokeWidth={1.75} aria-hidden="true" />{totalCount > 0 && <span className={styles.navBadge} data-tone="neutral" aria-hidden="true">{badgeLabel(totalCount)}</span>}</span>
  </button>;

  // Other parts of the page (the account sidebar) can open a header panel.
  useEffect(() => {
    const open = (event: Event) => setPanel((event as CustomEvent<HeaderPanel>).detail);
    window.addEventListener(OPEN_HEADER_PANEL, open);
    return () => window.removeEventListener(OPEN_HEADER_PANEL, open);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { if (panel && !dialog.current?.open) dialog.current?.showModal(); else if (!panel && dialog.current?.open) dialog.current?.close(); }, [panel]);
  return <header className={styles.header} data-scrolled={scrolled}>
    <div className={styles.identity}>
      <Link className={styles.logo} href="/" aria-label="Briz home"><Image src="/figma/logo.svg" alt="Briz" width={64} height={28} unoptimized priority /></Link>
      <button className={styles.location} onClick={() => setPanel("location")} aria-haspopup="dialog" aria-label={`Shopping from ${location}, within ${radius} km. Change location`}>
        <MapPin size={20} strokeWidth={1.75} className={styles.pin} aria-hidden="true" />
        <span className={styles.locationText}><span className={styles.locationLabel}>Shopping from · within {radius} km</span><span className={styles.address}><span className={styles.addressText}>{location}</span><ChevronDown size={14} strokeWidth={2} aria-hidden="true" /></span></span>
      </button>
    </div>
    <div className={styles.searchColumn}><NavbarSearch key={`${searchQuery}-${categoryContext}`} location={location} initialQuery={searchQuery} categoryContext={categoryContext} fluid /></div>
    {/* Kept deliberately small: Requests, Cart and Notifications when signed in (everything else is in the
        avatar menu); Cart, More and Log in for guests. Desktop and compact headers show the same set. */}
    <nav className={styles.actions} aria-label="Main navigation">
      {authenticated && requestsLink}
      {cartButton}
      <NavbarAccount layout="desktop" onOpenPanel={setPanel} />
    </nav>
    <div className={styles.compactActions}>
      <button className={styles.iconAction} aria-label="Open search" onClick={() => setPanel("search")}><Search size={22} strokeWidth={1.75} aria-hidden="true" /></button>
      {authenticated && requestsLink}
      {cartButton}
      <div className={styles.accountSlot}><NavbarAccount layout="compact" onOpenPanel={setPanel} /></div>
    </div>
    <dialog ref={dialog} className={`${styles.dialog} ${panel === "search" ? styles.searchDialog : ""}`} aria-labelledby={titleId} onCancel={() => setPanel(null)} onClose={() => setPanel(null)} onClick={event => { if (event.target === dialog.current) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setPanel(null); } }}>
      {panel !== "search" && (
        <div className={styles.dialogHeading}><h2 id={titleId}>{panel ? titles[panel] : "Briz"}</h2><button aria-label="Close dialog" onClick={() => setPanel(null)}>×</button></div>
      )}
      {panel === "search" && (
        <h2 id={titleId} className={styles.srOnly}>Search Briz</h2>
      )}
      {panel === "location" && <>
        <p>Choose where you’re shopping from.</p>
        <div className={styles.options}>{locations.map(item => <button key={item} aria-pressed={item === location} onClick={() => setLocation(item)}>{item}{item === location && <span>Selected</span>}</button>)}</div>
        {/* Distance lives with the location: it decides how far around it we look. */}
        <p className={styles.radiusLabel} id={`${titleId}-radius`}>Search radius</p>
        <div className={styles.radius} role="radiogroup" aria-labelledby={`${titleId}-radius`}>
          {RADII.map(km => <button key={km} type="button" role="radio" aria-checked={km === radius} onClick={() => setRadius(km)}>{km} km</button>)}
        </div>
        <button type="button" className={styles.locationDone} onClick={() => setPanel(null)}>Done</button>
      </>}
      {panel === "search" && <NavbarSearch key={`${searchQuery}-${categoryContext}`} location={location} initialQuery={searchQuery} categoryContext={categoryContext} embedded onNavigate={() => setPanel(null)} onClose={() => setPanel(null)} />}
      {panel === "orders" && <p>You don’t have any orders yet.</p>}
      {panel === "cart" && (
        <div>
          {items.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #ebebeb" }}>
                  <div>
                    <strong style={{ fontSize: "14px" }}>{item.name}</strong>
                    <div style={{ fontSize: "12px", color: "#646464" }}>Qty: {item.quantity} · {item.storeName}</div>
                  </div>
                  <span style={{ fontWeight: "600", fontSize: "14px", color: "#3e63dd" }}>Rs. {(item.price * item.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}
              <div style={{ marginTop: "8px", fontWeight: "700", textAlign: "right" }}>
                Total: Rs. {items.reduce((sum, i) => sum + i.price * i.quantity, 0).toLocaleString("en-IN")}
              </div>
            </div>
          )}
        </div>
      )}
      {panel === "chat" && <p>Chat with sellers will be available once Briz messaging is connected.</p>}
      {panel === "account" && <p>This is a preview account. Account services aren’t connected yet.</p>}
      {panel === "seller" && <p>Seller registration will be available once Briz’s seller portal is connected.</p>}
      {panel === "download" && <p>App Store and Google Play links haven’t been configured for this preview yet.</p>}
    </dialog>
    <AuthDialog open={authOpen} onOpenChange={navbarPreview.setAuthOpen} onComplete={navbarPreview.logIn} />
  </header>;
}
