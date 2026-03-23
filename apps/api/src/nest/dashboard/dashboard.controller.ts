import { Controller, Get, Query, UseGuards } from "@nestjs/common";

import { successResponse } from "@api/lib/route-helpers";
import { PAGINATION } from "@api/constants";
import * as dashboardService from "@api/services/dashboard.service";

import { BetterAuthGuard } from "../auth/better-auth.guard";
import { AdminGuard } from "../auth/role.guards";
import { parseQueryInt } from "@api/lib/parse-query-int";

@Controller("/api/dashboard")
@UseGuards(BetterAuthGuard, AdminGuard)
export class DashboardController {
  @Get("/stats")
  async getStats() {
    const stats = await dashboardService.getDashboardStats();
    return successResponse(stats);
  }

  @Get("/activity")
  async getActivity(@Query("limit") limit?: string) {
    const parsedLimit = parseQueryInt(limit, PAGINATION.DEFAULT_LIMIT, {
      min: 1,
      max: 500,
    });
    const activity = await dashboardService.getRecentActivity(parsedLimit);
    return successResponse(activity);
  }
}

