import { prisma } from "@repo/database";
import { AppError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";

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

/**
 * Get usage statistics for a user
 * For now, we'll calculate from actual data (media files, etc.)
 * In the future, this could use a UsageLog table
 */
export const getUserUsageStats = async (
	userId: string,
): Promise<UsageStats> => {
	try {
		// Get user's subscription to determine limits
		const subscription = await prisma.subscription.findFirst({
			where: {
				userId,
				status: "active",
			},
			include: {
				product: true,
			},
		});

		// Default limits (can be overridden by subscription plan)
		const defaultLimits = {
			apiCalls: 10000, // per month
			storage: 10 * 1024 * 1024 * 1024, // 10 GB
			aiChat: 1000, // per month
			contentGeneration: 500, // per month
			imageGeneration: 100, // per month
			seo: 200, // per month
			bandwidth: 100 * 1024 * 1024 * 1024, // 100 GB per month
		};

		// TODO: Get limits from subscription plan metadata
		const limits = {
			apiCalls: defaultLimits.apiCalls,
			storage: defaultLimits.storage,
			aiChat: defaultLimits.aiChat,
			contentGeneration: defaultLimits.contentGeneration,
			imageGeneration: defaultLimits.imageGeneration,
			seo: defaultLimits.seo,
			bandwidth: defaultLimits.bandwidth,
		};

		// Calculate current usage
		// Storage: sum of all media files size
		const mediaFiles = await prisma.mediaFile.findMany({
			where: { uploadedBy: userId },
			select: { size: true },
		});

		const storageUsed = mediaFiles.reduce(
			(sum, file) => sum + (file.size || 0),
			0,
		);

		// For now, mock other usage data
		// TODO: Implement actual tracking with UsageLog table
		const currentUsage = {
			apiCalls: 0, // Would track from rate limit logs
			storage: storageUsed,
			aiChat: 0, // Would track from AI service calls
			contentGeneration: 0, // Would track from content generation
			imageGeneration: 0, // Would track from image generation
			seo: 0, // Would track from SEO service calls
			bandwidth: 0, // Would track from file downloads/uploads
		};

		return {
			apiCalls: {
				current: currentUsage.apiCalls,
				limit: limits.apiCalls,
				percentage:
					limits.apiCalls > 0
						? (currentUsage.apiCalls / limits.apiCalls) * 100
						: 0,
			},
			storage: {
				current: storageUsed,
				limit: limits.storage,
				percentage:
					limits.storage > 0 ? (storageUsed / limits.storage) * 100 : 0,
			},
			features: {
				aiChat: {
					current: currentUsage.aiChat,
					limit: limits.aiChat,
					percentage:
						limits.aiChat > 0
							? (currentUsage.aiChat / limits.aiChat) * 100
							: 0,
				},
				contentGeneration: {
					current: currentUsage.contentGeneration,
					limit: limits.contentGeneration,
					percentage:
						limits.contentGeneration > 0
							? (currentUsage.contentGeneration /
									limits.contentGeneration) *
								100
							: 0,
				},
				imageGeneration: {
					current: currentUsage.imageGeneration,
					limit: limits.imageGeneration,
					percentage:
						limits.imageGeneration > 0
							? (currentUsage.imageGeneration /
									limits.imageGeneration) *
								100
							: 0,
				},
				seo: {
					current: currentUsage.seo,
					limit: limits.seo,
					percentage:
						limits.seo > 0 ? (currentUsage.seo / limits.seo) * 100 : 0,
				},
			},
			bandwidth: {
				current: currentUsage.bandwidth,
				limit: limits.bandwidth,
				percentage:
					limits.bandwidth > 0
						? (currentUsage.bandwidth / limits.bandwidth) * 100
						: 0,
			},
		};
	} catch (error) {
		logger.error({ error, userId }, "Failed to get usage stats");
		throw new AppError(
			"INTERNAL_ERROR",
			"Failed to retrieve usage statistics",
			500,
		);
	}
};

/**
 * Get usage history (last 30 days)
 * For now, returns mock data
 * TODO: Implement with UsageLog table
 */
export const getUserUsageHistory = async (
	userId: string | undefined,
	days: number = 30,
): Promise<UsageHistory[]> => {
	try {
		// Mock data for now
		// TODO: Query UsageLog table for actual history
		const history: UsageHistory[] = [];
		const today = new Date();

		for (let i = days - 1; i >= 0; i--) {
			const historyDate = new Date(today);
			historyDate.setDate(historyDate.getDate() - i);

			const dateString: string = historyDate.toISOString().split("T")[0]!;

			history.push({
				date: dateString,
				apiCalls: Math.floor(Math.random() * 500) + 100,
				storage: Math.floor(Math.random() * 1000000000) + 500000000, // bytes
				bandwidth: Math.floor(Math.random() * 50000000) + 10000000, // bytes
			});
		}

		return history;
	} catch (error) {
		logger.error({ error, userId, days }, "Failed to get usage history");
		throw new AppError(
			"INTERNAL_ERROR",
			"Failed to retrieve usage history",
			500,
		);
	}
};
