"use client";

import { useSyncExternalStore } from "react";

// Phase 2 navbar prototype state. In-memory only: there is no real account, no
// persistence and no network. It lives outside the header component so the mock
// state survives moving between pages; a refresh resets it to guest.

export type NavbarUserState = "guest" | "authenticated";
export type NavbarPopover = "notifications" | "profile" | "language" | null;
export type NavbarLanguage = "en" | "ne";

export type NavbarNotification = {
  id: string;
  type: "offer" | "request" | "promotion";
  title: string;
  description: string;
  time: string;
  unread: boolean;
};

export const LANGUAGES: Record<NavbarLanguage, { name: string; short: string }> = {
  en: { name: "English", short: "EN" },
  ne: { name: "नेपाली", short: "ने" },
};

export const MOCK_USER = { name: "John Doe", phone: "+977 9812345678", initials: "JD", email: "demo@gmail.com" };

const MOCK_NOTIFICATIONS: NavbarNotification[] = [
  {
    id: "offer",
    type: "offer",
    title: "New offer received",
    description: "Everest Electronics sent an offer for your wireless headphones request.",
    time: "2 min ago",
    unread: true,
  },
  {
    id: "request",
    type: "request",
    title: "Request update",
    description: "Your iPhone 15 Pro case request received a new response.",
    time: "1 hr ago",
    unread: true,
  },
  {
    id: "promotion",
    type: "promotion",
    title: "New deals nearby",
    description: "Explore offers from stores near you.",
    time: "Yesterday",
    unread: false,
  },
];

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
  /** Jump straight to a named state — used only by the "Preview navbar" dev control. */
  preview: (patch: Partial<NavbarPreviewState>) => set({ ...INITIAL, language: state.language, ...patch }),
  mockNotifications: (unread: boolean) => (unread ? MOCK_NOTIFICATIONS : markRead(MOCK_NOTIFICATIONS)),
};

export function useNavbarPreview() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => INITIAL,
  );
}
