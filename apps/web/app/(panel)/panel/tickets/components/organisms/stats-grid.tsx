"use client";

import {
  Ticket,
  AlertCircle,
  Clock,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/shadcn-ui/card";
import { Badge } from "@repo/shadcn-ui/badge";
import type { TicketStats } from "@/services/server";

interface StatsGridProps {
  stats: TicketStats | null;
}

export function StatsGrid({ stats }: StatsGridProps) {
  if (!stats) return null;

  const statItems = [
    {
      label: "Total Tickets",
      value: stats.total,
      icon: Ticket,
      color: "blue",
      trend: "+12%",
    },
    {
      label: "Open",
      value: stats.open,
      icon: AlertCircle,
      color: "amber",
      trend: "+5%",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "orange",
      trend: "+8%",
    },
    {
      label: "Resolved",
      value: stats.closed,
      icon: CheckCircle,
      color: "emerald",
      trend: "+15%",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className={`relative overflow-hidden bg-linear-to-br from-${stat.color}-500/10 to-${stat.color === "blue" ? "cyan" : stat.color === "amber" ? "yellow" : stat.color === "orange" ? "amber" : "teal"}-500/5 border-0 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-linear-to-br from-white/5 to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                <Icon className={`h-4 w-4 text-${stat.color}-500`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="default"
                  className="text-xs bg-green-500/10 text-green-600 hover:bg-green-500/20"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.trend}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  vs last month
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
