"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/shadcn-ui/card";
import { Badge } from "@repo/shadcn-ui/badge";
import {
  Receipt,
  DollarSign,
  CheckCircle,
  FileText,
  TrendingUp,
  Clock,
  RefreshCw,
} from "lucide-react";
import type { Order } from "@/services";

interface StatsGridProps {
  orders: Order[];
  total: number;
}

export function StatsGrid({ orders, total }: StatsGridProps) {
  const stats = {
    totalInvoices: total || orders.length,
    paidInvoices: orders.filter((o) =>
      ["paid", "completed"].includes(o.status.toLowerCase()),
    ).length,
    pendingInvoices: orders.filter((o) => o.status.toLowerCase() === "pending")
      .length,
    refundedInvoices: orders.filter((o) =>
      ["refunded", "partially_refunded"].includes(o.status.toLowerCase()),
    ).length,
    totalRevenue:
      orders
        .filter((o) => ["paid", "completed"].includes(o.status.toLowerCase()))
        .reduce((sum, o) => sum + (o.amount || 0), 0) / 100,
    avgInvoiceValue: 0,
  };

  stats.avgInvoiceValue =
    stats.paidInvoices > 0 ? stats.totalRevenue / stats.paidInvoices : 0;

  return (
    <>
      {/* Stats Grid - First Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden bg-linear-to-br from-blue-500/10 to-cyan-500/5 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-linear-to-br from-white/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invoices
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Receipt className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalInvoices}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="default"
                className="text-xs bg-green-500/10 text-green-600 hover:bg-green-500/20"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                +12%
              </Badge>
              <span className="text-xs text-muted-foreground">
                vs last month
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-linear-to-br from-green-500/10 to-emerald-500/5 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-linear-to-br from-white/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-500/20">
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              $
              {stats.totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="default"
                className="text-xs bg-green-500/10 text-green-600 hover:bg-green-500/20"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                +18%
              </Badge>
              <span className="text-xs text-muted-foreground">
                vs last month
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-linear-to-br from-emerald-500/10 to-teal-500/5 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-linear-to-br from-white/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.paidInvoices}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="default"
                className="text-xs bg-green-500/10 text-green-600 hover:bg-green-500/20"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                +8%
              </Badge>
              <span className="text-xs text-muted-foreground">
                vs last month
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-linear-to-br from-purple-500/10 to-pink-500/5 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-linear-to-br from-white/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Invoice Value
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/20">
              <FileText className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${stats.avgInvoiceValue.toFixed(2)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="default"
                className="text-xs bg-green-500/10 text-green-600 hover:bg-green-500/20"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                +5%
              </Badge>
              <span className="text-xs text-muted-foreground">
                vs last month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights - Second Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-linear-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="font-semibold text-lg">
                  {stats.pendingInvoices}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-linear-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <RefreshCw className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Refunded</div>
                <div className="font-semibold text-lg">
                  {stats.refundedInvoices}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-linear-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Success Rate
                </div>
                <div className="font-semibold text-lg">
                  {stats.totalInvoices > 0
                    ? Math.round(
                        (stats.paidInvoices / stats.totalInvoices) * 100,
                      )
                    : 0}
                  %
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
