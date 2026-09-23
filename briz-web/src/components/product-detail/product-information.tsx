"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Share2, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { DetailedProduct, formatPriceNPR, calculateDiscount } from "@/data/product-detail-data";
import { useFavourites } from "@/store/favourite-store";

interface ProductInformationProps {
  product: DetailedProduct;
  onOpenShare: () => void;
  locationAvailable?: boolean;
}

export function ProductInformation({
  product,
  onOpenShare,
  locationAvailable = true,
}: ProductInformationProps) {
  const { isFavourited, toggleFavourite } = useFavourites();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const favourited = isFavourited(product.id);
  const discount = calculateDiscount(product.currentPrice, product.originalPrice);

  function handleFavouriteToggle() {
    const isNowSaved = toggleFavourite(product.id);
    const msg = isNowSaved ? "Added to favourites ❤️" : "Removed from favourites";
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Category link & Secondary Actions Header Row */}
      <div className="flex items-center justify-between gap-3">
        <nav aria-label="Category context" className="flex items-center gap-1.5 text-xs font-semibold text-[#3e63dd]">
          <Link
            href={`/category?category=${encodeURIComponent(product.category)}`}
            className="hover:underline"
          >
            {product.category}
          </Link>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">{product.subcategory}</span>
        </nav>

        {/* Desktop Favourite & Share Icons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFavouriteToggle}
            aria-label={favourited ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`}
            aria-pressed={favourited}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition active:scale-95 ${
              favourited
                ? "border-rose-200 bg-rose-50 text-rose-600 shadow-sm"
                : "border-[#ebebeb] bg-white text-[#646464] hover:bg-slate-50 hover:text-[#202020]"
            }`}
          >
            <Heart className={`h-5 w-5 ${favourited ? "fill-rose-500" : ""}`} />
          </button>

          <button
            type="button"
            onClick={onOpenShare}
            aria-label="Share product link"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ebebeb] bg-white text-[#646464] transition hover:bg-slate-50 hover:text-[#202020] active:scale-95"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Prominent Product Title */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202020] leading-snug">
        {product.name}
      </h1>

      {/* Pricing Hierarchy */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-3xl sm:text-4xl font-extrabold text-[#202020] tracking-tight">
          {formatPriceNPR(product.currentPrice)}
        </span>

        {discount > 0 && product.originalPrice && (
          <>
            <del className="text-lg font-medium text-slate-400 line-through">
              {formatPriceNPR(product.originalPrice)}
            </del>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#eff4ff] text-[#3e63dd] border border-[#d6e4ff]">
              {discount}% off
            </span>
          </>
        )}
      </div>

      {/* Availability & Distance Status Row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2 border-y border-[#ebebeb] text-sm text-[#646464]">
        {/* Availability Badge */}
        <div className="flex items-center gap-1.5 font-medium">
          {product.inStock ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-[#30a46c] fill-[#30a46c]/10" />
              <span className="text-[#30a46c] font-semibold">In stock</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-rose-500" />
              <span className="text-rose-600 font-semibold">Out of stock</span>
            </>
          )}
        </div>

        <span className="text-slate-300">|</span>

        {/* Customer-to-Store Distance */}
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-[#3e63dd]" />
          {locationAvailable ? (
            <span>{product.distance}</span>
          ) : (
            <span className="text-slate-500 italic">Set location to see distance</span>
          )}
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#202020] px-4 py-2.5 text-sm font-semibold text-white shadow-lg animate-in fade-in slide-in-from-bottom-2"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}

