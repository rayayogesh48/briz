"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star, ShoppingCart, Check, MapPin, Truck, Sparkles } from "lucide-react";
import type { FeaturedProduct } from "@/data/featured-data";
import { useFavourites } from "@/store/favourite-store";
import { useCart } from "@/store/cart-store";
import styles from "./featured-product-card.module.css";

interface FeaturedProductCardProps {
  product: FeaturedProduct;
  viewMode?: "grid" | "list";
  /**
   * When provided, the heart is controlled by the parent instead of the
   * favourites store: it shows as saved and clicking it calls this.
   */
  onRemoveSaved?: () => void;
}

export function FeaturedProductCard({
  product,
  viewMode = "grid",
  onRemoveSaved,
}: FeaturedProductCardProps) {
  const { isFavourited, toggleFavourite } = useFavourites();
  const { addToCart, isItemInCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isFav = onRemoveSaved ? true : isFavourited(product.id);
  const isInCart = isItemInCart(product.id);

  const formattedPrice = `Rs. ${product.price.toLocaleString("en-IN")}`;
  const formattedOriginalPrice = product.originalPrice
    ? `Rs. ${product.originalPrice.toLocaleString("en-IN")}`
    : null;

  const handleFavouriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemoveSaved) {
      onRemoveSaved();
      return;
    }
    toggleFavourite(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
      {
        id: product.id,
        name: product.name,
        currentPrice: product.price,
        images: [product.image],
        seller: { name: product.storeName },
      },
      1
    );
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1600);
  };

  const imageSrc = imageError ? "/products/bottle-main.svg" : product.image;

  return (
    <article
      className={`${styles.card} ${viewMode === "list" ? styles.listCard : ""}`}
      data-product-id={product.id}
    >
      {/* Product Image & Badges */}
      <div className={styles.imageWrapper}>
        <Link
          href={`/products/${product.slug}`}
          className={styles.productLink}
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image
            src={imageSrc}
            alt={product.name}
            width={240}
            height={240}
            className={styles.productImage}
            onError={() => setImageError(true)}
          />
        </Link>

        {/* Badges */}
        <div className={styles.badgeContainer}>
          {product.featured && (
            <span className={styles.featuredBadge}>
              <Sparkles size={11} aria-hidden="true" />
              Featured
            </span>
          )}
          {product.discount && (
            <span className={styles.discountBadge}>
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Animated Favourite Icon (min 44px touch target) */}
        <button
          type="button"
          onClick={handleFavouriteClick}
          className={`${styles.favouriteButton} ${isFav ? styles.favouriteActive : ""}`}
          aria-label={
            onRemoveSaved
              ? `Remove product from saved: ${product.name}`
              : isFav
              ? `Remove ${product.name} from favourites`
              : `Save ${product.name} to favourites`
          }
          title={onRemoveSaved ? "Remove from saved" : isFav ? "Saved to favourites" : "Add to favourites"}
        >
          <Heart size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Card Content */}
      <div className={styles.cardBody}>
        {/* Rating */}
        {product.rating !== undefined && (
          <div className={styles.ratingRow}>
            <div className={styles.stars} aria-hidden="true">
              <Star size={12} fill="#f59e0b" color="#f59e0b" />
            </div>
            <span className={styles.ratingValue}>{product.rating.toFixed(1)}</span>
            {product.reviewCount && (
              <span className={styles.reviewCount}>({product.reviewCount})</span>
            )}
          </div>
        )}

        {/* Product Title */}
        <div className={styles.titleRow}>
          <Link href={`/products/${product.slug}`} className={styles.productLink}>
            <h3 className={styles.productTitle} title={product.name}>
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price block */}
        <div className={styles.priceSection}>
          <div className={styles.currentPrice}>{formattedPrice}</div>
          {formattedOriginalPrice && (
            <div className={styles.originalPriceRow}>
              <span className={styles.originalPrice}>{formattedOriginalPrice}</span>
              {product.discount && (
                <span className={styles.discountPercent}>{product.discount}% off</span>
              )}
            </div>
          )}
        </div>

        {/* Store & Distance */}
        <div className={styles.storeMeta}>
          <span className={styles.storeName} title={product.storeName}>
            {product.storeName}
          </span>
          <span className={styles.distance}>
            <MapPin size={11} aria-hidden="true" />
            {product.distance}
          </span>
        </div>

        {/* Delivery / Pickup label */}
        <div className={styles.deliveryBadge}>
          <Truck size={12} aria-hidden="true" />
          <span>{product.deliveryLabel}</span>
        </div>

        {/* Add to Cart Button */}
        <div className={styles.cardActions}>
          <button
            type="button"
            onClick={handleAddToCart}
            className={`${styles.addToCartBtn} ${justAdded ? styles.addedState : ""}`}
            aria-label={`Add ${product.name} to Cart`}
          >
            {justAdded ? (
              <>
                <Check size={16} aria-hidden="true" />
                <span>Added to Cart</span>
              </>
            ) : isInCart ? (
              <>
                <ShoppingCart size={15} aria-hidden="true" />
                <span>Add Another</span>
              </>
            ) : (
              <>
                <ShoppingCart size={15} aria-hidden="true" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
