import { Static, Type as t } from "@sinclair/typebox";

// ============================================
// Customer Types (Local + Polar mapping)
// ============================================

export const CustomerSchema = t.Object({
  id: t.String(),
  userId: t.Union([t.String(), t.Null()]),
  email: t.String(),
  name: t.Union([t.String(), t.Null()]),
  externalCustomerId: t.String(),
  provider: t.Union([t.Literal("POLAR"), t.Literal("STRIPE")]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type Customer = Static<typeof CustomerSchema>;

// Frontend-friendly customer type (string dates)
export interface CustomerFrontend {
  id: string;
  userId: string | null;
  email: string;
  name: string | null;
  externalCustomerId: string;
  provider: "POLAR" | "STRIPE";
  createdAt: string;
  updatedAt: string;
}

export const CustomerQuerySchema = t.Object({
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
  search: t.Optional(t.String()),
});

export type CustomerQuery = Static<typeof CustomerQuerySchema>;

// Service-level params
export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
}
