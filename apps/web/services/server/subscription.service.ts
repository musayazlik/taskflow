import { cookies } from "next/headers";
import { resolveApiBaseUrl } from "@repo/types";
import type { Subscription } from "../types";

/**
 * Server-side subscription service
 * Uses fetch with cookies for server-side rendering
 */
export async function getSubscriptionsServer(params?: {
  page?: number;
  limit?: number;
}): Promise<{
  subscriptions: Subscription[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const API_BASE_URL = resolveApiBaseUrl();
  const page = params?.page || 1;
  const limit = params?.limit || 10;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  // Get cookies from Next.js server-side
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/subscriptions/me?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        cache: "no-store", // Dynamic rendering on every request
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      success: boolean;
      data: Subscription[];
      pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };

    if (!data.success || !data.data) {
      return {
        subscriptions: [],
        total: 0,
        page: 1,
        pageSize: limit,
        totalPages: 0,
      };
    }

    const pagination = data.pagination || {
      total: data.data.length,
      page: page,
      limit: limit,
      totalPages: Math.ceil(data.data.length / limit),
    };

    return {
      subscriptions: data.data,
      total: pagination.total,
      page: pagination.page,
      pageSize: pagination.limit,
      totalPages: pagination.totalPages,
    };
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return {
      subscriptions: [],
      total: 0,
      page: 1,
      pageSize: limit,
      totalPages: 0,
    };
  }
}
