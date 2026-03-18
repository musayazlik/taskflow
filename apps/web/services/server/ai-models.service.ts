import { cookies } from "next/headers";
import { resolveApiBaseUrl } from "@repo/types";
import type { AiModelFrontend as AIModel } from "@repo/types";

/**
 * Server-side AI models service
 * Uses fetch with cookies for server-side rendering
 */
export async function getAIModelsServer(params?: {
  page?: number;
  limit?: number;
  activeOnly?: boolean;
  provider?: string;
}): Promise<{
  models: AIModel[];
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

  if (params?.activeOnly) {
    queryParams.append("activeOnly", "true");
  }
  if (params?.provider) {
    queryParams.append("provider", params.provider);
  }

  // Get cookies from Next.js server-side
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/ai-models?${queryParams.toString()}`,
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
      throw new Error(`Failed to fetch AI models: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      success: boolean;
      data: AIModel[];
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };

    if (!data.success || !data.data) {
      return {
        models: [],
        total: 0,
        page: 1,
        pageSize: limit,
        totalPages: 0,
      };
    }

    return {
      models: data.data,
      total: data.meta.total,
      page: data.meta.page,
      pageSize: data.meta.limit,
      totalPages: data.meta.totalPages,
    };
  } catch (error) {
    console.error("Error fetching AI models:", error);
    return {
      models: [],
      total: 0,
      page: 1,
      pageSize: limit,
      totalPages: 0,
    };
  }
}
