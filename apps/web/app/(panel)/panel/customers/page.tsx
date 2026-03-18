import { Metadata } from "next";
import { Suspense } from "react";
import { CustomersPageClient } from "./components/customers-page-client";
import { getCustomersServer } from "@/services/server";

export const metadata: Metadata = {
  title: "Customers | TurboStack Admin Panel",
  description:
    "Manage your customers. View customer details, track orders, and manage customer relationships.",
  robots: {
    index: false,
    follow: false,
  },
};

interface CustomersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
  }>;
}

function CustomersPageSkeleton() {
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

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = params.limit ? parseInt(params.limit, 10) : 10;
  const search = params.search || "";

  const { customers, total, page: currentPage, pageSize, totalPages } =
    await getCustomersServer({
      page,
      limit,
      search,
    });

  return (
    <Suspense fallback={<CustomersPageSkeleton />}>
      <CustomersPageClient
        initialCustomers={customers}
        initialTotal={total}
        initialPage={currentPage}
        initialPageSize={pageSize}
        initialTotalPages={totalPages}
      />
    </Suspense>
  );
}
