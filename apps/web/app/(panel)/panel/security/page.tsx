import { Metadata } from "next";
import { SecurityPageClient } from "./components/security-page-client";

export const metadata: Metadata = {
	title: "Security | TurboStack Admin Panel",
	description:
		"Monitor security events and manage access. View active sessions, security alerts, and audit logs. Configure security settings.",
	robots: {
		index: false,
		follow: false,
	},
};

export default function SecurityPage() {
	return <SecurityPageClient />;
}
