"use client";

import { useState } from "react";
import { ShoppingCart, MessageSquare, Check, Loader2 } from "lucide-react";
import { DetailedProduct } from "@/data/product-detail-data";
import { useCart } from "@/store/cart-store";
import { FEATURE_CONFIG } from "@/config/marketplace-features";

interface ProductActionsProps {
  product: DetailedProduct;
  onOpenChat: () => void;
  onRequireAppDialog?: (featureKey: "cart" | "chat") => void;
}

export function ProductActions({
  product,
  onOpenChat,
  onRequireAppDialog,
}: ProductActionsProps) {
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

    // Simulate quick responsive interaction
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
    <div className="hidden md:flex flex-col gap-3 pt-2" aria-label="Purchase and Inquiry Actions">
      <div className="grid grid-cols-2 gap-3">
        {/* Primary Action: Add to Cart */}
        {product.inStock ? (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isProcessing}
            aria-label={`Add ${product.name} to cart`}
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all active:scale-[0.98] ${
              showAddedConfirmation
                ? "bg-[#30a46c] text-white shadow-md"
                : "bg-[#3e63dd] text-white hover:bg-[#3354c7] shadow-sm hover:shadow"
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Adding...</span>
              </>
            ) : showAddedConfirmation ? (
              <>
                <Check className="h-4 w-4 stroke-[2.5]" />
                <span>Added to cart</span>
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
            aria-label="Product is currently out of stock"
            className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 text-sm font-semibold text-slate-400"
          >
            <ShoppingCart className="h-4 w-4 stroke-[2]" />
            <span>Out of stock</span>
          </button>
        )}

        {/* Secondary Action: Message Store */}
        <button
          type="button"
          onClick={handleMessageStore}
          aria-label={product.inStock ? "Message store about this product" : "Ask store about availability"}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#ebebeb] bg-white px-5 text-sm font-semibold text-[#202020] transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
        >
          <MessageSquare className="h-4 w-4 stroke-[2.2] text-[#3e63dd]" />
          <span>{product.inStock ? "Message Store" : "Ask about availability"}</span>
        </button>
      </div>

      {/* Cart confirmation polite screen-reader announcement */}
      <div className="sr-only" aria-live="polite">
        {showAddedConfirmation ? `Added ${product.name} to your shopping cart` : ""}
      </div>
    </div>
  );
}

