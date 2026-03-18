"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/shadcn-ui/card";
import { Badge } from "@repo/shadcn-ui/badge";
import {
  ShoppingCart,
  DollarSign,
  CheckCircle,
  Banknote,
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
    totalOrders: total || orders.length,
    completedOrders: orders.filter((o) =>
      ["completed", "paid"].includes(o.status.toLowerCase()),
    ).length,
    pendingOrders: orders.filter((o) => o.status.toLowerCase() === "pending")
      .length,
    refundedOrders: orders.filter((o) =>
      ["refunded", "partially_refunded"].includes(o.status.toLowerCase()),
    ).length,
    totalRevenue:
      orders
        .filter((o) => ["completed", "paid"].includes(o.status.toLowerCase()))
        .reduce((sum, o) => sum + (o.amount || 0), 0) / 100,
    avgOrderValue: 0,
  };

  stats.avgOrderValue =
    stats.completedOrders > 0 ? stats.totalRevenue / stats.completedOrders : 0;

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden bg-linear-to-br from-blue-500/10 to-cyan-500/5 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-linear-to-br from-white/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/20">
              <ShoppingCart className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
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
              Completed
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completedOrders}</div>
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
              Avg. Order Value
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Banknote className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${stats.avgOrderValue.toFixed(2)}
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
                  {stats.pendingOrders}
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
                  {stats.refundedOrders}
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
                  {stats.totalOrders > 0
                    ? Math.round(
                        (stats.completedOrders / stats.totalOrders) * 100,
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
