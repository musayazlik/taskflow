import { Metadata } from "next";
import { MessagesPageClient } from "./components/messages-page-client";

export const metadata: Metadata = {
  title: "Messages | TurboStack Admin Panel",
  description:
    "View and manage your messages. Read inbox messages, sent messages, and drafts. Search and filter your messages.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MessagesPage() {
  return <MessagesPageClient />;
}
