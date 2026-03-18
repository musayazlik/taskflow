"use client";

import { Package, Truck, Eye, Download } from "lucide-react";
import { Card, CardHeader, CardContent } from "@repo/shadcn-ui/card";
import { Badge } from "@repo/shadcn-ui/badge";
import { Button } from "@repo/shadcn-ui/button";
import { cn } from "@/lib/utils";
import { statusConfig, type Order } from "@/constant/orders";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {order.id}
                </h3>
                <Badge
                  variant="outline"
                  className={cn("text-xs", status.className)}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ordered on{" "}
                {new Date(order.date).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ${order.total.toFixed(2)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="border-t border-gray-200 dark:border-zinc-800 pt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Items
          </h4>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={`${order.id}-${item.name}`}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold">
                    {item.quantity}x
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ${item.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {order.trackingNumber && (
            <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Tracking Number:
                </span>
                <span className="font-mono font-medium text-blue-700 dark:text-blue-400">
                  {order.trackingNumber}
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-200 dark:border-zinc-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-200 dark:border-zinc-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Invoice
            </Button>
            {order.status === "delivered" && (
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200 dark:border-zinc-700"
              >
                Write Review
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
