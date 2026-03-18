import { apiClient, baseApi } from "@/lib/api";
import type { ApiResponse } from "./types";
import type {
	MediaFile,
	MediaListResponse,
	ImageOptimizationSettings,
	MediaUploadSettings,
} from "@repo/types";

export const mediaService = {

	async listFiles(params?: {
		limit?: number;
		offset?: number;
	}): Promise<ApiResponse<MediaListResponse>> {
		try {
			const queryParams = new URLSearchParams();
			if (params?.limit) queryParams.set("limit", params.limit.toString());
			if (params?.offset) queryParams.set("offset", params.offset.toString());

			const queryString = queryParams.toString();
			const url = `/api/media${queryString ? `?${queryString}` : ""}`;

			const response = await apiClient.get<{
				success: boolean;
				data?: MediaFile[];
				pagination?: {
					limit: number;
					offset: number;
					hasMore: boolean;
				};
				error?: string;
				message?: string;
			}>(url);

			if (!response.success) {
				return {
					success: false,
					error: response.error || "Failed to fetch media",
					message: response.message,
				};
			}

			return {
				success: true,
				data: {
					files: response.data || [],
					pagination: response.pagination || {
						limit: params?.limit || 50,
						offset: params?.offset || 0,
						hasMore: false,
					},
				},
			};
		} catch (error) {
			console.error("Error fetching media:", error);
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},
	async deleteFile(key: string): Promise<ApiResponse<void>> {
		try {
			const response = await apiClient.delete<{
				success: boolean;
				message?: string;
				error?: string;
			}>(`/api/media/${key}`);

			if (!response || !response.success) {
				return {
					success: false,
					error: response?.error || "Failed to delete file",
					message: response?.message,
				};
			}

			return {
				success: true,
				data: undefined,
				message: response.message || "File deleted successfully",
			};
		} catch (error) {
			console.error("Error deleting file:", error);
			return {
				success: false,
				error: "Network Error",
				message: "Failed to delete file",
			};
		}
	},

	async uploadFiles(
		files: File[],
		onProgress?: (progress: number) => void
	): Promise<ApiResponse<MediaFile[]>> {
		try {
			const formData = new FormData();
			files.forEach((file) => {
				formData.append("files", file);
			});

			onProgress?.(10);

			const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4101";
			const response = await fetch(`${apiUrl}/api/media/upload`, {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			onProgress?.(50);

			const data = await response.json();

			onProgress?.(100);

			if (!response.ok || !Array.isArray(data)) {
				return {
					success: false,
					error: data?.error || "Failed to upload files",
					message: data?.message,
				};
			}

			return {
				success: true,
				data: data.map((file: any) => ({
					key: file.key,
					name: file.name,
					size: file.size,
					url: file.url,
					type: file.type || "image/unknown",
					uploadedAt: Date.now(),
				})),
			};
		} catch (error) {
			console.error("Error uploading files:", error);
			return {
				success: false,
				error: "Network Error",
				message: "Failed to upload files",
			};
		}
	},
	
	async syncFromUploadThing(): Promise<ApiResponse<{ added: number; removed: number; errors: string[] }>> {
		try {
			const response = await apiClient.post<{
				success: boolean;
				data?: { added: number; removed: number; errors: string[] };
				message?: string;
				error?: string;
			}>("/api/media/sync", {});

			if (!response.success) {
				return {
					success: false,
					error: response.error || "Failed to sync files",
					message: response.message,
				};
			}

			return {
				success: true,
				data: response.data || { added: 0, removed: 0, errors: [] },
				message: response.message || "Files synced successfully",
			};
		} catch (error) {
			console.error("Error syncing files:", error);
			return {
				success: false,
				error: "Network Error",
				message: "Failed to sync files",
			};
		}
	},

	async optimizeImage(
		key: string,
		options: {
			quality?: number;
			format?: "webp" | "jpeg" | "png" | "original";
			maxWidth?: number;
			maxHeight?: number;
		},
	): Promise<ApiResponse<MediaFile>> {
		try {
			const response = await apiClient.post<{
				success: boolean;
				data?: MediaFile;
				message?: string;
				error?: string;
			}>(`/api/media/${key}/optimize`, options);

			if (!response.success) {
				return {
					success: false,
					error: response.error || "Failed to optimize image",
					message: response.message,
				};
			}

			return {
				success: true,
				data: response.data!,
				message: response.message || "Image optimized successfully",
			};
		} catch (error) {
			console.error("Error optimizing image:", error);
			return {
				success: false,
				error: "Network Error",
				message: "Failed to optimize image",
			};
		}
	},

	// ============================================
	// Image Optimization Settings
	// ============================================

	async getImageOptimizationSettings(): Promise<
		ApiResponse<ImageOptimizationSettings>
	> {
		try {
			const { data, error } = await baseApi.settings["image-optimization"].get();

			if (error) {
				return {
					success: false,
					error: "Request failed",
					message:
						String(error.value) || "Failed to get image optimization settings",
				};
			}

			return {
				success: true,
				data: data.data as ImageOptimizationSettings,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to get image optimization settings",
			};
		}
	},

	async updateImageOptimizationSettings(
		body: Partial<ImageOptimizationSettings>,
	): Promise<ApiResponse<ImageOptimizationSettings>> {
		try {
			const { data, error } = await baseApi.settings["image-optimization"].patch(
				body,
			);

			if (error) {
				return {
					success: false,
					error: "Request failed",
					message:
						String(error.value) ||
						"Failed to update image optimization settings",
				};
			}

			return {
				success: true,
				data: data.data as ImageOptimizationSettings,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to update image optimization settings",
			};
		}
	},

	// ============================================
	// Media Upload Settings
	// ============================================

	async getMediaUploadSettings(): Promise<ApiResponse<MediaUploadSettings>> {
		try {
			const response = await apiClient.get<{
				success: boolean;
				data?: MediaUploadSettings;
				error?: string;
				message?: string;
			}>("/api/settings/media-upload");

			if (!response.success) {
				return {
					success: false,
					error: response.error || "Request failed",
					message: response.message || "Failed to get media upload settings",
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
				message: "Failed to get media upload settings",
			};
		}
	},

	async updateMediaUploadSettings(
		body: Partial<MediaUploadSettings>,
	): Promise<ApiResponse<MediaUploadSettings>> {
		try {
			const response = await apiClient.patch<{
				success: boolean;
				data?: MediaUploadSettings;
				error?: string;
				message?: string;
			}>("/api/settings/media-upload", body);

			if (!response.success) {
				return {
					success: false,
					error: response.error || "Request failed",
					message:
						response.message || "Failed to update media upload settings",
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
				message: "Failed to update media upload settings",
			};
		}
	},
};
