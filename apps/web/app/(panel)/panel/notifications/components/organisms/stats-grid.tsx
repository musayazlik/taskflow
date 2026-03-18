"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import { Badge } from "@repo/shadcn-ui/badge";
import { Bell, BellRing, AlertTriangle, AlertCircle, Check } from "lucide-react";

interface Notification {
  id: string | number;
  type: string;
  read?: boolean;
}

interface StatsGridProps {
  notifications: Notification[];
  readNotifications: string[];
}

export function StatsGrid({
  notifications,
  readNotifications,
}: StatsGridProps) {
  const unreadCount = notifications.filter(
    (n) => !readNotifications.includes(String(n.id)),
  ).length;
  const successCount = notifications.filter((n) => n.type === "success").length;
  const warningCount = notifications.filter((n) => n.type === "warning").length;
  const errorCount = notifications.filter((n) => n.type === "error").length;

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/10 rounded-full -mr-10 -mt-10" />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <Bell className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{notifications.length}</div>
          <p className="text-xs text-muted-foreground mt-1">notifications</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10" />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <BellRing className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Unread
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{unreadCount}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {unreadCount > 0 ? (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            ) : (
              <Check className="h-3 w-3 text-emerald-500" />
            )}
            {unreadCount > 0 ? "new notifications" : "all caught up"}
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -mr-10 -mt-10" />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            Warnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{warningCount}</div>
          <p className="text-xs text-muted-foreground mt-1">need attention</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -mr-10 -mt-10" />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            Errors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{errorCount}</div>
          <p className="text-xs text-muted-foreground mt-1">critical alerts</p>
        </CardContent>
      </Card>
    </div>
  );
}
