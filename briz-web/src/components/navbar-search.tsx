"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { DESIGN_PRODUCTS, DESIGN_STORES, INITIAL_RECENT, searchCatalog, type Product, type Store } from "./search-data";
import { ProductRow, StoreRow, SearchIcon, SearchSection, RecentSearches, Suggestions, RequestBanner, ResultsFooter, SkeletonResults, OperatingHours } from "./search-parts";
import styles from "./navbar-search.module.css";

function RequestProduct({ query, location, onClose }: { query: string; location: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [name, setName] = useState(query);
  const [details, setDetails] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { ref.current?.showModal(); }, []);
  return createPortal(<dialog ref={ref} className={styles.request} aria-labelledby={id} onKeyDown={event => event.stopPropagation()} onCancel={event => event.stopPropagation()} onClose={event => { event.stopPropagation(); onClose(); }}>
    <div className={styles.requestHeading}><h2 id={id}>{saved ? "Request saved" : "Request a Product"}</h2><button aria-label="Close request" onClick={() => ref.current?.close()}>×</button></div>
    {saved ? <><p>Your request is saved on this device. Seller notifications aren’t connected in this demo.</p><button className={styles.primary} onClick={() => ref.current?.close()}>Done</button></> : <form onSubmit={event => {
      event.preventDefault();
      if (!name.trim()) return;
      try {
        const previous = JSON.parse(localStorage.getItem("briz-product-requests") || "[]");
        localStorage.setItem("briz-product-requests", JSON.stringify([...(Array.isArray(previous) ? previous : []), { name: name.trim(), details, location, createdAt: new Date().toISOString() }]));
        setSaved(true);
      } catch { setError("This browser couldn’t save your request. Please try again."); }
    }}>
      <p>Save a request for merchants near {location}.</p>
      <label>Product name<input required value={name} onChange={event => setName(event.target.value)} /></label>
      <label>Location<input readOnly value={location} /></label>
      <label>Additional details <span>(optional)</span><textarea rows={3} placeholder="Budget, quantity, preferred brand…" value={details} onChange={event => setDetails(event.target.value)} /></label>
      {error && <p role="alert">{error}</p>}
      <div className={styles.requestActions}><button type="button" className={styles.secondary} onClick={() => ref.current?.close()}>Cancel</button><button className={styles.primary} disabled={!name.trim()}>Save request</button></div>
    </form>}
  </dialog>, document.body);
}

export type SearchState = "idle" | "focused" | "loading" | "results" | "filled" | "empty-history" | "no-results";

