import { cookies } from "next/headers";
import { resolveApiBaseUrl } from "@repo/types";
import type { MediaFile } from "../types";

/**
 * Server-side media service
 * Uses fetch with cookies for server-side rendering
 */
export async function getMediaFilesServer(params?: {
  limit?: number;
  offset?: number;
}): Promise<{
  files: MediaFile[];
  hasMore: boolean;
}> {
  const API_BASE_URL = resolveApiBaseUrl();
  const limit = params?.limit || 100;
  const offset = params?.offset || 0;

  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  // Get cookies from Next.js server-side
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/media?${queryParams.toString()}`,
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
      throw new Error(`Failed to fetch media files: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      success: boolean;
      data: MediaFile[];
      pagination?: {
        limit: number;
        offset: number;
        hasMore: boolean;
      };
    };

    if (!data.success || !data.data) {
      return {
        files: [],
        hasMore: false,
      };
    }

    return {
      files: data.data,
      hasMore: data.pagination?.hasMore || false,
    };
  } catch (error) {
    console.error("Error fetching media files:", error);
    return {
      files: [],
      hasMore: false,
    };
  }
}
