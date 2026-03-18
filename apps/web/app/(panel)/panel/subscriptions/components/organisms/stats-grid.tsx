"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/shadcn-ui/card";
import { Badge } from "@repo/shadcn-ui/badge";
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  TrendingUp,
  Clock,
  XCircle,
} from "lucide-react";
import type { Subscription } from "@/services";

interface StatsGridProps {
  subscriptions: Subscription[];
  total: number;
}

export function StatsGrid({ subscriptions, total }: StatsGridProps) {
  const stats = {
    total: total || subscriptions.length,
    active: subscriptions.filter((s) => s.status === "active").length,
    canceled: subscriptions.filter((s) => s.status === "canceled").length,
    pastDue: subscriptions.filter((s) => s.status === "past_due").length,
    totalRevenue: subscriptions
      .filter((s) => s.status === "active" && s.price)
      .reduce((sum, s) => sum + (s.price?.priceAmount || 0) / 100, 0),
    avgRevenue: 0,
  };

  stats.avgRevenue = stats.active > 0 ? stats.totalRevenue / stats.active : 0;

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden bg-linear-to-br from-blue-500/10 to-cyan-500/5 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-linear-to-br from-white/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Subscriptions
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/20">
              <CreditCard className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
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
              Active
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.active}</div>
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
              Avg. Revenue
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/20">
              <CreditCard className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${stats.avgRevenue.toFixed(2)}
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
                <div className="text-sm text-muted-foreground">Canceled</div>
                <div className="font-semibold text-lg">{stats.canceled}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-red-500/10 to-transparent border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Past Due</div>
                <div className="font-semibold text-lg">{stats.pastDue}</div>
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
                <div className="text-sm text-muted-foreground">Active Rate</div>
                <div className="font-semibold text-lg">
                  {stats.total > 0
                    ? Math.round((stats.active / stats.total) * 100)
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
