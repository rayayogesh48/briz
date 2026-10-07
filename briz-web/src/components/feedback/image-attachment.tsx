"use client";

import { ImagePlus, X } from "lucide-react";
import { useRef } from "react";
import { MAX_IMAGES, formatFileSize } from "./feedback-data";
import styles from "./feedback.module.css";

type Props = {
  files: File[];
  error?: string;
  disabled?: boolean;
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
};

// Preview URLs are cached per File and released explicitly: revoking them in an
// effect cleanup breaks previews under StrictMode's mount/unmount/mount cycle.
const previewUrls = new WeakMap<File, string>();

function previewUrlFor(file: File) {
  let url = previewUrls.get(file);
  if (!url) {
    url = URL.createObjectURL(file);
    previewUrls.set(file, url);
  }
  return url;
}

export function releasePreview(file: File) {
  const url = previewUrls.get(file);
  if (url) URL.revokeObjectURL(url);
  previewUrls.delete(file);
}

function Thumb({ file, disabled, onRemove }: { file: File; disabled?: boolean; onRemove: () => void }) {
  const previewUrl = previewUrlFor(file);

  return (
    <li className={styles.thumb}>
      {/* Local object URL preview — next/image can't optimise blob URLs. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={previewUrl} alt={`Attached image ${file.name}`} title={`${file.name} · ${formatFileSize(file.size)}`} />
      <button
        type="button"
        className={styles.thumbRemove}
        aria-label={`Remove ${file.name}`}
        disabled={disabled}
        onClick={onRemove}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </li>
  );
}

export function ImageAttachment({ files, error, disabled, onAdd, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const choose = () => inputRef.current?.click();
  const describedBy = error ? "feedback-image-error" : "feedback-image-hint";

  return (
    <div className={styles.field}>
      <p className={styles.label}>
        Attach images <span className={styles.optional}>Optional</span>
      </p>
      <p className={styles.hint} id="feedback-image-hint">
        Add up to {MAX_IMAGES} screenshots or photos if they help explain your feedback.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className={styles.srOnly}
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const picked = Array.from(event.target.files ?? []);
          if (picked.length) onAdd(picked);
          event.target.value = "";
        }}
      />

      {files.length === 0 ? (
        <button
          type="button"
          className={styles.upload}
          onClick={choose}
          disabled={disabled}
          aria-describedby={describedBy}
          data-invalid={Boolean(error)}
        >
          <span className={styles.uploadIcon}>
            <ImagePlus size={20} aria-hidden="true" />
          </span>
          <span className={styles.uploadText}>
            <strong>Add images</strong>
            <span>JPG, PNG • Max 5 MB each</span>
          </span>
        </button>
      ) : (
        <ul className={styles.thumbs}>
          {files.map((file, index) => (
            <Thumb
              key={`${file.name}-${file.size}-${file.lastModified}`}
              file={file}
              disabled={disabled}
              onRemove={() => onRemove(index)}
            />
          ))}
          {files.length < MAX_IMAGES && (
            <li>
              <button
                type="button"
                className={styles.thumbAdd}
                onClick={choose}
                disabled={disabled}
                aria-describedby={describedBy}
              >
                <ImagePlus size={20} aria-hidden="true" />
                <span>
                  Add <span className={styles.srOnly}>image, </span>
                  {files.length}/{MAX_IMAGES}
                </span>
              </button>
            </li>
          )}
        </ul>
      )}

      {error && (
        <p className={styles.error} id="feedback-image-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
