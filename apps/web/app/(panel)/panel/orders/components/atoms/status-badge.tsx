"use client";

import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
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
    completed: {
      icon: CheckCircle,
      label: "Completed",
      className:
        "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
    },
    paid: {
      icon: CheckCircle,
      label: "Paid",
      className:
        "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
    },
    pending: {
      icon: Clock,
      label: "Pending",
      className:
        "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
    },
    refunded: {
      icon: RefreshCw,
      label: "Refunded",
      className:
        "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
    },
    partially_refunded: {
      icon: RefreshCw,
      label: "Partial Refund",
      className:
        "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30",
    },
    failed: {
      icon: XCircle,
      label: "Failed",
      className:
        "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30",
    },
    canceled: {
      icon: XCircle,
      label: "Canceled",
      className:
        "bg-gray-100 dark:bg-zinc-700/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-600",
    },
  };

  const config = statusConfig[statusLower] || {
    icon: AlertCircle,
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
