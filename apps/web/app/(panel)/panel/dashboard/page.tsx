import { Metadata } from "next";
import { getSession } from "@/lib/auth-actions";
import { DashboardHeader } from "./components/dashboard-header";
import { DashboardStats } from "./components/dashboard-stats";
import { AdminDashboard } from "./components/admin-dashboard";
import { UserDashboard } from "./components/user-dashboard";
import {
  PANEL_DASHBOARD_STATS,
  PANEL_RECENT_ACTIVITY,
  PANEL_TOP_PRODUCTS,
} from "@repo/types";

// Force dynamic rendering because this page uses cookies
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | TurboStack Admin Panel",
  description:
    "Manage your TurboStack dashboard. View analytics, manage users, products, and subscriptions. Get insights into your business performance.",
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
          topProducts={PANEL_TOP_PRODUCTS}
        />
      ) : (
        <UserDashboard />
      )}
    </div>
  );
}
