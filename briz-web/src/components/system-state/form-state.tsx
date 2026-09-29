"use client";

import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import styles from "./form-state.module.css";

export interface FormSubmissionErrorProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
  isRetrying?: boolean;
}

export function FormSubmissionError({
  title = "Couldn't submit your request",
  description = "Your information is still here. Please try again.",
  onRetry,
  className = "",
  isRetrying = false,
}: FormSubmissionErrorProps) {
  return (
    <div className={`${styles.formErrorBanner} ${className}`} role="alert" aria-live="assertive">
      <div className={styles.errorIconWrapper}>
        <AlertCircle size={18} />
      </div>
      <div className={styles.errorContent}>
        <strong className={styles.errorTitle}>{title}</strong>
        <p className={styles.errorDescription}>{description}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          className={styles.retryBtn}
          onClick={onRetry}
          disabled={isRetrying}
          aria-label="Retry form submission"
        >
          {isRetrying ? "Retrying..." : "Try again"}
        </button>
      )}
    </div>
  );
}

export interface InlineFieldErrorProps {
  id?: string;
  message?: string;
  className?: string;
}

export function InlineFieldError({ id, message, className = "" }: InlineFieldErrorProps) {
  if (!message) return null;

  return (
    <div id={id} className={`${styles.inlineError} ${className}`} role="alert">
      <AlertCircle size={14} className={styles.inlineIcon} />
      <span>{message}</span>
    </div>
  );
}

export interface InlineFieldSuccessProps {
  id?: string;
  message?: string;
  className?: string;
}

export function InlineFieldSuccess({ id, message, className = "" }: InlineFieldSuccessProps) {
  if (!message) return null;

  return (
    <div id={id} className={`${styles.inlineSuccess} ${className}`} role="status">
      <CheckCircle2 size={14} className={styles.inlineIconSuccess} />
      <span>{message}</span>
    </div>
  );
}
