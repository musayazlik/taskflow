"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  Zap,
  Image as ImageIcon,
  FileText,
  Search,
  HardDrive,
  Cloud,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import { Progress } from "@repo/shadcn-ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/shadcn-ui/select";
import { usageService, type UsageStats, type UsageHistory } from "@/services";
import { toast } from "sonner";
import {
  AreaChartComponent,
  LineChartComponent,
  type ChartConfig,
} from "@/components/charts";
import { PageHeader } from "@/components/panel/page-header";
import Loading from "@/app/loading";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function UsagePageClient() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [history, setHistory] = useState<UsageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const loadStats = useCallback(async () => {
    try {
      const response = await usageService.getUsageStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        toast.error(response.message || "Failed to load usage stats");
      }
    } catch (error) {
      toast.error("Failed to load usage statistics");
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const response = await usageService.getUsageHistory(days);
      if (response.success && response.data) {
        // Ensure data is an array
        const historyData = Array.isArray(response.data) ? response.data : [];
        setHistory(historyData);
      } else {
        // Set empty array on error
        setHistory([]);
      }
    } catch (error) {
      // Silent fail for history, but ensure history is always an array
      setHistory([]);
    }
  }, [days]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadHistory()]);
      setLoading(false);
    };
    loadData();
  }, [loadStats, loadHistory]);

  const chartData = (Array.isArray(history) ? history : []).map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    apiCalls: item.apiCalls,
    storage: Math.round(item.storage / 1024 / 1024), // Convert to MB
    bandwidth: Math.round(item.bandwidth / 1024 / 1024), // Convert to MB
  }));

  const chartConfig = {
    apiCalls: {
      label: "API Calls",
      color: "hsl(var(--chart-1))",
    },
    storage: {
      label: "Storage (MB)",
      color: "hsl(var(--chart-2))",
    },
    bandwidth: {
      label: "Bandwidth (MB)",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-8">
      <PageHeader
        icon={BarChart3}
        title="Usage Statistics"
        description="Monitor your API usage, storage, and feature limits"
        titleSize="large"
        actions={
          <Select
            value={days.toString()}
            onValueChange={(v) => setDays(parseInt(v))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Main Stats Cards */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* API Calls */}
            <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  API Calls
                </CardTitle>
                <Zap className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.apiCalls.current.toLocaleString() || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  of {stats?.apiCalls.limit.toLocaleString() || 0} limit
                </div>
                <Progress
                  value={stats?.apiCalls.percentage || 0}
                  className="mt-3"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {stats?.apiCalls.percentage.toFixed(1) || 0}% used
                </div>
              </CardContent>
            </Card>

            {/* Storage */}
            <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Storage
                </CardTitle>
                <HardDrive className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatBytes(stats?.storage.current || 0)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  of {formatBytes(stats?.storage.limit || 0)} limit
                </div>
                <Progress
                  value={stats?.storage.percentage || 0}
                  className="mt-3"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {stats?.storage.percentage.toFixed(1) || 0}% used
                </div>
              </CardContent>
            </Card>

            {/* Bandwidth */}
            <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Bandwidth
                </CardTitle>
                <Cloud className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatBytes(stats?.bandwidth.current || 0)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  of {formatBytes(stats?.bandwidth.limit || 0)} limit
                </div>
                <Progress
                  value={stats?.bandwidth.percentage || 0}
                  className="mt-3"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {stats?.bandwidth.percentage.toFixed(1) || 0}% used
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Usage */}
          <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Feature Usage</CardTitle>
              <CardDescription>
                Track your usage across different features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {/* AI Chat */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      AI Chat
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.features.aiChat.current || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    of {stats?.features.aiChat.limit || 0} limit
                  </div>
                  <Progress
                    value={stats?.features.aiChat.percentage || 0}
                    className="h-2"
                  />
                </div>

                {/* Content Generation */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Content Generation
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.features.contentGeneration.current || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    of {stats?.features.contentGeneration.limit || 0} limit
                  </div>
                  <Progress
                    value={stats?.features.contentGeneration.percentage || 0}
                    className="h-2"
                  />
                </div>

                {/* Image Generation */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-pink-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Image Generation
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.features.imageGeneration.current || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    of {stats?.features.imageGeneration.limit || 0} limit
                  </div>
                  <Progress
                    value={stats?.features.imageGeneration.percentage || 0}
                    className="h-2"
                  />
                </div>

                {/* SEO */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      SEO
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.features.seo.current || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    of {stats?.features.seo.limit || 0} limit
                  </div>
                  <Progress
                    value={stats?.features.seo.percentage || 0}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage History Charts */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle>API Calls History</CardTitle>
                <CardDescription>
                  Daily API calls over the last {days} days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <AreaChartComponent
                    data={chartData}
                    config={{
                      apiCalls: chartConfig.apiCalls,
                    }}
                    xAxisKey="date"
                    dataKeys={["apiCalls"]}
                    className="h-[300px]"
                  />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle>Storage & Bandwidth</CardTitle>
                <CardDescription>
                  Storage and bandwidth usage over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <LineChartComponent
                    data={chartData}
                    config={{
                      storage: chartConfig.storage,
                      bandwidth: chartConfig.bandwidth,
                    }}
                    xAxisKey="date"
                    dataKeys={["storage", "bandwidth"]}
                    className="h-[300px]"
                  />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
