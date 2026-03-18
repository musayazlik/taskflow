"use client";

import { Avatar, AvatarFallback } from "@repo/shadcn-ui/avatar";
import { getInitials } from "../utils";
import type { Customer } from "@/services";

interface CustomerAvatarProps {
  customer: Customer;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function CustomerAvatar({ customer, size = "md" }: CustomerAvatarProps) {
  const initials = getInitials(customer.name || customer.email);
  const sizeClass = sizeClasses[size];

  return (
    <Avatar
      className={`${sizeClass} border border-gray-200 dark:border-zinc-800 shadow-sm`}
    >
      <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-white font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
