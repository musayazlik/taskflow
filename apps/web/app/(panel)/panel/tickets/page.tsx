import { Metadata } from "next";
import { Suspense } from "react";
import { getTicketsServer, getTicketStatsServer } from "@/services/server";
import { TicketsPageClient } from "./components/tickets-page-client";

export const metadata: Metadata = {
  title: "Support Tickets | TurboStack Admin Panel",
  description:
    "Manage and track your support tickets. Create new tickets, view ticket details, and communicate with support.",
  robots: {
    index: false,
    follow: false,
  },
};

interface TicketsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    priority?: string;
  }>;
}

function TicketsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-20 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {["stat-1", "stat-2", "stat-3", "stat-4"].map((key) => (
          <div
            key={key}
            className="h-32 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
      <div className="h-96 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
    </div>
  );
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = params.search || "";
  const status =
    params.status === "open" ||
    params.status === "in_progress" ||
    params.status === "closed"
      ? params.status
      : undefined;
  const priority =
    params.priority === "low" ||
    params.priority === "medium" ||
    params.priority === "high"
      ? params.priority
      : undefined;

  const [ticketsData, stats] = await Promise.all([
    getTicketsServer({
      page,
      limit,
      search: search || undefined,
      status,
      priority,
    }),
    getTicketStatsServer(),
  ]);

  return (
    <Suspense fallback={<TicketsPageSkeleton />}>
      <TicketsPageClient
        initialTickets={ticketsData.tickets}
        initialTotal={ticketsData.total}
        initialPage={page}
        initialPageSize={limit}
        initialTotalPages={ticketsData.totalPages}
        initialStats={stats}
      />
    </Suspense>
  );
}
