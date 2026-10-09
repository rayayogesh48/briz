"use client";

// Frontend-only authentication prototype. Everything here is local React state
// and mock data: no requests, no auth SDKs, no sessions. It exists so design and
// product can click through and review every auth screen.

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Check, ChevronDown, CircleAlert, WifiOff, X } from "lucide-react";
import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from "react";
import styles from "./auth-preview.module.css";

export type AuthPreviewScreen =
  | "entry"
  | "phone-filled"
  | "otp"
  | "otp-error"
  | "otp-expired"
  | "google-existing"
  | "google-phone"
  | "apple-existing"
  | "apple-phone"
  | "phone-conflict"
  | "google-error"
  | "apple-error"
  | "network-error"
  | "success";

type Provider = "google" | "apple";

const DEMO_PHONE = "9812345678";
const DEMO_OTP = "123456";
const DEMO_EMAIL = "demo@gmail.com";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
/** How long the pretend provider hand-off takes. */
const PROVIDER_DELAY = 1300;

// Shown in development, or in any build started with NEXT_PUBLIC_AUTH_PREVIEW=1
// (for sharing a deployed preview with the design team).
const SHOW_PREVIEW_STATES =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_AUTH_PREVIEW === "1";

const PREVIEW_GROUPS: { screen: AuthPreviewScreen; label: string }[][] = [
  [
    { screen: "entry", label: "Auth entry" },
    { screen: "phone-filled", label: "Phone filled" },
    { screen: "otp", label: "OTP verification" },
    { screen: "otp-error", label: "OTP error" },
    { screen: "otp-expired", label: "OTP expired" },
  ],
  [
    { screen: "google-existing", label: "Google — Existing user" },
    { screen: "google-phone", label: "Google — Phone required" },
  ],
  [
    { screen: "apple-existing", label: "Apple — Existing user" },
    { screen: "apple-phone", label: "Apple — Phone required" },
  ],
  [
    { screen: "phone-conflict", label: "Phone already used" },
    { screen: "google-error", label: "Google error" },
    { screen: "apple-error", label: "Apple error" },
    { screen: "network-error", label: "Network error" },
    { screen: "success", label: "Success" },
  ],
];

const PROVIDER_NAME: Record<Provider, string> = { google: "Google", apple: "Apple" };

/** Mock data each preview state should open with. */
function presetFor(screen: AuthPreviewScreen): { phone: string; otp: string; provider: Provider | null } {
  const provider: Provider | null = screen.startsWith("google") ? "google" : screen.startsWith("apple") ? "apple" : null;
  switch (screen) {
    case "entry":
    case "network-error":
      return { phone: "", otp: "", provider: null };
    case "google-phone":
    case "apple-phone":
    case "google-error":
    case "apple-error":
    case "google-existing":
    case "apple-existing":
      return { phone: "", otp: "", provider };
    case "otp":
    case "otp-error":
      return { phone: DEMO_PHONE, otp: DEMO_OTP, provider: null };
    case "phone-conflict":
      return { phone: DEMO_PHONE, otp: "", provider: "google" };
    default:
      return { phone: DEMO_PHONE, otp: "", provider: null };
  }
}

/** Screens that are the same view in a different state share a key, so they don't re-animate. */
function viewKey(screen: AuthPreviewScreen) {
  if (screen === "phone-filled") return "entry";
  if (screen === "otp-error" || screen === "otp-expired") return "otp";
  return screen;
}

const isPhoneComplete = (phone: string) => /^9\d{9}$/.test(phone);
const maskPhone = (phone: string) => `+977 ${phone.slice(0, 2)}••••••${phone.slice(-2)}`;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

const ProviderIcon = ({ provider }: { provider: Provider }) => (provider === "google" ? <GoogleIcon /> : <AppleIcon />);

function Spinner() {
  return <span className={styles.spinner} aria-hidden="true" />;
}

/** The one phone input, shared by phone login and "add your phone" after Google/Apple. */
function PhoneField({ value, onChange, autoFocus }: { value: string; onChange: (value: string) => void; autoFocus?: boolean }) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor="auth-phone">
        Phone number
      </label>
      <div className={styles.phone}>
        <span className={styles.phonePrefix} aria-hidden="true">
          +977
        </span>
        <input
          id="auth-phone"
          type="tel"
          inputMode="numeric"
          autoComplete="off"
          placeholder="98XXXXXXXX"
          maxLength={10}
          value={value}
          autoFocus={autoFocus}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 10))}
        />
      </div>
    </div>
  );
}

