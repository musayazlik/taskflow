import { cookies } from "next/headers";
import { resolveApiBaseUrl } from "@repo/types";
import type { Product } from "../types";

/**
 * Server-side product service
 * Uses fetch with cookies for server-side rendering
 */
export async function getProductsServer(params?: {
  page?: number;
  limit?: number;
  includeArchived?: boolean;
  search?: string;
  status?: "all" | "active" | "archived";
}): Promise<{
  products: Product[];
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

  if (params?.includeArchived !== undefined) {
    queryParams.append("includeArchived", params.includeArchived.toString());
  }

  if (params?.search) {
    queryParams.append("search", params.search);
  }

  if (params?.status && params.status !== "all") {
    queryParams.append("status", params.status);
  }

  // Get cookies from Next.js server-side
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/products?${queryParams.toString()}`,
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
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(
        `Failed to fetch products: ${response.status} - ${errorText}`,
      );
    }

    const data = (await response.json()) as {
      success: boolean;
      data?: Product[];
      meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };

    if (!data.success || !data.data || !data.meta) {
      return {
        products: [],
        total: 0,
        page: 1,
        pageSize: limit,
        totalPages: 0,
      };
    }

    const meta = data.meta;

    return {
      products: data.data,
      total: meta.total,
      page: meta.page,
      pageSize: meta.limit,
      totalPages: meta.totalPages,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      products: [],
      total: 0,
      page: 1,
      pageSize: limit,
      totalPages: 0,
    };
  }
}
