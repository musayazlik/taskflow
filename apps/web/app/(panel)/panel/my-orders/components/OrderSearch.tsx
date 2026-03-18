"use client";

import { Search } from "lucide-react";
import { Input } from "@repo/shadcn-ui/input";

interface OrderSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function OrderSearch({ searchQuery, onSearchChange }: OrderSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Search orders by ID or product name..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"
      />
    </div>
  );
}
