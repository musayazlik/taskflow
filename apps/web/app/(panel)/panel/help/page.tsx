import { Metadata } from "next";
import { HelpPageClient } from "./components/help-page-client";

export const metadata: Metadata = {
  title: "Help | TurboStack Admin Panel",
  description: "Get help with your account and products.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HelpPage() {
  return <HelpPageClient />;
}
