"use client";

import { formatCurrency } from "../utils";
import type { Subscription } from "@/services";

interface PriceCellProps {
  subscription: Subscription;
}

export function PriceCell({ subscription }: PriceCellProps) {
  return (
    <div>
      <p className="font-semibold text-gray-900 dark:text-white">
        {subscription.price ? (
          <>
            {formatCurrency(
              subscription.price.priceAmount,
              subscription.price.priceCurrency,
            )}
            /{subscription.price.recurringInterval || "month"}
          </>
        ) : (
          "N/A"
        )}
      </p>
    </div>
  );
}
