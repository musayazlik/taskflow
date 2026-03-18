"use client";

import {
  FileText,
  Loader2,
  Receipt,
  ShoppingCart,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@repo/shadcn-ui/button";
import type { Order } from "@/services";
import { StatsGrid, type StatItem } from "@/components/stats";
import { InvoicesTable } from "./organisms/invoices-table";
import { orderService } from "@/services/order.service";
import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/panel/page-header";

interface InvoicesPageClientProps {
  initialOrders: Order[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialTotalPages: number;
}

export function InvoicesPageClient({
  initialOrders,
  initialTotal,
  initialPage,
  initialPageSize,
  initialTotalPages,
}: InvoicesPageClientProps) {
  const [loading, setLoading] = useState(false);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await orderService.getOrders({
        page: initialPage,
        limit: initialPageSize,
      });

      if (!response.success) {
        toast.error(response.error || "Failed to load invoices");
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast.error("Failed to load invoices");
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
    const totalRevenue =
      initialOrders
        .filter((o) => ["completed", "paid"].includes(o.status.toLowerCase()))
        .reduce((sum, o) => sum + (o.amount || 0), 0) / 100;

    return [
      {
        label: "Total Invoices",
        value: initialTotal || initialOrders.length,
        icon: FileText,
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
        label: "Paid",
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
        icon={FileText}
        title="Invoices"
        description="View and manage invoices generated from orders"
        titleSize="large"
        actions={[
          {
            label: "Refresh",
            icon: loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Receipt className="h-4 w-4" />
            ),
            onClick: loadInvoices,
            disabled: loading,
            variant: "outline",
          },
        ]}
      />

      <StatsGrid items={statsItems} />

      <InvoicesTable
        initialOrders={initialOrders}
        initialTotal={initialTotal}
        initialPage={initialPage}
        initialPageSize={initialPageSize}
        initialTotalPages={initialTotalPages}
      />
    </div>
  );
}
