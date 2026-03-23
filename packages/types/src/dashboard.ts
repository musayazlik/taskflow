import { Static, Type as t } from "@sinclair/typebox";

/** Admin dashboard: users + task counts (no commerce / billing fields) */
export const DashboardStatsSchema = t.Object({
  totalUsers: t.Number(),
  newUsersThisMonth: t.Number(),
  totalTasks: t.Number(),
  tasksTodo: t.Number(),
  tasksInProgress: t.Number(),
  tasksDone: t.Number(),
});

export type DashboardStats = Static<typeof DashboardStatsSchema>;

export const RecentActivitySchema = t.Object({
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

/** Frontend service shape (aligned with API `DashboardStats`) */
export interface DashboardStatsFrontend {
  totalUsers: number;
  newUsersThisMonth: number;
  totalTasks: number;
  tasksTodo: number;
  tasksInProgress: number;
  tasksDone: number;
}

export interface RecentActivityFrontend {
  id: string;
  user: string;
  action: string;
  status: "success" | "warning" | "error" | "info";
  time: string;
}
