"use client";

import { CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusLower = status.toLowerCase();

  const statusConfig: Record<
    string,
    { icon: typeof CheckCircle; label: string; className: string }
  > = {
    active: {
      icon: CheckCircle,
      label: "Active",
      className:
        "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
    },
    canceled: {
      icon: XCircle,
      label: "Canceled",
      className:
        "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30",
    },
    past_due: {
      icon: Clock,
      label: "Past Due",
      className:
        "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
    },
  };

  const config = statusConfig[statusLower] || {
    icon: Clock,
    label: status,
    className:
      "bg-gray-100 dark:bg-zinc-700/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-600",
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border",
        config.className,
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
