"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  Clock,
  Mail,
  Phone,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { BrizFooter } from "@/components/briz-footer";
import { BrizHeader } from "@/components/briz-header";
import {
  IMAGE_ERROR,
  IMAGE_LIMIT_ERROR,
  MAX_IMAGES,
  MESSAGE_LIMIT,
  isValidImage,
  validateFeedback,
  type FeedbackField,
} from "./feedback-data";
import { useFeedbackDraft } from "./feedback-draft";
import { FeedbackTypeSelect } from "./feedback-type-select";
import { ImageAttachment, releasePreview } from "./image-attachment";
import { submitFeedback } from "./submit-feedback";
import styles from "./feedback.module.css";

type Status = "idle" | "submitting" | "failed" | "sent";

const FIELD_ORDER: FeedbackField[] = ["name", "phone", "type", "message"];
const FIELD_IDS: Record<FeedbackField, string> = {
  name: "feedback-name",
  phone: "feedback-phone",
  type: "feedback-type",
  message: "feedback-message",
};

function SuccessState() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);
  return (
    <div className={styles.success} role="status">
      <span className={styles.successIcon}>
        <Check size={28} strokeWidth={2.5} aria-hidden="true" />
      </span>
      <h2 ref={headingRef} tabIndex={-1} className={styles.successTitle}>
        Thanks for your feedback!
      </h2>
      <p className={styles.successBody}>
        We&rsquo;ve received your feedback. Your input helps us make Briz better
        for everyone.
      </p>
      <Link href="/" className={styles.submit}>
        Done
      </Link>
    </div>
  );
}

