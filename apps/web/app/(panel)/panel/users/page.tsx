import { Metadata } from "next";
import { Suspense } from "react";
import { getUsersServer } from "@/services/server";
import { UsersPageClient } from "./components/users-page-client";

export const metadata: Metadata = {
  title: "Users | TaskFlow Admin Panel",
  description:
    "Manage user accounts and permissions. View, create, edit, and delete users. Manage user roles and email verification.",
  robots: {
    index: false,
    follow: false,
  },
};

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    role?: string;
  }>;
}

function UsersPageSkeleton() {
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

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = params.search || "";
  const role = params.role || "";

  const { users, total, totalPages } = await getUsersServer({
    page,
    limit,
    search: search || undefined,
    role: role || undefined,
  });

  return (
    <Suspense fallback={<UsersPageSkeleton />}>
      <UsersPageClient
        initialUsers={users}
        initialTotal={total}
        initialPage={page}
        initialPageSize={limit}
        initialTotalPages={totalPages}
      />
    </Suspense>
  );
}
