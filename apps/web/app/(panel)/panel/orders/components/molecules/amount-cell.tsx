"use client";

import { formatCurrency } from "../utils";
import type { Order } from "@/services";

interface AmountCellProps {
  order: Order;
}

export function AmountCell({ order }: AmountCellProps) {
  return (
    <div>
      <p className="font-semibold text-gray-900 dark:text-white">
        {formatCurrency(order.amount, order.currency)}
      </p>
      {order.price && (
        <p className="text-xs text-muted-foreground">
          {order.price.recurringInterval
            ? `/${order.price.recurringInterval}`
            : "one-time"}
        </p>
      )}
    </div>
  );
}
