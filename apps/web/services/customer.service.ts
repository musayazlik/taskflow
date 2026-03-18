import { baseApi } from "@/lib/api";
import type { ApiResponse, Customer, PaginatedResponse } from "./types";

export const customerService = {
	async getCustomers(params?: {
		page?: number;
		limit?: number;
		search?: string;
	}): Promise<ApiResponse<PaginatedResponse<Customer>>> {
		try {
			const { data, error } = await baseApi.customers.get({
				query: {
					page: params?.page?.toString(),
					limit: params?.limit?.toString(),
					search: params?.search,
				},
			});

			if (error) {
				return {
					success: false,
					error: "Request failed",
					message: String(error.value) || "Failed to fetch customers",
				};
			}

			return {
				success: true,
				data: data as unknown as PaginatedResponse<Customer>,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},
	async importFromPolar(): Promise<
		ApiResponse<{
			imported: number;
			updated: number;
			skipped: number;
			customers: {
				id: string;
				name: string | null;
				externalCustomerId: string;
			}[];
		}>
	> {
		try {
			const { data, error } =
				await baseApi.customers["import-from-polar"].post();

			if (error) {
				return {
					success: false,
					error: "Request failed",
					message: String(error.value) || "Failed to import from Polar",
				};
			}

			const response = data as {
				success: boolean;
				data: {
					imported: number;
					updated: number;
					skipped: number;
					customers: {
						id: string;
						name: string | null;
						externalCustomerId: string;
					}[];
				};
				message?: string;
			};
			return {
				success: true,
				data: response.data,
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
