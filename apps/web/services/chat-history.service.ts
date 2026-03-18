import { baseApi } from "@/lib/api";
import type { ApiResponse, PaginatedResponse } from "./types";
import type {
  ChatSessionFrontend as ChatSession,
  ChatSessionMessageFrontend as ChatSessionMessage,
  ChatSessionWithMessagesFrontend as ChatSessionWithMessages,
  CreateChatSessionRequest,
  UpdateChatSessionRequest,
  AddChatMessageRequest,
} from "@repo/types";

export const chatHistoryService = {
  // Get user's chat sessions
  async getChatSessions(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<ChatSession>>> {
    try {
      const { data, error } = await baseApi["chat-history"]["sessions"].get({
        query: {
          page: params?.page?.toString(),
          limit: params?.limit?.toString(),
          isActive: params?.isActive?.toString(),
        },
      });

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to fetch chat sessions",
        };
      }

      // API returns { success, data: sessions[], meta } - extract sessions
      const apiData = data as { data?: ChatSession[]; meta?: unknown };
      const sessions = apiData?.data ?? [];

      return {
        success: true,
        data: {
          data: sessions,
          meta: apiData?.meta ?? {
            page: 1,
            limit: 50,
            total: sessions.length,
            totalPages: 1,
          },
        } as PaginatedResponse<ChatSession>,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  // Get specific chat session with messages
  async getChatSessionById(
    id: string,
  ): Promise<ApiResponse<ChatSessionWithMessages>> {
    try {
      const { data, error } =
        await baseApi["chat-history"]["sessions"][id].get();

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to fetch chat session",
        };
      }

      return {
        success: true,
        data: (data as any).data as ChatSessionWithMessages,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  // Create new chat session
  async createChatSession(
    data: CreateChatSessionRequest,
  ): Promise<ApiResponse<ChatSession>> {
    try {
      const { data: responseData, error } =
        await baseApi["chat-history"]["sessions"].post(data);

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to create chat session",
        };
      }

      return {
        success: true,
        data: (responseData as any).data as ChatSession,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  // Update chat session
  async updateChatSession(
    id: string,
    data: UpdateChatSessionRequest,
  ): Promise<ApiResponse<ChatSession>> {
    try {
      const { data: responseData, error } =
        await baseApi["chat-history"]["sessions"][id].patch(data);

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to update chat session",
        };
      }

      return {
        success: true,
        data: (responseData as any).data as ChatSession,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  // Delete chat session
  async deleteChatSession(id: string): Promise<ApiResponse<void>> {
    try {
      const { data, error } =
        await baseApi["chat-history"]["sessions"][id].delete();

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to delete chat session",
        };
      }

      return {
        success: true,
        message: (data as any)?.message || "Chat session deleted successfully",
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  // Add message to chat session
  async addMessage(
    data: AddChatMessageRequest,
  ): Promise<ApiResponse<ChatSessionMessage>> {
    try {
      const { data: responseData, error } =
        await baseApi["chat-history"]["messages"].post(data);

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to add message",
        };
      }

      return {
        success: true,
        data: (responseData as any).data as ChatSessionMessage,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  // Get messages for a chat session
  async getChatMessages(
    sessionId: string,
  ): Promise<ApiResponse<ChatSessionMessage[]>> {
    try {
      const { data, error } =
        await baseApi["chat-history"]["sessions"][sessionId]["messages"].get();

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: String(error.value) || "Failed to fetch chat messages",
        };
      }

      return {
        success: true,
        data: (data as any).data as ChatSessionMessage[],
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
