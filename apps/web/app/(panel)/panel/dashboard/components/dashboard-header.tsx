import { Sparkles } from "lucide-react";

interface DashboardHeaderProps {
  title?: string;
  description?: string;
}

export function DashboardHeader({
  title = "Dashboard",
  description = "Welcome back! Here's what's happening today.",
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Live Data
          </span>
        </div>
      </div>
    </div>
  );
}
