"use client";

import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/shadcn-ui/card";
import { Badge } from "@repo/shadcn-ui/badge";
import { cn } from "@/lib/utils";

export interface StatItem {
  /** Stat label/title */
  label: string;
  /** Stat value (can be number or string) */
  value: number | string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Color theme: blue, green, amber, red, purple, orange, emerald, cyan, etc. */
  color?:
    | "blue"
    | "green"
    | "amber"
    | "red"
    | "purple"
    | "orange"
    | "emerald"
    | "cyan"
    | "violet"
    | "pink"
    | "gray"
    | "indigo";
  /** Optional trend indicator (e.g., "+12%") */
  trend?: string;
  /** Optional description text below the value */
  description?: string;
  /** Optional custom gradient classes */
  gradient?: string;
  /** Optional custom icon background classes */
  iconBg?: string;
  /** Optional custom icon color classes */
  iconColor?: string;
  /** Optional custom value formatter */
  formatter?: (value: number | string) => string;
}

export interface StatsGridProps {
  /** Array of stat items to display */
  items: StatItem[];
  /** Grid columns configuration */
  columns?: {
    default?: number;
    sm?: number;
    lg?: number;
  };
  /** Show trend badges */
  showTrends?: boolean;
  /** Custom className for the grid container */
  className?: string;
}

type ColorKey =
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "purple"
  | "orange"
  | "emerald"
  | "cyan"
  | "violet"
  | "pink"
  | "indigo"
  | "gray";

const colorConfig: Record<
  ColorKey,
  {
    gradient: string;
    iconBg: string;
    iconColor: string;
    borderColor: string;
  }
> = {
  blue: {
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    borderColor: "border-blue-500/20",
  },
  green: {
    gradient: "from-green-500/10 via-green-500/5 to-transparent",
    iconBg: "bg-green-500/10",
    iconColor: "text-green-500",
    borderColor: "border-green-500/20",
  },
  amber: {
    gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    borderColor: "border-amber-500/20",
  },
  red: {
    gradient: "from-red-500/10 via-red-500/5 to-transparent",
    iconBg: "bg-red-500/10",
    iconColor: "text-red-500",
    borderColor: "border-red-500/20",
  },
  purple: {
    gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
    borderColor: "border-purple-500/20",
  },
  orange: {
    gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
    borderColor: "border-orange-500/20",
  },
  emerald: {
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-500/20",
  },
  cyan: {
    gradient: "from-cyan-500/10 via-cyan-500/5 to-transparent",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-500",
    borderColor: "border-cyan-500/20",
  },
  violet: {
    gradient: "from-violet-500/10 via-violet-500/5 to-transparent",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
    borderColor: "border-violet-500/20",
  },
  pink: {
    gradient: "from-pink-500/10 via-pink-500/5 to-transparent",
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-500",
    borderColor: "border-pink-500/20",
  },
  indigo: {
    gradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-500",
    borderColor: "border-indigo-500/20",
  },
  gray: {
    gradient: "from-gray-500/10 via-gray-500/5 to-transparent",
    iconBg: "bg-gray-500/10",
    iconColor: "text-gray-500",
    borderColor: "border-gray-500/20",
  },
};

const getTrendDetails = (trend: string) => {
  const isPositive = trend.startsWith("+");
  const isNegative = trend.startsWith("-");

  if (isPositive) {
    return {
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    };
  }
  if (isNegative) {
    return {
      icon: TrendingDown,
      color: "text-red-500",
      bg: "bg-red-500/10",
    };
  }
  return {
    icon: Minus,
    color: "text-muted-foreground",
    bg: "bg-secondary",
  };
};

/**
 * Reusable Stats Grid Component
 */
export function StatsGrid({
  items,
  columns = { default: 1, sm: 2, lg: 4 },
  showTrends = true,
  className,
}: StatsGridProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid gap-4",
        {
          "grid-cols-1": columns.default === 1,
          "grid-cols-2": columns.default === 2,
          "grid-cols-3": columns.default === 3,
          "grid-cols-4": columns.default === 4,
          "sm:grid-cols-1": columns.sm === 1,
          "sm:grid-cols-2": columns.sm === 2,
          "sm:grid-cols-3": columns.sm === 3,
          "sm:grid-cols-4": columns.sm === 4,
          "lg:grid-cols-1": columns.lg === 1,
          "lg:grid-cols-2": columns.lg === 2,
          "lg:grid-cols-3": columns.lg === 3,
          "lg:grid-cols-4": columns.lg === 4,
        },
        className
      )}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const color = item.color || "blue";
        const config =
          color in colorConfig && colorConfig[color]
            ? colorConfig[color]
            : colorConfig.blue;

        const gradient = item.gradient || `bg-linear-to-br ${config.gradient}`;
        const iconBg = item.iconBg || config.iconBg;
        const iconColor = item.iconColor || config.iconColor;

        const displayValue = item.formatter
          ? item.formatter(item.value)
          : typeof item.value === "number"
            ? item.value.toLocaleString()
            : item.value;

        const trendDetails = item.trend ? getTrendDetails(item.trend) : null;
        const TrendIcon = trendDetails?.icon;

        return (
          <Card
            key={`${item.label}-${index}`}
            className={cn(
              "relative overflow-hidden transition-all duration-200 hover:shadow-md",
              "border bg-card",
              config.borderColor,
              gradient
            )}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-linear-to-br from-white/5 to-transparent blur-2xl" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
                <div className={cn("p-2 rounded-xl", iconBg)}>
                  <Icon className={cn("h-4 w-4", iconColor)} />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight">
                  {displayValue}
                </h3>
                
                {(item.description || (showTrends && item.trend && trendDetails)) && (
                  <div className="flex items-center gap-2 mt-2">
                    {showTrends && item.trend && trendDetails && TrendIcon ? (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "px-1.5 py-0.5 text-xs font-medium bg-background/50 backdrop-blur-sm border-0",
                          trendDetails.color
                        )}
                      >
                        <TrendIcon className="h-3 w-3 mr-1" />
                        {item.trend}
                      </Badge>
                    ) : null}
                    
                    {(item.description || (showTrends && item.trend)) && (
                      <p className="text-xs text-muted-foreground">
                        {item.description || "vs last month"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
