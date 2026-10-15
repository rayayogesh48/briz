"use client";

// Profile page prototype. Local state and mock data only: nothing is uploaded,
// saved, linked or deleted, and a refresh restores the default state.

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronUp, CircleAlert, LoaderCircle, UserRound } from "lucide-react";
import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { navbarPreview, useNavbarPreview } from "@/store/navbar-preview-store";
import previewStyles from "@/components/navbar-preview-control.module.css";
import styles from "./profile-page.module.css";

type Provider = "google" | "apple";
type LinkStatus = "idle" | "connecting" | "connected" | "disconnecting" | "error";
type PhotoStatus = "empty" | "uploading" | "uploaded" | "removing" | "error";

type ProfileState = {
  page: "ready" | "loading" | "error" | "signed-out";
  photo: PhotoStatus;
  photoUrl: string | null;
  photoError: string;
  name: string;
  savedName: string;
  nameError: string;
  save: "idle" | "saving" | "failed";
  links: Record<Provider, LinkStatus>;
  dialog: "logout" | "delete" | null;
  dialogBusy: boolean;
  deleteError: boolean;
  toast: string;
};

const MOCK_NAME = "Ram Karki";
const MOCK_PHONE = "9812345678";
const MOCK_PHOTO = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&h=160&q=75";
const MAX_NAME = 50;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MOCK_DELAY = 1100;

const PROVIDERS: Record<Provider, { name: string; icon: string; account: string }> = {
  google: { name: "Google", icon: "/figma/profile/google.svg", account: "ram.karki@gmail.com" },
  apple: { name: "Apple", icon: "/figma/profile/apple.svg", account: "ram.karki@icloud.com" },
};

const INITIAL: ProfileState = {
  page: "ready",
  photo: "empty",
  photoUrl: null,
  photoError: "",
  name: MOCK_NAME,
  savedName: MOCK_NAME,
  nameError: "",
  save: "idle",
  links: { google: "idle", apple: "idle" },
  dialog: null,
  dialogBusy: false,
  deleteError: false,
  toast: "",
};

const SHOW_PREVIEW = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_PROFILE_PREVIEW === "1";

const PRESETS: { group: string; items: { label: string; patch: Partial<ProfileState> }[] }[] = [
  {
    group: "Page",
    items: [
      { label: "Default", patch: {} },
      { label: "Loading", patch: { page: "loading" } },
      { label: "Couldn't load", patch: { page: "error" } },
      { label: "Signed out", patch: { page: "signed-out" } },
    ],
  },
  {
    group: "Profile photo",
    items: [
      { label: "Photo — uploading", patch: { photo: "uploading" } },
      { label: "Photo — uploaded", patch: { photo: "uploaded", photoUrl: MOCK_PHOTO } },
      { label: "Photo — removing", patch: { photo: "removing", photoUrl: MOCK_PHOTO } },
      { label: "Photo — file too large", patch: { photo: "error", photoError: "That image is larger than 5 MB. Choose a smaller one." } },
      { label: "Photo — wrong file type", patch: { photo: "error", photoError: "Use a JPG, PNG or WebP image." } },
      { label: "Photo — upload failed", patch: { photo: "error", photoError: "Couldn’t upload your photo. Try again." } },
    ],
  },
  {
    group: "Personal details",
    items: [
      { label: "Name — edited", patch: { name: "Ram Bahadur Karki" } },
      { label: "Name — empty error", patch: { name: "", nameError: "Enter your full name." } },
      { label: "Name — too long error", patch: { name: "Ram Bahadur Karki ".repeat(4).trim(), nameError: `Use ${MAX_NAME} characters or fewer.` } },
      { label: "Saving", patch: { name: "Ram Bahadur Karki", save: "saving" } },
      { label: "Saved", patch: { name: "Ram Bahadur Karki", savedName: "Ram Bahadur Karki", toast: "Profile updated" } },
      { label: "Save failed", patch: { name: "Ram Bahadur Karki", save: "failed" } },
    ],
  },
  {
    group: "Link account",
    items: [
      { label: "Google — connecting", patch: { links: { google: "connecting", apple: "idle" } } },
      { label: "Google — connected", patch: { links: { google: "connected", apple: "idle" } } },
      { label: "Google — couldn't connect", patch: { links: { google: "error", apple: "idle" } } },
      { label: "Apple — connected", patch: { links: { google: "idle", apple: "connected" } } },
      { label: "Both connected", patch: { links: { google: "connected", apple: "connected" } } },
      { label: "Google — disconnecting", patch: { links: { google: "disconnecting", apple: "connected" } } },
    ],
  },
  {
    group: "Account",
    items: [
      { label: "Log out — confirm", patch: { dialog: "logout" } },
      { label: "Log out — in progress", patch: { dialog: "logout", dialogBusy: true } },
      { label: "Delete account — confirm", patch: { dialog: "delete" } },
      { label: "Delete account — deleting", patch: { dialog: "delete", dialogBusy: true } },
      { label: "Delete account — failed", patch: { dialog: "delete", deleteError: true } },
    ],
  },
];

