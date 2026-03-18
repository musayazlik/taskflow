// ============================================
// Order Types
// ============================================

import type { Product } from "./products";

export interface Order {
  id: string;
  externalOrderId: string;
  amount: number;
  currency: string;
  status: string;
  customerId: string | null;
  productId: string | null;
  priceId: string | null;
  metadata?: Record<string, any>;
  createdAt: Date | string;
  updatedAt: Date | string;
  product?: Product | null;
  price?: {
    id: string;
    type: "one_time" | "recurring";
    priceAmount: number;
    priceCurrency: string;
    recurringInterval: string | null;
  } | null;
  user?: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  } | null;
}

export interface Invoice {
  id: string;
  orderId: string;
  url: string;
  pdfUrl?: string;
  createdAt: string;
}

// Service-level types
export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
}
