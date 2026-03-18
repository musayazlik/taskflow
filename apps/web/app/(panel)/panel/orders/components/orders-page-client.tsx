"use client";

import { ShoppingCart, Loader2, RefreshCw, DollarSign, CheckCircle, Banknote, Clock, TrendingUp } from "lucide-react";
import { Button } from "@repo/shadcn-ui/button";
import { cn } from "@/lib/utils";
import type { Order } from "@/services";
import { StatsGrid, type StatItem } from "@/components/stats";
import { OrdersTable } from "./organisms/orders-table";
import { orderService } from "@/services/order.service";
import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/panel/page-header";

interface OrdersPageClientProps {
  initialOrders: Order[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialTotalPages: number;
}

export function OrdersPageClient({
  initialOrders,
  initialTotal,
  initialPage,
  initialPageSize,
  initialTotalPages,
}: OrdersPageClientProps) {
  const [loading, setLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await orderService.getOrders({
        page: initialPage,
        limit: initialPageSize,
      });

      if (!response.success) {
        toast.error(response.error || "Failed to load orders");
      } else {
        toast.success("Orders refreshed");
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [initialPage, initialPageSize]);

  const statsItems = useMemo<StatItem[]>(() => {
    const completedOrders = initialOrders.filter((o) =>
      ["completed", "paid"].includes(o.status.toLowerCase()),
    ).length;
    const pendingOrders = initialOrders.filter(
      (o) => o.status.toLowerCase() === "pending",
    ).length;
    const refundedOrders = initialOrders.filter((o) =>
      ["refunded", "partially_refunded"].includes(o.status.toLowerCase()),
    ).length;
    const totalRevenue =
      initialOrders
        .filter((o) => ["completed", "paid"].includes(o.status.toLowerCase()))
        .reduce((sum, o) => sum + (o.amount || 0), 0) / 100;
    const avgOrderValue =
      completedOrders > 0 ? totalRevenue / completedOrders : 0;

    return [
      {
        label: "Total Orders",
        value: initialTotal || initialOrders.length,
        icon: ShoppingCart,
        color: "blue",
        trend: "+12%",
      },
      {
        label: "Total Revenue",
        value: totalRevenue,
        icon: DollarSign,
        color: "green",
        formatter: (val) =>
          `$${(val as number).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        trend: "+8%",
      },
      {
        label: "Completed",
        value: completedOrders,
        icon: CheckCircle,
        color: "emerald",
        trend: "+15%",
      },
      {
        label: "Pending",
        value: pendingOrders,
        icon: Clock,
        color: "amber",
        trend: "+5%",
      },
    ];
  }, [initialOrders, initialTotal]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ShoppingCart}
        title="Orders"
        description="View and manage orders from Polar"
        titleSize="large"
        actions={[
          {
            label: "Refresh",
            icon: (
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            ),
            onClick: loadOrders,
            variant: "outline",
            disabled: loading,
            loading: loading,
          },
        ]}
      />

      <StatsGrid items={statsItems} />

      <OrdersTable
        initialOrders={initialOrders}
        initialTotal={initialTotal}
        initialPage={initialPage}
        initialPageSize={initialPageSize}
        initialTotalPages={initialTotalPages}
      />
    </div>
  );
}
