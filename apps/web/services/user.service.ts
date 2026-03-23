import { apiClient, buildApiQuery } from "@/lib/api";
import type {
	ApiResponse,
	User,
	PaginatedResponse,
	UserSettings,
	UserSettingsWithId,
} from "./types";

export const userService = {
	async getUsers(params?: {
		page?: number;
		limit?: number;
		search?: string;
		role?: string;
	}): Promise<ApiResponse<PaginatedResponse<User>>> {
		try {
			const query = buildApiQuery({
				page: params?.page?.toString(),
				limit: params?.limit?.toString(),
				search: params?.search,
				role: params?.role,
			});

			const response = await apiClient.get<PaginatedResponse<User>>(
				`/api/users${query}`,
			);

			if (!response.success) {
				return {
					success: false,
					error: "Request failed",
					message: response.message || "Failed to fetch users",
				};
			}

			return {
				success: true,
				data: response,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},

	async getUserById(id: string): Promise<ApiResponse<User>> {
		try {
			const response = await apiClient.get<{
				success: boolean;
				data?: User;
				error?: string;
				message?: string;
			}>(`/api/users/${encodeURIComponent(id)}`);

			if (!response.success) {
				return {
					success: false,
					error: "Request failed",
					message: response.message || "Failed to fetch user",
				};
			}

			return {
				success: true,
				data: response.data as User,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},

	async createUser(body: {
		name: string;
		email: string;
		role: "USER" | "ADMIN" | "SUPER_ADMIN";
		password: string;
	}): Promise<ApiResponse<User>> {
		try {
			const response = await apiClient.post<{
				success: boolean;
				data?: User;
				message?: string;
				error?: string;
			}>("/api/users/create", body);

			if (!response.success) {
				return {
					success: false,
					error: response.error || "Request failed",
					message: response.message || "Failed to create user",
				};
			}

			return {
				success: true,
				data: response.data as User,
				message: response.message,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},

	async generatePassword(): Promise<ApiResponse<{ password: string }>> {
		try {
			const response = await apiClient.get<{
				success: boolean;
				data?: { password: string };
				error?: string;
			}>("/api/users/generate-password");

			if (!response.success) {
				return {
					success: false,
					error: response.error || "Request failed",
					message: "Failed to generate password",
				};
			}

			return {
				success: true,
				data: response.data as { password: string },
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},

	async sendPasswordReset(userId: string): Promise<ApiResponse<void>> {
		try {
			const data = await apiClient.post<{
				success: boolean;
				message?: string;
				error?: string;
			}>(`/api/users/${encodeURIComponent(userId)}/send-password-reset`, {});

			if (!data.success) {
				return {
					success: false,
					error: data.error || "Request failed",
					message: data.message || "Failed to send password reset email",
				};
			}

			return {
				success: true,
				data: undefined,
				message: data.message || "Password reset email sent",
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},

	async verifyEmail(userId: string): Promise<ApiResponse<User>> {
		try {
			const data = await apiClient.post<{
				success: boolean;
				data?: User;
				message?: string;
				error?: string;
			}>(`/api/users/${encodeURIComponent(userId)}/verify-email`, {});

			if (!data.success) {
				return {
					success: false,
					error: data.error || "Request failed",
					message: data.message || "Failed to verify email",
				};
			}

			return {
				success: true,
				data: data.data as User,
				message: data.message,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},

	async unverifyEmail(userId: string): Promise<ApiResponse<User>> {
		try {
			const data = await apiClient.post<{
				success: boolean;
				data?: User;
				message?: string;
				error?: string;
			}>(`/api/users/${encodeURIComponent(userId)}/unverify-email`, {});

			if (!data.success) {
				return {
					success: false,
					error: data.error || "Request failed",
					message: data.message || "Failed to unverify email",
				};
			}

			return {
				success: true,
				data: data.data as User,
				message: data.message,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},

	async updateUser(
		id: string,
		body: Partial<{
			name: string;
			email: string;
			role: "USER" | "ADMIN";
		}>,
	): Promise<ApiResponse<User>> {
		try {
			const response = await apiClient.patch<{
				success: boolean;
				data?: User;
				message?: string;
				error?: string;
			}>(`/api/users/${id}`, body);

			if (!response.success) {
				return {
					success: false,
					error: response.error || "Request failed",
					message: response.message || "Failed to update user",
				};
			}

			return {
				success: true,
				data: response.data as User,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},

	async deleteUser(id: string): Promise<ApiResponse<void>> {
		try {
			const response = await apiClient.delete<{
				success: boolean;
				message?: string;
				error?: string;
			}>(`/api/users/${id}`);

			if (!response || !response.success) {
				return {
					success: false,
					error: response?.error || "Request failed",
					message: response?.message || "Failed to delete user",
				};
			}

			return {
				success: true,
				data: undefined,
				message: response.message,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},

	async getProfile(): Promise<ApiResponse<User>> {
		try {
			const response = await apiClient.get<{
				success: boolean;
				data?: User;
				error?: string;
				message?: string;
			}>("/api/profile");

			if (!response.success) {
				return {
					success: false,
					error: "Request failed",
					message: response.message || "Failed to get profile",
				};
			}

			return {
				success: true,
				data: response.data as User,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to get profile",
			};
		}
	},

	async updateProfile(body: {
		name?: string;
		email?: string;
		bio?: string | null;
		skills?: string[];
	}): Promise<ApiResponse<User>> {
		try {
			console.log("[updateProfile] Sending request with body:", body);

			const response = await apiClient.patch<{
				success: boolean;
				data?: User;
				message?: string;
				error?: string;
			}>("/api/profile", body);

			console.log("[updateProfile] Response:", response);

			if (!response.success) {
				return {
					success: false,
					error: response.error || "Request failed",
					message: response.message || "Failed to update profile",
				};
			}

			return {
				success: true,
				data: response.data as User,
			};
		} catch (err) {
			console.error("[updateProfile] Catch error:", err);
			return {
				success: false,
				error: "Network Error",
				message: "Failed to update profile",
			};
		}
	},

	async uploadAvatar(file: File): Promise<ApiResponse<{ url: string }>> {
		try {
			const formData = new FormData();
			formData.append("avatar", file);

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/avatar`, {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				return {
					success: false,
					error: result.error || "Upload failed",
					message: result.message || "Failed to upload avatar",
				};
			}

			return {
				success: true,
				data: result.data,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to upload avatar",
			};
		}
	},

	async deleteAvatar(): Promise<ApiResponse<void>> {
		try {
			const data = await apiClient.delete<{
				success: boolean;
				message?: string;
				error?: string;
			}>("/api/profile/avatar");

			if (!data || !data.success) {
				return {
					success: false,
					error: data?.error || "Request failed",
					message: data?.message || "Failed to delete avatar",
				};
			}

			return {
				success: true,
				data: undefined,
				message: data.message,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to delete avatar",
			};
		}
	},

	async hasPassword(): Promise<ApiResponse<{ hasPassword: boolean }>> {
		try {
			const response = await apiClient.get<{
				success: boolean;
				data?: { hasPassword: boolean };
				error?: string;
			}>("/api/profile/has-password");

			if (!response.success) {
				return {
					success: false,
					error: response.error || "Request failed",
					message: "Failed to check password status",
				};
			}

			return {
				success: true,
				data: response.data as { hasPassword: boolean },
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to check password status",
			};
		}
	},

	async setPassword(newPassword: string): Promise<ApiResponse<void>> {
		try {
			const response = await apiClient.post<{
				success: boolean;
				message?: string;
				error?: string;
			}>("/api/profile/set-password", { newPassword });

			if (!response.success) {
				return {
					success: false,
					error: response.error || "Request failed",
					message: response.message || "Failed to set password",
				};
			}

			return {
				success: true,
				data: undefined,
				message: response.message,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to set password",
			};
		}
	},

	async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
		try {
			const response = await apiClient.post<{
				success: boolean;
				message?: string;
				error?: string;
			}>("/api/profile/change-password", { currentPassword, newPassword });

			if (!response.success) {
				return {
					success: false,
					error: response.error || "Request failed",
					message: response.message || "Failed to change password",
				};
			}

			return {
				success: true,
				data: undefined,
				message: response.message,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to change password",
			};
		}
	},

	async bulkDelete(ids: string[]): Promise<ApiResponse<{ deleted: number; failed: number }>> {
		try {
			const response = await apiClient.post<{
				success: boolean;
				message?: string;
				deleted?: number;
				failed?: number;
				error?: string;
			}>("/api/users/bulk-delete", { ids });

			if (!response.success) {
				return {
					success: false,
					error: response.error || "Request failed",
					message: response.message || "Failed to delete users",
				};
			}

			return {
				success: true,
				data: { deleted: response.deleted || 0, failed: response.failed || 0 },
				message: response.message,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},

	async bulkVerify(ids: string[]): Promise<ApiResponse<{ verified: number; failed: number }>> {
		try {
			const response = await apiClient.post<{
				success: boolean;
				message?: string;
				verified?: number;
				failed?: number;
				error?: string;
			}>("/api/users/bulk-verify", { ids });

			if (!response.success) {
				return {
					success: false,
					error: response.error || "Request failed",
					message: response.message || "Failed to verify users",
				};
			}

			return {
				success: true,
				data: { verified: response.verified || 0, failed: response.failed || 0 },
				message: response.message,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},

	async bulkUnverify(ids: string[]): Promise<ApiResponse<{ unverified: number; failed: number }>> {
		try {
			const response = await apiClient.post<{
				success: boolean;
				message?: string;
				unverified?: number;
				failed?: number;
				error?: string;
			}>("/api/users/bulk-unverify", { ids });

			if (!response.success) {
				return {
					success: false,
					error: response.error || "Request failed",
					message: response.message || "Failed to deactivate users",
				};
			}

			return {
				success: true,
				data: { unverified: response.unverified || 0, failed: response.failed || 0 },
				message: response.message,
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
