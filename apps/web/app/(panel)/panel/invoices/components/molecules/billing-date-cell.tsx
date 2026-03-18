"use client";

import { Calendar } from "lucide-react";
import { formatDate } from "../utils";
import type { Order } from "@/services";

interface BillingDateCellProps {
  order: Order;
}

export function BillingDateCell({ order }: BillingDateCellProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Calendar className="h-4 w-4" />
      {formatDate(order.updatedAt)}
    </div>
  );
}
