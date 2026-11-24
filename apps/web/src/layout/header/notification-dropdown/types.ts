export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type?: "info" | "warning" | "success" | "security";
  read?: boolean;
}
