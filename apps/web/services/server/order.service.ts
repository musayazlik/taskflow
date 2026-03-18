import { cookies } from "next/headers";
import { resolveApiBaseUrl } from "@repo/types";
import type { Order } from "../types";

/**
 * Server-side order service
 * Uses fetch with cookies for server-side rendering
 */
export async function getOrdersServer(params?: {
  page?: number;
  limit?: number;
}): Promise<{
  orders: Order[];
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
      `${API_BASE_URL}/api/orders?${queryParams.toString()}`,
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
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      success: boolean;
      data: Order[];
      pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };

    if (!data.success || !data.data) {
      return {
        orders: [],
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
      orders: data.data,
      total: pagination.total,
      page: pagination.page,
      pageSize: pagination.limit,
      totalPages: pagination.totalPages,
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      orders: [],
      total: 0,
      page: 1,
      pageSize: limit,
      totalPages: 0,
    };
  }
}
