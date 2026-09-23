"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "briz-favourite-products";
const EMPTY_FAVOURITES: string[] = [];

let cachedRawFavourites: string | null = null;
let cachedFavouritesList: string[] = EMPTY_FAVOURITES;

function getFavouritesSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY_FAVOURITES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRawFavourites) {
      return cachedFavouritesList;
    }
    cachedRawFavourites = raw;
    cachedFavouritesList = raw ? JSON.parse(raw) : EMPTY_FAVOURITES;
    return cachedFavouritesList;
  } catch {
    return EMPTY_FAVOURITES;
  }
}

function getServerSnapshot(): string[] {
  return EMPTY_FAVOURITES;
}

function subscribeToFavourites(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("briz-fav-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("briz-fav-change", callback);
  };
}

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("briz-fav-change"));
  }
}

export function useFavourites() {
  const favouriteIds = useSyncExternalStore(subscribeToFavourites, getFavouritesSnapshot, getServerSnapshot);

  function toggleFavourite(productId: string): boolean {
    if (typeof window === "undefined") return false;
    const current = getFavouritesSnapshot();
    const exists = current.includes(productId);
    const updated = exists ? current.filter((id) => id !== productId) : [...current, productId];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      cachedRawFavourites = JSON.stringify(updated);
      cachedFavouritesList = updated;
      notifyChange();
    } catch {
      // storage error
    }

    return !exists;
  }

  function isFavourited(productId: string): boolean {
    return favouriteIds.includes(productId);
  }

  return {
    favouriteIds,
    toggleFavourite,
    isFavourited,
  };
}

