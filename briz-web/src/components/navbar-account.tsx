"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Bell, Check, CheckCheck, ChevronDown, ChevronRight, Download, Ellipsis, Globe, Heart, LogOut, MessageCircle, Package, Store, UserRound, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import {
  LANGUAGES,
  MOCK_USER,
  navbarPreview,
  useNavbarPreview,
  type NavbarLanguage,
} from "@/store/navbar-preview-store";
import { groupByDay, matchesFilter } from "./notifications/notification-data";
import { NotificationItem, useNow } from "./notifications/notification-item";
import notificationStyles from "./notifications/notifications.module.css";
import { badgeLabel } from "./requests/request-data";
import styles from "./navbar-account.module.css";

/** Header panels the account menu can open. */
export type NavbarPanel = "orders" | "cart" | "chat" | "seller" | "download";


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

function LanguageOptions() {
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
          }}
        >
          {LANGUAGES[code].name}
          {code === language && <Check size={16} className={styles.check} aria-hidden="true" />}
        </button>
      ))}
    </div>
  );
}

/**
 * The bell's panel: every notification (All or Unread only), grouped by day in a
 * list that scrolls inside the panel. Opening one goes to its page and marks it read.
 * There is no separate notifications page for now, so nothing links out of here.
 */
function NotificationsPanel() {
  const { notifications } = useNavbarPreview();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const now = useNow();
  const unreadCount = notifications.filter((item) => item.unread).length;
  const groups = groupByDay(
    notifications.filter((item) => matchesFilter(item, filter)),
    now,
  );

  return (
    <Popover label="Notifications" className={styles.notifications}>
      <div className={styles.popoverHead}>
        <h2>Notifications</h2>
        {unreadCount > 0 && (
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
          <div className={styles.segmented} role="group" aria-label="Show">
            <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
              All
            </button>
            <button type="button" aria-pressed={filter === "unread"} onClick={() => setFilter("unread")}>
              Unread{unreadCount > 0 && <span className={styles.segmentCount}>{badgeLabel(unreadCount)}</span>}
            </button>
          </div>

          {groups.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>
                <CheckCheck size={20} aria-hidden="true" />
              </span>
              <strong>You&rsquo;re all caught up</strong>
              <p>You&rsquo;ve read every notification.</p>
            </div>
          ) : (
            <div className={styles.notificationScroll}>
              {groups.map((group) => (
                <section key={group.label} aria-labelledby={`notifications-${group.label}`}>
                  <h3 id={`notifications-${group.label}`} className={styles.groupTitle}>
                    {group.label}
                  </h3>
                  <ul className={notificationStyles.list}>
                    {group.items.map((item) => (
                      <NotificationItem
                        key={item.id}
                        item={item}
                        now={now}
                        onOpen={() => {
                          navbarPreview.setNotificationRead(item.id, true);
                          navbarPreview.closePopover();
                        }}
                      />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </Popover>
  );
}

/** A menu row: leading icon and label, optionally with a value or chevron on the right. */
function MenuLabel({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className={styles.menuLabel}>
      <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
      {children}
    </span>
  );
}

function PanelItem({ icon, label, onSelect }: { icon: LucideIcon; label: string; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={styles.menuItem}
      onClick={() => {
        navbarPreview.closePopover();
        onSelect();
      }}
    >
      <MenuLabel icon={icon}>{label}</MenuLabel>
    </button>
  );
}

/**
 * Everything that isn't one of the navbar's three everyday icons (Requests, Cart,
 * Notifications), grouped: your account, Briz, preferences, then Log out.
 */
function ProfileMenu({ onOpenPanel, languageExpanded }: { onOpenPanel: (panel: NavbarPanel) => void; languageExpanded: boolean }) {
  const { language, signedInWithGoogle } = useNavbarPreview();
  const pathname = usePathname();
  const [languageOpen, setLanguageOpen] = useState(languageExpanded);
  const link = (href: string, icon: LucideIcon, label: string) => (
    <Link
      href={href}
      role="menuitem"
      className={styles.menuItem}
      aria-current={pathname === href ? "page" : undefined}
      onClick={navbarPreview.closePopover}
    >
      <MenuLabel icon={icon}>{label}</MenuLabel>
    </Link>
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

      {/* Same groups as the account sidebar, labelled so the menu scans at a glance. */}
      <div className={styles.menuGroup} role="menu" aria-label="Your activity">
        <p className={styles.groupLabel} aria-hidden="true">
          Your activity
        </p>
        <PanelItem icon={Package} label="My orders" onSelect={() => onOpenPanel("orders")} />
        {link("/saved", Heart, "Saved")}
        <PanelItem icon={MessageCircle} label="Chat" onSelect={() => onOpenPanel("chat")} />
      </div>

      <div className={styles.menuGroup} role="menu" aria-label="Settings">
        <p className={styles.groupLabel} aria-hidden="true">
          Settings
        </p>
        {link("/profile", UserRound, "Profile")}
        <button
          type="button"
          role="menuitem"
          className={styles.menuItem}
          aria-expanded={languageOpen}
          onClick={() => setLanguageOpen(!languageOpen)}
        >
          <MenuLabel icon={Globe}>Language</MenuLabel>
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

      <div className={styles.menuGroup} role="menu" aria-label="More from Briz">
        <p className={styles.groupLabel} aria-hidden="true">
          More from Briz
        </p>
        <PanelItem icon={Store} label="Become a seller" onSelect={() => onOpenPanel("seller")} />
        <PanelItem icon={Download} label="Download app" onSelect={() => onOpenPanel("download")} />
      </div>

      <div className={styles.menuGroup} role="menu" aria-label="Session">
        <button type="button" role="menuitem" className={styles.menuItem} onClick={navbarPreview.logOut}>
          <MenuLabel icon={LogOut}>Log out</MenuLabel>
        </button>
      </div>
    </Popover>
  );
}

/** Guests: the occasional actions (Become a seller, Download app) wait behind one "More" button. */
function GuestMoreMenu({ onOpenPanel }: { onOpenPanel: (panel: NavbarPanel) => void }) {
  const { activePopover } = useNavbarPreview();
  return (
    <div className={styles.anchor} data-navbar-popover-root>
      <button
        type="button"
        className={`${styles.utility} ${styles.iconOnly}`}
        data-tip="More"
        aria-haspopup="menu"
        aria-expanded={activePopover === "more"}
        aria-label="More"
        onClick={() => navbarPreview.togglePopover("more")}
      >
        <Ellipsis size={22} strokeWidth={1.75} aria-hidden="true" />
      </button>
      {activePopover === "more" && (
        <Popover label="More" className={styles.more}>
          <div className={styles.menuGroup} role="menu" aria-label="More from Briz">
            <PanelItem icon={Store} label="Become a seller" onSelect={() => onOpenPanel("seller")} />
            <PanelItem icon={Download} label="Download app" onSelect={() => onOpenPanel("download")} />
          </div>
        </Popover>
      )}
    </div>
  );
}

type NavbarAccountProps = {
  /** "desktop" or "compact" (the small-screen header). Both show the same controls; popovers become sheets on phones. */
  layout: "desktop" | "compact";
  /** Opens one of the header's existing Phase 1 panels. */
  onOpenPanel: (panel: NavbarPanel) => void;
};

/**
 * Phase 2 account utilities for the navbar: More and Log in for guests; notifications
 * and the account menu (which holds everything else) once the mock user is signed in.
 */
export function NavbarAccount({ layout, onOpenPanel }: NavbarAccountProps) {
  const { userState, activePopover, notifications } = useNavbarPreview();

  if (userState === "guest") {
    return (
      <div className={styles.account} data-layout={layout}>
        <GuestMoreMenu onOpenPanel={onOpenPanel} />
        <button type="button" className={styles.login} onClick={navbarPreview.openAuth}>
          Log in
        </button>
      </div>
    );
  }

  const hasUnread = notifications.some((item) => item.unread);

  return (
    <div className={styles.account} data-layout={layout}>
      <div className={styles.anchor} data-navbar-popover-root>
        <button
          type="button"
          className={`${styles.utility} ${styles.iconOnly}`}
          data-tip="Notifications"
          aria-haspopup="dialog"
          aria-expanded={activePopover === "notifications"}
          aria-label={hasUnread ? "Notifications, unread updates" : "Notifications"}
          onClick={() => navbarPreview.togglePopover("notifications")}
        >
          <Bell size={22} strokeWidth={1.75} aria-hidden="true" />
          {hasUnread && <span className={styles.bellDot} aria-hidden="true" />}
        </button>
        {activePopover === "notifications" && <NotificationsPanel />}
      </div>

      <div className={styles.anchor} data-navbar-popover-root>
        <button
          type="button"
          className={styles.avatarTrigger}
          aria-haspopup="menu"
          aria-expanded={activePopover === "profile" || activePopover === "language"}
          aria-label="Open account menu"
          onClick={() => navbarPreview.togglePopover("profile")}
        >
          <span className={styles.avatar} aria-hidden="true">
            {MOCK_USER.initials}
          </span>
          <ChevronDown size={14} aria-hidden="true" />
        </button>
        {(activePopover === "profile" || activePopover === "language") && (
          // Keyed so switching between "profile" and "language" re-applies the expanded state.
          <ProfileMenu key={activePopover} onOpenPanel={onOpenPanel} languageExpanded={activePopover === "language"} />
        )}
      </div>
    </div>
  );
}
