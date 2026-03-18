import { prisma } from "@repo/database";
import type { Product } from "@repo/database";
import { AppError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";
import { normalizeMedias, prepareMediasForStorage } from "@api/lib/utils";
import type {
  ProductListParams,
  CreateProductData,
  UpdateProductData,
  ProductWithPrices,
} from "@repo/types";

/**
 * Sync product to external provider (non-blocking)
 * This is a fire-and-forget operation
 */
const syncToExternalProvider = async (productId: string): Promise<void> => {
  try {
    const { syncProductToExternal } =
      await import("@api/services/polar.service");
    await syncProductToExternal(productId);
    logger.info({ productId }, "Product synced to external provider");
  } catch (error) {
    logger.warn(
      { err: error, productId },
      "Failed to sync product to external provider (non-blocking)",
    );
  }
};

/**
 * Update product in external provider (non-blocking)
 */
const updateInExternalProvider = async (
  externalProductId: string,
  data: { name?: string; description?: string; medias?: string[] },
): Promise<void> => {
  try {
    const { updateExternalProduct } =
      await import("@api/services/polar.service");
    await updateExternalProduct(externalProductId, data);
    logger.info({ externalProductId }, "Product updated in external provider");
  } catch (error) {
    logger.warn(
      { err: error, externalProductId },
      "Failed to update product in external provider (non-blocking)",
    );
  }
};

/**
 * Build where clause for product queries
 */
const buildProductWhere = (params: ProductListParams) => {
  const where: any = {};

  // Status filter - takes precedence over includeArchived
  if (params.status && params.status !== "all") {
    where.isArchived = params.status === "archived";
  } else if (!params.includeArchived) {
    where.isArchived = false;
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" as const } },
      {
        description: { contains: params.search, mode: "insensitive" as const },
      },
    ];
  }

  if (params.featured !== undefined) {
    where.featured = params.featured;
  }

  if (params.visibility) {
    where.visibility = params.visibility;
  }

  if (params.provider) {
    where.provider = params.provider;
  }

  return where;
};

/**
 * Transform product with normalized medias and dates
 */
const transformProduct = (
  product: Product & { prices?: any[] },
): ProductWithPrices => {
  return {
    ...product,
    medias: normalizeMedias(product.medias),
    prices: product.prices || [],
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    externalSyncedAt: product.externalSyncedAt?.toISOString() || null,
  } as ProductWithPrices;
};

// ============================================
// Main Service Functions
// ============================================

/**
 * Get all products with pagination and filters
 */
export const getAllProducts = async (
  params: ProductListParams = {},
): Promise<{
  products: ProductWithPrices[];
  total: number;
  page: number;
  limit: number;
}> => {
  const { page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;
  const where = buildProductWhere(params);

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
        include: { prices: true },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map(transformProduct),
      total,
      page,
      limit,
    };
  } catch (error) {
    logger.error({ err: error, params }, "Error fetching products");
    throw new AppError("PRODUCT_FETCH_ERROR", "Failed to fetch products", 500);
  }
};

/**
 * Get product by ID (without prices)
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    return await prisma.product.findUnique({
      where: { id },
    });
  } catch (error) {
    logger.error({ err: error, id }, "Error fetching product");
    throw new AppError("PRODUCT_FETCH_ERROR", "Failed to fetch product", 500);
  }
};

/**
 * Get product by ID with prices
 */
export const getProductWithPrices = async (
  id: string,
): Promise<ProductWithPrices | null> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { prices: true },
    });

    if (!product) {
      return null;
    }

    return transformProduct(product);
  } catch (error) {
    logger.error({ err: error, id }, "Error fetching product");
    throw new AppError("PRODUCT_FETCH_ERROR", "Failed to fetch product", 500);
  }
};

/**
 * Create new product
 *
 * Mirror Model Architecture:
 * 1. Create product in local DB first (source of truth)
 * 2. Sync to external provider in background (fire-and-forget)
 * 3. Webhook will update externalSyncedAt when confirmed
 */
