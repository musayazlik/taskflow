import { Metadata } from "next";
import { UsagePageClient } from "./components/usage-page-client";

export const metadata: Metadata = {
	title: "Usage Statistics | TurboStack Admin Panel",
	description:
		"View your usage statistics including API calls, storage, features, and bandwidth. Monitor your limits and usage history.",
	robots: {
		index: false,
		follow: false,
	},
};

export default async function UsagePage() {
	return <UsagePageClient />;
}
