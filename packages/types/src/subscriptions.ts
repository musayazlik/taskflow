// ============================================
// Subscription Types
// ============================================

import type { Product } from "./products";

export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  priceId: string;
  status: string;
  currentPeriodStart: Date | string;
  currentPeriodEnd: Date | string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  product?: Product;
  price?: {
    id: string;
    type: "one_time" | "recurring";
    priceAmount: number;
    priceCurrency: string;
    recurringInterval: string | null;
  };
  user?: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}
