import { resolveApiBaseUrl } from "@repo/types";

const API_BASE_URL = resolveApiBaseUrl();

/**
 * Build a query string from key-value pairs; omits undefined and empty string values.
 */
export function buildApiQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, value);
    }
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

/** REST client using fetch; use with NestJS `/api/*` routes. */
export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
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
    const text = await response.text();
    return text ? JSON.parse(text) : undefined;
  },
};
