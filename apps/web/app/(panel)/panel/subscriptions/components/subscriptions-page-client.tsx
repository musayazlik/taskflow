"use client";

import { CreditCard, Repeat, XCircle, AlertCircle, DollarSign, TrendingUp } from "lucide-react";
import type { Subscription } from "@/services";
import { StatsGrid, type StatItem } from "@/components/stats";
import { SubscriptionsTable } from "./organisms/subscriptions-table";
import { PageHeader } from "@/components/panel/page-header";
import { useMemo } from "react";

interface SubscriptionsPageClientProps {
  initialSubscriptions: Subscription[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialTotalPages: number;
}

export function SubscriptionsPageClient({
  initialSubscriptions,
  initialTotal,
  initialPage,
  initialPageSize,
  initialTotalPages,
}: SubscriptionsPageClientProps) {
  const statsItems = useMemo<StatItem[]>(() => {
    const active = initialSubscriptions.filter((s) => s.status === "active").length;
    const canceled = initialSubscriptions.filter((s) => s.status === "canceled").length;
    const pastDue = initialSubscriptions.filter((s) => s.status === "past_due").length;
    const totalRevenue =
      initialSubscriptions
        .filter((s) => s.status === "active" && s.price)
        .reduce((sum, s) => sum + (s.price?.priceAmount || 0) / 100, 0);
    const avgRevenue = active > 0 ? totalRevenue / active : 0;

    return [
      {
        label: "Total Subscriptions",
        value: initialTotal || initialSubscriptions.length,
        icon: CreditCard,
        color: "blue",
        trend: "+12%",
      },
      {
        label: "Active",
        value: active,
        icon: Repeat,
        color: "green",
        trend: "+8%",
      },
      {
        label: "Canceled",
        value: canceled,
        icon: XCircle,
        color: "red",
        trend: "+2%",
      },
      {
        label: "Past Due",
        value: pastDue,
        icon: AlertCircle,
        color: "amber",
        trend: "-5%",
      },
    ];
  }, [initialSubscriptions, initialTotal]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CreditCard}
        title="Subscriptions"
        description="Manage subscriptions and billing"
      />

      <StatsGrid items={statsItems} />

      <SubscriptionsTable
        initialSubscriptions={initialSubscriptions}
        initialTotal={initialTotal}
        initialPage={initialPage}
        initialPageSize={initialPageSize}
        initialTotalPages={initialTotalPages}
      />
    </div>
  );
}
