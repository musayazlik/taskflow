"use client";

import { useMemo, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import { DataTable, type Column } from "@/components/data-table";
import { CustomerCell } from "../molecules/customer-cell";
import { PolarBadge } from "../atoms/polar-badge";
import { DateCell } from "../molecules/date-cell";
import type { Customer } from "@/services";

interface CustomersTableProps {
  customers: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function CustomersTable({
  customers,
  total,
  page,
  pageSize,
  totalPages,
}: CustomersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const searchTerm = searchParams.get("search") || "";

  const updateURL = useCallback(
    (updates: { page?: number; limit?: number; search?: string }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.page !== undefined) {
        if (updates.page === 1) {
          params.delete("page");
        } else {
          params.set("page", updates.page.toString());
        }
      }

      if (updates.limit !== undefined) {
        if (updates.limit === 10) {
          params.delete("limit");
        } else {
          params.set("limit", updates.limit.toString());
        }
      }

      if (updates.search !== undefined) {
        if (updates.search === "") {
          params.delete("search");
        } else {
          params.set("search", updates.search);
        }
      }

      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  const columns: Column<Customer>[] = useMemo(
    () => [
      {
        key: "customer",
        header: "Customer",
        cell: (customer) => <CustomerCell customer={customer} />,
      },
      {
        key: "polar",
        header: "Polar Customer",
        cell: (customer) => (
          <PolarBadge polarCustomerId={customer.externalCustomerId} />
        ),
      },
      {
        key: "createdAt",
        header: "Created",
        sortable: true,
        cell: (customer) => <DateCell date={customer.createdAt} />,
      },
    ],
    [],
  );

  return (
    <Card className="border-gray-200 dark:border-zinc-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Customers</CardTitle>
        <CardDescription>
          {total} customer{total === 1 ? "" : "s"} total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={customers}
          columns={columns}
          loading={isPending}
          loadingText="Loading customers..."
          emptyIcon={<Users className="h-8 w-8 text-gray-400" />}
          emptyTitle="No customers found"
          emptyDescription="Customers will appear here once they are created in Polar."
          searchable
          searchPlaceholder="Search by name or email..."
          searchValue={searchTerm}
          onSearchChange={(value) => {
            updateURL({ search: value, page: 1 });
          }}
          pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={(page) => {
            updateURL({ page });
          }}
          onPageSizeChange={(size) => {
            updateURL({ limit: size, page: 1 });
          }}
          getRowId={(customer) => customer.id}
          onRefresh={() => {
            startTransition(() => {
              router.refresh();
            });
          }}
        />
      </CardContent>
    </Card>
  );
}

