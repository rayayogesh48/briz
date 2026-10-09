"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Bell, Check, ChevronDown, ChevronRight, Heart, Megaphone, MessageSquareText, Tag } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import {
  LANGUAGES,
  MOCK_USER,
  navbarPreview,
  useNavbarPreview,
  type NavbarLanguage,
  type NavbarNotification,
} from "@/store/navbar-preview-store";
import styles from "./navbar-account.module.css";

const NOTIFICATION_ICON: Record<NavbarNotification["type"], ReactNode> = {
  offer: <Tag size={16} aria-hidden="true" />,
  request: <MessageSquareText size={16} aria-hidden="true" />,
  promotion: <Megaphone size={16} aria-hidden="true" />,
};

const maskedPhone = `${MOCK_USER.phone.slice(5, 7)}••••••${MOCK_USER.phone.slice(-2)}`;

/**
 * Closes the open navbar popover on outside click or Escape. Mounted once by the
 * header: the account controls render twice (desktop and compact), and each
 * would otherwise treat the other's clicks as "outside".
 */
export function useNavbarPopoverDismiss() {
  const { activePopover } = useNavbarPreview();
  useEffect(() => {
    if (!activePopover) return;
    const handlePointer = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-navbar-popover-root]")) return;
      navbarPreview.closePopover();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") navbarPreview.closePopover();
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [activePopover]);
}

