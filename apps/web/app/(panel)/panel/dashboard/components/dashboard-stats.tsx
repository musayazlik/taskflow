"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/shadcn-ui/card";
import {
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PANEL_DASHBOARD_STATS } from "@repo/types";

const iconMap = {
  "Total Revenue": DollarSign,
  Subscriptions: Users,
  Sales: ShoppingCart,
  "Active Now": TrendingUp,
} as const;

const iconColorMap = {
  "Total Revenue": {
    bg: "bg-emerald-100 dark:bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    shadow: "shadow-emerald-500/20",
  },
  Subscriptions: {
    bg: "bg-blue-100 dark:bg-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    shadow: "shadow-blue-500/20",
  },
  Sales: {
    bg: "bg-violet-100 dark:bg-violet-500/20",
    text: "text-violet-600 dark:text-violet-400",
    shadow: "shadow-violet-500/20",
  },
  "Active Now": {
    bg: "bg-amber-100 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    shadow: "shadow-amber-500/20",
  },
} as const;

interface DashboardStatsProps {
  stats: typeof PANEL_DASHBOARD_STATS;
  userRole: "USER" | "ADMIN" | "SUPER_ADMIN";
}

export function DashboardStats({ stats, userRole }: DashboardStatsProps) {
  const filteredStats = stats
    .map((stat) => ({
      ...stat,
      icon: iconMap[stat.title as keyof typeof iconMap],
      colors: iconColorMap[stat.title as keyof typeof iconColorMap],
    }))
    .filter(
      (stat) => userRole === "ADMIN" || stat.title === "Subscriptions",
    );

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {filteredStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className="relative overflow-hidden bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:shadow-lg transition-all duration-300 group"
          >
            {/* Gradient accent */}
            <div
              className={cn(
                "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 transition-opacity group-hover:opacity-30",
                stat.colors.bg,
              )}
            />

            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.title}
              </CardTitle>
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl",
                  stat.colors.bg,
                )}
              >
                <Icon className={cn("h-5 w-5", stat.colors.text)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold",
                    stat.trend === "up"
                      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                      : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400",
                  )}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.change}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.description}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
