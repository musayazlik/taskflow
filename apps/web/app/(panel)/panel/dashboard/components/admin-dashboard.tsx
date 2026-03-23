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
  ListTodo,
  Activity,
  Clock,
  ChevronRight,
  BarChart3,
  Zap,
  Users,
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
import type { PANEL_RECENT_ACTIVITY } from "@repo/types";

const tasksCompletedChartData = [
  { month: "Jan", completed: 42, goal: 40 },
  { month: "Feb", completed: 55, goal: 45 },
  { month: "Mar", completed: 48, goal: 50 },
  { month: "Apr", completed: 61, goal: 55 },
  { month: "May", completed: 59, goal: 60 },
  { month: "Jun", completed: 72, goal: 65 },
];

const tasksCompletedChartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  goal: {
    label: "Goal",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const tasksByStatusChartData = [
  { status: "To do", count: 86 },
  { status: "In progress", count: 64 },
  { status: "Done", count: 412 },
];

const tasksByStatusChartConfig = {
  count: {
    label: "Tasks",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const activeUsersData = [
  { name: "active", value: 42, fill: "hsl(var(--chart-1))" },
];

const activeUsersConfig = {
  active: {
    label: "Active today",
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
    icon: FileText,
    label: "Tasks",
    description: "View and manage tasks",
    href: "/panel/tasks",
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
}

export function AdminDashboard({
  recentActivity,
}: AdminDashboardProps) {
  return (
    <>
      {/* Charts Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Tasks completed trend (illustrative) */}
        <Card className="lg:col-span-4 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Tasks completed
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Monthly completed tasks vs goal (sample data)
              </CardDescription>
            </div>
            <Link
              href="/panel/tasks"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View tasks
              <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <LineChartComponent
              data={tasksCompletedChartData}
              config={tasksCompletedChartConfig}
              xAxisKey="month"
              dataKeys={["completed", "goal"]}
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
              Users active in the workspace (sample)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-4 pt-0">
            <RadialChartComponent
              data={activeUsersData}
              config={activeUsersConfig}
              className="h-[220px] w-full max-w-[220px]"
              centerValue="42"
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
        {/* Tasks by status */}
        <Card className="lg:col-span-3 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-violet-500" />
              Tasks by status
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Snapshot by column (sample data)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <BarChartComponent
              data={tasksByStatusChartData}
              config={tasksByStatusChartConfig}
              xAxisKey="status"
              dataKeys={["count"]}
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

      {/* Quick Actions */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-1">
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
