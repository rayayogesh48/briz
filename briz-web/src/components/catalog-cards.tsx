"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product, Store } from "./search-data";
import { discountOf, money } from "./search-results-model";
import styles from "./catalog-cards.module.css";

export function Asset({ name, size = 16, alt = "" }: { name: string; size?: number; alt?: string }) {
  return <Image src={`/figma/results/${name}.svg`} width={size} height={size} alt={alt} unoptimized />;
}
export function DistanceBadge({ distance }: { distance: string }) {
  return <span className={styles.distance}><Asset name="product-imgHeroiconsMiniMapPin" size={14} />{distance}</span>;
}
export function ProductCard({ product, onSelect }: { product: Product; onSelect: (product: Product) => void }) {
  const [saved, setSaved] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const discount = Math.round(discountOf(product) * 100);
  return <article className={styles.product} data-product-id={product.id}>
    <div className={styles.picture}>
      <button className={styles.imageButton} aria-label={`View ${product.name}`} onClick={() => onSelect(product)}><Image src={product.image} alt={product.name} fill sizes="(max-width: 600px) 45vw, 240px" />{!product.inStock && <span className={styles.outOfStock}>OUT OF STOCK</span>}</button>
      {discount > 0 && <span className={styles.discount}>{discount}% OFF</span>}
      <button className={styles.favorite} aria-label={`${saved ? "Unsave" : "Save"} ${product.name}`} aria-pressed={saved} onClick={() => setSaved(!saved)}><Asset name="product-imgSvg" size={27} /></button>
      {product.inStock && !product.askForPrice && (quantity ? <div className={styles.quantity}>
        <button aria-label={`Remove one ${product.name}`} onClick={() => setQuantity(quantity - 1)}><Asset name="product-imgHeroiconsSolidMinus" size={20} /></button><output aria-label={`Quantity of ${product.name}`} aria-live="polite">{quantity}</output><button aria-label={`Add one ${product.name}`} onClick={() => setQuantity(quantity + 1)}><Asset name="product-imgHeroiconsSolidPlus" size={20} /></button>
      </div> : <button className={styles.cart} aria-label={`Add ${product.name} to selection`} onClick={() => setQuantity(1)}><Asset name="product-imgHeroiconsOutlineShoppingCart" size={24} /></button>)}
    </div>
    <div className={styles.productInfo}>
      <DistanceBadge distance={product.distance} />
      <button className={styles.productName} onClick={() => onSelect(product)} title={product.name}>{product.name}</button>
      <div className={styles.price} data-muted={!product.inStock}>{product.askForPrice ? <><strong className={styles.unknown}>-</strong><button onClick={() => onSelect(product)}>Ask for Price</button></> : <><strong>{money(product.price)}</strong>{product.originalPrice && <del>{money(product.originalPrice)}</del>}</>}</div>
    </div>
  </article>;
}
export function StoreCard({ store, onSelect }: { store: Store; onSelect: (store: Store) => void }) {
  return <button className={styles.store} onClick={() => onSelect(store)} aria-label={`View products from ${store.name}`} data-store-id={store.id}>
    <div className={styles.cover}><Image src={store.cover || "/figma/results/store-imgImage2.png"} alt="" fill sizes="(max-width: 600px) 85vw, 320px" /><DistanceBadge distance={store.distance} /></div>
    <div className={styles.storeInfo}>
      <Image className={styles.storeLogo} src={store.logo || "/figma/results/store-imgAvatarImage2.png"} alt="" width={48} height={48} />
      <div className={styles.storeName}><span title={store.name}>{store.name}</span>{store.verified && <Asset name="store-imgVerifiedIcon" alt="Verified store" />}</div>
      <span className={styles.category}>{store.category}</span>
      <span className={styles.rating}><Asset name="store-imgStarIcon" />{store.rating?.toFixed(1) || "New"}{store.reviewCount ? ` (${store.reviewCount} Reviews)` : " store"}</span>
    </div>
  </button>;
}
