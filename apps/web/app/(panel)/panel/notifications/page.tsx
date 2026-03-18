import { Metadata } from "next";
import { NotificationsPageClient } from "./components/notifications-page-client";

export const metadata: Metadata = {
  title: "Notifications | TurboStack Admin Panel",
  description:
    "Manage your notifications and preferences. View all notifications, filter by type, and customize your notification settings.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotificationsPage() {
  return <NotificationsPageClient />;
}
