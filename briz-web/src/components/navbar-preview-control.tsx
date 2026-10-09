"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navbarPreview } from "@/store/navbar-preview-store";
import styles from "./navbar-preview-control.module.css";

// Development tool, deliberately outside the navbar: jumps the mock navbar to any
// state. Shown in development, or in a build started with NEXT_PUBLIC_NAVBAR_PREVIEW=1.
const SHOW = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_NAVBAR_PREVIEW === "1";

const STATES: { label: string; apply: () => void }[] = [
  { label: "Guest", apply: () => navbarPreview.preview({ userState: "guest" }) },
  {
    label: "Authenticated",
    apply: () => navbarPreview.preview({ userState: "authenticated", notifications: navbarPreview.mockNotifications(false) }),
  },
  { label: "Authenticated + unread notification", apply: () => navbarPreview.preview({ userState: "authenticated" }) },
  { label: "Notifications open", apply: () => navbarPreview.preview({ userState: "authenticated", activePopover: "notifications" }) },
  {
    label: "Notifications empty",
    apply: () => navbarPreview.preview({ userState: "authenticated", notifications: [], activePopover: "notifications" }),
  },
  { label: "Profile menu open", apply: () => navbarPreview.preview({ userState: "authenticated", activePopover: "profile" }) },
  { label: "Language menu open", apply: () => navbarPreview.preview({ userState: "authenticated", activePopover: "language" }) },
  { label: "Nepali selected", apply: () => navbarPreview.preview({ userState: "authenticated", language: "ne" }) },
];

export function NavbarPreviewControl() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("Guest");
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  if (!SHOW) return null;

  return (
    // data-navbar-popover-root: picking a state must not count as an "outside click"
    // that immediately closes the popover the state just opened.
    <div className={styles.root} ref={root} data-navbar-popover-root>
      {open && (
        <div className={styles.menu} role="menu" aria-label="Navbar preview states">
          {STATES.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitemradio"
              aria-checked={item.label === current}
              className={styles.item}
              onClick={() => {
                item.apply();
                setCurrent(item.label);
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <button type="button" className={styles.trigger} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        Preview navbar <ChevronUp size={15} data-open={open} aria-hidden="true" />
      </button>
    </div>
  );
}
