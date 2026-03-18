"use client";

import { ArrowUpRight } from "lucide-react";
import { Badge } from "@repo/shadcn-ui/badge";

interface PolarBadgeProps {
  polarCustomerId: string;
}

export function PolarBadge({ polarCustomerId }: PolarBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="text-xs flex items-center gap-1 border-blue-200 text-blue-700 dark:border-blue-500/40 dark:text-blue-300"
    >
      <ArrowUpRight className="h-3 w-3" />
      <span className="truncate">{polarCustomerId}</span>
    </Badge>
  );
}
