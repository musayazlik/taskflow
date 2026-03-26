import { cookies } from "next/headers";
import { resolveApiBaseUrl } from "@repo/types";
import type { UserFrontend as User } from "@repo/types";

/**
 * Server-side user service
 * Uses fetch with cookies for server-side rendering
 */
export async function getUsersServer(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}): Promise<{
  users: User[];
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

  if (params?.role) {
    queryParams.append("role", params.role);
  }

  // Get cookies from Next.js server-side
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/users?${queryParams.toString()}`,
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
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      success: boolean;
      data?: User[];
      meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };

    if (!data.success || !data.data || !data.meta) {
      return {
        users: [],
        total: 0,
        page: 1,
        pageSize: limit,
        totalPages: 0,
      };
    }

    const meta = data.meta;

    return {
      users: data.data,
      total: meta.total,
      page: meta.page,
      pageSize: meta.limit,
      totalPages: meta.totalPages,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      users: [],
      total: 0,
      page: 1,
      pageSize: limit,
      totalPages: 0,
    };
  }
}
