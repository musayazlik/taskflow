"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ShoppingBag,
  Truck,
  DollarSign,
  CheckCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { OrderSearch } from "./OrderSearch";
import { OrderCard } from "./OrderCard";
import { OrderEmptyState } from "./OrderEmptyState";
import { PageHeader } from "@/components/panel/page-header";
import { StatsGrid, type StatItem } from "@/components/stats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import { orderService } from "@/services";
import type { Order } from "@/services/types";
import { toast } from "sonner";
import type { Order as OrderConstant } from "@/constant/orders";

interface OrdersClientProps {
  initialOrders: Order[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialTotalPages: number;
}

// Convert service Order to constant Order format
function convertOrder(order: Order): OrderConstant {
  // Amount is in cents, convert to dollars
  const total = typeof order.amount === "number" ? order.amount / 100 : 0;

  // Map status to OrderConstant status
  const statusMap: Record<string, OrderConstant["status"]> = {
    completed: "delivered",
    delivered: "delivered",
    shipped: "shipped",
    processing: "processing",
    pending: "processing",
    cancelled: "cancelled",
    canceled: "cancelled",
  };

  const status = statusMap[order.status?.toLowerCase() || ""] || "processing";

  // Extract items from product or metadata
  const items: OrderConstant["items"] = [];
  if (order.product && order.product !== null) {
    items.push({
      name: order.product.name || "Unknown Product",
      quantity: 1,
      price: total,
    });
  } else if (order.metadata?.items) {
    // If items are stored in metadata
    const metadataItems = Array.isArray(order.metadata.items)
      ? order.metadata.items
      : [];
    items.push(
      ...metadataItems.map((item: any) => ({
        name: item.name || "Unknown Product",
        quantity: item.quantity || 1,
        price:
          typeof item.price === "number" ? item.price / 100 : item.price || 0,
      })),
    );
  } else {
    // Fallback: create a single item from the order
    items.push({
      name: "Order Item",
      quantity: 1,
      price: total,
    });
  }

  return {
    id: String(order.id),
    date:
      typeof order.createdAt === "string"
        ? order.createdAt
        : order.createdAt instanceof Date
          ? order.createdAt.toISOString()
          : new Date().toISOString(),
    total,
    status,
    items,
    trackingNumber:
      order.metadata?.trackingNumber || order.metadata?.tracking_number || null,
  };
}

export function OrdersClient({
  initialOrders,
  initialTotal,
  initialPage,
  initialPageSize,
  initialTotalPages,
}: OrdersClientProps) {
  const [orders, setOrders] = useState<OrderConstant[]>(
    initialOrders.map(convertOrder),
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  // Update orders when initialOrders changes
  useEffect(() => {
    setOrders(initialOrders.map(convertOrder));
    setTotal(initialTotal);
    setTotalPages(initialTotalPages);
  }, [initialOrders, initialTotal, initialTotalPages]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await orderService.getOrders({
        page: initialPage,
        limit: initialPageSize,
      });

      if (response.success && response.data) {
        const convertedOrders = response.data.data.map(convertOrder);
        setOrders(convertedOrders);
        setTotal(response.data.pagination?.total || convertedOrders.length);
        setTotalPages(
          response.data.pagination?.totalPages ||
            Math.ceil(
              (response.data.pagination?.total || convertedOrders.length) /
                initialPageSize,
            ),
        );
      } else {
        toast.error(response.error || "Failed to load orders");
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [initialPage, initialPageSize]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;

    const query = searchQuery.toLowerCase();
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(query) ||
        order.items.some((item) => item.name.toLowerCase().includes(query)),
    );
  }, [orders, searchQuery]);

  const statsItems = useMemo<StatItem[]>(() => {
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const inTransit = orders.filter(
      (o) => o.status === "shipped" || o.status === "processing",
    ).length;
    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

    return [
      {
        label: "Total Orders",
        value: total || orders.length,
        icon: ShoppingBag,
        color: "blue",
        trend: "+12%",
      },
      {
        label: "Delivered",
        value: delivered,
        icon: CheckCircle,
        color: "emerald",
        trend: "+8%",
      },
      {
        label: "In Transit",
        value: inTransit,
        icon: Truck,
        color: "amber",
        trend: "+5%",
      },
      {
        label: "Total Spent",
        value: totalSpent,
        icon: DollarSign,
        color: "violet",
        formatter: (val) =>
          `$${(val as number).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        trend: "+15%",
      },
    ];
  }, [orders, total]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ShoppingBag}
        title="My Orders"
        description="View and track your order history"
        iconBg="bg-linear-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25"
        titleSize="large"
        actions={[
          {
            label: "Refresh",
            icon: loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            ),
            onClick: loadOrders,
            disabled: loading,
            variant: "outline",
          },
        ]}
      />

      <StatsGrid items={statsItems} />

      <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Search and manage your order history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <OrderSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <OrderEmptyState searchQuery={searchQuery} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
