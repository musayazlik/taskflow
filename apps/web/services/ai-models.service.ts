import { baseApi } from "@/lib/api";
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
      const { data, error } = await baseApi["ai-models"].get({
        query: {
          page: params?.page?.toString(),
          limit: params?.limit?.toString(),
          activeOnly: params?.activeOnly?.toString(),
          provider: params?.provider,
        },
      });

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to fetch AI models",
        };
      }

      return {
        success: true,
        data: (data as any).data as PaginatedResponse<AiModel>,
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
      const { data, error } = await baseApi["ai-models"][id].get();

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to fetch AI model",
        };
      }

      return {
        success: true,
        data: (data as any).data as AiModel,
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
      const { data, error } = await baseApi["ai-models"].post(modelData);

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to create AI model",
        };
      }

      return {
        success: true,
        data: (data as any).data as AiModel,
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
      const { data, error } = await baseApi["ai-models"][id].patch(
        modelData,
      );

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to update AI model",
        };
      }

      return {
        success: true,
        data: (data as any).data as AiModel,
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
      const { data, error } = await baseApi["ai-models"][id].delete();

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to delete AI model",
        };
      }

      return {
        success: true,
        message: (data as any)?.message || "AI model deleted successfully",
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
