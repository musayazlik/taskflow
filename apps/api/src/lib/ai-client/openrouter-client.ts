/**
 * OpenRouter API Client
 * 
 * Specialized HTTP client for OpenRouter AI API integration using @openrouter/sdk.
 * Handles authentication, request formatting, and response parsing.
 * 
 * @module ai-client/openrouter-client
 */

import { OpenRouter } from "@openrouter/sdk";
import { env } from "@api/lib/env";
import { AppError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";

/**
 * OpenRouter API message format
 */
export interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * OpenRouter chat completion request parameters
 */
export interface OpenRouterChatRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  [key: string]: unknown; // Allow additional parameters
}

/**
 * OpenRouter chat completion response
 */
export interface OpenRouterChatResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: {
    message: string;
    type: string;
    code?: string;
  };
}

/**
 * OpenRouter API Client Configuration
 */
export interface OpenRouterClientConfig {
  /** Custom API key (defaults to env.OPENROUTER_API_KEY) */
  apiKey?: string;
  /** HTTP Referer header */
  httpReferer?: string;
  /** X-Title header */
  xTitle?: string;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * OpenRouter API Client
 * 
 * Wrapper around @openrouter/sdk with additional error handling and logging.
 */
export class OpenRouterClient {
  private sdk: OpenRouter;
  private apiKey: string;

  constructor(config?: OpenRouterClientConfig) {
    this.apiKey = config?.apiKey || env.OPENROUTER_API_KEY || "";

    if (!this.apiKey) {
      logger.warn("OpenRouter API key is not configured");
    }

    // Initialize OpenRouter SDK
    // SDK only accepts apiKey in constructor, headers are set automatically
    this.sdk = new OpenRouter({
      apiKey: this.apiKey,
    });
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Send chat completion request to OpenRouter using SDK
   * 
   * @param params - Chat completion parameters
   * @returns Chat completion response
   * @throws AppError if API key is missing or request fails
   */
  async chatCompletion(
    params: OpenRouterChatRequest,
  ): Promise<OpenRouterChatResponse> {
    if (!this.isConfigured()) {
      throw new AppError(
        "OPENROUTER_NOT_CONFIGURED",
        "OpenRouter API key is not configured",
        500,
      );
    }

    // Validate required parameters
    if (!params.model || !params.messages || params.messages.length === 0) {
      throw new AppError(
        "INVALID_REQUEST",
        "Model and messages are required",
        400,
      );
    }

    try {
      logger.debug(
        {
          model: params.model,
          messageCount: params.messages.length,
          temperature: params.temperature,
          maxTokens: params.max_tokens,
        },
        "Sending chat completion request to OpenRouter via SDK",
      );

      // Use SDK's chat.send method
      // SDK uses camelCase (maxTokens) instead of snake_case (max_tokens)
      const requestParams: any = {
        model: params.model,
        messages: params.messages.map((msg) => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
        })),
        temperature: params.temperature ?? 0.7,
        maxTokens: params.max_tokens ?? 2048,
      };

      // Only add stream if explicitly set to true (SDK handles streaming differently)
      if (params.stream === true) {
        requestParams.stream = true;
      }

      // Include any additional parameters (convert snake_case to camelCase if needed)
      Object.entries(params).forEach(([key, value]) => {
        if (
          !["model", "messages", "temperature", "max_tokens", "stream"].includes(
            key,
          )
        ) {
          // Convert snake_case to camelCase for SDK compatibility
          const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
            letter.toUpperCase(),
          );
          requestParams[camelKey] = value;
        }
      });

      const response = await this.sdk.chat.send(requestParams);

      // SDK returns the response directly, convert to our format
      const responseData = response as unknown as OpenRouterChatResponse;

      // Check for API errors in response
      if (responseData.error) {
        throw new AppError(
          "OPENROUTER_API_ERROR",
          responseData.error.message || "OpenRouter API error",
          500,
          {
            errorType: responseData.error.type,
            errorCode: responseData.error.code,
          },
        );
      }

      // Validate response structure
      if (!responseData.choices || responseData.choices.length === 0) {
        throw new AppError(
          "OPENROUTER_ERROR",
          "No response choices returned from OpenRouter",
          500,
        );
      }

      logger.debug(
        {
          model: responseData.model,
          finishReason: responseData.choices[0]?.finish_reason,
          usage: responseData.usage,
        },
        "Chat completion request successful",
      );

      return responseData;
    } catch (error) {
      logger.error(
        {
          error,
          model: params.model,
          params: {
            messageCount: params.messages.length,
            temperature: params.temperature,
            maxTokens: params.max_tokens,
          },
        },
        "OpenRouter chat completion failed",
      );

      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }

      // Wrap SDK errors
      throw new AppError(
        "OPENROUTER_ERROR",
        error instanceof Error ? error.message : "Failed to get AI response",
        500,
        { originalError: error },
      );
    }
  }

  /**
   * List available models from OpenRouter using SDK
   * 
   * @returns Array of available models
   * @throws AppError if API key is missing or request fails
   */
  async listModels(): Promise<unknown[]> {
    if (!this.isConfigured()) {
      throw new AppError(
        "OPENROUTER_NOT_CONFIGURED",
        "OpenRouter API key is not configured",
        500,
      );
    }

    try {
      // Use SDK's models.list method
      const response = await this.sdk.models.list();

      // SDK returns models directly or in a data property
      return (response as any).data || response || [];
    } catch (error) {
      logger.error({ error }, "Failed to list OpenRouter models");

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        "OPENROUTER_ERROR",
        error instanceof Error ? error.message : "Failed to list models",
        500,
        { originalError: error },
      );
    }
  }
}
