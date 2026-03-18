import { Elysia, t } from "elysia";
import * as dashboardService from "@api/services/dashboard.service";
import { requireAdmin, successResponse } from "@api/lib/route-helpers";
import {
  DashboardStatsSchema,
  RecentActivitySchema,
  ActivityQuerySchema,
} from "@repo/types";
import { PAGINATION } from "@api/constants";

export const dashboardRoutes = new Elysia({ prefix: "/dashboard" })
  .derive(async ({ request: { headers } }) => {
    const session = await requireAdmin(headers);
    return { user: session.user, session: session.session };
  })

  .get(
    "/stats",
    async () => {
      const stats = await dashboardService.getDashboardStats();
      return successResponse(stats);
    },
    {
      detail: {
        tags: ["Dashboard"],
        summary: "Get dashboard statistics",
        description: "Returns aggregated statistics for the admin dashboard",
      },
      response: t.Object({
        success: t.Boolean(),
        data: DashboardStatsSchema,
      }),
    },
  )

  .get(
    "/activity",
    async ({ query }) => {
      const limit = query.limit
        ? parseInt(query.limit)
        : PAGINATION.DEFAULT_LIMIT;
      const activity = await dashboardService.getRecentActivity(limit);
      return successResponse(activity);
    },
    {
      query: ActivityQuerySchema,
      detail: {
        tags: ["Dashboard"],
        summary: "Get recent activity",
        description: "Returns recent orders and user signups",
      },
      response: t.Object({
        success: t.Boolean(),
        data: RecentActivitySchema,
      }),
    },
  );