export default function NavbarSearch({ location, embedded = false, previewState }: {
  location: string;
  embedded?: boolean;
  previewState?: SearchState;
}) {
  const [query, setQuery] = useState(previewState === "filled" ? "Wireless headphone" : previewState === "loading" || previewState === "results" ? "Shoe" : previewState === "no-results" ? "{search-query}" : "");
  const [open, setOpen] = useState(embedded);
  const [recent, setRecent] = useState(previewState === "empty-history" ? [] : INITIAL_RECENT);
  const [loading, setLoading] = useState(false);
  const [all, setAll] = useState(false);
  const [request, setRequest] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [selected, setSelected] = useState<Product | Store | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (embedded) input.current?.focus();
    function outside(event: PointerEvent) {
      if (!embedded && !root.current?.contains(event.target as Node)) {
        setOpen(false);
        if (root.current?.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
      }
    }
    document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("pointerdown", outside); if (timer.current) clearTimeout(timer.current); };
  }, [embedded]);

  function finishSearch() {
    if (timer.current) clearTimeout(timer.current);
    setLoading(false); setAll(true); setInteracted(true); setOpen(true);
    remember(query);
  }
  function change(value: string) {
    if (timer.current) clearTimeout(timer.current);
    setInteracted(true); setQuery(value); setSelected(null); setAll(false); setOpen(true);
    // Simulated catalog latency; replace with a cancellable catalog API request.
    setLoading(Boolean(value.trim()));
    if (value.trim()) timer.current = setTimeout(() => { setLoading(false); timer.current = null; }, 650);
  }
  function remember(value: string) {
    if (value.trim()) setRecent(previous => [{ id: value.trim().toLowerCase(), query: value.trim() }, ...previous.filter(item => item.query.toLowerCase() !== value.trim().toLowerCase())].slice(0, 6));
  }
  function choose(value: string) { change(value); remember(value); input.current?.focus(); }
  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && !embedded) {
      event.preventDefault(); setInteracted(true); setOpen(false);
      if (root.current?.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault(); setInteracted(true); setOpen(true);
    const buttons = Array.from(content.current?.querySelectorAll<HTMLButtonElement>("button[data-search-item]") || []);
    if (!buttons.length) return;
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === "ArrowDown" ? (index + 1) % buttons.length : (index <= 0 ? buttons.length - 1 : index - 1);
    buttons[next].focus();
  }

  const normalized = query.trim();
  const designPreview = Boolean(previewState && !interacted);
  const { products, stores } = designPreview && previewState === "results" ? { products: DESIGN_PRODUCTS, stores: DESIGN_STORES } : searchCatalog(query, all);
  const hasResults = products.length + stores.length > 0;
  const state: SearchState = designPreview ? previewState! : !open ? normalized ? "filled" : "idle" : loading ? "loading" : !normalized ? "focused" : hasResults ? "results" : "no-results";
  const expanded = state !== "idle" && state !== "filled";
  function focusSearch() { setInteracted(true); setOpen(true); }

  return <div ref={root} className={`${styles.root} ${embedded ? styles.embedded : ""}`} data-open={expanded} data-filled={Boolean(normalized)} data-preview={Boolean(previewState)} data-state={state} onKeyDown={keyDown} onBlur={event => {
    if (!embedded && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
  }}>
    <form className={styles.field} role="search" onSubmit={event => { event.preventDefault(); finishSearch(); }}>
      <Image src="/figma/search.svg" width={20} height={20} alt="" unoptimized />
      <input ref={input} type="text" role="combobox" aria-label="Search products, stores, or categories" aria-expanded={expanded} aria-controls={expanded ? id : undefined} aria-haspopup="dialog" autoComplete="off" placeholder={'Search for "wireless earphones"'} value={query} onFocus={focusSearch} onClick={focusSearch} onChange={event => change(event.target.value)} />
      {query && <button type="button" className={styles.clear} aria-label="Clear search" onClick={() => { change(""); input.current?.focus(); }}><SearchIcon name="close" /></button>}
    </form>
    {expanded && <div ref={content} id={id} className={styles.dropdown} role="dialog" aria-label="Search suggestions" aria-busy={state === "loading"}>
      {state === "loading" ? <><SkeletonResults /><ResultsFooter query={query} onSelect={finishSearch} /></> : selected ? <div className={styles.detail}>
        <button className={styles.textButton} onClick={() => setSelected(null)}>Back to results</button><h3>{selected.name}</h3>
        {"price" in selected ? <><p>Rs. {selected.price.toLocaleString("en-IN")}</p><p>{selected.storeName} · {selected.location} · {selected.distance}</p><p>{selected.inStock ? "In stock" : "Out of stock"}</p></> : <><p>{selected.category}</p><p>{selected.location} · {selected.distance}</p><OperatingHours status={selected.status} /></>}
        <small>Demo catalog · checkout and store pages aren’t connected.</small>
      </div> : state === "focused" || state === "empty-history" ? <>
        <RecentSearches recent={recent} onChoose={choose} onClear={() => setRecent([])} onRemove={itemId => setRecent(previous => previous.filter(item => item.id !== itemId))} />
        <div className={styles.divider} /><Suggestions onChoose={choose} />
      </> : state === "results" ? <>
        <span className={styles.status} role="status">{products.length} products · {stores.length} stores</span>
        {products.length > 0 && <SearchSection title="Products">{products.map(product => <ProductRow key={product.id} product={product} onSelect={() => { setInteracted(true); remember(query); setSelected(product); setOpen(true); }} />)}</SearchSection>}
        {products.length > 0 && stores.length > 0 && <div className={styles.divider} />}
        {stores.length > 0 && <SearchSection title="Stores">{stores.map(store => <StoreRow key={store.id} store={store} onSelect={() => { setInteracted(true); remember(query); setSelected(store); setOpen(true); }} />)}</SearchSection>}
        <ResultsFooter query={query} all={all} onSelect={finishSearch} />
      </> : <RequestBanner query={query} onRequest={() => { remember(query); setRequest(true); }} />}
    </div>}
    {request && <RequestProduct query={query} location={location} onClose={() => { setRequest(false); input.current?.focus(); }} />}
  </div>;
}
