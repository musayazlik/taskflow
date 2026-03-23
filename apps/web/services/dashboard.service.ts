import { apiClient, buildApiQuery } from "@/lib/api";
import type { ApiResponse } from "./types";
import type {
  DashboardStatsFrontend as DashboardStats,
  RecentActivityFrontend as RecentActivity,
} from "@repo/types";

export const dashboardService = {
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data?: DashboardStats;
        error?: string;
        message?: string;
      }>("/api/dashboard/stats");

      if (!response.success) {
        return {
          success: false,
          error: "Request failed",
          message: response.message || "Failed to fetch dashboard stats",
        };
      }

      return {
        success: true,
        data: response.data as DashboardStats,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async getRecentActivity(
    limit?: number,
  ): Promise<ApiResponse<RecentActivity[]>> {
    try {
      const query = buildApiQuery({
        limit: limit?.toString(),
      });
      const response = await apiClient.get<{
        success: boolean;
        data?: RecentActivity[];
        error?: string;
        message?: string;
      }>(`/api/dashboard/activity${query}`);

      if (!response.success) {
        return {
          success: false,
          error: "Request failed",
          message: response.message || "Failed to fetch recent activity",
        };
      }

      return {
        success: true,
        data: response.data as RecentActivity[],
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },
};
