"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import {
  ShoppingCart,
  TrendingUp,
  Activity,
  Clock,
  ChevronRight,
  BarChart3,
  Trophy,
  Zap,
  Users,
  Package,
  FileText,
} from "lucide-react";
import {
  LineChartComponent,
  BarChartComponent,
  RadialChartComponent,
  type ChartConfig,
} from "@/components/charts";
import { SystemStats } from "@/components/system-stats";
import { cn } from "@/lib/utils";
import type { PANEL_RECENT_ACTIVITY, PANEL_TOP_PRODUCTS } from "@repo/types";

const revenueChartData = [
  { month: "Jan", revenue: 4500, target: 4000 },
  { month: "Feb", revenue: 5200, target: 4500 },
  { month: "Mar", revenue: 4800, target: 5000 },
  { month: "Apr", revenue: 6100, target: 5500 },
  { month: "May", revenue: 5900, target: 6000 },
  { month: "Jun", revenue: 7200, target: 6500 },
];

const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  target: {
    label: "Target",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const salesChartData = [
  { category: "Electronics", sales: 450 },
  { category: "Clothing", sales: 380 },
  { category: "Books", sales: 290 },
  { category: "Home", sales: 320 },
  { category: "Sports", sales: 210 },
];

const salesChartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const activeUsersData = [
  { name: "active", value: 573, fill: "hsl(var(--chart-1))" },
];

const activeUsersConfig = {
  active: {
    label: "Active Users",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const quickActions = [
  {
    icon: Users,
    label: "Add User",
    description: "Create new account",
    href: "/panel/users",
    color: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
  },
  {
    icon: Package,
    label: "New Product",
    description: "Add to inventory",
    href: "/panel/products/new",
    color:
      "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400",
  },
  {
    icon: FileText,
    label: "View Reports",
    description: "Sales & analytics",
    href: "/panel/analytics",
    color:
      "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Zap,
    label: "AI Models",
    description: "Manage AI tools",
    href: "/panel/ai-models",
    color:
      "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
  },
];

const statusStyles = {
  success:
    "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  warning:
    "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
  error:
    "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30",
  info: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
};

interface AdminDashboardProps {
  recentActivity: typeof PANEL_RECENT_ACTIVITY;
  topProducts: typeof PANEL_TOP_PRODUCTS;
}

export function AdminDashboard({
  recentActivity,
  topProducts,
}: AdminDashboardProps) {
  return (
    <>
      {/* Charts Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Revenue Trend */}
        <Card className="lg:col-span-4 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Revenue Trend
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Monthly revenue vs target comparison
              </CardDescription>
            </div>
            <Link
              href="/panel/analytics"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View Details
              <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <LineChartComponent
              data={revenueChartData}
              config={revenueChartConfig}
              xAxisKey="month"
              dataKeys={["revenue", "target"]}
              className="h-[280px] w-full"
              showDots={true}
              curveType="monotone"
              showLegend={false}
            />
          </CardContent>
        </Card>

        {/* Active Users Radial */}
        <Card className="lg:col-span-3 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Active Users
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Users currently browsing your store
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-4 pt-0">
            <RadialChartComponent
              data={activeUsersData}
              config={activeUsersConfig}
              className="h-[220px] w-full max-w-[220px]"
              centerValue="573"
              centerLabel="Online"
              endAngle={250}
              innerRadius={70}
              outerRadius={95}
            />
          </CardContent>
        </Card>
      </div>

      {/* Sales & Activity Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Sales by Category */}
        <Card className="lg:col-span-3 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-violet-500" />
              Sales by Category
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Top performing categories this month
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <BarChartComponent
              data={salesChartData}
              config={salesChartConfig}
              xAxisKey="category"
              dataKeys={["sales"]}
              className="h-[240px] w-full"
              showLegend={false}
            />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-4 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Latest actions from your users
              </CardDescription>
            </div>
            <Link
              href="/panel/notifications"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View All
              <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between gap-4 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-200 dark:bg-zinc-700">
                      <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {activity.user}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {activity.action}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-semibold border",
                        statusStyles[
                          activity.status as keyof typeof statusStyles
                        ] || statusStyles.info,
                      )}
                    >
                      {activity.status}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Statistics */}
      <SystemStats />

      {/* Top Products & Quick Actions */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Top Products */}
        <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Top Products
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Best selling products this month
              </CardDescription>
            </div>
            <Link
              href="/panel/products"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              All Products
              <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between gap-4 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm transition-all",
                        index === 0
                          ? "bg-linear-to-br from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-500/25"
                          : index === 1
                            ? "bg-linear-to-br from-gray-300 to-gray-400 dark:from-gray-500 dark:to-gray-600 text-white"
                            : index === 2
                              ? "bg-linear-to-br from-amber-600 to-amber-700 text-white"
                              : "bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-300",
                      )}
                    >
                      {index + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        {product.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {product.sales} sales
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    {product.revenue}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Common tasks you can perform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex flex-col gap-3 p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 transition-all duration-200"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-xl transition-transform group-hover:scale-110",
                        action.color,
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="block font-semibold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        {action.label}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        {action.description}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
