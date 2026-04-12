import { Metadata } from "next";
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
    <UsersPageClient
      initialUsers={users}
      initialTotal={total}
      initialPage={page}
      initialPageSize={limit}
      initialTotalPages={totalPages}
    />
  );
}
