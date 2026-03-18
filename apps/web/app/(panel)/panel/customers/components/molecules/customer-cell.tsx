"use client";

import { Mail } from "lucide-react";
import { CustomerAvatar } from "../atoms/customer-avatar";
import type { Customer } from "@/services";

interface CustomerCellProps {
  customer: Customer;
}

export function CustomerCell({ customer }: CustomerCellProps) {
  return (
    <div className="flex items-center gap-3">
      <CustomerAvatar customer={customer} />
      <div className="flex flex-col">
        <span className="font-semibold text-gray-900 dark:text-white">
          {customer.name || "Unknown"}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <Mail className="h-3 w-3" />
          {customer.email}
        </span>
      </div>
    </div>
  );
}
