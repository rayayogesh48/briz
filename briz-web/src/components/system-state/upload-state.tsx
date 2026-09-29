"use client";

import React from "react";
import Image from "next/image";
import { ImageOff, RefreshCw, Trash2, X } from "lucide-react";
import styles from "./upload-state.module.css";

export type UploadErrorReason = "unsupported-format" | "file-too-large" | "network-failure";

export interface UploadStateProps {
  status: "uploading" | "error";
  fileName?: string;
  fileSizeText?: string;
  previewUrl?: string;
  progressPercent?: number; // 0-100 or undefined for indeterminate
  errorReason?: UploadErrorReason;
  errorMessage?: string;
  maxSizeBytes?: number;
  onRetry?: () => void;
  onRemove?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function UploadState({
  status,
  fileName = "image.jpg",
  fileSizeText = "1.8 MB",
  previewUrl,
  progressPercent,
  errorReason = "network-failure",
  errorMessage,
  maxSizeBytes = 5 * 1024 * 1024,
  onRetry,
  onRemove,
  onCancel,
  className = "",
}: UploadStateProps) {
  // Determine copy based on errorReason
  let title = "Couldn't upload this image";
  let description = "Check your connection and try again.";

  if (errorReason === "unsupported-format") {
    title = "This file type isn't supported";
    description = "Upload a JPG, PNG, or WebP image.";
  } else if (errorReason === "file-too-large") {
    const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
    title = "This image is too large";
    description = `Maximum file size is ${maxSizeMB}MB. Please choose a smaller photo.`;
  }

  if (errorMessage) {
    description = errorMessage;
  }

  if (status === "uploading") {
    const isIndeterminate = progressPercent === undefined;
    return (
      <div className={`${styles.uploadContainer} ${styles.uploading} ${className}`} role="status" aria-busy="true">
        <div className={styles.previewBox}>
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Uploading thumbnail"
              width={44}
              height={44}
              className={styles.thumbnail}
              unoptimized
            />
          ) : (
            <div className={styles.placeholderThumbnail} />
          )}
        </div>

        <div className={styles.uploadInfo}>
          <div className={styles.fileRow}>
            <span className={styles.fileName}>{fileName}</span>
            <span className={styles.fileSize}>
              {isIndeterminate ? "Uploading..." : `${Math.round(progressPercent)}%`}
            </span>
          </div>

          <div className={styles.progressBarBg} aria-hidden="true">
            <div
              className={`${styles.progressBarFill} ${isIndeterminate ? styles.indeterminate : ""}`}
              style={!isIndeterminate ? { width: `${Math.min(100, Math.max(0, progressPercent))}%` } : undefined}
            />
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            className={styles.iconButton}
            onClick={onCancel}
            aria-label="Cancel image upload"
            title="Cancel"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }

  // Error state
  return (
    <div className={`${styles.uploadContainer} ${styles.error} ${className}`} role="alert">
      <div className={styles.errorIcon}>
        <ImageOff size={20} />
      </div>

      <div className={styles.uploadInfo}>
        <div className={styles.fileRow}>
          <strong className={styles.errorTitle}>{title}</strong>
          {fileSizeText && <span className={styles.fileSize}>{fileSizeText}</span>}
        </div>
        <p className={styles.errorDescription}>{description}</p>
      </div>

      <div className={styles.errorActions}>
        {onRetry && (
          <button
            type="button"
            className={styles.retryButton}
            onClick={onRetry}
            aria-label="Try uploading again"
          >
            <RefreshCw size={13} />
            <span>Try again</span>
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            className={styles.removeButton}
            onClick={onRemove}
            aria-label="Remove selected image"
          >
            <Trash2 size={13} />
            <span>Remove</span>
          </button>
        )}
      </div>
    </div>
  );
}
