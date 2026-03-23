import { Metadata } from "next";
import { getSession } from "@/lib/auth-actions";
import { DashboardHeader } from "./components/dashboard-header";
import { DashboardStats } from "./components/dashboard-stats";
import { AdminDashboard } from "./components/admin-dashboard";
import { UserDashboard } from "./components/user-dashboard";
import {
  PANEL_DASHBOARD_STATS,
  PANEL_RECENT_ACTIVITY,
} from "@repo/types";

// Force dynamic rendering because this page uses cookies
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | TaskFlow",
  description:
    "TaskFlow panel overview: users, tasks, and workspace activity.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const session = await getSession();

  const userRole =
    ((session?.user as { role?: string } | undefined)?.role as
      | "USER"
      | "ADMIN"
      | "SUPER_ADMIN") || "USER";

  return (
    <div className="space-y-8">
      <DashboardHeader />
      <DashboardStats stats={PANEL_DASHBOARD_STATS} userRole={userRole} />
      {userRole === "ADMIN" || userRole === "SUPER_ADMIN" ? (
        <AdminDashboard
          recentActivity={PANEL_RECENT_ACTIVITY}
        />
      ) : (
        <UserDashboard />
      )}
    </div>
  );
}