export function FeedbackPage() {
  const router = useRouter();
  const { values, update, clear } = useFeedbackDraft();
  const [touched, setTouched] = useState<
    Partial<Record<FeedbackField, boolean>>
  >({});
  const [images, setImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  // Guards against a second submit landing before the loading state renders.
  const inFlight = useRef(false);

  const errors = validateFeedback(values);
  const shown = (field: FeedbackField) =>
    touched[field] ? errors[field] : undefined;
  const touch = (field: FeedbackField) =>
    setTouched((current) => ({ ...current, [field]: true }));
  const describedBy = (field: FeedbackField) =>
    shown(field) ? `${FIELD_IDS[field]}-error` : undefined;

  const submitting = status === "submitting";
  const complete = Boolean(
    values.name.trim() && values.phone && values.type && values.message.trim(),
  );

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }

  function addImages(picked: File[]) {
    const valid = picked.filter(isValidImage);
    const room = MAX_IMAGES - images.length;
    setImages([...images, ...valid.slice(0, room)]);
    if (valid.length < picked.length) setImageError(IMAGE_ERROR);
    else if (valid.length > room) setImageError(IMAGE_LIMIT_ERROR);
    else setImageError("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (inFlight.current) return;

    const firstInvalid = FIELD_ORDER.find((field) => errors[field]);
    if (firstInvalid) {
      setTouched({ name: true, phone: true, type: true, message: true });
      const target = document.getElementById(FIELD_IDS[firstInvalid]);
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
      target?.focus({ preventScroll: true });
      return;
    }

    inFlight.current = true;
    setStatus("submitting");
    try {
      await submitFeedback({ ...values, images });
      clear();
      images.forEach(releasePreview);
      setStatus("sent");
      window.scrollTo({ top: 0 });
    } catch {
      // Everything the user entered stays in place for the retry.
      setStatus("failed");
    } finally {
      inFlight.current = false;
    }
  }

  return (
    <div className={styles.shell}>
      <div className={styles.webOnly}>
        <BrizHeader />
      </div>

      <header className={styles.appBar}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Go back"
          onClick={goBack}
        >
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
        <span className={styles.appBarTitle}>Send us feedback</span>
      </header>

      <main className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Send us feedback</p>
          <h1>Help us make Briz better</h1>
          <p>
            Found something we can improve? Share your feedback, ideas, or
            issues with us.
          </p>
        </div>

        <div className={styles.card}>
          {status === "sent" ? (
            <SuccessState />
          ) : (
            <form
              className={styles.form}
              onSubmit={handleSubmit}
              noValidate
              aria-busy={submitting}
            >
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor={FIELD_IDS.name}>
                    Full name{" "}
                    <span className={styles.required} aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id={FIELD_IDS.name}
                    className={styles.control}
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={values.name}
                    required
                    disabled={submitting}
                    aria-invalid={Boolean(shown("name"))}
                    aria-describedby={describedBy("name")}
                    onChange={(event) => update({ name: event.target.value })}
                    onBlur={() => touch("name")}
                  />
                  {shown("name") && (
                    <p className={styles.error} id={`${FIELD_IDS.name}-error`}>
                      {shown("name")}
                    </p>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor={FIELD_IDS.phone}>
                    Phone number{" "}
                    <span className={styles.required} aria-hidden="true">
                      *
                    </span>
                  </label>
                  <div
                    className={styles.phone}
                    data-invalid={Boolean(shown("phone"))}
                    data-disabled={submitting}
                  >
                    <span className={styles.phonePrefix} aria-hidden="true">
                      +977
                    </span>
                    <input
                      id={FIELD_IDS.phone}
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="98XXXXXXXX"
                      maxLength={10}
                      value={values.phone}
                      required
                      disabled={submitting}
                      aria-invalid={Boolean(shown("phone"))}
                      aria-describedby={describedBy("phone")}
                      onChange={(event) =>
                        update({
                          phone: event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10),
                        })
                      }
                      onBlur={() => touch("phone")}
                    />
                  </div>
                  {shown("phone") && (
                    <p className={styles.error} id={`${FIELD_IDS.phone}-error`}>
                      {shown("phone")}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor={FIELD_IDS.type}>
                  Feedback type{" "}
                  <span className={styles.required} aria-hidden="true">
                    *
                  </span>
                </label>
                <FeedbackTypeSelect
                  id={FIELD_IDS.type}
                  value={values.type}
                  invalid={Boolean(shown("type"))}
                  describedBy={describedBy("type")}
                  disabled={submitting}
                  onChange={(type) => update({ type })}
                  onClose={() => touch("type")}
                />
                {shown("type") && (
                  <p className={styles.error} id={`${FIELD_IDS.type}-error`}>
                    {shown("type")}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor={FIELD_IDS.message}>
                  Your feedback{" "}
                  <span className={styles.required} aria-hidden="true">
                    *
                  </span>
                </label>
                <div className={styles.textareaWrap}>
                  <textarea
                    id={FIELD_IDS.message}
                    className={`${styles.control} ${styles.textarea}`}
                    rows={6}
                    maxLength={MESSAGE_LIMIT}
                    placeholder="Tell us what happened, what you’d like to see, or how we can improve."
                    value={values.message}
                    required
                    disabled={submitting}
                    aria-invalid={Boolean(shown("message"))}
                    aria-describedby={describedBy("message")}
                    onChange={(event) =>
                      update({ message: event.target.value })
                    }
                    onBlur={() => touch("message")}
                  />
                  <span className={styles.counter} aria-hidden="true">
                    {values.message.length}/{MESSAGE_LIMIT}
                  </span>
                </div>
                {shown("message") && (
                  <p className={styles.error} id={`${FIELD_IDS.message}-error`}>
                    {shown("message")}
                  </p>
                )}
              </div>

              <ImageAttachment
                files={images}
                error={imageError}
                disabled={submitting}
                onAdd={addImages}
                onRemove={(index) => {
                  releasePreview(images[index]);
                  setImages(images.filter((_, position) => position !== index));
                  setImageError("");
                }}
              />

              <div className={styles.actions}>
                {status === "failed" && (
                  <div className={styles.banner} role="alert">
                    <CircleAlert size={18} aria-hidden="true" />
                    <span>
                      We couldn&rsquo;t send your feedback. Please try again.
                    </span>
                    <button type="submit" className={styles.textButton}>
                      Try again
                    </button>
                  </div>
                )}
                <button
                  type="submit"
                  className={styles.submit}
                  disabled={!complete || submitting}
                >
                  {submitting && (
                    <span className={styles.spinner} aria-hidden="true" />
                  )}
                  {submitting ? "Sending..." : "Send feedback"}
                </button>
              </div>
            </form>
          )}
        </div>

        <aside className={styles.contacts} aria-labelledby="feedback-contacts">
          <h2 id="feedback-contacts">Prefer to reach us directly?</h2>
          <ul>
            <li>
              <Mail size={18} aria-hidden="true" />
              <span>
                <span className={styles.contactLabel}>Email</span>
                <a href="mailto:support@briz.com">support@briz.com</a>
              </span>
            </li>
            <li>
              <Phone size={18} aria-hidden="true" />
              <span>
                <span className={styles.contactLabel}>Phone</span>
                <a href="tel:+9779812345678">+977 9812345678</a>
              </span>
            </li>
            <li>
              <Clock size={18} aria-hidden="true" />
              <span>
                <span className={styles.contactLabel}>Support hours</span>
                Sun–Fri, 10:00 AM – 5:00 PM
              </span>
            </li>
          </ul>
        </aside>
      </main>

      <div className={styles.webOnly}>
        <BrizFooter />
      </div>
    </div>
  );
}
