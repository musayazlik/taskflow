export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatSessionFrontend {
  id: string;
  userId: string;
  title: string;
  modelId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSessionMessageFrontend {
  id: string;
  sessionId: string;
  role: ChatMessageRole;
  content: string;
  tokensUsed?: number;
  createdAt: string;
}

export interface ChatSessionWithMessagesFrontend extends ChatSessionFrontend {
  messages: ChatSessionMessageFrontend[];
}

export interface CreateChatSessionRequest {
  title: string;
  modelId: string;
}

export interface UpdateChatSessionRequest {
  title?: string;
  isActive?: boolean;
}

export interface AddChatMessageRequest {
  sessionId: string;
  role: ChatMessageRole;
  content: string;
  tokensUsed?: number;
}
