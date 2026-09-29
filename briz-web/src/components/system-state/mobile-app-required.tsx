"use client";

import React from "react";
import { SystemState } from "./system-state";

export interface MobileAppRequiredProps {
  feature?: string;
  description?: string;
  className?: string;
  compact?: boolean;
}

export function MobileAppRequired({
  feature = "This feature",
  description,
  className = "",
  compact = true,
}: MobileAppRequiredProps) {
  const defaultDesc = description || `${feature} is available from the Briz mobile app on iOS and Android.`;

  return (
    <SystemState
      variant="info"
      iconName="Smartphone"
      eyebrow="Mobile App Only"
      title="Available on the Briz mobile app"
      description={defaultDesc}
      compact={compact}
      className={className}
      primaryAction={{
        label: "Download Briz App",
        href: "/#download",
        variant: "primary",
      }}
      secondaryAction={{
        label: "Learn more",
        href: "/",
        variant: "secondary",
      }}
    />
  );
}
