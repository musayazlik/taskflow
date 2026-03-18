import { z } from "zod";

// Product provider enum
export const productProviderSchema = z.enum(["POLAR", "STRIPE"]);

// Product visibility enum
export const productVisibilitySchema = z.enum([
  "PUBLIC",
  "HIDDEN",
  "MEMBERS_ONLY",
]);

// Price schema for product prices
export const priceSchema = z.object({
  type: z.enum(["one_time", "recurring"]),
  priceAmount: z.number().min(0, "Price must be positive"),
  priceCurrency: z.string().default("USD"),
  recurringInterval: z.enum(["month", "year", "day", "week"]).optional(),
});

// Create product schema
export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  isRecurring: z.boolean(),
  prices: z.array(priceSchema).optional(),
  // Internal management fields
  featured: z.boolean().optional(),
  orderIndex: z.number().optional(),
  visibility: productVisibilitySchema.optional(),
});

// Update product schema
export const updateProductSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isRecurring: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  // Internal management fields
  featured: z.boolean().optional(),
  orderIndex: z.number().optional(),
  visibility: productVisibilitySchema.optional(),
});

// Product query params schema
export const productQuerySchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  isArchived: z.boolean().optional(),
  page: z.number().min(1).optional(),
  featured: z.boolean().optional(),
  visibility: productVisibilitySchema.optional(),
  provider: productProviderSchema.optional(),
});

// Export types
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryParams = z.infer<typeof productQuerySchema>;
export type PriceInput = z.infer<typeof priceSchema>;
export type ProductProvider = z.infer<typeof productProviderSchema>;
export type ProductVisibility = z.infer<typeof productVisibilitySchema>;
