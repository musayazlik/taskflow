import { baseApi } from "@/lib/api";
import { resolveApiBaseUrl, AUTH_ENDPOINTS } from "@repo/types";
import type { ApiResponse, AuthResponse, User } from "./types";

const API_BASE_URL = resolveApiBaseUrl();

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
      const { data, error } = await baseApi.auth["forgot-password"].post({
        email,
      });

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message:
            (error.value as any)?.message || "Failed to send reset email",
        };
      }

      return {
        success: true,
        data: (data as any)?.data,
        message: (data as any)?.message,
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
      const { data: responseData, error } = await baseApi.auth[
        "reset-password"
      ].post({
        newPassword: data.password,
        token: data.token,
      });

      if (error) {
        return {
          success: false,
          error: (error.value as any)?.message || "Request failed",
          message: "Failed to reset password",
        };
      }

      return {
        success: true,
        message: (responseData as any)?.message,
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
      const { data, error } = await baseApi.auth["get-session"].get();

      if (error) {
        return {
          success: false,
          error: "Request failed",
          message: (error.value as any)?.message || "No session",
        };
      }

      if (data && (data as any).user) {
        const result = data as any;
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
