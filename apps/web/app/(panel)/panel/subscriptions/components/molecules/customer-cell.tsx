"use client";

import { User } from "lucide-react";
import type { Subscription } from "@/services";

interface CustomerCellProps {
  subscription: Subscription;
}

export function CustomerCell({ subscription }: CustomerCellProps) {
  if (!subscription.user) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
        <User className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="font-medium text-sm">{subscription.user.name || "—"}</p>
        <p className="text-xs text-muted-foreground">
          {subscription.user.email}
        </p>
      </div>
    </div>
  );
}
