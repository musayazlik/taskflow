import { apiClient } from "@/lib/api";
import type { ApiResponse } from "./types";
import type { GlobalSettings } from "@repo/types";

export const settingsService = {
	async getPublicSettings(): Promise<ApiResponse<GlobalSettings | null>> {
		try {
			const response = await apiClient.get<{
				success: boolean;
				data: GlobalSettings | null;
				error?: string;
				message?: string;
			}>("/api/settings");

			if (!response.success) {
				return {
					success: false,
					error: "Request failed",
					message: response.message || "Failed to get settings",
				};
			}

			return {
				success: true,
				data: response.data,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to get settings",
			};
		}
	},

	async updateGlobalSettings(
		body: Partial<Omit<GlobalSettings, "id" | "createdAt" | "updatedAt">>,
	): Promise<ApiResponse<GlobalSettings>> {
		try {
			const response = await apiClient.patch<{
				success: boolean;
				data?: GlobalSettings;
				error?: string;
				message?: string;
			}>("/api/settings", body);

			if (!response.success) {
				return {
					success: false,
					error: response.error || "Request failed",
					message: response.message || "Failed to update settings",
				};
			}

			return {
				success: true,
				data: response.data!,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to update settings",
			};
		}
	},
};

