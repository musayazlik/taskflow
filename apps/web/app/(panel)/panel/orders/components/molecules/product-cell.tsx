"use client";

import { Package } from "lucide-react";
import type { Order } from "@/services";

interface ProductCellProps {
  order: Order;
}

export function ProductCell({ order }: ProductCellProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-linear-to-br from-gray-100 to-gray-50 dark:from-zinc-800 dark:to-zinc-900 rounded-lg flex items-center justify-center ring-1 ring-gray-200 dark:ring-zinc-700">
        <Package className="h-4 w-4 text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate">
          {order.product?.name || "Unknown Product"}
        </p>
        {order.product?.description && (
          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
            {order.product.description}
          </p>
        )}
      </div>
    </div>
  );
}
