"use client";

import { Badge } from "@repo/shadcn-ui/badge";
import { cn } from "@/lib/utils";

export const priorityConfig = {
  low: {
    label: "Low",
    className:
      "bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-600",
  },
  medium: {
    label: "Medium",
    className:
      "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
  },
  high: {
    label: "High",
    className:
      "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30",
  },
};

interface PriorityBadgeProps {
  priority: "low" | "medium" | "high";
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Badge variant="outline" className={cn("border", config.className)}>
      {config.label}
    </Badge>
  );
}
