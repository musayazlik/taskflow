import { Metadata } from "next";
import { Suspense } from "react";
import { getProductsServer } from "@/services/server";
import { ProductsPageClient } from "./components/products-page-client";

export const metadata: Metadata = {
  title: "Products | TurboStack Admin Panel",
  description:
    "Manage your products and subscriptions. View, create, edit, and archive products. Import products from Polar.",
  robots: {
    index: false,
    follow: false,
  },
};

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
  }>;
}

function ProductsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-20 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
      <div className="h-96 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
    </div>
  );
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = params.search || "";

  const { products, total, totalPages } = await getProductsServer({
    page,
    limit,
    includeArchived: true,
    search: search || undefined,
  });

  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsPageClient
        initialProducts={products}
        initialTotal={total}
        initialPage={page}
        initialPageSize={limit}
        initialTotalPages={totalPages}
      />
    </Suspense>
  );
}
