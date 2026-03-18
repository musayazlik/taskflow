"use client";

import { CreditCard } from "lucide-react";
import type { Subscription } from "@/services";

interface SubscriptionCellProps {
  subscription: Subscription;
}

export function SubscriptionCell({ subscription }: SubscriptionCellProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <CreditCard className="h-4 w-4" />
      </div>
      <div>
        <p className="font-semibold text-sm">
          {subscription.product?.name || "Unknown Product"}
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          #{subscription.id.slice(0, 8)}
        </p>
      </div>
    </div>
  );
}
