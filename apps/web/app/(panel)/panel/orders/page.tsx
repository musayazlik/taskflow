import { Metadata } from "next";
import { Suspense } from "react";
import { OrdersPageClient } from "./components/orders-page-client";
import { getOrdersServer } from "@/services/server";

export const metadata: Metadata = {
  title: "Orders | TurboStack Admin Panel",
  description:
    "View and manage orders from Polar. Track order status, view invoices, and manage customer orders.",
  robots: {
    index: false,
    follow: false,
  },
};

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
  }>;
}

function OrdersPageSkeleton() {
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

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = params.limit ? parseInt(params.limit, 10) : 10;

  const { orders, total, page: currentPage, pageSize, totalPages } =
    await getOrdersServer({
      page,
      limit,
    });

  return (
    <Suspense fallback={<OrdersPageSkeleton />}>
      <OrdersPageClient
        initialOrders={orders}
        initialTotal={total}
        initialPage={currentPage}
        initialPageSize={pageSize}
        initialTotalPages={totalPages}
      />
    </Suspense>
  );
}
