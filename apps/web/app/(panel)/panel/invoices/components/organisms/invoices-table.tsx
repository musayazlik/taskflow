"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import { DataTable, type Column, type DataTableAction } from "@/components/data-table";
import { InvoiceCell } from "../molecules/invoice-cell";
import { CustomerCell } from "../molecules/customer-cell";
import { AmountCell } from "../molecules/amount-cell";
import { StatusBadge } from "../atoms/status-badge";
import { BillingDateCell } from "../molecules/billing-date-cell";
import type { Order } from "@/services";
import { orderService } from "@/services/order.service";
import { toast } from "sonner";

interface InvoicesTableProps {
  initialOrders: Order[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialTotalPages: number;
}

export function InvoicesTable({
  initialOrders,
  initialTotal,
  initialPage,
  initialPageSize,
  initialTotalPages,
}: InvoicesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [loading, setLoading] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState<string | null>(null);

  const urlSearch = searchParams.get("search") || "";
  const urlPage = searchParams.get("page")
    ? parseInt(searchParams.get("page")!, 10)
    : initialPage;
  const urlPageSize = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!, 10)
    : initialPageSize;

  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [pageSize, setPageSize] = useState(urlPageSize);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlPage = searchParams.get("page")
      ? parseInt(searchParams.get("page")!, 10)
      : initialPage;
    const urlPageSize = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : initialPageSize;

    setSearchTerm(urlSearch);
    setCurrentPage(urlPage);
    setPageSize(urlPageSize);
  }, [searchParams, initialPage, initialPageSize]);

  useEffect(() => {
    setOrders(initialOrders);
    setTotal(initialTotal);
    setTotalPages(initialTotalPages);
  }, [initialOrders, initialTotal, initialTotalPages]);

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

      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await orderService.getOrders({
        page: currentPage,
        limit: pageSize,
      });

      if (!response.success) {
        toast.error(response.error || "Failed to load invoices");
        return;
      }

      if (response.data) {
        setOrders(response.data.data || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
          setTotal(response.data.pagination.total);
        }
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  const handleViewInvoice = async (order: Order) => {
    setLoadingInvoice(order.id);
    try {
      const response = await orderService.getOrderInvoice(order.id);

      if (!response.success) {
        toast.error(response.error || "Failed to load invoice");
        return;
      }

      if (response.data?.url) {
        window.open(response.data.url, "_blank");
      } else {
        toast.error("Invoice URL not available");
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
      toast.error("Failed to load invoice");
    } finally {
      setLoadingInvoice(null);
    }
  };

  const handleDownloadInvoice = async (order: Order) => {
    setLoadingInvoice(order.id);
    try {
      const response = await orderService.getOrderInvoice(order.id);

      if (!response.success) {
        toast.error(response.error || "Failed to load invoice");
        return;
      }

      if (response.data?.pdfUrl) {
        window.open(response.data.pdfUrl, "_blank");
      } else if (response.data?.url) {
        window.open(response.data.url, "_blank");
      } else {
        toast.error("Invoice PDF not available");
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
      toast.error("Failed to load invoice");
    } finally {
      setLoadingInvoice(null);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const term = searchTerm.toLowerCase();
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(term) ||
        order.product?.name?.toLowerCase().includes(term) ||
        order.user?.email?.toLowerCase().includes(term) ||
        order.status.toLowerCase().includes(term),
    );
  }, [orders, searchTerm]);

  const columns: Column<Order>[] = useMemo(
    () => [
      {
        key: "invoice",
        header: "Invoice",
        cell: (order) => <InvoiceCell order={order} />,
      },
      {
        key: "customer",
        header: "Customer",
        cell: (order) => <CustomerCell order={order} />,
      },
      {
        key: "amount",
        header: "Amount",
        cell: (order) => <AmountCell order={order} />,
      },
      {
        key: "status",
        header: "Status",
        cell: (order) => <StatusBadge status={order.status} />,
      },
      {
        key: "billingDate",
        header: "Billing Date",
        cell: (order) => <BillingDateCell order={order} />,
      },
    ],
    [],
  );

  const actions: DataTableAction<Order>[] = useMemo(
    () => [
      {
        label: "View Invoice",
        icon: <FileText className="h-4 w-4" />,
        onClick: handleViewInvoice,
        disabled: (order) => loadingInvoice === order.id,
      },
      {
        label: "Download PDF",
        icon: <FileText className="h-4 w-4" />,
        onClick: handleDownloadInvoice,
        disabled: (order) => loadingInvoice === order.id,
      },
    ],
    [loadingInvoice],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>
          {total} invoice{total === 1 ? "" : "s"} from Polar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={filteredOrders}
          columns={columns}
          actions={actions}
          loading={loading}
          loadingText="Loading invoices..."
          emptyIcon={<FileText className="h-8 w-8 text-gray-400" />}
          emptyTitle="No invoices found"
          emptyDescription="Invoices will appear here once orders are created."
          searchable
          searchPlaceholder="Search by invoice, customer or status..."
          searchValue={searchTerm}
          onSearchChange={(value) => {
            setSearchTerm(value);
            updateURL({ search: value, page: 1 });
          }}
          pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={(page) => {
            setCurrentPage(page);
            updateURL({ page });
          }}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
            updateURL({ limit: size, page: 1 });
          }}
          getRowId={(row) => row.id}
          onRefresh={loadInvoices}
        />
      </CardContent>
    </Card>
  );
}
