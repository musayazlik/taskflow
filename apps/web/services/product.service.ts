import { baseApi } from "@/lib/api";
import type { ApiResponse, Product, PaginatedResponse } from "./types";

export const productService = {
  async getProducts(params?: {
    limit?: number;
    page?: number;
    isArchived?: boolean;
    includeArchived?: boolean;
    search?: string;
    status?: "all" | "active" | "archived";
  }): Promise<ApiResponse<PaginatedResponse<Product>>> {
    try {
      const { data, error } = await baseApi.products.get({
        query: {
          limit: params?.limit?.toString(),
          page: params?.page?.toString(),
          includeArchived: params?.includeArchived?.toString(),
          search: params?.search,
          status: params?.status,
        },
      });

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to fetch products",
        };
      }

      return {
        success: true,
        data: data as unknown as PaginatedResponse<Product>,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await baseApi.products({ id }).get();

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to fetch product",
        };
      }

      const response = data as unknown as { success: boolean; data: Product };
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

  async createProduct(body: {
    name: string;
    description?: string;
    isRecurring: boolean;
    prices?: any[];
    medias?: string[];
    metadata?: Record<string, string>;
    recurringInterval?: "day" | "week" | "month" | "year";
    recurringIntervalCount?: number;
    trialInterval?: "day" | "week" | "month" | "year";
    trialIntervalCount?: number;
    attachedCustomFields?: Array<{
      custom_field_id: string;
      required: boolean;
    }>;
  }): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await (baseApi.products.post as any)(body);

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to create product",
        };
      }

      const response = data as unknown as { success: boolean; data: Product };
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

  async updateProduct(
    id: string,
    body: Partial<{
      name: string;
      description: string;
      isRecurring: boolean;
      isArchived: boolean;
      medias?: string[];
    }>,
  ): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await baseApi.products({ id }).patch(body);

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to update product",
        };
      }

      const response = data as unknown as { success: boolean; data: Product };
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

  async archiveProduct(id: string): Promise<ApiResponse<void>> {
    try {
      const { data, error } = await baseApi.products({ id }).delete();

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to archive product",
        };
      }

      return {
        success: true,
        data: undefined,
        message: (data as { success: boolean; message?: string })?.message,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async syncProduct(id: string): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await baseApi.products({ id })["sync"].post();

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to sync product",
        };
      }

      const response = data as unknown as {
        success: boolean;
        data: Product;
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

  async importFromPolar(): Promise<
    ApiResponse<{
      imported: number;
      updated: number;
      skipped: number;
      products: { id: string; name: string; polarProductId: string }[];
    }>
  > {
    try {
      const { data, error } =
        await baseApi.products["import-from-polar"].post();

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to import from Polar",
        };
      }

      const response = data as {
        success: boolean;
        data: {
          imported: number;
          updated: number;
          skipped: number;
          products: { id: string; name: string; polarProductId: string }[];
        };
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

  async uploadMedia(file: File): Promise<ApiResponse<{ id: string }>> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Use fetch directly for FormData uploads
      const { resolveApiBaseUrl } = await import("@repo/types");
      const API_BASE_URL = resolveApiBaseUrl();
      const response = await fetch(
        `${API_BASE_URL}/api/products/upload-media`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          error: result.error || "Upload failed",
          message: result.message || "Failed to upload file",
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message || "File uploaded successfully",
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to upload file",
      };
    }
  },

  async getMediaInfo(fileIds: string[]): Promise<
    ApiResponse<
      Array<{
        id: string;
        publicUrl: string;
        name: string;
        mimeType: string;
        size: number;
      }>
    >
  > {
    try {
      const { data, error } = await baseApi.products["get-media-info"].post({
        fileIds,
      });

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to get media info",
        };
      }

      const response = data as {
        success: boolean;
        data: Array<{
          id: string;
          publicUrl: string;
          name: string;
          mimeType: string;
          size: number;
        }>;
      };
      return {
        success: true,
        data: response.data,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to get media info",
      };
    }
  },

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      const { data, error } = await baseApi.products({ id }).delete();

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to delete product",
        };
      }

      return {
        success: true,
        data: undefined,
        message: (data as { success: boolean; message?: string })?.message,
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
