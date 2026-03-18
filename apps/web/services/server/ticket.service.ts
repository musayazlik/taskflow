import { cookies } from "next/headers";
import { resolveApiBaseUrl } from "@repo/types";
import type { Ticket } from "../ticket.service";

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  closed: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
}

/**
 * Server-side ticket service
 * Uses fetch with cookies for server-side rendering
 */
export async function getTicketsServer(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "open" | "in_progress" | "closed";
  priority?: "low" | "medium" | "high";
}): Promise<{
  tickets: Ticket[];
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

  if (params?.status) {
    queryParams.append("status", params.status);
  }

  if (params?.priority) {
    queryParams.append("priority", params.priority);
  }

  // Get cookies from Next.js server-side
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tickets?${queryParams.toString()}`,
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
      throw new Error(`Failed to fetch tickets: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      success: boolean;
      data?: {
        data: Ticket[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    };

    if (!data.success || !data.data) {
      return {
        tickets: [],
        total: 0,
        page: 1,
        pageSize: limit,
        totalPages: 0,
      };
    }

    const payload = data.data;
    const tickets = Array.isArray(payload.data) ? payload.data : [];
    const meta = payload.meta;

    return {
      tickets,
      total: meta?.total ?? tickets.length,
      page: meta?.page ?? page,
      pageSize: meta?.limit ?? limit,
      totalPages:
        meta?.totalPages ??
        (Math.ceil((meta?.total ?? tickets.length) / limit) || 1),
    };
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return {
      tickets: [],
      total: 0,
      page: 1,
      pageSize: limit,
      totalPages: 0,
    };
  }
}

/**
 * Server-side ticket stats service
 * Uses fetch with cookies for server-side rendering
 */
export async function getTicketStatsServer(): Promise<TicketStats | null> {
  const API_BASE_URL = resolveApiBaseUrl();

  // Get cookies from Next.js server-side
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const response = await fetch(`${API_BASE_URL}/api/tickets/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store", // Dynamic rendering on every request
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ticket stats: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      success: boolean;
      data?: TicketStats;
    };

    if (!data.success || !data.data) {
      return null;
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching ticket stats:", error);
    return null;
  }
}
