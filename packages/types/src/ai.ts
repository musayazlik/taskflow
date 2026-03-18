// ============================================
// AI Service Types
// ============================================

// Multimodal content types for OpenRouter API
export interface TextContent {
  type: "text";
  text: string;
}

export interface ImageContent {
  type: "image_url";
  image_url: {
    url: string;
  };
}

export interface AudioContent {
  type: "audio_url";
  audio_url: {
    url: string;
  };
}

export type MultimodalContent = TextContent | ImageContent | AudioContent;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  // Support both string (text-only) and array (multimodal)
  content: string | MultimodalContent[];
}

export interface ChatCompletionParams {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  content: string;
  finishReason: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface SEOGenerationParams {
  model: string;
  topic: string;
  targetKeyword?: string;
  tone: string;
  language: string;
  creativity: number;
}

export interface SEOResult {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
}

export interface ContentGenerationParams {
  model: string;
  topic: string;
  keywords?: string;
  contentType: string;
  tone: string;
  language: string;
  targetLength: number;
  creativity: number;
}

export interface ContentResult {
  title: string;
  slug: string;
  content: string;
  outline: string[];
  wordCount: number;
}

export interface ImageGenerationParams {
  model: string;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: string;
  style: string;
  quality: number;
  count: number;
  baseImageUrl?: string; // For image-to-image generation
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
}

// ============================================
// AI Management Types
// ============================================

/**
 * AI Provider types supported by the AI Management module
 */
export type AIProvider = "openrouter" | "openai" | "anthropic" | "google";

/**
 * System prompt categories
 */
export enum SystemPromptCategory {
  TEXT_GENERATION = "TEXT_GENERATION",
  IMAGE_GENERATION = "IMAGE_GENERATION",
  SEO_OPTIMIZATION = "SEO_OPTIMIZATION",
  CODE_GENERATION = "CODE_GENERATION",
}

/**
 * AI Management request parameters
 */
export interface AIManagementRequest {
  /** User prompt/input - required */
  userPrompt: string;
  /** AI model name/identifier - required */
  aiModelName: string;
  /** AI provider name - required */
  aiProvider: AIProvider;
  /** Optional system prompt category */
  systemPromptCategory?: SystemPromptCategory;
  /** Optional system prompt type (defaults to "GENERAL") */
  systemPromptType?: string;
  /** Optional custom system prompt (overrides category/type) */
  customSystemPrompt?: string;
  /** Optional temperature (0-2, default: 0.7) */
  temperature?: number;
  /** Optional max tokens (default: 2048) */
  maxTokens?: number;
  /** Optional additional parameters */
  additionalParams?: Record<string, unknown>;
}

/**
 * Token usage information
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Standardized AI Management response
 */
export interface AIManagementResponse {
  /** Success status */
  success: boolean;
  /** AI-generated content/response */
  content?: string;
  /** Model used for generation */
  model: string;
  /** Provider used */
  provider: AIProvider;
  /** Token usage statistics */
  usage?: TokenUsage;
  /** Finish reason */
  finishReason?: string;
  /** Response ID */
  responseId?: string;
  /** Error code (if failed) */
  errorCode?: string;
  /** Error message (if failed) */
  errorMessage?: string;
  /** Additional error details (if failed) */
  errorDetails?: Record<string, unknown>;
  /** Timestamp of the response */
  timestamp: Date;
}

// ============================================
// Chat History Types
// ============================================

/**
 * Chat session represents a conversation thread
 */
export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  modelId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Frontend version of ChatSession with string dates
 */
export interface ChatSessionFrontend {
  id: string;
  userId: string;
  title: string;
  modelId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Individual message within a chat session
 */
export interface ChatSessionMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokensUsed?: number;
  createdAt: Date;
}

/**
 * Frontend version of ChatSessionMessage with string dates
 */
export interface ChatSessionMessageFrontend {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokensUsed?: number;
  createdAt: string;
}

/**
 * Create chat session request
 */
export interface CreateChatSessionRequest {
  title: string;
  modelId: string;
}

/**
 * Update chat session request
 */
export interface UpdateChatSessionRequest {
  title?: string;
  isActive?: boolean;
}

/**
 * Add message to chat session request
 */
export interface AddChatMessageRequest {
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokensUsed?: number;
}

/**
 * Chat session with messages
 */
export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatSessionMessage[];
}

/**
 * Frontend version of ChatSessionWithMessages
 */
export interface ChatSessionWithMessagesFrontend extends ChatSessionFrontend {
  messages: ChatSessionMessageFrontend[];
}

/**
 * Paginated chat sessions response
 */
export interface ChatSessionsPaginatedResponse {
  sessions: ChatSessionFrontend[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
