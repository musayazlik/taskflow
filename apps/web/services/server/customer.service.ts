import { cookies } from "next/headers";
import { resolveApiBaseUrl } from "@repo/types";
import type { Customer } from "../types";

/**
 * Server-side customer service
 * Uses fetch with cookies for server-side rendering
 */
export async function getCustomersServer(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{
  customers: Customer[];
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

  if (params?.search) {
    queryParams.append("search", params.search);
  }

  // Get cookies from Next.js server-side
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/customers?${queryParams.toString()}`,
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
      throw new Error(`Failed to fetch customers: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      success: boolean;
      data: Customer[];
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };

    if (!data.success || !data.data) {
      return {
        customers: [],
        total: 0,
        page: 1,
        pageSize: limit,
        totalPages: 0,
      };
    }

    return {
      customers: data.data,
      total: data.meta.total,
      page: data.meta.page,
      pageSize: data.meta.limit,
      totalPages: data.meta.totalPages,
    };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return {
      customers: [],
      total: 0,
      page: 1,
      pageSize: limit,
      totalPages: 0,
    };
  }
}
