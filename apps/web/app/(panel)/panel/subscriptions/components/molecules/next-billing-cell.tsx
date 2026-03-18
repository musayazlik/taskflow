"use client";

import { Calendar } from "lucide-react";
import { formatDate } from "../utils";
import type { Subscription } from "@/services";

interface NextBillingCellProps {
  subscription: Subscription;
}

export function NextBillingCell({ subscription }: NextBillingCellProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Calendar className="h-4 w-4" />
      {formatDate(subscription.currentPeriodEnd)}
    </div>
  );
}