export const createProduct = async (
  data: CreateProductData,
): Promise<ProductWithPrices> => {
  try {
    const mediasData = prepareMediasForStorage(data.medias);

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        isRecurring: data.isRecurring ?? false,
        medias: mediasData,
        // Internal management fields
        featured: data.featured ?? false,
        orderIndex: data.orderIndex ?? 0,
        visibility: data.visibility ?? "PUBLIC",
        provider: data.provider ?? "POLAR",
        // Sync tracking (initially not synced)
        externalSyncedAt: null,
        externalSyncAttempts: 0,
        prices: {
          create: data.prices?.map((price) => ({
            type: price.type,
            priceAmount: price.priceAmount,
            priceCurrency: price.priceCurrency,
            recurringInterval: price.recurringInterval,
            isArchived: false,
          })),
        },
      },
      include: {
        prices: true,
      },
    });

    // Sync to external provider (non-blocking, fire-and-forget)
    syncToExternalProvider(product.id).catch((err) => {
      logger.warn({ err, productId: product.id }, "Background sync failed");
    });

    return transformProduct(product);
  } catch (error) {
    logger.error({ err: error, data }, "Error creating product");
    throw new AppError("PRODUCT_CREATE_ERROR", "Failed to create product", 500);
  }
};

/**
 * Update product
 *
 * Mirror Model Architecture:
 * 1. Update product in local DB first
 * 2. If already synced to external provider, update there as well
 * 3. If not synced, trigger background sync
 */
export const updateProduct = async (
  id: string,
  data: UpdateProductData,
): Promise<ProductWithPrices> => {
  try {
    const updateData: any = { ...data };

    // Prepare medias if provided
    if (data.medias !== undefined) {
      updateData.medias = prepareMediasForStorage(data.medias);
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { prices: true },
    });

    const normalizedProduct = transformProduct(product);

    // Handle external provider sync
    if (product.externalProductId && product.externalSyncedAt) {
      // Product is synced, update in external provider
      const mediaIds = normalizedProduct.medias
        .map((m) => m.id)
        .filter(Boolean);
      updateInExternalProvider(product.externalProductId, {
        name: data.name,
        description: data.description,
        medias: mediaIds,
      }).catch((err) => {
        logger.warn(
          { err, productId: id },
          "Background update to external provider failed",
        );
      });
    } else if (!product.externalSyncedAt) {
      // Not synced yet, trigger background sync
      syncToExternalProvider(product.id).catch((err) => {
        logger.warn({ err, productId: product.id }, "Background sync failed");
      });
    }

    return normalizedProduct;
  } catch (error) {
    logger.error({ err: error, id, data }, "Error updating product");
    throw new AppError("PRODUCT_UPDATE_ERROR", "Failed to update product", 500);
  }
};

/**
 * Archive product (soft delete)
 */
export const archiveProduct = async (id: string): Promise<Product> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new AppError("PRODUCT_NOT_FOUND", "Product not found", 404);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { isArchived: true },
    });

    // Archive in external provider if synced (non-blocking)
    if (product.externalProductId && product.externalSyncedAt) {
      try {
        const { archiveExternalProduct } =
          await import("@api/services/polar.service");
        await archiveExternalProduct(product.externalProductId);
        logger.info(
          { externalProductId: product.externalProductId },
          "Product archived in external provider",
        );
      } catch (error) {
        logger.warn(
          { err: error, externalProductId: product.externalProductId },
          "Failed to archive product in external provider",
        );
      }
    }

    return updatedProduct;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error({ err: error, id }, "Error archiving product");
    throw new AppError(
      "PRODUCT_ARCHIVE_ERROR",
      "Failed to archive product",
      500,
    );
  }
};

/**
 * Get product count
 */
export const getProductCount = async (
  includeArchived = false,
): Promise<number> => {
  try {
    return await prisma.product.count({
      where: includeArchived ? {} : { isArchived: false },
    });
  } catch (error) {
    logger.error({ err: error, includeArchived }, "Error counting products");
    throw new AppError("PRODUCT_COUNT_ERROR", "Failed to count products", 500);
  }
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (
  limit = 10,
): Promise<ProductWithPrices[]> => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
        featured: true,
        visibility: "PUBLIC",
      },
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
      take: limit,
      include: { prices: true },
    });

    return products.map(transformProduct);
  } catch (error) {
    logger.error({ err: error }, "Error fetching featured products");
    throw new AppError(
      "PRODUCT_FETCH_ERROR",
      "Failed to fetch featured products",
      500,
    );
  }
};

/**
 * Update product order index
 */
export const updateProductOrder = async (
  id: string,
  orderIndex: number,
): Promise<ProductWithPrices> => {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: { orderIndex },
      include: { prices: true },
    });

    return transformProduct(product);
  } catch (error) {
    logger.error(
      { err: error, id, orderIndex },
      "Error updating product order",
    );
    throw new AppError(
      "PRODUCT_UPDATE_ERROR",
      "Failed to update product order",
      500,
    );
  }
};
