import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Star, MapPin, Truck, Store as StoreIcon, ArrowRight } from "lucide-react";
import { ProductSeller } from "@/data/product-detail-data";

interface SellerDetailsProps {
  seller: ProductSeller;
}

export function SellerDetails({ seller }: SellerDetailsProps) {
  const deliveryText =
    seller.deliveryType === "both"
      ? "Online delivery · Store pickup"
      : seller.deliveryType === "online"
      ? "Online delivery"
      : "Store pickup";

  return (
    <section
      aria-label="Seller information"
      className="flex flex-col gap-3 rounded-2xl border border-[#ebebeb] bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Sold by
        </span>
        <Link
          href={`/store/${seller.storeSlug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#3e63dd] transition hover:underline"
        >
          <span>View Store Profile</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Store Identity Row */}
      <div className="flex items-center gap-3">
        {/* Store Logo or Initial Avatar */}
        <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#ebebeb] bg-slate-50">
          {seller.logo ? (
            <Image
              src={seller.logo}
              alt={`${seller.name} logo`}
              width={48}
              height={48}
              className="object-cover"
            />
          ) : (
            <span className="text-base font-bold text-slate-600">
              {seller.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Store Name, Verified Badge, and Reviews */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href={`/store/${seller.storeSlug}`}
              className="text-base font-bold text-[#202020] hover:text-[#3e63dd] transition truncate"
            >
              {seller.name}
            </Link>
            {seller.verified && (
              <span
                title="Verified store"
                aria-label="Verified store"
                className="inline-flex items-center text-[#3e63dd]"
              >
                <BadgeCheck className="h-4 w-4 fill-[#3e63dd] text-white" />
              </span>
            )}
          </div>

          {/* Rating and Review Count */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            {seller.rating && seller.reviewCount && seller.reviewCount > 0 ? (
              <>
                <div className="flex items-center gap-0.5 font-bold text-[#202020]">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{seller.rating.toFixed(1)}</span>
                </div>
                <span className="text-slate-300">·</span>
                <Link
                  href={`/store/${seller.storeSlug}#reviews`}
                  className="hover:underline text-slate-600"
                >
                  {seller.reviewCount} store reviews
                </Link>
              </>
            ) : (
              <span className="text-slate-400 italic">No reviews yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Store Location & Delivery Options Cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#f1f1f1] text-xs text-[#646464]">
        {/* Address */}
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
          <span className="truncate" title={seller.address}>{seller.address}</span>
        </div>

        {/* Delivery Options */}
        <div className="flex items-center gap-1.5">
          {seller.deliveryType === "pickup" ? (
            <StoreIcon className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
          ) : (
            <Truck className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
          )}
          <span className="text-slate-400">Delivery options:</span>
          <span className="font-medium text-[#202020]">{deliveryText}</span>
        </div>
      </div>
    </section>
  );
}
