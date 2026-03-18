import type { LucideIcon } from "lucide-react";
import { CheckCircle, Package, Truck, Clock } from "lucide-react";

export type OrderStatus = "delivered" | "shipped" | "processing" | "cancelled";

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  trackingNumber: string | null;
}

export interface StatusConfig {
  label: string;
  icon: LucideIcon;
  className: string;
}

export const statusConfig: Record<OrderStatus, StatusConfig> = {
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    className:
      "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    className:
      "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
  },
  processing: {
    label: "Processing",
    icon: Clock,
    className:
      "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
  },
  cancelled: {
    label: "Cancelled",
    icon: Package,
    className:
      "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30",
  },
};
