import { baseApi } from "@/lib/api";
import type { ApiResponse, Order, Invoice } from "./types";

export const orderService = {
  async getOrders(params?: {
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<{ data: Order[]; pagination: any }>> {
    try {
      const { data, error } = await baseApi.orders.get({
        query: {
          limit: params?.limit?.toString(),
          page: params?.page?.toString(),
        },
      });

      if (error) {
        return {
          success: false,
          error: (error.value as any)?.error || "Failed to fetch orders",
          message: (error.value as any)?.message,
        };
      }

      const responseData = data as any;

      return {
        success: true,
        data: {
          data: responseData?.data || [],
          pagination: responseData?.pagination || {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
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

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await (baseApi.orders as any)[id].get();

      if (error) {
        return {
          success: false,
          error: (error.value as any)?.error || "Failed to fetch order",
          message: (error.value as any)?.message,
        };
      }

      return {
        success: true,
        data: (data as any).data as Order,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async getOrderInvoice(id: string): Promise<ApiResponse<Invoice>> {
    try {
      const { data, error } = await (baseApi.orders as any)[id].invoice.get();

      if (error) {
        return {
          success: false,
          error: (error.value as any)?.error || "Failed to fetch invoice",
          message: (error.value as any)?.message,
        };
      }

      return {
        success: true,
        data: (data as any).data as Invoice,
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
