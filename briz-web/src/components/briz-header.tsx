"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import NavbarSearch from "./navbar-search";
import { useCart } from "@/store/cart-store";
import styles from "./briz-header.module.css";
type Panel = "location" | "search" | "menu" | "orders" | "cart" | "account" | "seller" | "download";
type Props = { variant?: "signed-in" | "download"; searchQuery?: string; categoryContext?: string };
const locations = ["New Baneshwor, Kathmandu", "Lalitpur, Patan", "Bhaktapur"];
const titles: Record<Panel, string> = { location: "Shopping location", search: "Search Briz", menu: "Explore Briz", orders: "My Orders", cart: "Your Cart", account: "Your account", seller: "Become a Seller", download: "Download the Briz app" };
function Icon({ name }: { name: string }) { return <Image src={`/figma/${name}.svg`} alt="" width={20} height={20} unoptimized />; }
export function BrizHeader({ variant = "signed-in", searchQuery = "", categoryContext }: Props) {
  const [location, setLocation] = useState(locations[0]);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { totalCount, items } = useCart();

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
      <button className={styles.location} onClick={() => setPanel("location")} aria-haspopup="dialog"><strong>🛍️ Shopping from</strong><span><span className={styles.address}>{location}</span><Icon name="chevron-down" /></span></button>
    </div>
    <div className={styles.searchColumn}><NavbarSearch key={`${searchQuery}-${categoryContext}`} location={location} initialQuery={searchQuery} categoryContext={categoryContext} /></div>
    <nav className={styles.actions} aria-label="Main navigation">
      {variant === "signed-in" ? <>
        <button className={styles.navAction} onClick={() => setPanel("orders")}><Icon name="orders" /><span>My Orders</span></button>
        <button className={styles.navAction} onClick={() => setPanel("cart")} aria-label={`Your Cart, ${totalCount} items`}>
          <Icon name="cart" />
          <span>Your Cart{totalCount > 0 ? ` (${totalCount})` : ""}</span>
        </button>
        <button className={styles.avatar} aria-label="Your account" onClick={() => setPanel("account")}><Image src="/figma/avatar.png" alt="" width={48} height={48} /></button>
      </> : <>
        <button className={styles.secondary} onClick={() => setPanel("seller")}><Icon name="store" />Become a Seller</button>
        <button className={styles.primary} onClick={() => setPanel("download")}><Icon name="download" />Download App</button>
      </>}
    </nav>
    <div className={styles.compactActions}><button aria-label="Open search" onClick={() => setPanel("search")}><Icon name="search-mobile" /></button><button aria-label="Open navigation menu" onClick={() => setPanel("menu")}><Icon name="menu" /></button></div>
    <dialog ref={dialog} className={`${styles.dialog} ${panel === "search" ? styles.searchDialog : ""}`} aria-labelledby={titleId} onCancel={() => setPanel(null)} onClose={() => setPanel(null)} onClick={event => { if (event.target === dialog.current) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setPanel(null); } }}>
      {panel !== "search" && (
        <div className={styles.dialogHeading}><h2 id={titleId}>{panel ? titles[panel] : "Briz"}</h2><button aria-label="Close dialog" onClick={() => setPanel(null)}>×</button></div>
      )}
      {panel === "search" && (
        <h2 id={titleId} className={styles.srOnly}>Search Briz</h2>
      )}
      {panel === "location" && <><p>Choose where you’re shopping from.</p><div className={styles.options}>{locations.map(item => <button key={item} aria-pressed={item === location} onClick={() => { setLocation(item); setPanel(null); }}>{item}{item === location && <span>Selected</span>}</button>)}</div></>}
      {panel === "search" && <NavbarSearch key={`${searchQuery}-${categoryContext}`} location={location} initialQuery={searchQuery} categoryContext={categoryContext} embedded onNavigate={() => setPanel(null)} onClose={() => setPanel(null)} />}
      {panel === "menu" && <div className={styles.options}>{(variant === "signed-in" ? ["orders", "cart", "account"] as const : ["seller", "download"] as const).map(item => <button key={item} onClick={() => setPanel(item)}>{titles[item]}</button>)}</div>}
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
      {panel === "account" && <p>This is a preview account. Account services aren’t connected yet.</p>}
      {panel === "seller" && <p>Seller registration will be available once Briz’s seller portal is connected.</p>}
      {panel === "download" && <p>App Store and Google Play links haven’t been configured for this preview yet.</p>}
    </dialog>
  </header>;
}
