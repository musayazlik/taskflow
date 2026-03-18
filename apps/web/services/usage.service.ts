import { baseApi } from "@/lib/api";
import type { ApiResponse } from "./types";

export interface UsageStats {
	apiCalls: {
		current: number;
		limit: number;
		percentage: number;
	};
	storage: {
		current: number; // bytes
		limit: number; // bytes
		percentage: number;
	};
	features: {
		aiChat: {
			current: number;
			limit: number;
			percentage: number;
		};
		contentGeneration: {
			current: number;
			limit: number;
			percentage: number;
		};
		imageGeneration: {
			current: number;
			limit: number;
			percentage: number;
		};
		seo: {
			current: number;
			limit: number;
			percentage: number;
		};
	};
	bandwidth: {
		current: number; // bytes
		limit: number; // bytes
		percentage: number;
	};
}

export interface UsageHistory {
	date: string;
	apiCalls: number;
	storage: number;
	bandwidth: number;
}

export const usageService = {
	async getUsageStats(): Promise<ApiResponse<UsageStats>> {
		try {
			const { data, error } = await baseApi.usage.stats.get();

			if (error) {
				return {
					success: false,
					error: "Request failed",
					message: String(error.value) || "Failed to fetch usage stats",
				};
			}

			// Eden Treaty returns { success: true, data: {...} }
			const response = data as { success?: boolean; data?: UsageStats };
			const statsData = response?.data || response;

			return {
				success: true,
				data: statsData as UsageStats,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},

	async getUsageHistory(days?: number): Promise<ApiResponse<UsageHistory[]>> {
		try {
			const { data, error } = await baseApi.usage.history.get({
				query: {
					days: days?.toString(),
				},
			});

			if (error) {
				return {
					success: false,
					error: "Request failed",
					message:
						String(error.value) || "Failed to fetch usage history",
				};
			}

			// Eden Treaty returns { success: true, data: [...] }
			const response = data as { success?: boolean; data?: UsageHistory[] };
			const historyData = response?.data || (Array.isArray(response) ? response : []);

			return {
				success: true,
				data: Array.isArray(historyData) ? historyData : [],
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
