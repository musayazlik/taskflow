import { apiClient } from "@/lib/api";
import type { ApiResponse } from "@repo/types";

type NotificationsListApiResponse = {
  success: boolean;
  data?: { notifications?: Array<unknown> };
  message?: string;
  error?: string;
};

export const notificationService = {
  async getNotifications(): Promise<ApiResponse<NotificationsListApiResponse>> {
    try {
      const response =
        await apiClient.get<NotificationsListApiResponse>("/api/notifications");

      if (!response?.success) {
        return {
          success: false,
          error: response?.error || "Request failed",
          message: response?.message || "Failed to load notifications",
        };
      }

      return { success: true, data: response };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async markAsRead(notificationId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.patch<{
        success: boolean;
        message?: string;
        error?: string;
      }>(
        `/api/notifications/${encodeURIComponent(notificationId)}/read`,
        undefined,
      );

      if (!response?.success) {
        return {
          success: false,
          error: response?.error || "Request failed",
          message: response?.message || "Failed to mark as read",
        };
      }

      return { success: true, data: undefined, message: response.message };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async markManyAsRead(notificationIds: string[]): Promise<ApiResponse<void>> {
    try {
      await Promise.all(notificationIds.map((id) => this.markAsRead(id)));
      return { success: true, data: undefined };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },
};
