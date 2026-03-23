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
  Users,
  Package,
  Activity,
  Clock,
  BarChart3,
  Zap,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import {
  LineChartComponent,
  BarChartComponent,
  type ChartConfig,
} from "@/components/charts";

export function UserDashboard() {
  return (
    <div className="space-y-6">
      {/* User Welcome Card */}
      <Card className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/25">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Welcome to Your Dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your subscription and view your activity
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Stats Grid - Single Stat */}
      <div className="grid gap-4 grid-cols-1">
        <Card className="relative overflow-hidden bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 bg-blue-400 -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Subscription Status
            </CardTitle>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              Active
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                <ArrowUpRight className="h-3 w-3" />
                Premium Plan
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Renews in 12 days
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Charts Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* User Activity Chart */}
        <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Your Activity
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Daily logins and interactions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <LineChartComponent
              data={[
                { day: "Mon", logins: 3, actions: 12 },
                { day: "Tue", logins: 5, actions: 18 },
                { day: "Wed", logins: 2, actions: 8 },
                { day: "Thu", logins: 4, actions: 15 },
                { day: "Fri", logins: 6, actions: 22 },
                { day: "Sat", logins: 3, actions: 10 },
                { day: "Sun", logins: 2, actions: 7 },
              ]}
              config={{
                logins: {
                  label: "Logins",
                  color: "hsl(var(--chart-1))",
                },
                actions: {
                  label: "Actions",
                  color: "hsl(var(--chart-2))",
                },
              }}
              xAxisKey="day"
              dataKeys={["logins", "actions"]}
              className="h-[250px] w-full"
              showDots={true}
              curveType="monotone"
              showLegend={true}
            />
          </CardContent>
        </Card>

        {/* Usage Breakdown */}
        <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-violet-500" />
              Feature Usage
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              How you use the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <BarChartComponent
              data={[
                { feature: "Tasks", usage: 45 },
                { feature: "Notifications", usage: 32 },
                { feature: "Profile", usage: 28 },
                { feature: "Media", usage: 15 },
                { feature: "Dashboard", usage: 22 },
              ]}
              config={{
                usage: {
                  label: "Usage Count",
                  color: "hsl(var(--chart-3))",
                },
              }}
              xAxisKey="feature"
              dataKeys={["usage"]}
              className="h-[250px] w-full"
              showLegend={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* User Quick Actions & Recent */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* User Quick Actions */}
        <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Common tasks for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-2">
              {[
                {
                  icon: Activity,
                  label: "Tasks",
                  description: "View your tasks",
                  href: "/panel/tasks",
                  color: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
                },
                {
                  icon: Clock,
                  label: "Notifications",
                  description: "Review recent updates",
                  href: "/panel/notifications",
                  color: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
                },
                {
                  icon: BarChart3,
                  label: "Dashboard",
                  description: "Track your activity",
                  href: "/panel/dashboard",
                  color: "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400",
                },
                {
                  icon: Settings,
                  label: "Settings",
                  description: "Manage your account",
                  href: "/panel/settings",
                  color:
                    "bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-400",
                },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex flex-col gap-3 p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 transition-all duration-200"
                  >
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-xl transition-transform group-hover:scale-110 ${action.color}`}
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

        {/* Recent User Activity */}
        <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Your Recent Activity
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Latest actions you performed
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  action: "Completed a task",
                  time: "2 hours ago",
                  icon: Activity,
                },
                {
                  action: "Updated profile settings",
                  time: "5 hours ago",
                  icon: Settings,
                },
                {
                  action: "Read notifications",
                  time: "Yesterday",
                  icon: Clock,
                },
                {
                  action: "Viewed analytics",
                  time: "2 days ago",
                  icon: BarChart3,
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20">
                      <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {item.action}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {item.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
