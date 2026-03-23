import { apiClient } from "@/lib/api";
import { resolveApiBaseUrl, AUTH_ENDPOINTS } from "@repo/types";
import type { ApiResponse, AuthResponse, User } from "./types";

// Keep browser auth requests same-origin so session cookies are set on the frontend domain.
const API_BASE_URL = typeof window === "undefined" ? resolveApiBaseUrl() : "";

export const authService = {
  async register(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> {
    try {
      // better-auth uses /api/auth/sign-up/email
      const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.signUp}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.user) {
        return {
          success: true,
          data: {
            user: {
              id: result.user.id,
              email: result.user.email,
              name: result.user.name,
              role: result.user.role || "USER",
              image: result.user.image,
              emailVerified: result.user.emailVerified || false,
              emailVerifiedAt: (result.user as any).emailVerifiedAt || null,
              createdAt: result.user.createdAt
                ? typeof result.user.createdAt === "string"
                  ? result.user.createdAt
                  : new Date(result.user.createdAt).toISOString()
                : new Date().toISOString(),
              updatedAt: result.user.updatedAt
                ? typeof result.user.updatedAt === "string"
                  ? result.user.updatedAt
                  : new Date(result.user.updatedAt).toISOString()
                : new Date().toISOString(),
            } as any,
            session: result.session,
          },
        };
      }

      return {
        success: false,
        error: result.error,
        message: result.message || "Registration failed",
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> {
    try {
      // better-auth uses /api/auth/sign-in/email
      const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.signIn}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.user) {
        return {
          success: true,
          data: {
            user: {
              id: result.user.id,
              email: result.user.email,
              name: result.user.name,
              role: result.user.role || "USER",
              image: result.user.image,
              emailVerified: result.user.emailVerified || false,
              emailVerifiedAt: (result.user as any).emailVerifiedAt || null,
              createdAt: result.user.createdAt
                ? typeof result.user.createdAt === "string"
                  ? result.user.createdAt
                  : new Date(result.user.createdAt).toISOString()
                : new Date().toISOString(),
              updatedAt: result.user.updatedAt
                ? typeof result.user.updatedAt === "string"
                  ? result.user.updatedAt
                  : new Date(result.user.updatedAt).toISOString()
                : new Date().toISOString(),
            } as any,
            session: result.session,
          },
        };
      }

      return {
        success: false,
        error: result.error,
        message: result.message || "Login failed",
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async logout(): Promise<ApiResponse<void>> {
    try {
      await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.signOut}`, {
        method: "POST",
        credentials: "include",
      });

      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }

      return { success: true };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to logout",
      };
    }
  },

  async forgotPassword(
    email: string,
  ): Promise<ApiResponse<{ debug?: { token: string; email: string } }>> {
    try {
      const response = await apiClient.post<{
        success?: boolean;
        message?: string;
        error?: string;
        data?: { debug?: { token: string; email: string } };
      }>(AUTH_ENDPOINTS.forgotPassword, { email });

      if (response && typeof response === "object" && "error" in response && response.error) {
        return {
          success: false,
          error: "Request failed",
          message: response.message || String(response.error) || "Failed to send reset email",
        };
      }

      return {
        success: true,
        data: response?.data,
        message: response?.message,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to send reset email",
      };
    }
  },

  async resetPassword(data: {
    email: string;
    token: string;
    password: string;
  }): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<{
        success?: boolean;
        message?: string;
        error?: string;
      }>(AUTH_ENDPOINTS.resetPassword, {
        newPassword: data.password,
        token: data.token,
      });

      if (response && typeof response === "object" && "error" in response && response.error) {
        return {
          success: false,
          error: String(response.error) || "Request failed",
          message: "Failed to reset password",
        };
      }

      return {
        success: true,
        message: response?.message,
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to reset password",
      };
    }
  },

  async getSession(): Promise<ApiResponse<{ user: User }>> {
    try {
      const data = await apiClient.get<{
        user?: Record<string, unknown>;
        session?: unknown;
      }>(AUTH_ENDPOINTS.session);

      if (data?.user) {
        const u = data.user as {
          id: string;
          email: string;
          name: string;
          role?: string;
          image?: string | null;
          emailVerified?: boolean;
          emailVerifiedAt?: string | null;
          createdAt?: string | Date;
          updatedAt?: string | Date;
        };
        return {
          success: true,
          data: {
            user: {
              id: u.id,
              email: u.email,
              name: u.name,
              role: (u.role || "USER") as User["role"],
              image: u.image,
              emailVerified: u.emailVerified || false,
              emailVerifiedAt: u.emailVerifiedAt ?? null,
              createdAt: u.createdAt
                ? typeof u.createdAt === "string"
                  ? u.createdAt
                  : new Date(u.createdAt).toISOString()
                : new Date().toISOString(),
              updatedAt: u.updatedAt
                ? typeof u.updatedAt === "string"
                  ? u.updatedAt
                  : new Date(u.updatedAt).toISOString()
                : new Date().toISOString(),
            },
          },
        };
      }

      return {
        success: false,
        message: "No session",
      };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to get session",
      };
    }
  },
};
