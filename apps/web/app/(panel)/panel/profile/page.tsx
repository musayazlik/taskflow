import { Metadata } from "next";
import { getSession } from "@/lib/auth-actions";
import { ProfilePageClient } from "./components/profile-page-client";

// Force dynamic rendering because this page uses cookies
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Profile | TaskFlow Admin Panel",
  description:
    "Manage your personal information and avatar. Update your profile details, change your avatar, and view your account statistics.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfilePage() {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  return <ProfilePageClient user={session.user} />;
}
