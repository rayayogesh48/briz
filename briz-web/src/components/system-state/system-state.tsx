"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileQuestion,
  FileX,
  FolderOpen,
  ImageOff,
  Inbox,
  Lock,
  PackageX,
  Search,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Timer,
  UploadCloud,
  WifiOff,
  Wrench,
} from "lucide-react";
import type { SystemStateAction, SystemStateVariant } from "./system-states-data";
import styles from "./system-state.module.css";

export interface SystemStateProps {
  variant?: SystemStateVariant;
  icon?: React.ReactNode;
  iconName?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  primaryAction?: SystemStateAction;
  secondaryAction?: SystemStateAction;
  compact?: boolean;
  fullPage?: boolean;
  minimalHeader?: boolean;
  isolated?: boolean;
  children?: React.ReactNode;
  className?: string;
  role?: "status" | "alert";
  headingLevel?: "h1" | "h2" | "h3";
  id?: string;
  dataTestId?: string;
}

export function renderDefaultIcon(variant: SystemStateVariant, iconName?: string, size = 26) {
  if (iconName) {
    switch (iconName) {
      case "FileQuestion":
        return <FileQuestion size={size} strokeWidth={2.2} />;
      case "AlertCircle":
        return <AlertCircle size={size} strokeWidth={2.2} />;
      case "WifiOff":
        return <WifiOff size={size} strokeWidth={2.2} />;
      case "Wrench":
        return <Wrench size={size} strokeWidth={2.2} />;
      case "Lock":
        return <Lock size={size} strokeWidth={2.2} />;
      case "Clock":
        return <Clock size={size} strokeWidth={2.2} />;
      case "Timer":
        return <Timer size={size} strokeWidth={2.2} />;
      case "PackageX":
        return <PackageX size={size} strokeWidth={2.2} />;
      case "Search":
        return <Search size={size} strokeWidth={2.2} />;
      case "FolderOpen":
        return <FolderOpen size={size} strokeWidth={2.2} />;
      case "Inbox":
        return <Inbox size={size} strokeWidth={2.2} />;
      case "FileX":
        return <FileX size={size} strokeWidth={2.2} />;
      case "ShoppingBag":
        return <ShoppingBag size={size} strokeWidth={2.2} />;
      case "Store":
        return <Store size={size} strokeWidth={2.2} />;
      case "UploadCloud":
        return <UploadCloud size={size} strokeWidth={2.2} />;
      case "ImageOff":
        return <ImageOff size={size} strokeWidth={2.2} />;
      case "Smartphone":
        return <Smartphone size={size} strokeWidth={2.2} />;
      case "Sparkles":
        return <Sparkles size={size} strokeWidth={2.2} />;
      case "CheckCircle2":
        return <CheckCircle2 size={size} strokeWidth={2.2} />;
      default:
        break;
    }
  }

  // Fallback by variant
  switch (variant) {
    case "error":
      return <AlertCircle size={size} strokeWidth={2.2} />;
    case "warning":
      return <AlertTriangle size={size} strokeWidth={2.2} />;
    case "success":
      return <CheckCircle2 size={size} strokeWidth={2.2} />;
    case "info":
      return <AlertCircle size={size} strokeWidth={2.2} />;
    case "neutral":
    default:
      return <PackageX size={size} strokeWidth={2.2} />;
  }
}

export function SystemState({
  variant = "neutral",
  icon,
  iconName,
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  compact = false,
  fullPage = false,
  minimalHeader = false,
  isolated = false,
  children,
  className = "",
  role,
  headingLevel,
  id,
  dataTestId,
}: SystemStateProps) {
  const shouldReduceMotion = useReducedMotion();

  // Pick semantic heading element
  const HeadingTag = headingLevel || (fullPage ? "h1" : "h2");

  // Determine accessibility role
  const computedRole =
    role || (variant === "error" ? "alert" : variant === "info" || variant === "warning" ? "status" : undefined);

  // Render action button or link
  const renderAction = (action?: SystemStateAction, isPrimary = true) => {
    if (!action) return null;

    const actionVariant = action.variant || (isPrimary ? "primary" : "secondary");
    const buttonClass = `${styles.button} ${styles[`button-${actionVariant}`]}`;

    if (action.href) {
      return (
        <Link
          href={action.href}
          className={buttonClass}
          onClick={action.onClick}
          aria-disabled={action.disabled || action.loading}
        >
          {action.loading && <span className={styles.spinner} role="status" aria-label="Loading" />}
          <span>{action.label}</span>
        </Link>
      );
    }

    return (
      <button
        type="button"
        className={buttonClass}
        onClick={action.onClick}
        disabled={action.disabled || action.loading}
      >
        {action.loading && <span className={styles.spinner} role="status" aria-label="Loading" />}
        <span>{action.label}</span>
      </button>
    );
  };

  const content = (
    <motion.div
      className={styles.contentCard}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Icon Badge */}
      <div
        className={`${styles.iconBadge} ${styles[`variant-${variant}`]}`}
        aria-hidden="true"
      >
        {icon || renderDefaultIcon(variant, iconName, compact ? 22 : 26)}
      </div>

      {/* Eyebrow */}
      {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}

      {/* Title */}
      <HeadingTag className={styles.title}>{title}</HeadingTag>

      {/* Description */}
      {description && <p className={styles.description}>{description}</p>}

      {/* Supporting / Contextual Child Content */}
      {children && <div className={styles.childrenWrapper}>{children}</div>}

      {/* Primary & Secondary Actions */}
      {(primaryAction || secondaryAction) && (
        <div className={styles.actionsRow}>
          {renderAction(secondaryAction, false)}
          {renderAction(primaryAction, true)}
        </div>
      )}
    </motion.div>
  );

  const wrapperClass = [
    styles.stateWrapper,
    fullPage ? (isolated ? styles.fullPageIsolated : styles.fullPage) : styles.compact,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      id={id}
      data-testid={dataTestId || (compact ? "system-state-compact" : "system-state-fullpage")}
      className={wrapperClass}
      role={computedRole}
      aria-live={computedRole ? "polite" : undefined}
    >
      {minimalHeader && (
        <header className={styles.minimalHeader}>
          <Link href="/" className={styles.logoLink} aria-label="Briz home">
            <Image src="/figma/logo.svg" alt="Briz" width={64} height={28} unoptimized priority />
          </Link>
        </header>
      )}
      {content}
    </section>
  );
}