function validateName(value: string) {
  const name = value.trim();
  if (!name) return "Enter your full name.";
  if (name.length > MAX_NAME) return `Use ${MAX_NAME} characters or fewer.`;
  return "";
}

const Spinner = ({ size = 16 }: { size?: number }) => <LoaderCircle size={size} className={styles.spinner} aria-hidden="true" />;

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const id = useId();
  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className={styles.intro}>
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </section>
  );
}

/** Native <dialog>: focus trap, Escape and the backdrop come from the browser. */
function ConfirmDialog({
  open,
  busy,
  title,
  onClose,
  children,
}: {
  open: boolean;
  busy: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        // Escape must not dismiss the dialog halfway through the mock request.
        if (busy) event.preventDefault();
      }}
      onClick={(event) => {
        if (event.target === ref.current && !busy) onClose();
      }}
    >
      {open && (
        <div className={styles.dialogBody}>
          <h2 id={titleId}>{title}</h2>
          {children}
        </div>
      )}
    </dialog>
  );
}

function PreviewControl({ onPick }: { onPick: (patch: Partial<ProfileState>) => void }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("Default");
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
    <div className={`${previewStyles.root} ${styles.previewOffset}`} ref={root}>
      {open && (
        <div className={`${previewStyles.menu} ${styles.previewMenu}`} role="menu" aria-label="Profile page preview states">
          {PRESETS.map(({ group, items }) => (
            <div key={group} className={styles.previewGroup} role="group" aria-label={group}>
              <p className={styles.previewLabel}>{group}</p>
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitemradio"
                  aria-checked={item.label === current}
                  className={previewStyles.item}
                  onClick={() => {
                    onPick(item.patch);
                    setCurrent(item.label);
                    setOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      <button type="button" className={previewStyles.trigger} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        Preview profile <ChevronUp size={15} data-open={open} aria-hidden="true" />
      </button>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className={styles.settings} aria-busy="true" aria-label="Loading your profile">
      {[48, 168, 150, 44].map((height, index) => (
        <div key={index} className={styles.section}>
          <div className={styles.intro}>
            <span className={styles.bone} style={{ width: 140, height: 22 }} />
            <span className={styles.bone} style={{ width: 220, height: 16 }} />
          </div>
          <span className={`${styles.bone} ${styles.boneBlock}`} style={{ height }} />
        </div>
      ))}
    </div>
  );
}

export function ProfilePage() {
  const router = useRouter();
  const { userState } = useNavbarPreview();
  const [state, setState] = useState(INITIAL);
  const [deleteText, setDeleteText] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const objectUrl = useRef<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const nameId = useId();
  const phoneId = useId();

  const patch = (next: Partial<ProfileState>) => setState((current) => ({ ...current, ...next }));
  /** Stands in for a request: applies `next` after a short delay. */
  const later = (next: () => void) => {
    timers.current.push(setTimeout(next, MOCK_DELAY));
  };
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(
    () => () => {
      clearTimers();
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    [],
  );

  useEffect(() => {
    if (!state.toast) return;
    const timer = setTimeout(() => setState((current) => ({ ...current, toast: "" })), 2400);
    return () => clearTimeout(timer);
  }, [state.toast]);

  function applyPreset(next: Partial<ProfileState>) {
    clearTimers();
    setDeleteText("");
    if (next.page === "signed-out") navbarPreview.logOut();
    setState({ ...INITIAL, ...next });
  }

  // ---------- Profile photo ----------

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) return patch({ photo: "error", photoError: "Use a JPG, PNG or WebP image." });
    if (file.size > MAX_PHOTO_BYTES) return patch({ photo: "error", photoError: "That image is larger than 5 MB. Choose a smaller one." });

    const url = URL.createObjectURL(file);
    patch({ photo: "uploading", photoError: "" });
    later(() => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = url;
      patch({ photo: "uploaded", photoUrl: url, toast: "Profile photo updated" });
    });
  }

  function removePhoto() {
    patch({ photo: "removing" });
    later(() => patch({ photo: "empty", photoUrl: null, toast: "Profile photo removed" }));
  }

  // ---------- Personal details ----------

  const dirty = state.name.trim() !== state.savedName;
  const saving = state.save === "saving";

  function saveName(event: FormEvent) {
    event.preventDefault();
    if (saving || !dirty) return;
    const nameError = validateName(state.name);
    if (nameError) {
      patch({ nameError });
      nameInput.current?.focus();
      return;
    }
    const name = state.name.trim();
    patch({ save: "saving", nameError: "" });
    later(() => patch({ save: "idle", name, savedName: name, toast: "Profile updated" }));
  }

  // ---------- Link account ----------

  const setLink = (provider: Provider, status: LinkStatus) =>
    setState((current) => ({ ...current, links: { ...current.links, [provider]: status } }));

  function connect(provider: Provider) {
    setLink(provider, "connecting");
    later(() => {
      setLink(provider, "connected");
      patch({ toast: `${PROVIDERS[provider].name} connected` });
    });
  }

  function disconnect(provider: Provider) {
    setLink(provider, "disconnecting");
    later(() => {
      setLink(provider, "idle");
      patch({ toast: `${PROVIDERS[provider].name} disconnected` });
    });
  }

  // ---------- Account ----------

  function closeDialog() {
    setDeleteText("");
    patch({ dialog: null, dialogBusy: false, deleteError: false });
  }

  function confirmLeave() {
    patch({ dialogBusy: true, deleteError: false });
    later(() => {
      navbarPreview.logOut();
      router.push("/");
    });
  }

  const canDelete = deleteText.trim().toUpperCase() === "DELETE";

  let content: ReactNode;
  if (state.page === "loading") {
    content = <ProfileSkeleton />;
  } else if (state.page === "error") {
    content = (
      <div className={styles.message} role="alert">
        <span className={styles.messageIcon} data-tone="error">
          <CircleAlert size={22} aria-hidden="true" />
        </span>
        <h2>Couldn&rsquo;t load your profile</h2>
        <p>Check your connection and try again.</p>
        <button type="button" className={styles.primaryButton} onClick={() => patch({ page: "ready" })}>
          Try again
        </button>
      </div>
    );
  } else if (state.page === "signed-out" && userState !== "authenticated") {
    content = (
      <div className={styles.message}>
        <span className={styles.messageIcon}>
          <UserRound size={22} aria-hidden="true" />
        </span>
        <h2>Log in to see your profile</h2>
        <p>Your name, phone number and sign-in methods are kept here.</p>
        <button type="button" className={styles.primaryButton} onClick={navbarPreview.openAuth}>
          Log in
        </button>
      </div>
    );
  } else {
    const photoBusy = state.photo === "uploading" || state.photo === "removing";
    const hasPhoto = Boolean(state.photoUrl) && (state.photo === "uploaded" || state.photo === "removing");

    content = (
      <div className={styles.settings}>
        <Section title="Profile photo" description="Shown on your Briz account.">
          <div className={styles.photo}>
            <span className={styles.avatar} data-busy={photoBusy}>
              {hasPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element -- local object URL or a mock photo
                <img src={state.photoUrl ?? ""} alt="Your profile photo" />
              ) : (
                <Image src="/figma/profile/avatar-placeholder.png" width={48} height={48} alt="" />
              )}
              {photoBusy && (
                <span className={styles.avatarBusy}>
                  <Spinner size={18} />
                </span>
              )}
            </span>
            <div className={styles.photoControls}>
              <input
                ref={fileInput}
                type="file"
                accept={PHOTO_TYPES.join(",")}
                className={styles.srOnly}
                tabIndex={-1}
                aria-hidden="true"
                onChange={handleFile}
              />
              <div className={styles.photoActions} aria-live="polite">
                {state.photo === "uploading" ? (
                  <span className={styles.photoStatus}>Uploading…</span>
                ) : state.photo === "removing" ? (
                  <span className={styles.photoStatus}>Removing…</span>
                ) : (
                  <>
                    <button type="button" className={styles.linkButton} onClick={() => fileInput.current?.click()}>
                      {hasPhoto ? "Change image" : "Upload image"}
                    </button>
                    {hasPhoto && (
                      <button type="button" className={`${styles.linkButton} ${styles.linkMuted}`} onClick={removePhoto}>
                        Remove
                      </button>
                    )}
                  </>
                )}
              </div>
              {state.photo === "error" ? (
                <p className={styles.fieldError} role="alert">
                  {state.photoError}
                </p>
              ) : (
                <p className={styles.hint}>JPG, PNG or WebP, up to 5 MB.</p>
              )}
            </div>
          </div>
        </Section>

        <Section title="Personal details" description="Your name and verified phone number.">
          <form className={styles.form} onSubmit={saveName} noValidate>
            <div className={styles.field}>
              <label htmlFor={nameId}>
                Full name{" "}
                <span className={styles.required} aria-hidden="true">
                  *
                </span>
              </label>
              <input
                ref={nameInput}
                id={nameId}
                className={styles.input}
                value={state.name}
                autoComplete="name"
                required
                disabled={saving}
                aria-invalid={Boolean(state.nameError)}
                aria-describedby={state.nameError ? `${nameId}-error` : undefined}
                onChange={(event) =>
                  patch({
                    name: event.target.value,
                    // Once an error is showing, re-check on every keystroke so it clears as soon as it's fixed.
                    nameError: state.nameError ? validateName(event.target.value) : "",
                    save: "idle",
                  })
                }
                onBlur={() => dirty && patch({ nameError: validateName(state.name) })}
              />
              {state.nameError && (
                <p id={`${nameId}-error`} className={styles.fieldError} role="alert">
                  {state.nameError}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor={phoneId}>Phone number</label>
              <div className={`${styles.input} ${styles.inputLocked}`}>
                <input id={phoneId} value={`+977 ${MOCK_PHONE}`} readOnly aria-describedby={`${phoneId}-hint`} />
                <Image src="/figma/profile/check-circle.svg" width={16} height={16} alt="Verified" unoptimized />
              </div>
              <p id={`${phoneId}-hint`} className={styles.hint}>
                Phone number cannot be changed.
              </p>
            </div>

            {state.save === "failed" && (
              <p className={styles.alert} role="alert">
                <CircleAlert size={16} aria-hidden="true" />
                Couldn&rsquo;t save your changes. Try again.
              </p>
            )}

            <button type="submit" className={styles.primaryButton} disabled={!dirty || saving || Boolean(state.nameError)}>
              {saving && <Spinner />}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </Section>

        <Section title="Link account" description="Connect another sign-in method to your Briz account.">
          <ul className={styles.providers}>
            {(Object.keys(PROVIDERS) as Provider[]).map((provider) => {
              const { name, icon, account } = PROVIDERS[provider];
              const status = state.links[provider];
              const linked = status === "connected" || status === "disconnecting";
              const busy = status === "connecting" || status === "disconnecting";
              return (
                <li key={provider} className={styles.provider}>
                  <span className={styles.providerIcon}>
                    <Image src={icon} width={24} height={24} alt="" unoptimized />
                  </span>
                  <div className={styles.providerText}>
                    <p className={styles.providerName}>
                      {name}
                      {linked && <span className={styles.badge}>Connected</span>}
                    </p>
                    {status === "error" ? (
                      <p className={styles.fieldError} role="alert">
                        Couldn&rsquo;t connect {name}. Try again.
                      </p>
                    ) : (
                      <p className={styles.hint}>{linked ? account : `Sign in with your ${name} account`}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.outlineButton}
                    disabled={busy}
                    aria-label={`${linked ? "Disconnect" : "Connect"} ${name}`}
                    onClick={() => (linked ? disconnect(provider) : connect(provider))}
                  >
                    {busy && <Spinner size={14} />}
                    {status === "connecting"
                      ? "Connecting…"
                      : status === "disconnecting"
                      ? "Disconnecting…"
                      : status === "connected"
                      ? "Disconnect"
                      : status === "error"
                      ? "Try again"
                      : "Connect"}
                  </button>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section title="Account" description="Log out, or permanently delete your Briz account.">
          <div className={styles.accountActions}>
            <button type="button" className={styles.logoutButton} onClick={() => patch({ dialog: "logout" })}>
              <Image src="/figma/profile/logout.svg" width={20} height={20} alt="" unoptimized />
              Logout
            </button>
            <button type="button" className={styles.deleteButton} onClick={() => patch({ dialog: "delete" })}>
              <Image src="/figma/profile/trash.svg" width={20} height={20} alt="" unoptimized />
              Delete account
            </button>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.srOnly}>Profile</h1>
      {content}

      <ConfirmDialog open={state.dialog === "logout"} busy={state.dialogBusy} title="Log out of Briz?" onClose={closeDialog}>
        <p>You&rsquo;ll need your phone number to log back in.</p>
        <div className={styles.dialogActions}>
          <button type="button" className={styles.outlineButton} data-size="large" disabled={state.dialogBusy} onClick={closeDialog}>
            Cancel
          </button>
          <button type="button" className={styles.primaryButton} disabled={state.dialogBusy} onClick={confirmLeave}>
            {state.dialogBusy && <Spinner />}
            {state.dialogBusy ? "Logging out…" : "Log out"}
          </button>
        </div>
      </ConfirmDialog>

      <ConfirmDialog open={state.dialog === "delete"} busy={state.dialogBusy} title="Delete your Briz account?" onClose={closeDialog}>
        <p>
          This permanently deletes your profile, saved items, requests and order history. It can&rsquo;t be undone.
        </p>
        <label className={styles.confirmField}>
          Type DELETE to confirm
          <input
            className={styles.input}
            value={deleteText}
            disabled={state.dialogBusy}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            onChange={(event) => setDeleteText(event.target.value)}
          />
        </label>
        {state.deleteError && (
          <p className={styles.alert} role="alert">
            <CircleAlert size={16} aria-hidden="true" />
            Couldn&rsquo;t delete your account. Try again.
          </p>
        )}
        <div className={styles.dialogActions}>
          <button type="button" className={styles.outlineButton} data-size="large" disabled={state.dialogBusy} onClick={closeDialog}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.dangerButton}
            disabled={state.dialogBusy || (!canDelete && !state.deleteError)}
            onClick={confirmLeave}
          >
            {state.dialogBusy && <Spinner />}
            {state.dialogBusy ? "Deleting…" : "Delete account"}
          </button>
        </div>
      </ConfirmDialog>

      <div className={styles.toastRegion} aria-live="polite">
        {state.toast && (
          <span key={state.toast} className={styles.toast}>
            {state.toast}
          </span>
        )}
      </div>

      {SHOW_PREVIEW && <PreviewControl onPick={applyPreset} />}
    </main>
  );
}
