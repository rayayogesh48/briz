"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Copy, Check, Share2 } from "lucide-react";
import { DetailedProduct, formatPriceNPR } from "@/data/product-detail-data";

interface ShareProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: DetailedProduct;
}

export function ShareProductDialog({
  isOpen,
  onClose,
  product,
}: ShareProductDialogProps) {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/products/${product.slug}`
      : `https://briz.com/products/${product.slug}`;

  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopied(true);
      setToastMessage("Link copied to clipboard! 📋");
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setToastMessage(null), 2500);
    } catch {
      inputRef.current?.select();
      document.execCommand("copy");
      setCopied(true);
      setToastMessage("Link copied to clipboard! 📋");
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setToastMessage(null), 2500);
    }
  }

  async function handleNativeShare() {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Briz:`,
        url: activeUrl,
      });
    } catch {
      // Dismissed or unsupported
    }
  }

  function handleFacebookShare() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(activeUrl)}`,
      "_blank",
      "width=600,height=500"
    );
  }

  function handleWhatsAppShare() {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${product.name} - ${formatPriceNPR(product.currentPrice)}\n${activeUrl}`
      )}`,
      "_blank"
    );
  }

  function handleEmailShare() {
    window.location.href = `mailto:?subject=${encodeURIComponent(
      product.name
    )}&body=${encodeURIComponent(
      `Check out ${product.name} on Briz:\n\n${product.description.slice(0, 140)}...\n\nPrice: ${formatPriceNPR(
        product.currentPrice
      )}\n\n${activeUrl}`
    )}`;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-product-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-[#ebebeb] bg-white p-6 shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#f1f1f1]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff4ff] text-[#3e63dd]">
              <Share2 className="h-4 w-4 stroke-[2.5]" />
            </div>
            <h2 id="share-product-title" className="text-lg font-bold text-[#202020]">
              Share this product
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#202020] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="py-3 text-sm text-[#646464]">
          Send this product to someone who might like it.
        </p>

        {/* Product Preview Card */}
        <div className="flex items-center gap-3 rounded-xl border border-[#ebebeb] bg-slate-50 p-3 mb-4">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-white border border-[#ebebeb]">
            <Image
              src={product.images[0] || "/products/bottle-main.svg"}
              alt=""
              fill
              sizes="56px"
              className="object-contain p-1"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#202020] line-clamp-1">
              {product.name}
            </span>
            <span className="text-xs font-extrabold text-[#3e63dd]">
              {formatPriceNPR(product.currentPrice)}
            </span>
            <span className="text-[11px] text-slate-400 truncate">
              {product.seller.name} · {product.distance}
            </span>
          </div>
        </div>

        {/* Copy Link Input Bar */}
        <div className="flex flex-col gap-1.5 mb-5">
          <span className="text-xs font-semibold text-slate-500">Product Link</span>
          <div className="flex items-center gap-2 rounded-xl border border-[#ebebeb] bg-white p-1.5 focus-within:border-[#3e63dd]">
            <input
              ref={inputRef}
              type="text"
              readOnly
              value={activeUrl}
              onClick={() => inputRef.current?.select()}
              className="flex-1 bg-transparent px-2.5 text-xs text-[#202020] focus:outline-none truncate"
              aria-label="Product URL"
            />
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? "Link copied" : "Copy product link"}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                copied
                  ? "bg-[#30a46c] text-white"
                  : "bg-[#3e63dd] text-white hover:bg-[#3354c7]"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 stroke-[2]" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Sharing Quick Actions */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex flex-col items-center gap-1 rounded-xl border border-[#ebebeb] p-2.5 hover:bg-slate-50 transition"
          >
            <span className="text-sm font-bold text-[#25d366]">WhatsApp</span>
            <span className="text-[10px] text-slate-400">Share in chat</span>
          </button>

          <button
            type="button"
            onClick={handleFacebookShare}
            className="flex flex-col items-center gap-1 rounded-xl border border-[#ebebeb] p-2.5 hover:bg-slate-50 transition"
          >
            <span className="text-sm font-bold text-[#1877f2]">Facebook</span>
            <span className="text-[10px] text-slate-400">Post or feed</span>
          </button>

          <button
            type="button"
            onClick={handleEmailShare}
            className="flex flex-col items-center gap-1 rounded-xl border border-[#ebebeb] p-2.5 hover:bg-slate-50 transition"
          >
            <span className="text-sm font-bold text-[#ea4335]">Email</span>
            <span className="text-[10px] text-slate-400">Send mail</span>
          </button>
        </div>

        {/* Native Web Share API Button if available */}
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#ebebeb] bg-slate-50 text-xs font-semibold text-[#202020] transition hover:bg-slate-100"
          >
            <Share2 className="h-4 w-4 text-[#3e63dd]" />
            <span>More sharing options...</span>
          </button>
        )}

        {/* Toast announcement */}
        <div className="sr-only" aria-live="polite">
          {toastMessage}
        </div>
      </div>
    </div>
  );
}

