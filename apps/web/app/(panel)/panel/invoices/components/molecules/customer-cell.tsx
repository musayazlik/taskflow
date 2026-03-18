"use client";

import { User } from "lucide-react";
import type { Order } from "@/services";

interface CustomerCellProps {
  order: Order;
}

export function CustomerCell({ order }: CustomerCellProps) {
  if (!order.user) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
        <User className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="font-medium text-sm">{order.user.name || "—"}</p>
        <p className="text-xs text-muted-foreground">{order.user.email}</p>
      </div>
    </div>
  );
}
