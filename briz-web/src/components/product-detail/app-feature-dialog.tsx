"use client";

import { useEffect } from "react";
import { X, Smartphone, ArrowUpRight } from "lucide-react";
import { FEATURE_CONFIG, APP_FEATURE_DESCRIPTIONS } from "@/config/marketplace-features";

interface AppFeatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  featureKey: "cart" | "favourites" | "chat";
}

export function AppFeatureDialog({
  isOpen,
  onClose,
  featureKey,
}: AppFeatureDialogProps) {
  const info = APP_FEATURE_DESCRIPTIONS[featureKey] || APP_FEATURE_DESCRIPTIONS.chat;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-feature-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm rounded-2xl border border-[#ebebeb] bg-white p-6 shadow-2xl animate-in zoom-in-95">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#202020] transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-3 pt-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#3e63dd]">
            <Smartphone className="h-7 w-7 stroke-[2]" />
          </div>

          <h2
            id="app-feature-dialog-title"
            className="text-lg font-bold text-[#202020]"
          >
            {info.title}
          </h2>

          <p className="text-xs sm:text-sm text-[#646464] leading-relaxed">
            {info.description}
          </p>

          <div className="flex flex-col w-full gap-2.5 pt-4">
            <a
              href={FEATURE_CONFIG.appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-[#3e63dd] text-xs font-bold text-white shadow-sm transition hover:bg-[#3354c7]"
            >
              <span>Get the Briz App</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-full items-center justify-center rounded-xl text-xs font-semibold text-[#646464] hover:bg-slate-100 transition"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

