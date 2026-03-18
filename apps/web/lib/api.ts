import { treaty } from "@elysiajs/eden";
import { resolveApiBaseUrl } from "@repo/types";

const API_BASE_URL = resolveApiBaseUrl();

// Eden Treaty client - type-safe API calls
// Note: App type is inferred at runtime, no build-time dependency on backend
export const api = treaty(API_BASE_URL, {
  fetch: {
    credentials: "include",
  },
});

// baseApi is typed as any to avoid build-time dependency on backend App type
// Runtime type safety is maintained by Eden Treaty
export const baseApi = api.api! as any;

// Traditional REST client wrapper for services that use standard HTTP methods
export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    // Always return JSON response (includes error responses)
    return response.json();
  },

  async post<T>(path: string, data?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    // Always return JSON response (includes error responses)
    return response.json();
  },

  async patch<T>(path: string, data?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    // Always return JSON response (includes error responses)
    return response.json();
  },

  async delete<T>(path: string): Promise<T | void> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    // DELETE might not return content
    const text = await response.text();
    return text ? JSON.parse(text) : undefined;
  },
};
