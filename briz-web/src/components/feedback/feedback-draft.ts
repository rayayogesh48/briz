"use client";

import { useSyncExternalStore } from "react";
import { safeJsonParse } from "@/lib/safe-json";
import { EMPTY_FEEDBACK, type FeedbackValues } from "./feedback-data";

// The draft lives in sessionStorage so typed feedback survives a reload or a
// quick trip to another page. The attached image is not persisted.
const STORAGE_KEY = "briz-feedback-draft";
const CHANGE_EVENT = "briz-feedback-draft-change";

let cachedRaw: string | null = null;
let cachedDraft: FeedbackValues = EMPTY_FEEDBACK;

function getSnapshot(): FeedbackValues {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedDraft;
    cachedRaw = raw;
    cachedDraft = { ...EMPTY_FEEDBACK, ...safeJsonParse<Partial<FeedbackValues>>(raw, {}) };
    return cachedDraft;
  } catch {
    return cachedDraft;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

function writeDraft(next: FeedbackValues | null) {
  cachedRaw = next ? JSON.stringify(next) : null;
  cachedDraft = next ?? EMPTY_FEEDBACK;
  try {
    if (cachedRaw) sessionStorage.setItem(STORAGE_KEY, cachedRaw);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode, quota): keep the in-memory draft.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useFeedbackDraft() {
  const values = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_FEEDBACK);
  return {
    values,
    update: (patch: Partial<FeedbackValues>) => writeDraft({ ...getSnapshot(), ...patch }),
    clear: () => writeDraft(null),
  };
}
