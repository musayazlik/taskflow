import { baseApi } from "@/lib/api";
import type { ApiResponse, Subscription } from "./types";

export const subscriptionService = {
  async getSubscriptions(params?: {
    page?: number;
    limit?: number;
  }): Promise<
    ApiResponse<{
      data: Subscription[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>
  > {
    try {
      const { data, error } = await baseApi.subscriptions.me.get({
        query: {
          page: params?.page?.toString(),
          limit: params?.limit?.toString(),
        },
      });

      if (error) {
        return {
          success: false,
          error: error.status.toString() || "Failed to fetch subscriptions",
          message: error.value.message || "Failed to fetch subscriptions",
        };
      }

      const responseData = (data as any)?.data ?? data;
      const subscriptions = Array.isArray(responseData) ? responseData : [];
      const pagination = (data as any)?.pagination;

      return {
        success: true,
        data: {
          data: subscriptions as Subscription[],
          pagination,
        },
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async getSubscription(id: string): Promise<ApiResponse<Subscription>> {
    try {
      const { data, error } = await baseApi.subscriptions({ id }).get();

      if (error) {
        return {
          success: false,
          error: error.status.toString() || "Failed to fetch subscription",
          message: error.value.message || "Failed to fetch subscription",
        };
      }

      const response = data as { success: boolean; data: Subscription };
      return {
        success: true,
        data: response.data,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async cancelSubscription(
    id: string,
    immediate: boolean = false,
  ): Promise<ApiResponse<Subscription>> {
    try {
      const { data, error } = await (
        baseApi.subscriptions({ id }).cancel as any
      ).post({
        body: { immediate },
      });

      if (error) {
        const errorData = error.value as
          | { error?: string; message?: string }
          | string;
        return {
          success: false,
          error:
            (typeof errorData === "object" && errorData?.error) ||
            (typeof errorData === "string"
              ? errorData
              : "Failed to cancel subscription"),
          message:
            (typeof errorData === "object" && errorData?.message) ||
            "Failed to cancel subscription",
        };
      }

      const response = data as {
        success: boolean;
        data: Subscription;
        message?: string;
      };
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async reactivateSubscription(id: string): Promise<ApiResponse<Subscription>> {
    try {
      const { data, error } = await baseApi
        .subscriptions({ id })
        .reactivate.post();

      if (error) {
        const errorData = error.value as
          | { error?: string; message?: string }
          | string;
        return {
          success: false,
          error:
            (typeof errorData === "object" && errorData?.error) ||
            (typeof errorData === "string"
              ? errorData
              : "Failed to reactivate subscription"),
          message:
            (typeof errorData === "object" && errorData?.message) ||
            "Failed to reactivate subscription",
        };
      }

      const response = data as {
        success: boolean;
        data: Subscription;
        message?: string;
      };
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async getSubscriptionHistory(params?: {
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<Subscription[]>> {
    try {
      const { data, error } = await baseApi.subscriptions.me.history.get({
        query: {
          limit: params?.limit?.toString(),
          page: params?.page?.toString(),
        },
      });

      if (error) {
        const errorData = error.value as
          | { error?: string; message?: string }
          | string;
        return {
          success: false,
          error:
            (typeof errorData === "object" && errorData?.error) ||
            (typeof errorData === "string"
              ? errorData
              : "Failed to fetch history"),
          message:
            (typeof errorData === "object" && errorData?.message) ||
            "Failed to fetch history",
        };
      }

      // Backend returns { success: true, data: subscriptions }
      // Eden Treaty wraps it, so we need to access data.data
      const responseData = (data as any)?.data ?? data;
      const subscriptions = Array.isArray(responseData) ? responseData : [];

      return {
        success: true,
        data: subscriptions as Subscription[],
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async createCheckoutSession(
    priceId: string,
    successUrl: string,
  ): Promise<ApiResponse<{ id: string; url: string }>> {
    try {
      const { data, error } = await baseApi.subscriptions.checkout.post({
        priceId,
        successUrl,
      });

      if (error) {
        const errorData = error.value as
          | { error?: string; message?: string }
          | string;
        return {
          success: false,
          error:
            (typeof errorData === "object" && errorData?.error) ||
            (typeof errorData === "string"
              ? errorData
              : "Failed to create checkout session"),
          message:
            (typeof errorData === "object" && errorData?.message) ||
            "Failed to create checkout session",
        };
      }

      const response = data as {
        success: boolean;
        data: { id: string; url: string };
      };
      return {
        success: true,
        data: response.data,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async getPortalUrl(): Promise<ApiResponse<{ url: string }>> {
    try {
      const { data, error } = await baseApi.subscriptions.portal.get();

      if (error) {
        const errorData = error.value as
          | { error?: string; message?: string }
          | string;
        return {
          success: false,
          error:
            (typeof errorData === "object" && errorData?.error) ||
            (typeof errorData === "string"
              ? errorData
              : "Portal access failed"),
          message:
            (typeof errorData === "object" && errorData?.message) ||
            "Portal access failed",
        };
      }

      const response = data as { success: boolean; data: { url: string } };
      return {
        success: true,
        data: response.data,
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
