import type { ReactNode } from "react";

export type TimelineStepStatus = "completed" | "current" | "upcoming";

export interface TimelineStep {
  id: string | number;
  titleKey: "pickedUp" | "inTransit" | "delivered";
  date: string;
  time: string;
  status: TimelineStepStatus;
  icon?: ReactNode;
}

export interface CourierInfo {
  name: string;
  roleKey: string;
  avatar: string;
  phone?: string;
  onChat?: () => void;
  onCall?: () => void;
}

export interface TrackingDeliveryData {
  trackingId: string;
  statusKey: string;
  steps: TimelineStep[];
  courier: CourierInfo;
}

export interface TrackingMapProps {
  title?: string;
  subtitle?: string;
  mapUrl?: string;
  className?: string;
  onOptionsClick?: () => void;
}

export interface TrackingProgressProps {
  trackingId: string;
  statusKey?: string;
  statusLabel?: string;
  steps: TimelineStep[];
  className?: string;
}

export interface CourierCardProps {
  courier: CourierInfo;
  className?: string;
}

export interface DeliveryTrackerProps {
  data?: TrackingDeliveryData;
  className?: string;
  children?: ReactNode;
}
