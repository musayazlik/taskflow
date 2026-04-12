import { apiClient } from "@/lib/api";
import type { ApiResponse } from "@repo/types";
import type { SystemInfo } from "@repo/types";

export const systemService = {
  async getSystemStats(): Promise<ApiResponse<SystemInfo>> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data?: SystemInfo;
        error?: string;
        message?: string;
      }>("/api/system/stats");

      if (!response.success) {
        return {
          success: false,
          error: "Request failed",
          message: response.message || "Failed to fetch system stats",
        };
      }

      if (response.data) {
        return {
          success: true,
          data: response.data,
        };
      }
      return {
        success: false,
        error: "Invalid response",
        message: "Invalid system stats response format",
      };
    } catch (err) {
      console.error("System stats error:", err);
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },
};
