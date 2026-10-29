"use client";

import { useSyncExternalStore } from "react";
import { buildMockNotifications, incomingNotification, type BrizNotification } from "@/components/notifications/notification-data";

// Phase 2 navbar prototype state. In-memory only: there is no real account, no
// persistence and no network. It lives outside the header component so the mock
// state survives moving between pages; a refresh resets it to guest.

export type NavbarUserState = "guest" | "authenticated";
/** "language" is the account menu opened with its language list expanded; "more" is the guest More menu. */
export type NavbarPopover = "notifications" | "profile" | "language" | "more" | null;
export type NavbarLanguage = "en" | "ne";

/** Kept as an alias of the shared notification model. */
export type NavbarNotification = BrizNotification;

export const LANGUAGES: Record<NavbarLanguage, { name: string; short: string }> = {
  en: { name: "English", short: "EN" },
  ne: { name: "नेपाली", short: "ने" },
};

export const MOCK_USER = { name: "John Doe", phone: "+977 9812345678", initials: "JD", email: "demo@gmail.com" };

const MOCK_NOTIFICATIONS: NavbarNotification[] = buildMockNotifications(Date.now());

type NavbarPreviewState = {
  userState: NavbarUserState;
  activePopover: NavbarPopover;
  language: NavbarLanguage;
  notifications: NavbarNotification[];
  /** True when the mocked sign-in came through Google, so the menu shows an email. */
  signedInWithGoogle: boolean;
  authOpen: boolean;
};

const INITIAL: NavbarPreviewState = {
  userState: "guest",
  activePopover: null,
  language: "en",
  notifications: MOCK_NOTIFICATIONS,
  signedInWithGoogle: false,
  authOpen: false,
};

let state = INITIAL;
const listeners = new Set<() => void>();

function set(patch: Partial<NavbarPreviewState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const markRead = (items: NavbarNotification[]) => items.map((item) => ({ ...item, unread: false }));

export const navbarPreview = {
  openAuth: () => set({ authOpen: true, activePopover: null }),
  setAuthOpen: (authOpen: boolean) => set({ authOpen }),
  /** Mock sign-in: flips the navbar to its authenticated state. */
  logIn: (provider: "google" | "apple" | null = null) =>
    set({ userState: "authenticated", signedInWithGoogle: provider === "google", authOpen: false, activePopover: null }),
  /** Mock log out: back to guest. Nothing is cleared anywhere because nothing was stored. */
  logOut: () => set({ userState: "guest", activePopover: null, signedInWithGoogle: false }),
  /** Opens a popover, closing whichever one was open. Passing the open one closes it. */
  togglePopover: (popover: Exclude<NavbarPopover, null>) =>
    set({ activePopover: state.activePopover === popover ? null : popover }),
  closePopover: () => {
    if (state.activePopover) set({ activePopover: null });
  },
  setLanguage: (language: NavbarLanguage) => set({ language }),
  markAllRead: () => set({ notifications: markRead(state.notifications) }),
  setNotificationRead: (id: string, read: boolean) =>
    set({ notifications: state.notifications.map((item) => (item.id === id ? { ...item, unread: !read } : item)) }),
  /** A notification arriving now (preview only); newest first. */
  receiveNotification: () => set({ notifications: [incomingNotification(Date.now()), ...state.notifications] }),
  isGuest: () => state.userState === "guest",
  /** Jump straight to a named state — used only by the "Preview navbar" dev control. */
  preview: (patch: Partial<NavbarPreviewState>) => set({ ...INITIAL, language: state.language, ...patch }),
  mockNotifications: (unread: boolean) => (unread ? MOCK_NOTIFICATIONS : markRead(MOCK_NOTIFICATIONS)),
  /** A fresh mock feed: `count` notifications, the newest `unread` of them unread. */
  mockNotificationFeed: (count: number, unread: number) => buildMockNotifications(Date.now(), count, unread),
};

export function useNavbarPreview() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => INITIAL,
  );
}
