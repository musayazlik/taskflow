import { apiClient } from "@/lib/api";
import type { ApiResponse } from "./types";
import type {
  ChatCompletionParams,
  ChatCompletionResponse,
  SEOGenerationParams,
  SEOResult,
  ContentGenerationParams,
  ContentResult,
  ImageGenerationParams,
  GeneratedImage,
  AIManagementRequest,
  AIManagementResponse,
} from "@repo/types";

export const aiService = {
  async chat(
    params: ChatCompletionParams,
  ): Promise<ApiResponse<ChatCompletionResponse>> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data?: ChatCompletionResponse;
        error?: string;
        message?: string;
      }>("/api/ai/chat", params);

      if (!response.success) {
        return {
          success: false,
          error: response.error || "CHAT_ERROR",
          message: response.message || "Failed to get AI response",
        };
      }

      return {
        success: true,
        data: response.data!,
      };
    } catch (error) {
      console.error("AI chat error:", error);
      return {
        success: false,
        error: "NETWORK_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to connect to server",
      };
    }
  },

  async generateSEO(
    params: SEOGenerationParams,
  ): Promise<ApiResponse<SEOResult>> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data?: SEOResult;
        error?: string;
        message?: string;
      }>("/api/ai/seo", params);

      if (!response.success) {
        return {
          success: false,
          error: response.error || "SEO_GENERATION_ERROR",
          message: response.message || "Failed to generate SEO content",
        };
      }

      return {
        success: true,
        data: response.data!,
      };
    } catch (error) {
      console.error("SEO generation error:", error);
      return {
        success: false,
        error: "NETWORK_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to connect to server",
      };
    }
  },

  async generateContent(
    params: ContentGenerationParams,
  ): Promise<ApiResponse<ContentResult>> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data?: ContentResult;
        error?: string;
        message?: string;
      }>("/api/ai/content", params);

      if (!response.success) {
        return {
          success: false,
          error: response.error || "CONTENT_GENERATION_ERROR",
          message: response.message || "Failed to generate content",
        };
      }

      return {
        success: true,
        data: response.data!,
      };
    } catch (error) {
      console.error("Content generation error:", error);
      return {
        success: false,
        error: "NETWORK_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to connect to server",
      };
    }
  },

  async generateImages(
    params: ImageGenerationParams,
  ): Promise<ApiResponse<GeneratedImage[]>> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data?: GeneratedImage[];
        error?: string;
        message?: string;
      }>("/api/ai/image", params);

      if (!response.success) {
        return {
          success: false,
          error: response.error || "IMAGE_GENERATION_ERROR",
          message: response.message || "Failed to generate images",
        };
      }

      return {
        success: true,
        data: response.data!,
      };
    } catch (error) {
      console.error("Image generation error:", error);
      return {
        success: false,
        error: "NETWORK_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to connect to server",
      };
    }
  },

  async listModels(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data?: any[];
        error?: string;
        message?: string;
      }>("/api/ai/models");

      if (!response.success) {
        return {
          success: false,
          error: response.error || "LIST_MODELS_ERROR",
          message: response.message || "Failed to list models",
        };
      }

      return {
        success: true,
        data: response.data!,
      };
    } catch (error) {
      console.error("List models error:", error);
      return {
        success: false,
        error: "NETWORK_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to connect to server",
      };
    }
  },

  async listImageModels(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data?: any[];
        error?: string;
        message?: string;
      }>("/api/ai/models/image");

      if (!response.success) {
        return {
          success: false,
          error: response.error || "LIST_IMAGE_MODELS_ERROR",
          message: response.message || "Failed to list image models",
        };
      }

      return {
        success: true,
        data: response.data!,
      };
    } catch (error) {
      console.error("List image models error:", error);
      return {
        success: false,
        error: "NETWORK_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to connect to server",
      };
    }
  },

  /**
   * Process AI request using standardized interface
   * This is the unified endpoint for AI operations with system prompts
   */
  async processRequest(
    params: AIManagementRequest,
  ): Promise<ApiResponse<AIManagementResponse>> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data?: AIManagementResponse;
        error?: string;
        message?: string;
      }>("/api/ai/process", params);

      if (!response.success) {
        return {
          success: false,
          error: response.error || "AI_PROCESS_ERROR",
          message: response.message || "Failed to process AI request",
        };
      }

      return {
        success: true,
        data: response.data!,
      };
    } catch (error) {
      console.error("AI process request error:", error);
      return {
        success: false,
        error: "NETWORK_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to connect to server",
      };
    }
  },
};
