"use client";

import { Card, CardContent } from "@repo/shadcn-ui/card";
import { Images, HardDrive, FileImage } from "lucide-react";
import { formatFileSize } from "../utils";
import type { MediaFile } from "@/services";

interface StatsGridProps {
  files: MediaFile[];
}

export function StatsGrid({ files }: StatsGridProps) {
  const stats = {
    totalFiles: files.length,
    totalSize: files.reduce((sum, f) => sum + f.size, 0),
    imageFiles: files.filter(
      (f) =>
        f.type?.startsWith("image/") ||
        f.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i),
    ).length,
    otherFiles: 0,
  };
  stats.otherFiles = stats.totalFiles - stats.imageFiles;

  const statsCards = [
    {
      title: "Total Files",
      value: stats.totalFiles,
      icon: Images,
      gradient: "from-blue-500/10 to-cyan-500/5",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/20",
    },
    {
      title: "Total Size",
      value: formatFileSize(stats.totalSize),
      icon: HardDrive,
      gradient: "from-purple-500/10 to-pink-500/5",
      iconColor: "text-purple-500",
      iconBg: "bg-purple-500/20",
    },
    {
      title: "Images",
      value: stats.imageFiles,
      icon: FileImage,
      gradient: "from-green-500/10 to-emerald-500/5",
      iconColor: "text-green-500",
      iconBg: "bg-green-500/20",
    },
    {
      title: "Other Files",
      value: stats.otherFiles,
      icon: FileImage,
      gradient: "from-orange-500/10 to-yellow-500/5",
      iconColor: "text-orange-500",
      iconBg: "bg-orange-500/20",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className={`relative overflow-hidden bg-linear-to-br ${stat.gradient} border-0 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-linear-to-br from-white/5 to-transparent" />
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