function Popover({ children, className, label }: { children: ReactNode; className?: string; label: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`${styles.popover} ${className ?? ""}`}
      role="dialog"
      aria-label={label}
      initial={reduce ? false : { opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}

function LanguageOptions({ onPicked }: { onPicked?: () => void }) {
  const { language } = useNavbarPreview();
  return (
    <div role="group" aria-label="Language">
      {(Object.keys(LANGUAGES) as NavbarLanguage[]).map((code) => (
        <button
          key={code}
          type="button"
          role="menuitemradio"
          aria-checked={code === language}
          className={styles.menuItem}
          lang={code}
          onClick={() => {
            navbarPreview.setLanguage(code);
            onPicked?.();
          }}
        >
          {LANGUAGES[code].name}
          {code === language && <Check size={16} className={styles.check} aria-hidden="true" />}
        </button>
      ))}
    </div>
  );
}

function NotificationsPanel() {
  const { notifications } = useNavbarPreview();
  const hasUnread = notifications.some((item) => item.unread);
  return (
    <Popover label="Notifications" className={styles.notifications}>
      <div className={styles.popoverHead}>
        <h2>Notifications</h2>
        {hasUnread && (
          <button type="button" className={styles.textAction} onClick={navbarPreview.markAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <Bell size={20} aria-hidden="true" />
          </span>
          <strong>No notifications yet</strong>
          <p>Updates about your requests, offers, and Briz activity will appear here.</p>
        </div>
      ) : (
        <>
          <ul className={styles.notificationList}>
            {notifications.map((item) => (
              <li key={item.id} className={styles.notification} data-unread={item.unread}>
                <span className={styles.notificationIcon}>{NOTIFICATION_ICON[item.type]}</span>
                <span className={styles.notificationText}>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                  <time>{item.time}</time>
                </span>
                {item.unread && <span className={styles.unreadDot} role="img" aria-label="Unread" />}
              </li>
            ))}
          </ul>
          <Link href="/notifications" className={styles.popoverFoot} onClick={navbarPreview.closePopover}>
            View all notifications
          </Link>
        </>
      )}
    </Popover>
  );
}

function ProfileMenu({ compact, onOpenPanel }: { compact: boolean; onOpenPanel: (panel: "orders" | "cart") => void }) {
  const { language, signedInWithGoogle } = useNavbarPreview();
  const pathname = usePathname();
  // Open straight to the language list when the preview control asks for it on small screens.
  const [languageOpen, setLanguageOpen] = useState(false);
  const close = navbarPreview.closePopover;
  const link = (href: string, label: string) => (
    <Link href={href} role="menuitem" className={styles.menuItem} aria-current={pathname === href ? "page" : undefined} onClick={close}>
      {label}
    </Link>
  );
  const panel = (name: "orders" | "cart", label: string) => (
    <button
      type="button"
      role="menuitem"
      className={styles.menuItem}
      onClick={() => {
        close();
        onOpenPanel(name);
      }}
    >
      {label}
    </button>
  );

  return (
    <Popover label="Account" className={styles.profile}>
      <div className={styles.identity}>
        <span className={styles.avatar} aria-hidden="true">
          {MOCK_USER.initials}
        </span>
        <span className={styles.identityText}>
          <strong>{MOCK_USER.name}</strong>
          <span>{signedInWithGoogle ? MOCK_USER.email : maskedPhone}</span>
        </span>
      </div>

      <div className={styles.menuGroup} role="menu" aria-label="Account">
        {link("/profile", "Profile")}
        {link("/requests", "My requests")}
        {link("/saved", "Saved")}
        {compact && link("/notifications", "Notifications")}
        {panel("orders", "My orders")}
        {compact && panel("cart", "Your cart")}
      </div>

      <div className={styles.menuGroup} role="menu" aria-label="Preferences">
        <button
          type="button"
          role="menuitem"
          className={styles.menuItem}
          aria-expanded={languageOpen}
          onClick={() => setLanguageOpen(!languageOpen)}
        >
          Language
          <span className={styles.menuValue} lang={language}>
            {LANGUAGES[language].name}
            <ChevronRight size={16} data-open={languageOpen} aria-hidden="true" />
          </span>
        </button>
        {languageOpen && (
          <div className={styles.nested}>
            <LanguageOptions />
          </div>
        )}
      </div>

      <div className={styles.menuGroup} role="menu" aria-label="Session">
        <button type="button" role="menuitem" className={styles.menuItem} onClick={navbarPreview.logOut}>
          Log out
        </button>
      </div>
    </Popover>
  );
}

type NavbarAccountProps = {
  /** "desktop": full utilities. "compact": the small-screen header (bell + avatar, or Log in). */
  layout: "desktop" | "compact";
  /** Opens one of the header's existing Phase 1 panels. */
  onOpenPanel: (panel: "orders" | "cart") => void;
};

/**
 * Phase 2 account utilities for the navbar: Log in for guests; language, Saved,
 * notifications and the account menu once the mock user is signed in.
 */
export function NavbarAccount({ layout, onOpenPanel }: NavbarAccountProps) {
  const { userState, activePopover, language, notifications } = useNavbarPreview();
  const pathname = usePathname();
  const compact = layout === "compact";

  if (userState === "guest") {
    return (
      <button type="button" className={styles.login} onClick={navbarPreview.openAuth}>
        Log in
      </button>
    );
  }

  const hasUnread = notifications.some((item) => item.unread);
  const onSaved = pathname === "/saved";

  return (
    <div className={styles.account} data-layout={layout}>
      {!compact && (
        <div className={styles.anchor} data-navbar-popover-root>
          <button
            type="button"
            className={styles.utility}
            aria-haspopup="menu"
            aria-expanded={activePopover === "language"}
            aria-label={`Language: ${LANGUAGES[language].name}`}
            onClick={() => navbarPreview.togglePopover("language")}
          >
            <span lang={language}>{LANGUAGES[language].short}</span>
            <ChevronDown size={14} aria-hidden="true" />
          </button>
          {activePopover === "language" && (
            <Popover label="Language" className={styles.language}>
              <p className={styles.popoverLabel}>Language</p>
              <LanguageOptions onPicked={navbarPreview.closePopover} />
            </Popover>
          )}
        </div>
      )}

      {!compact && (
        <Link href="/saved" className={styles.utility} data-active={onSaved} aria-current={onSaved ? "page" : undefined}>
          <Heart size={18} fill={onSaved ? "currentColor" : "none"} aria-hidden="true" />
          <span className={styles.utilityLabel}>Saved</span>
        </Link>
      )}

      <div className={styles.anchor} data-navbar-popover-root>
        <button
          type="button"
          className={`${styles.utility} ${styles.iconOnly}`}
          aria-haspopup="dialog"
          aria-expanded={activePopover === "notifications"}
          aria-label={hasUnread ? "Notifications, unread updates" : "Notifications"}
          onClick={() => navbarPreview.togglePopover("notifications")}
        >
          <Bell size={20} aria-hidden="true" />
          {hasUnread && <span className={styles.bellDot} aria-hidden="true" />}
        </button>
        {activePopover === "notifications" && <NotificationsPanel />}
      </div>

      <div className={styles.anchor} data-navbar-popover-root>
        <button
          type="button"
          className={styles.avatarTrigger}
          aria-haspopup="menu"
          aria-expanded={activePopover === "profile"}
          aria-label="Open account menu"
          onClick={() => navbarPreview.togglePopover("profile")}
        >
          <span className={styles.avatar} aria-hidden="true">
            {MOCK_USER.initials}
          </span>
          <ChevronDown size={14} aria-hidden="true" />
        </button>
        {activePopover === "profile" && <ProfileMenu compact={compact} onOpenPanel={onOpenPanel} />}
      </div>
    </div>
  );
}
