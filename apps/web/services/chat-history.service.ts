/**
 * Browser-local chat session storage (replaces removed /api/chat-history backend).
 * Persists to localStorage under TASKFLOW_LOCAL_CHAT_KEY.
 */

import type { ApiResponse } from "./types";

type ChatSessionsListPayload = {
  data: ChatSession[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
import type {
  ChatSessionFrontend as ChatSession,
  ChatSessionMessageFrontend as ChatSessionMessage,
  ChatSessionWithMessagesFrontend as ChatSessionWithMessages,
  CreateChatSessionRequest,
  UpdateChatSessionRequest,
  AddChatMessageRequest,
} from "@repo/types";

const STORAGE_KEY = "taskflow-local-chat-sessions-v1";
const LOCAL_USER_ID = "local";

type PersistedState = {
  sessions: ChatSession[];
  messages: Record<string, ChatSessionMessage[]>;
};

function nowIso(): string {
  return new Date().toISOString();
}

function loadState(): PersistedState {
  if (typeof window === "undefined") {
    return { sessions: [], messages: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sessions: [], messages: {} };
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed.sessions || !parsed.messages) {
      return { sessions: [], messages: {} };
    }
    return parsed;
  } catch {
    return { sessions: [], messages: {} };
  }
}

function saveState(state: PersistedState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function touchSession(state: PersistedState, sessionId: string): void {
  const idx = state.sessions.findIndex((s) => s.id === sessionId);
  if (idx < 0) return;
  const prev = state.sessions[idx]!;
  const updated: ChatSession = {
    ...prev,
    updatedAt: nowIso(),
  };
  state.sessions.splice(idx, 1);
  state.sessions.unshift(updated);
}

export const chatHistoryService = {
  async getChatSessions(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<ApiResponse<ChatSessionsListPayload>> {
    const state = loadState();
    let list = [...state.sessions];
    if (params?.isActive !== undefined) {
      list = list.filter((s) => s.isActive === params.isActive);
    }
    list.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 50;
    const start = (page - 1) * limit;
    const slice = list.slice(start, start + limit);
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      success: true,
      data: {
        data: slice,
        meta: { page, limit, total, totalPages },
      },
    };
  },

  async getChatSessionById(
    id: string,
  ): Promise<ApiResponse<ChatSessionWithMessages>> {
    const state = loadState();
    const session = state.sessions.find((s) => s.id === id);
    if (!session) {
      return {
        success: false,
        error: "NOT_FOUND",
        message: "Chat session not found",
      };
    }
    const messages = [...(state.messages[id] ?? [])].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    return {
      success: true,
      data: { ...session, messages },
    };
  },

  async createChatSession(
    data: CreateChatSessionRequest,
  ): Promise<ApiResponse<ChatSession>> {
    const state = loadState();
    const id = crypto.randomUUID();
    const ts = nowIso();
    const session: ChatSession = {
      id,
      userId: LOCAL_USER_ID,
      title: data.title,
      modelId: data.modelId,
      isActive: true,
      createdAt: ts,
      updatedAt: ts,
    };
    state.sessions.unshift(session);
    state.messages[id] = [];
    saveState(state);
    return { success: true, data: session };
  },

  async updateChatSession(
    id: string,
    data: UpdateChatSessionRequest,
  ): Promise<ApiResponse<ChatSession>> {
    const state = loadState();
    const idx = state.sessions.findIndex((s) => s.id === id);
    if (idx < 0) {
      return {
        success: false,
        error: "NOT_FOUND",
        message: "Chat session not found",
      };
    }
    const prev = state.sessions[idx]!;
    const updated: ChatSession = {
      id: prev.id,
      userId: prev.userId,
      title: data.title !== undefined ? data.title : prev.title,
      modelId: prev.modelId,
      isActive: data.isActive !== undefined ? data.isActive : prev.isActive,
      createdAt: prev.createdAt,
      updatedAt: nowIso(),
    };
    state.sessions[idx] = updated;
    saveState(state);
    return { success: true, data: updated };
  },

  async deleteChatSession(id: string): Promise<ApiResponse<void>> {
    const state = loadState();
    state.sessions = state.sessions.filter((s) => s.id !== id);
    delete state.messages[id];
    saveState(state);
    return { success: true, message: "Chat session deleted successfully" };
  },

  async addMessage(
    data: AddChatMessageRequest,
  ): Promise<ApiResponse<ChatSessionMessage>> {
    const state = loadState();
    const session = state.sessions.find((s) => s.id === data.sessionId);
    if (!session) {
      return {
        success: false,
        error: "NOT_FOUND",
        message: "Chat session not found",
      };
    }
    const message: ChatSessionMessage = {
      id: crypto.randomUUID(),
      sessionId: data.sessionId,
      role: data.role,
      content: data.content,
      tokensUsed: data.tokensUsed,
      createdAt: nowIso(),
    };
    const list = state.messages[data.sessionId] ?? [];
    state.messages[data.sessionId] = [...list, message];
    touchSession(state, data.sessionId);
    saveState(state);
    return { success: true, data: message };
  },

  async getChatMessages(
    sessionId: string,
  ): Promise<ApiResponse<ChatSessionMessage[]>> {
    const state = loadState();
    const messages = [...(state.messages[sessionId] ?? [])].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    return { success: true, data: messages };
  },
};
