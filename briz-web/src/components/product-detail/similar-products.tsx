"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { SimilarProduct, formatPriceNPR } from "@/data/product-detail-data";
import { useFavourites } from "@/store/favourite-store";

interface SimilarProductsProps {
  products: SimilarProduct[];
  locationAvailable?: boolean;
}

export function SimilarProducts({
  products,
  locationAvailable = true,
}: SimilarProductsProps) {
  const { isFavourited, toggleFavourite } = useFavourites();

  if (!products || products.length === 0) {
    return null; // Hide the section if no similar products
  }

  return (
    <section aria-labelledby="similar-products-heading" className="flex flex-col gap-6">
      <h2
        id="similar-products-heading"
        className="text-xl font-bold tracking-tight text-[#202020]"
      >
        Similar products
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        {products.map((item) => {
          const favourited = isFavourited(item.id);

          return (
            <article
              key={item.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#ebebeb] bg-white p-3 sm:p-4 shadow-xs transition hover:shadow-md hover:border-slate-300"
            >
              {/* Product Image Frame */}
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-50 mb-3 flex items-center justify-center">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-contain p-3 transition-transform duration-200 group-hover:scale-105"
                />

                {/* Favourite Action (stops navigation propagation) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavourite(item.id);
                  }}
                  aria-label={favourited ? `Unsave ${item.name}` : `Save ${item.name}`}
                  aria-pressed={favourited}
                  className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs shadow-xs border border-[#ebebeb] transition active:scale-95 hover:bg-white"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      favourited ? "fill-rose-500 text-rose-500" : "text-[#646464]"
                    }`}
                  />
                </button>
              </div>

              {/* Product Content Details */}
              <div className="flex flex-col flex-1 justify-between gap-2">
                <div className="flex flex-col gap-1">
                  {/* Store Name */}
                  <span className="text-xs font-semibold text-slate-400 truncate">
                    {item.storeName}
                  </span>

                  {/* Product Title (max 2 lines) */}
                  <h3 className="text-sm font-bold text-[#202020] line-clamp-2 leading-snug group-hover:text-[#3e63dd] transition-colors">
                    <Link href={`/products/${item.slug}`} className="focus-visible:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      {item.name}
                    </Link>
                  </h3>
                </div>

                {/* Pricing and Distance Footer */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-base font-extrabold text-[#202020]">
                      {formatPriceNPR(item.currentPrice)}
                    </span>
                    {item.originalPrice && (
                      <del className="text-xs text-slate-400 line-through">
                        {formatPriceNPR(item.originalPrice)}
                      </del>
                    )}
                  </div>

                  {locationAvailable && item.distance && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="h-3 w-3 text-[#3e63dd]" />
                      <span className="truncate">{item.distance}</span>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

