"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/shadcn-ui/alert-dialog";
import { DataTable, type Column, type DataTableAction } from "@/components/data-table";
import { OrderCell } from "../molecules/order-cell";
import { ProductCell } from "../molecules/product-cell";
import { CustomerCell } from "../molecules/customer-cell";
import { AmountCell } from "../molecules/amount-cell";
import { StatusBadge } from "../atoms/status-badge";
import type { Order } from "@/services";
import { orderService } from "@/services/order.service";
import { toast } from "sonner";
import { ShoppingCart, Receipt, FileText, Download, X } from "lucide-react";

interface OrdersTableProps {
  initialOrders: Order[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialTotalPages: number;
}

export function OrdersTable({
  initialOrders,
  initialTotal,
  initialPage,
  initialPageSize,
  initialTotalPages,
}: OrdersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [loading, setLoading] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await orderService.getOrders({
        page: currentPage,
        limit: pageSize,
      });

      if (!response.success) {
        toast.error(response.error || "Failed to load orders");
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
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
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

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    toast.info(
      "Order cancellation requires refund processing. Please contact support.",
    );
    setCancelDialogOpen(false);
    setSelectedOrder(null);
  };

  const canCancelOrder = (order: Order) => {
    const status = order.status.toLowerCase();
    return (
      status === "pending" || status === "paid" || status === "completed"
    );
  };

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const term = searchTerm.toLowerCase();
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(term) ||
        order.product?.name?.toLowerCase().includes(term) ||
        order.user?.name?.toLowerCase().includes(term) ||
        order.user?.email?.toLowerCase().includes(term) ||
        order.status.toLowerCase().includes(term),
    );
  }, [orders, searchTerm]);

  const columns: Column<Order>[] = useMemo(
    () => [
      {
        key: "orderId",
        header: "Order ID",
        cell: (order) => <OrderCell order={order} />,
      },
      {
        key: "product",
        header: "Product",
        cell: (order) => <ProductCell order={order} />,
        className: "min-w-[200px]",
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
        icon: <Download className="h-4 w-4" />,
        onClick: handleDownloadInvoice,
        disabled: (order) => loadingInvoice === order.id,
      },
      {
        label: "Cancel Order",
        icon: <X className="h-4 w-4" />,
        onClick: (order) => {
          setSelectedOrder(order);
          setCancelDialogOpen(true);
        },
        variant: "destructive",
        disabled: (order) => !canCancelOrder(order),
      },
    ],
    [loadingInvoice],
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              All Orders
            </CardTitle>
            <CardDescription>{total} orders from Polar</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredOrders}
            columns={columns}
            actions={actions}
            loading={loading}
            loadingText="Loading orders from Polar..."
            emptyIcon={<ShoppingCart className="h-8 w-8 text-gray-400" />}
            emptyTitle="No orders found"
            emptyDescription="Orders from Polar will appear here once customers make purchases"
            searchable={true}
            searchPlaceholder="Search orders..."
            searchValue={searchTerm}
            onSearchChange={(value) => {
              setSearchTerm(value);
              updateURL({ search: value, page: 1 });
            }}
            pagination={true}
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
            onRefresh={loadOrders}
          />
        </CardContent>
      </Card>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel order #
              {selectedOrder?.id.slice(0, 8)}? This action may require refund
              processing through customer support.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
