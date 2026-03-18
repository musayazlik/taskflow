import { Static, Type as t } from "@sinclair/typebox";

export const DashboardStatsSchema = t.Object({
  totalUsers: t.Number(),
  totalProducts: t.Number(),
  totalOrders: t.Number(),
  totalRevenue: t.Number(),
  activeSubscriptions: t.Number(),
  newUsersThisMonth: t.Number(),
  revenueThisMonth: t.Number(),
});

export type DashboardStats = Static<typeof DashboardStatsSchema>;

export const RecentActivitySchema = t.Object({
  recentOrders: t.Array(
    t.Object({
      id: t.String(),
      amount: t.Number(),
      status: t.String(),
      createdAt: t.Date(),
      user: t.Object({
        name: t.Union([t.String(), t.Null()]),
        email: t.String(),
      }),
      product: t.Object({
        name: t.String(),
      }),
    }),
  ),
  recentUsers: t.Array(
    t.Object({
      id: t.String(),
      name: t.Union([t.String(), t.Null()]),
      email: t.String(),
      createdAt: t.Date(),
    }),
  ),
});

export type RecentActivity = Static<typeof RecentActivitySchema>;

export const ActivityQuerySchema = t.Object({
  limit: t.Optional(t.String()),
});

export type ActivityQuery = Static<typeof ActivityQuerySchema>;

// Frontend service types (simplified versions)
export interface DashboardStatsFrontend {
  totalRevenue: number;
  subscriptions: number;
  sales: number;
  activeUsers: number;
}

export interface RecentActivityFrontend {
  id: string;
  user: string;
  action: string;
  status: "success" | "warning" | "error" | "info";
  time: string;
}
