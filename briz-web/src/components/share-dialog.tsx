"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./share-dialog.module.css";

export interface ShareDialogProps {
  /** Controls open/close state of the dialog */
  isOpen: boolean;
  /** Callback to close dialog */
  onClose: () => void;
  /** Custom URL to share. Defaults to current window.location.href */
  url?: string;
  /** Title / subject of the shared content */
  title?: string;
  /** Description / message text */
  description?: string;
}

function IconShare() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.677.15-.2.3-.777.979-.952 1.18-.175.2-.351.226-.652.075-.3-.15-1.267-.467-2.414-1.489-.893-.796-1.496-1.78-1.672-2.08-.175-.3-.019-.463.132-.613.136-.135.301-.351.451-.527.151-.175.2-.3.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.633-.927-2.235-.244-.587-.493-.507-.677-.516l-.577-.01c-.2 0-.526.075-.802.376-.276.3-1.053 1.028-1.053 2.507 0 1.479 1.078 2.908 1.228 3.109.15.2 2.122 3.24 5.14 4.543.718.31 1.279.495 1.716.634.721.23 1.378.197 1.897.12.578-.087 1.78-.727 2.03-1.429.251-.702.251-1.303.176-1.429-.076-.125-.276-.201-.577-.351zM12.04 21.786c-1.764 0-3.493-.464-5.016-1.341l-.36-.21-3.73.978.995-3.636-.23-.367a9.78 9.78 0 0 1-1.503-5.234c0-5.414 4.404-9.818 9.82-9.818 2.624 0 5.09 1.023 6.945 2.879 1.856 1.855 2.878 4.322 2.876 6.946.002 5.417-4.405 9.863-9.797 9.863zM12.04 0C5.397 0 .01 5.387.01 12.03c0 2.12.553 4.19 1.603 6.008L0 24l6.143-1.61a12.01 12.01 0 0 0 5.897 1.545h.005c6.643 0 12.032-5.388 12.032-12.032A11.96 11.96 0 0 0 20.55 3.527C18.272 1.25 15.26 0 12.04 0z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export function ShareDialog({
  isOpen,
  onClose,
  url,
  title = "Briz — Shop local in Kathmandu",
  description = "Check out local verified merchants, authentic products, and fast delivery on Briz.",
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Derive active URL safely without setState in effect
  const activeUrl = url || (typeof window !== "undefined" ? window.location.href : "https://briz.com");
  const canSystemShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  // Handle ESC key to close dialog
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Lock background scroll
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopied(true);
      showToast("Link copied to clipboard! 📋");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback input selection
      inputRef.current?.select();
      document.execCommand("copy");
      setCopied(true);
      showToast("Link copied to clipboard! 📋");
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function handleFacebookShare() {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(activeUrl)}`;
    window.open(fbUrl, "_blank", "width=600,height=500,menubar=no,toolbar=no");
  }

  function handleInstagramShare() {
    // Instagram doesn't have a direct URL sharing intent for web feed, so we copy the link and open Instagram
    handleCopy();
    showToast("Link copied! Ready to paste into Instagram 📸");
    setTimeout(() => {
      window.open("https://www.instagram.com", "_blank");
    }, 600);
  }

  function handleWhatsAppShare() {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n${activeUrl}`)}`;
    window.open(waUrl, "_blank");
  }

  function handleEmailShare() {
    const mailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\nVisit: ${activeUrl}`)}`;
    window.location.href = mailUrl;
  }

  async function handleSystemShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: activeUrl,
        });
      } catch {
        // User cancelled or share dismissed
      }
    }
  }

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-dialog-title"
    >
      <div ref={modalRef} className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleBlock}>
            <div className={styles.titleIcon}>
              <IconShare />
            </div>
            <h2 id="share-dialog-title" className={styles.title}>
              Share
            </h2>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close share dialog"
          >
            ✕
          </button>
        </div>

        <p className={styles.description}>
          Share this link with friends, family, or social media platforms.
        </p>

        {/* Social Share Grid */}
        <div className={styles.socialSection}>
          <span className={styles.sectionLabel}>Share via</span>
          <div className={styles.socialGrid}>
            {/* Facebook */}
            <button
              type="button"
              className={styles.socialBtn}
              onClick={handleFacebookShare}
              aria-label="Share on Facebook"
            >
              <div className={`${styles.socialIconWrapper} ${styles.facebookIcon}`}>
                <IconFacebook />
              </div>
              <span className={styles.socialLabel}>Facebook</span>
            </button>

            {/* Instagram */}
            <button
              type="button"
              className={styles.socialBtn}
              onClick={handleInstagramShare}
              aria-label="Share on Instagram"
            >
              <div className={`${styles.socialIconWrapper} ${styles.instagramIcon}`}>
                <IconInstagram />
              </div>
              <span className={styles.socialLabel}>Instagram</span>
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              className={styles.socialBtn}
              onClick={handleWhatsAppShare}
              aria-label="Share on WhatsApp"
            >
              <div className={`${styles.socialIconWrapper} ${styles.whatsappIcon}`}>
                <IconWhatsApp />
              </div>
              <span className={styles.socialLabel}>WhatsApp</span>
            </button>

            {/* Email */}
            <button
              type="button"
              className={styles.socialBtn}
              onClick={handleEmailShare}
              aria-label="Share via Email"
            >
              <div className={`${styles.socialIconWrapper} ${styles.emailIcon}`}>
                <IconMail />
              </div>
              <span className={styles.socialLabel}>Email</span>
            </button>
          </div>
        </div>

        {/* Share Link Input */}
        <div className={styles.linkSection}>
          <span className={styles.sectionLabel}>Share link</span>
          <div className={styles.inputWrapper}>
            <span className={styles.linkIcon}>
              <IconLink />
            </span>
            <input
              ref={inputRef}
              type="text"
              readOnly
              value={activeUrl}
              onClick={() => inputRef.current?.select()}
              className={styles.linkInput}
              aria-label="Shareable link URL"
            />
            <button
              type="button"
              className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ""}`}
              onClick={handleCopy}
              aria-label={copied ? "Link copied" : "Copy share link"}
            >
              {copied ? (
                <>
                  <IconCheck />
                  <span>Copied!</span>
                </>
              ) : (
                <span>Copy</span>
              )}
            </button>
          </div>
        </div>

        {/* Native Web Share API button if supported */}
        {canSystemShare && (
          <button
            type="button"
            className={styles.systemShareBtn}
            onClick={handleSystemShare}
            aria-label="More sharing options"
          >
            <IconShare />
            <span>More sharing options...</span>
          </button>
        )}

        {/* Toast Feedback */}
        {toastMessage && (
          <div className={styles.toast} role="status" aria-live="polite">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
