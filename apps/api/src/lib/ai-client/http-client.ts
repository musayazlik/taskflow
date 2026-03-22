/**
 * @fileoverview Generic `fetch` wrapper with timeout, retries on 5xx/429/408/network errors, and `AppError` mapping.
 * Intended for AI and other JSON HTTP APIs — not a full-featured HTTP client.
 * @module @api/lib/ai-client/http-client
 */

import { logger } from "@api/lib/logger";
import { AppError } from "@api/lib/errors";

/**
 * HTTP client configuration options
 */
export interface HttpClientConfig {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Delay between retries in milliseconds */
  retryDelay?: number;
  /** HTTP headers */
  headers?: Record<string, string>;
}

/**
 * Default HTTP client configuration
 */
const DEFAULT_CONFIG: Required<Omit<HttpClientConfig, "headers">> = {
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
};

/**
 * HTTP response wrapper
 */
export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown, status?: number): boolean {
  // Network errors are retryable
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true;
  }

  // 5xx errors are retryable (except 501, 505)
  if (status && status >= 500 && status !== 501 && status !== 505) {
    return true;
  }

  // 429 (Rate Limited) is retryable
  if (status === 429) {
    return true;
  }

  // 408 (Request Timeout) is retryable
  if (status === 408) {
    return true;
  }

  return false;
}

/**
 * Configurable HTTP client; default timeout **30s**, **3** retries, **1s** base delay.
 *
 * @remarks Use `get` / `post` / `put` / `delete` for JSON APIs; body is JSON-stringified for mutating methods.
 */
export class HttpClient {
  private config: Required<Omit<HttpClientConfig, "headers">> & {
    headers?: Record<string, string>;
  };

  constructor(config: HttpClientConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Execute HTTP request with retry logic
   * 
   * @param url - Request URL
   * @param options - Fetch options
   * @param attempt - Current retry attempt (internal use)
   * @returns HTTP response with parsed data
   * @throws AppError on failure after all retries
   */
  async request<T = unknown>(
    url: string,
    options: RequestInit = {},
    attempt: number = 1,
  ): Promise<HttpResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout,
    );

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.config.headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response body
      let data: T;
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text) as T;
        } catch {
          data = text as unknown as T;
        }
      }

      // Handle non-2xx responses
      if (!response.ok) {
        const errorMessage =
          (data as any)?.error?.message ||
          (data as any)?.message ||
          `HTTP ${response.status}: ${response.statusText}`;

        // Retry on retryable errors
        if (
          isRetryableError(new Error(errorMessage), response.status) &&
          attempt < this.config.maxRetries
        ) {
          logger.warn(
            {
              url,
              status: response.status,
              attempt,
              maxRetries: this.config.maxRetries,
            },
            "Retrying request after error",
          );

          await sleep(this.config.retryDelay * attempt);
          return this.request<T>(url, options, attempt + 1);
        }

        // Map HTTP status codes to error codes
        let errorCode = "HTTP_ERROR";
        if (response.status === 401) {
          errorCode = "UNAUTHORIZED";
        } else if (response.status === 403) {
          errorCode = "FORBIDDEN";
        } else if (response.status === 404) {
          errorCode = "NOT_FOUND";
        } else if (response.status === 429) {
          errorCode = "RATE_LIMITED";
        } else if (response.status >= 500) {
          errorCode = "SERVER_ERROR";
        }

        throw new AppError(
          errorCode,
          errorMessage,
          response.status,
          { url, response: data },
        );
      }

      return {
        data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (error instanceof Error && error.name === "AbortError") {
        if (attempt < this.config.maxRetries) {
          logger.warn(
            { url, attempt, maxRetries: this.config.maxRetries },
            "Request timeout, retrying",
          );

          await sleep(this.config.retryDelay * attempt);
          return this.request<T>(url, options, attempt + 1);
        }

        throw new AppError(
          "TIMEOUT_ERROR",
          `Request timeout after ${this.config.timeout}ms`,
          408,
          { url },
        );
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        if (attempt < this.config.maxRetries) {
          logger.warn(
            { url, attempt, maxRetries: this.config.maxRetries, error: error.message },
            "Network error, retrying",
          );

          await sleep(this.config.retryDelay * attempt);
          return this.request<T>(url, options, attempt + 1);
        }

        throw new AppError(
          "NETWORK_ERROR",
          `Network error: ${error.message}`,
          503,
          { url, originalError: error.message },
        );
      }

      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }

      // Unknown error
      logger.error(
        { url, attempt, error },
        "Unexpected error during HTTP request",
      );

      throw new AppError(
        "UNKNOWN_ERROR",
        error instanceof Error ? error.message : "Unknown error occurred",
        500,
        { url, originalError: error },
      );
    }
  }

  /**
   * Execute GET request
   */
  async get<T = unknown>(url: string): Promise<HttpResponse<T>> {
    return this.request<T>(url, { method: "GET" });
  }

  /**
   * Execute POST request
   */
  async post<T = unknown>(
    url: string,
    body?: unknown,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Execute PUT request
   */
  async put<T = unknown>(
    url: string,
    body?: unknown,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Execute DELETE request
   */
  async delete<T = unknown>(url: string): Promise<HttpResponse<T>> {
    return this.request<T>(url, { method: "DELETE" });
  }
}
