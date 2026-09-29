"use client";

import { SystemState } from "./system-state";
import type { SystemStateAction } from "./system-states-data";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: SystemStateAction;
  secondaryAction?: SystemStateAction;
  icon?: React.ReactNode;
  iconName?: string;
  eyebrow?: string;
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
  dataTestId?: string;
}

export function EmptyState({
  title,
  description,
  action,
  secondaryAction,
  icon,
  iconName = "Inbox",
  eyebrow,
  compact = true,
  className = "",
  children,
  dataTestId = "briz-empty-state",
}: EmptyStateProps) {
  return (
    <SystemState
      variant="neutral"
      icon={icon}
      iconName={iconName}
      eyebrow={eyebrow}
      title={title}
      description={description}
      primaryAction={action}
      secondaryAction={secondaryAction}
      compact={compact}
      className={className}
      dataTestId={dataTestId}
    >
      {children}
    </SystemState>
  );
}
