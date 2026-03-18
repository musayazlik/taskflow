"use client";

import { Calendar } from "lucide-react";

interface DateCellProps {
  date: string | Date;
}

export function DateCell({ date }: DateCellProps) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
      <Calendar className="h-3.5 w-3.5" />
      {dateObj.toLocaleDateString()}
    </div>
  );
}
