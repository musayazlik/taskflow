import { Static, Type as t } from "@sinclair/typebox";

// Define PriceSchema first as it's used in ProductSchema
export const PriceSchema = t.Object({
  id: t.String(),
  externalPriceId: t.Union([t.String(), t.Null()]),
  type: t.String(),
  priceAmount: t.Number(),
  priceCurrency: t.String(),
  recurringInterval: t.Optional(t.Union([t.String(), t.Null()])), // Optional - only required for recurring prices
  isArchived: t.Boolean(),
});

// Schema for Product Media
export const ProductMediaSchema = t.Object({
  id: t.String(),
  public_url: t.String(),
});

// Provider enum schema
export const ProductProviderSchema = t.Union([
  t.Literal("POLAR"),
  t.Literal("STRIPE"),
]);

// Visibility enum schema
export const ProductVisibilitySchema = t.Union([
  t.Literal("PUBLIC"),
  t.Literal("HIDDEN"),
  t.Literal("MEMBERS_ONLY"),
]);

// Schema for Product (Mirror Model)
export const ProductSchema = t.Object({
  id: t.String(),
  // External provider reference
  provider: ProductProviderSchema,
  externalProductId: t.Union([t.String(), t.Null()]),
  // Core fields
  name: t.String(),
  description: t.Union([t.String(), t.Null()]),
  medias: t.Array(ProductMediaSchema),
  isRecurring: t.Boolean(),
  isArchived: t.Boolean(),
  // Internal management fields
  featured: t.Boolean(),
  orderIndex: t.Number(),
  visibility: ProductVisibilitySchema,
  // Sync tracking
  externalSyncedAt: t.Union([t.String(), t.Null()]), // ISO date string
  externalSyncAttempts: t.Number(),
  createdAt: t.String(), // ISO date string
  updatedAt: t.String(), // ISO date string
  prices: t.Array(PriceSchema),
});

export type Product = Static<typeof ProductSchema>;

// Frontend-compatible Product type (with string dates)
export interface ProductMedia {
  id: string;
  public_url: string;
}

export type ProductProvider = "POLAR" | "STRIPE";
export type ProductVisibility = "PUBLIC" | "HIDDEN" | "MEMBERS_ONLY";

export interface ProductFrontend {
  id: string;
  // External provider reference
  provider: ProductProvider;
  externalProductId: string | null;
  // Core fields
  name: string;
  description: string | null;
  isRecurring: boolean;
  isArchived: boolean;
  medias: ProductMedia[];
  // Internal management fields
  featured: boolean;
  orderIndex: number;
  visibility: ProductVisibility;
  // Sync tracking
  externalSyncedAt: string | null;
  externalSyncAttempts: number;
  createdAt: string;
  updatedAt: string;
  prices: Array<{
    id: string;
    externalPriceId: string | null;
    type: "one_time" | "recurring";
    priceAmount: number;
    priceCurrency: string;
    recurringInterval: string | null;
    isArchived: boolean;
  }>;
}

export const ProductWithPricesSchema = t.Composite([
  ProductSchema,
  t.Object({
    prices: t.Array(t.Any()),
  }),
]);

export type ProductWithPrices = Static<typeof ProductWithPricesSchema>;

// Schema for creating a product
export const CreateProductSchema = t.Object({
  name: t.String(),
  description: t.Optional(t.String()),
  isRecurring: t.Boolean(),
  medias: t.Optional(t.Array(t.String())),
  prices: t.Array(PriceSchema),
  // Internal management fields (optional)
  featured: t.Optional(t.Boolean()),
  orderIndex: t.Optional(t.Number()),
  visibility: t.Optional(ProductVisibilitySchema),
  // Polar-specific fields (optional, used during sync)
  metadata: t.Optional(t.Record(t.String(), t.String())),
  recurringInterval: t.Optional(
    t.Union([
      t.Literal("day"),
      t.Literal("week"),
      t.Literal("month"),
      t.Literal("year"),
    ]),
  ),
  recurringIntervalCount: t.Optional(t.Number()),
  trialInterval: t.Optional(
    t.Union([
      t.Literal("day"),
      t.Literal("week"),
      t.Literal("month"),
      t.Literal("year"),
    ]),
  ),
  trialIntervalCount: t.Optional(t.Number()),
  attachedCustomFields: t.Optional(
    t.Array(
      t.Object({
        custom_field_id: t.String(),
        required: t.Boolean(),
      }),
    ),
  ),
});

export type CreateProduct = Static<typeof CreateProductSchema>;

export const UpdateProductSchema = t.Object({
  name: t.Optional(t.String()),
  description: t.Optional(t.String()),
  isRecurring: t.Optional(t.Boolean()),
  isArchived: t.Optional(t.Boolean()),
  medias: t.Optional(t.Array(t.String())),
  // Internal management fields
  featured: t.Optional(t.Boolean()),
  orderIndex: t.Optional(t.Number()),
  visibility: t.Optional(ProductVisibilitySchema),
});

export type UpdateProduct = Static<typeof UpdateProductSchema>;

export const ProductQuerySchema = t.Object({
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
  includeArchived: t.Optional(t.String()),
  search: t.Optional(t.String()),
  featured: t.Optional(t.String()),
  visibility: t.Optional(t.String()),
  provider: t.Optional(t.String()),
  status: t.Optional(
    t.Union([t.Literal("all"), t.Literal("active"), t.Literal("archived")]),
  ),
});

export type ProductQuery = Static<typeof ProductQuerySchema>;

// Service-level types
export interface ProductListParams {
  page?: number;
  limit?: number;
  includeArchived?: boolean;
  search?: string;
  featured?: boolean;
  visibility?: ProductVisibility;
  provider?: ProductProvider;
  status?: "all" | "active" | "archived";
}

export interface CreateProductData {
  name: string;
  description?: string;
  isRecurring?: boolean;
  medias?: string[];
  prices?: {
    type: string;
    priceAmount: number;
    priceCurrency: string;
    recurringInterval?: string | null;
  }[];
  // Internal fields
  featured?: boolean;
  orderIndex?: number;
  visibility?: ProductVisibility;
  provider?: ProductProvider;
  // External provider fields
  metadata?: Record<string, string>;
  recurringInterval?: "day" | "week" | "month" | "year";
  recurringIntervalCount?: number;
  trialInterval?: "day" | "week" | "month" | "year";
  trialIntervalCount?: number;
  attachedCustomFields?: Array<{
    custom_field_id: string;
    required: boolean;
  }>;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  isRecurring?: boolean;
  isArchived?: boolean;
  medias?: string[];
  // Internal fields
  featured?: boolean;
  orderIndex?: number;
  visibility?: ProductVisibility;
}

// Sync status types
export interface SyncStatus {
  syncedAt: string | null;
  attempts: number;
  isSynced: boolean;
}

// Import result type
export interface ImportProductsResult {
  imported: number;
  updated: number;
  skipped: number;
  products: Array<{
    id: string;
    name: string;
    externalProductId: string | null;
  }>;
}
