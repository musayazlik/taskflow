import { Metadata } from "next";
import { SettingsPageClient } from "./components/settings-page-client";

export const metadata: Metadata = {
	title: "Settings | TurboStack Admin Panel",
	description:
		"Manage your application settings and preferences. Configure appearance, notifications, billing, API keys, and media upload settings.",
	robots: {
		index: false,
		follow: false,
	},
};

export default function SettingsPage() {
	return <SettingsPageClient />;
}
