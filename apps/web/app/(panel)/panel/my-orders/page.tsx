import type { Metadata } from "next";
import { Suspense } from "react";
import { getOrdersServer } from "@/services/server";
import { OrdersClient } from "./components/OrdersClient";
import { OrdersPageSkeleton } from "./components/OrdersPageSkeleton";

export const metadata: Metadata = {
  title: "My Orders | TurboStack Admin Panel",
  description:
    "View and track your order history. Manage your purchases, download invoices, and check delivery status.",
  robots: {
    index: false,
    follow: false,
  },
};

interface MyOrdersPageProps {
  searchParams?: {
    page?: string;
    limit?: string;
  };
}

export default async function MyOrdersPage({ searchParams }: MyOrdersPageProps) {
  const page = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 50;

  const ordersData = await getOrdersServer({
    page,
    limit,
  });

  return (
    <Suspense fallback={<OrdersPageSkeleton />}>
      <OrdersClient
        initialOrders={ordersData.orders}
        initialTotal={ordersData.total}
        initialPage={ordersData.page}
        initialPageSize={ordersData.pageSize}
        initialTotalPages={ordersData.totalPages}
      />
    </Suspense>
  );
}
