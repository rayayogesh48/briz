"use client";

import { useSyncExternalStore } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  storeName: string;
  quantity: number;
}

const STORAGE_KEY = "briz-cart-items";
const EMPTY_CART: CartItem[] = [];

let cachedRawCart: string | null = null;
let cachedCartList: CartItem[] = EMPTY_CART;

function getCartSnapshot(): CartItem[] {
  if (typeof window === "undefined") return EMPTY_CART;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRawCart) {
      return cachedCartList;
    }
    cachedRawCart = raw;
    cachedCartList = raw ? JSON.parse(raw) : EMPTY_CART;
    return cachedCartList;
  } catch {
    return EMPTY_CART;
  }
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

function subscribeToCart(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("briz-cart-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("briz-cart-change", callback);
  };
}

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("briz-cart-change"));
  }
}

export function useCart() {
  const items = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerSnapshot);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(product: { id: string; name: string; currentPrice: number; images: string[]; seller: { name: string } }, quantity = 1) {
    if (typeof window === "undefined") return;
    const current = getCartSnapshot();
    const existingIndex = current.findIndex((i) => i.id === product.id);

    let updated: CartItem[];
    if (existingIndex >= 0) {
      updated = current.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      updated = [
        ...current,
        {
          id: product.id,
          name: product.name,
          price: product.currentPrice,
          image: product.images[0] || "/products/bottle-main.svg",
          storeName: product.seller.name,
          quantity,
        },
      ];
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      cachedRawCart = JSON.stringify(updated);
      cachedCartList = updated;
      notifyChange();
    } catch {
      // storage quota or error fallback
    }
  }

  function isItemInCart(productId: string): boolean {
    return items.some((item) => item.id === productId);
  }

  return {
    items,
    totalCount,
    addToCart,
    isItemInCart,
  };
}

