"use client";

import { useState } from "react";
import { ShoppingCart, MessageSquare, Check, Loader2 } from "lucide-react";
import { DetailedProduct, formatPriceNPR } from "@/data/product-detail-data";
import { useCart } from "@/store/cart-store";
import { FEATURE_CONFIG } from "@/config/marketplace-features";

interface MobileProductActionBarProps {
  product: DetailedProduct;
  onOpenChat: () => void;
  onRequireAppDialog?: (featureKey: "cart" | "chat") => void;
}

export function MobileProductActionBar({
  product,
  onOpenChat,
  onRequireAppDialog,
}: MobileProductActionBarProps) {
  const { addToCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddedConfirmation, setShowAddedConfirmation] = useState(false);

  function handleAddToCart() {
    if (!product.inStock || isProcessing) return;

    if (FEATURE_CONFIG.cart === "app-only") {
      onRequireAppDialog?.("cart");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      addToCart(product, 1);
      setIsProcessing(false);
      setShowAddedConfirmation(true);

      setTimeout(() => {
        setShowAddedConfirmation(false);
      }, 2500);
    }, 280);
  }

  function handleMessageStore() {
    if (FEATURE_CONFIG.chat === "app-only") {
      onRequireAppDialog?.("chat");
      return;
    }
    onOpenChat();
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-[#ebebeb] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      aria-label="Mobile sticky action bar"
    >
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        {/* Compact Price indicator on left */}
        <div className="flex flex-col min-w-0 pr-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Price</span>
          <span className="text-base font-extrabold text-[#202020] truncate">
            {formatPriceNPR(product.currentPrice)}
          </span>
        </div>

        {/* Message Store Action */}
        <button
          type="button"
          onClick={handleMessageStore}
          aria-label={product.inStock ? "Message store" : "Ask about availability"}
          className="flex h-11 flex-1 min-w-[120px] items-center justify-center gap-1.5 rounded-xl border border-[#ebebeb] bg-slate-50 px-3 text-xs font-bold text-[#202020] transition active:scale-95"
        >
          <MessageSquare className="h-4 w-4 text-[#3e63dd] stroke-[2.2]" />
          <span className="truncate">{product.inStock ? "Message" : "Ask Stock"}</span>
        </button>

        {/* Primary Add to Cart */}
        {product.inStock ? (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isProcessing}
            aria-label={`Add ${product.name} to cart`}
            className={`flex h-11 flex-[1.4] min-w-[130px] items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold transition-all active:scale-95 ${
              showAddedConfirmation
                ? "bg-[#30a46c] text-white shadow"
                : "bg-[#3e63dd] text-white hover:bg-[#3354c7] shadow-sm"
            }`}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : showAddedConfirmation ? (
              <>
                <Check className="h-4 w-4 stroke-[2.5]" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 stroke-[2.2]" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="flex h-11 flex-[1.4] cursor-not-allowed items-center justify-center gap-1 rounded-xl bg-slate-100 px-3 text-xs font-semibold text-slate-400"
          >
            <span>Out of stock</span>
          </button>
        )}
      </div>
    </div>
  );
}

