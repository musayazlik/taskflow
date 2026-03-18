"use client";

import { AlertCircle, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@repo/shadcn-ui/badge";
import { cn } from "@/lib/utils";

export const statusConfig = {
  open: {
    label: "Open",
    icon: AlertCircle,
    className:
      "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    className:
      "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
  },
  closed: {
    label: "Resolved",
    icon: CheckCircle,
    className:
      "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  },
};

interface StatusBadgeProps {
  status: "open" | "in_progress" | "closed";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("flex items-center gap-1.5", config.className)}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
