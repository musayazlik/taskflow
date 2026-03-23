import { apiClient, buildApiQuery } from "@/lib/api";
import type { ApiResponse, PaginatedResponse } from "./types";
import type {
  CreateAiModel,
  UpdateAiModel,
  AiModelFrontend as AiModel,
} from "@repo/types";

export const aiModelService = {
  async getAiModels(params?: {
    page?: number;
    limit?: number;
    activeOnly?: boolean;
    provider?: string;
  }): Promise<ApiResponse<PaginatedResponse<AiModel>>> {
    try {
      const query = buildApiQuery({
        page: params?.page?.toString(),
        limit: params?.limit?.toString(),
        activeOnly:
          params?.activeOnly !== undefined ? String(params.activeOnly) : undefined,
        provider: params?.provider,
      });

      const response = await apiClient.get<PaginatedResponse<AiModel>>(
        `/api/ai-models${query}`,
      );

      if (!response.success) {
        return {
          success: false,
          error: "Request failed",
          message: response.message || "Failed to fetch AI models",
        };
      }

      return {
        success: true,
        data: response,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async getAiModelById(id: string): Promise<ApiResponse<AiModel>> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data?: AiModel;
        error?: string;
        message?: string;
      }>(`/api/ai-models/${encodeURIComponent(id)}`);

      if (!response.success) {
        return {
          success: false,
          error: "Request failed",
          message: response.message || "Failed to fetch AI model",
        };
      }

      return {
        success: true,
        data: response.data as AiModel,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async createAiModel(modelData: CreateAiModel): Promise<ApiResponse<AiModel>> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data?: AiModel;
        error?: string;
        message?: string;
      }>("/api/ai-models", modelData);

      if (!response.success) {
        return {
          success: false,
          error: "Request failed",
          message: response.message || "Failed to create AI model",
        };
      }

      return {
        success: true,
        data: response.data as AiModel,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async updateAiModel(
    id: string,
    modelData: UpdateAiModel,
  ): Promise<ApiResponse<AiModel>> {
    try {
      const response = await apiClient.patch<{
        success: boolean;
        data?: AiModel;
        error?: string;
        message?: string;
      }>(`/api/ai-models/${encodeURIComponent(id)}`, modelData);

      if (!response.success) {
        return {
          success: false,
          error: "Request failed",
          message: response.message || "Failed to update AI model",
        };
      }

      return {
        success: true,
        data: response.data as AiModel,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async deleteAiModel(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/ai-models/${encodeURIComponent(id)}`);

      if (!response || !response.success) {
        return {
          success: false,
          error: "Request failed",
          message: response?.message || "Failed to delete AI model",
        };
      }

      return {
        success: true,
        message: response.message || "AI model deleted successfully",
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