function OtpInput({ value, onChange, invalid }: { value: string; onChange: (value: string) => void; invalid: boolean }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (index: number) => inputs.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))]?.focus();

  function handleChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return;
    const next = (value.slice(0, index) + digits + value.slice(index + digits.length)).slice(0, OTP_LENGTH);
    onChange(next);
    focus(index + digits.length);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      // Clear this box if it has a digit, otherwise step back and clear the previous one.
      const target = value[index] ? index : index - 1;
      if (target < 0) return;
      onChange(value.slice(0, target));
      focus(target);
    } else if (event.key === "ArrowLeft") {
      focus(index - 1);
    } else if (event.key === "ArrowRight") {
      focus(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!digits) return;
    onChange(digits);
    focus(digits.length);
  }

  return (
    <div className={styles.otp} role="group" aria-label="6-digit verification code" data-invalid={invalid}>
      {Array.from({ length: OTP_LENGTH }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            inputs.current[index] = node;
          }}
          className={styles.otpBox}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={OTP_LENGTH}
          aria-label={`Digit ${index + 1}`}
          aria-invalid={invalid}
          value={value[index] ?? ""}
          autoFocus={index === Math.min(value.length, OTP_LENGTH - 1)}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
        />
      ))}
    </div>
  );
}

function ResendTimer({ onResend }: { onResend: () => void }) {
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  if (seconds > 0) {
    return (
      <span className={styles.muted} aria-live="off">
        Resend code in {seconds}s
      </span>
    );
  }
  return (
    <button
      type="button"
      className={styles.link}
      onClick={() => {
        setSeconds(RESEND_SECONDS);
        onResend();
      }}
    >
      Resend code
    </button>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <p className={styles.notice} role="alert">
      <CircleAlert size={16} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

function StatusIcon({ tone, children }: { tone: "error" | "success" | "neutral"; children: ReactNode }) {
  return (
    <span className={styles.statusIcon} data-tone={tone}>
      {children}
    </span>
  );
}

function PreviewStates({ current, onPick }: { current: AuthPreviewScreen; onPick: (screen: AuthPreviewScreen) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div className={styles.preview} ref={root}>
      <button type="button" className={styles.previewButton} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        Preview states <ChevronDown size={15} aria-hidden="true" />
      </button>
      {open && (
        <div className={styles.previewMenu} role="menu" aria-label="Auth preview states">
          {PREVIEW_GROUPS.map((group, groupIndex) => (
            <div key={groupIndex} className={styles.previewGroup} role="group">
              {group.map((item) => (
                <button
                  key={item.screen}
                  type="button"
                  role="menuitemradio"
                  aria-checked={item.screen === current}
                  className={styles.previewItem}
                  onClick={() => {
                    onPick(item.screen);
                    setOpen(false);
                  }}
                >
                  {item.label}
                  {item.screen === current && <Check size={15} aria-hidden="true" />}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fired when the mock flow ends on "Continue to Briz". `provider` is null for phone login. */
  onComplete?: (provider: "google" | "apple" | null) => void;
  /** Show the development "Preview states" switcher. */
  showPreviewStates?: boolean;
}

/**
 * The auth modal and every screen in it. Used by the /auth prototype page and by
 * the navbar's Log in button. All state is local; nothing is sent anywhere.
 */
export function AuthDialog({ open, onOpenChange, onComplete, showPreviewStates = false }: AuthDialogProps) {
  const reduce = useReducedMotion();
  const setOpen = onOpenChange;
  const [screen, setScreen] = useState<AuthPreviewScreen>("entry");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [provider, setProvider] = useState<Provider | null>(null);
  /** Provider whose button is showing its pretend "Continuing with…" hand-off. */
  const [connecting, setConnecting] = useState<Provider | null>(null);

  function jumpTo(next: AuthPreviewScreen) {
    const preset = presetFor(next);
    setPhone(preset.phone);
    setOtp(preset.otp);
    setProvider(preset.provider);
    setConnecting(null);
    setScreen(next);
    setOpen(true);
  }

  function go(next: AuthPreviewScreen) {
    setConnecting(null);
    setScreen(next);
  }

  // Pretend hand-off from the entry screen: Google/Apple "returns" without a phone number.
  useEffect(() => {
    if (!connecting) return;
    const timer = setTimeout(() => {
      setProvider(connecting);
      setPhone("");
      setConnecting(null);
      setScreen(`${connecting}-phone`);
    }, PROVIDER_DELAY);
    return () => clearTimeout(timer);
  }, [connecting]);

  // "Existing user" previews: the account already has a phone, so it goes straight to done.
  useEffect(() => {
    if (!open || (screen !== "google-existing" && screen !== "apple-existing")) return;
    const timer = setTimeout(() => setScreen("success"), PROVIDER_DELAY + 300);
    return () => clearTimeout(timer);
  }, [open, screen]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, setOpen]);

  const toOtp = () => {
    setOtp("");
    go("otp");
  };
  const backToPhone = () => go(provider ? `${provider}-phone` : "entry");
  const usePhoneInstead = () => {
    setProvider(null);
    go("entry");
  };
  const finish = () => {
    onComplete?.(provider);
    setOpen(false);
    jumpToEntryQuietly();
  };
  function jumpToEntryQuietly() {
    setPhone("");
    setOtp("");
    setProvider(null);
    setConnecting(null);
    setScreen("entry");
  }

  const key = viewKey(screen);
  const canGoBack = key === "otp" || screen === "phone-conflict";
  let content: ReactNode;

  if (key === "entry") {
    content = (
      <>
        <header className={styles.header}>
          <h2 className={styles.title} id="auth-title">
            Welcome to Briz
          </h2>
          <p className={styles.description}>Find products nearby or request what you need from local sellers.</p>
        </header>

        <div className={styles.providers}>
          {(["google", "apple"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={styles.providerButton}
              disabled={connecting !== null}
              onClick={() => setConnecting(item)}
            >
              {connecting === item ? <Spinner /> : <ProviderIcon provider={item} />}
              {connecting === item ? `Continuing with ${PROVIDER_NAME[item]}...` : `Continue with ${PROVIDER_NAME[item]}`}
            </button>
          ))}
        </div>

        <div className={styles.divider} role="separator">
          <span>or</span>
        </div>

        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            if (isPhoneComplete(phone)) toOtp();
          }}
        >
          <PhoneField value={phone} onChange={setPhone} />
          <button type="submit" className={styles.primary} disabled={!isPhoneComplete(phone) || connecting !== null}>
            Continue
          </button>
        </form>

        <p className={styles.legal}>
          By continuing, you agree to Briz&rsquo;s <a href="#terms">Terms of Use</a> and <a href="#privacy">Privacy Policy</a>.
        </p>
      </>
    );
  } else if (key === "otp") {
    const expired = screen === "otp-expired";
    const invalid = screen === "otp-error";
    content = (
      <>
        <header className={styles.header}>
          <h2 className={styles.title} id="auth-title">
            Verify your number
          </h2>
          <p className={styles.description}>
            Enter the 6-digit code sent to <strong>{maskPhone(phone || DEMO_PHONE)}</strong>
          </p>
        </header>

        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            // Prototype: any complete 6-digit code is accepted.
            if (!expired && otp.length === OTP_LENGTH) go("success");
          }}
        >
          <OtpInput
            value={otp}
            invalid={invalid}
            onChange={(value) => {
              setOtp(value);
              if (invalid) go("otp");
            }}
          />
          {invalid && <Notice>That code isn&rsquo;t correct. Try again.</Notice>}
          {expired && <Notice>This code has expired. Request a new one.</Notice>}

          {expired ? (
            <button type="button" className={styles.primary} onClick={toOtp}>
              Send new code
            </button>
          ) : (
            <button type="submit" className={styles.primary} disabled={otp.length !== OTP_LENGTH}>
              Verify
            </button>
          )}
        </form>

        <div className={styles.otpFooter}>
          {expired ? <span className={styles.muted}>Code expired</span> : <ResendTimer onResend={() => setOtp("")} />}
          <button type="button" className={styles.link} onClick={backToPhone}>
            Change phone number
          </button>
        </div>
      </>
    );
  } else if (screen === "google-phone" || screen === "apple-phone") {
    const current: Provider = screen === "google-phone" ? "google" : "apple";
    content = (
      <>
        <div className={styles.providerContext}>
          <span className={styles.providerBadge}>
            <ProviderIcon provider={current} />
          </span>
          <span>
            <strong>Signed in with {PROVIDER_NAME[current]}</strong>
            {current === "google" && <span>{DEMO_EMAIL}</span>}
          </span>
        </div>
        <header className={styles.header}>
          <h2 className={styles.title} id="auth-title">
            Add your phone number
          </h2>
          <p className={styles.description}>We need a verified phone number to complete your Briz account.</p>
        </header>
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            if (isPhoneComplete(phone)) toOtp();
          }}
        >
          <PhoneField value={phone} onChange={setPhone} autoFocus />
          <button type="submit" className={styles.primary} disabled={!isPhoneComplete(phone)}>
            Continue
          </button>
        </form>
      </>
    );
  } else if (screen === "google-existing" || screen === "apple-existing") {
    const current: Provider = screen === "google-existing" ? "google" : "apple";
    content = (
      <div className={styles.centered} role="status">
        <span className={styles.providerBadgeLarge}>
          <ProviderIcon provider={current} />
        </span>
        <h2 className={styles.title} id="auth-title">
          Continuing with {PROVIDER_NAME[current]}...
        </h2>
        <p className={styles.description}>Just a moment.</p>
        <Spinner />
      </div>
    );
  } else if (screen === "phone-conflict") {
    content = (
      <div className={styles.centered}>
        <StatusIcon tone="error">
          <CircleAlert size={26} aria-hidden="true" />
        </StatusIcon>
        <h2 className={styles.title} id="auth-title">
          This phone number is already in use
        </h2>
        <p className={styles.description}>
          This number is connected to another Briz account. Use a different number or continue with phone instead.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            onClick={() => {
              setPhone("");
              go(`${provider ?? "google"}-phone`);
            }}
          >
            Use a different number
          </button>
          <button type="button" className={styles.secondary} onClick={usePhoneInstead}>
            Continue with phone
          </button>
        </div>
      </div>
    );
  } else if (screen === "google-error" || screen === "apple-error") {
    const current: Provider = screen === "google-error" ? "google" : "apple";
    content = (
      <div className={styles.centered}>
        <StatusIcon tone="error">
          <CircleAlert size={26} aria-hidden="true" />
        </StatusIcon>
        <h2 className={styles.title} id="auth-title">
          Couldn&rsquo;t continue with {PROVIDER_NAME[current]}
        </h2>
        <p className={styles.description}>Try again or choose another login method.</p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            onClick={() => {
              go("entry");
              setConnecting(current);
            }}
          >
            Try again
          </button>
          <button type="button" className={styles.secondary} onClick={usePhoneInstead}>
            Use phone instead
          </button>
        </div>
      </div>
    );
  } else if (screen === "network-error") {
    content = (
      <div className={styles.centered}>
        <StatusIcon tone="neutral">
          <WifiOff size={26} aria-hidden="true" />
        </StatusIcon>
        <h2 className={styles.title} id="auth-title">
          Couldn&rsquo;t connect
        </h2>
        <p className={styles.description}>Check your internet connection and try again.</p>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={() => go("entry")}>
            Try again
          </button>
        </div>
      </div>
    );
  } else {
    content = (
      <div className={styles.centered} role="status">
        <StatusIcon tone="success">
          <Check size={28} strokeWidth={2.5} aria-hidden="true" />
        </StatusIcon>
        <h2 className={styles.title} id="auth-title">
          You&rsquo;re all set
        </h2>
        <p className={styles.description}>Your number is verified. Welcome to Briz.</p>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={finish}>
            Continue to Briz
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showPreviewStates && SHOW_PREVIEW_STATES && <PreviewStates current={screen} onPick={jumpTo} />}

      {open && (
        <div className={styles.backdrop} onClick={() => setOpen(false)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalBar}>
              {canGoBack ? (
                <button type="button" className={styles.iconButton} aria-label="Back" onClick={backToPhone}>
                  <ArrowLeft size={20} aria-hidden="true" />
                </button>
              ) : (
                <span />
              )}
              <button type="button" className={styles.iconButton} aria-label="Close" onClick={() => setOpen(false)}>
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={key}
                className={styles.view}
                initial={reduce ? false : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -8 }}
                transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
              >
                {content}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </>
  );
}

/** The standalone /auth prototype page: a plain stage with the dialog and its state switcher. */
export function AuthPreview() {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.stage}>
      <div className={styles.stageIntro}>
        <p className={styles.stageBadge}>Prototype · no real sign-in</p>
        <h1>Briz authentication preview</h1>
        <p>Every screen here is mocked with local state. Nothing is sent anywhere.</p>
        <button type="button" className={styles.primary} onClick={() => setOpen(true)}>
          Open auth
        </button>
      </div>
      <AuthDialog open={open} onOpenChange={setOpen} showPreviewStates />
    </div>
  );
}
