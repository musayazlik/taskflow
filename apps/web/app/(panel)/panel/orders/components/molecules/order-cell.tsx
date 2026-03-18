"use client";

import { Receipt } from "lucide-react";
import { formatDate } from "../utils";
import type { Order } from "@/services";

interface OrderCellProps {
  order: Order;
}

export function OrderCell({ order }: OrderCellProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Receipt className="h-4 w-4" />
      </div>
      <div>
        <p className="font-mono text-sm font-semibold">
          #{order.id.slice(0, 8)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(order.createdAt)}
        </p>
      </div>
    </div>
  );
}
