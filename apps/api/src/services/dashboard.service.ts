import { prisma } from "@repo/database";
import { AppError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";
import type { DashboardStats, RecentActivity } from "@repo/types";

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, newUsersThisMonth] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
    ]);

    return {
      totalUsers,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      revenueThisMonth: 0,
      activeSubscriptions: 0,
      newUsersThisMonth,
    };
  } catch (error) {
    logger.error({ err: error }, "Error fetching dashboard stats");
    throw new AppError(
      "DASHBOARD_ERROR",
      "Failed to fetch dashboard stats",
      500,
    );
  }
};

export const getRecentActivity = async (
  limit = 10,
): Promise<RecentActivity> => {
  try {
    const [recentUsers] = await Promise.all([
      prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      }),
      [],
    ]);

    return {
      recentUsers,
      recentOrders: [],
    };
  } catch (error) {
    logger.error({ err: error, limit }, "Error fetching recent activity");
    throw new AppError(
      "DASHBOARD_ERROR",
      "Failed to fetch recent activity",
      500,
    );
  }
};
