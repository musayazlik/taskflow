import { Metadata } from "next";
import { Suspense } from "react";
import { SubscriptionsPageClient } from "./components/subscriptions-page-client";
import { getSubscriptionsServer } from "@/services/server";

export const metadata: Metadata = {
  title: "Subscriptions | TurboStack Admin Panel",
  description:
    "Manage subscriptions and billing. View active subscriptions, track revenue, and manage subscription lifecycle.",
  robots: {
    index: false,
    follow: false,
  },
};

interface SubscriptionsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
  }>;
}

function SubscriptionsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 bg-gray-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 bg-gray-100 dark:bg-zinc-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
      <div className="h-96 bg-gray-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
    </div>
  );
}

export default async function SubscriptionsPage({
  searchParams,
}: SubscriptionsPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = params.limit ? parseInt(params.limit, 10) : 10;

  const { subscriptions, total, page: currentPage, pageSize, totalPages } =
    await getSubscriptionsServer({
      page,
      limit,
    });

  return (
    <Suspense fallback={<SubscriptionsPageSkeleton />}>
      <SubscriptionsPageClient
        initialSubscriptions={subscriptions}
        initialTotal={total}
        initialPage={currentPage}
        initialPageSize={pageSize}
        initialTotalPages={totalPages}
      />
    </Suspense>
  );
}
