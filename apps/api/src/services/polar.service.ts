import { prisma } from "@repo/database";
import { AppError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";
import { env } from "@api/lib/env";
import { POLAR_API } from "@api/constants";
import { maybeOptimizeImage } from "@api/lib/utils";
import type {
  PolarProductResponse,
  CreatePolarProductPayload,
  PolarProductsListResponse,
  PolarCustomersListResponse,
  FileUploadResponse,
  ProductMediaFileRead,
  CheckoutSessionResponse,
  PolarSubscriptionUpdatePayload,
  PolarOrderPayload,
  PolarOrderResponse,
  PolarOrdersListResponse,
  PolarInvoiceResponse,
  CreatePolarCustomerPayload,
  PolarCustomerResponse,
} from "@repo/types";

/**
 * Make authenticated request to Polar API
 */
export async function polarRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (!env.POLAR_ACCESS_TOKEN) {
    throw new AppError(
      "POLAR_CONFIG_ERROR",
      "POLAR_ACCESS_TOKEN not configured",
      500,
    );
  }

  const response = await fetch(`${POLAR_API.getApiUrl()}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.POLAR_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `Polar API error: ${response.status} ${response.statusText}`;
    let errorDetail: any = {};

    try {
      const errorText = await response.text();
      if (errorText) {
        try {
          errorDetail = JSON.parse(errorText);
          // Polar API error format: { detail: string } or { message: string } or array of errors
          if (errorDetail.detail) {
            errorMessage = errorDetail.detail;
          } else if (errorDetail.message) {
            errorMessage = errorDetail.message;
          } else if (Array.isArray(errorDetail)) {
            errorMessage = errorDetail
              .map((e: any) => e.detail || e.message || JSON.stringify(e))
              .join(", ");
          } else if (typeof errorDetail === "object") {
            errorMessage = JSON.stringify(errorDetail);
          } else {
            errorMessage = errorText;
          }
        } catch {
          errorMessage = errorText;
        }
      }
    } catch {
      // If we can't read the response, use status text
    }

    logger.error(
      {
        status: response.status,
        statusText: response.statusText,
        error: errorDetail,
        message: errorMessage,
        endpoint,
      },
      "Polar API Error",
    );

    // Provide helpful error message for invalid/expired tokens
    if (response.status === 401 && errorDetail?.error === "invalid_token") {
      throw new AppError(
        "POLAR_API_ERROR",
        "Polar API token is expired, revoked, or invalid. Please generate a new access token from Polar Dashboard (Settings → Developers → Access Tokens) and update POLAR_ACCESS_TOKEN in your .env file.",
        response.status,
      );
    }

    throw new AppError("POLAR_API_ERROR", errorMessage, response.status);
  }

  return response.json();
}

/**
 * Create product in Polar
 */
export async function createPolarProduct(
  payload: CreatePolarProductPayload,
): Promise<PolarProductResponse> {
  logger.info({ productName: payload.name }, "Creating product in Polar");

  return polarRequest<PolarProductResponse>("/products/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update product in Polar
 */
export async function updateExternalProduct(
  externalProductId: string,
  payload: Partial<CreatePolarProductPayload>,
): Promise<PolarProductResponse> {
  logger.info({ externalProductId }, "Updating product in Polar");

  return polarRequest<PolarProductResponse>(`/products/${externalProductId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * @deprecated Use updateExternalProduct instead
 */
export const updatePolarProduct = updateExternalProduct;

/**
 * Archive product in Polar
 */
export async function archiveExternalProduct(
  externalProductId: string,
): Promise<PolarProductResponse> {
  logger.info({ externalProductId }, "Archiving product in Polar");

  return polarRequest<PolarProductResponse>(`/products/${externalProductId}`, {
    method: "PATCH",
    body: JSON.stringify({ is_archived: true }),
  });
}

/**
 * @deprecated Use archiveExternalProduct instead
 */
export const archivePolarProduct = archiveExternalProduct;

/**
 * Sync a single product to Polar
 */
export async function syncProductToExternal(productId: string): Promise<void> {
  logger.info({ productId }, "Syncing product to Polar");

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { prices: true },
  });

  if (!product) {
    throw new AppError("PRODUCT_NOT_FOUND", "Product not found", 404);
  }

  // Already synced
  if (product.externalProductId && product.externalSyncedAt) {
    logger.info(
      { externalProductId: product.externalProductId },
      "Product already synced",
    );
    return;
  }

  try {
    // Prepare prices for Polar
    const polarPrices = product.prices.map((price) => ({
      amount_type: "fixed" as const,
      price_amount: price.priceAmount,
      price_currency: price.priceCurrency.toLowerCase(), // Polar expects lowercase: "usd" not "USD"
      recurring_interval:
        price.type === "recurring" && price.recurringInterval
          ? (price.recurringInterval as "month" | "year" | "week" | "day")
          : undefined,
    }));

    // Extract media IDs from medias array (now in {id, public_url} format)
    // Handle Prisma JsonValue type
    let mediaIds: string[] = [];
    if (product.medias) {
      if (Array.isArray(product.medias)) {
        mediaIds = product.medias
          .map((item: any) => {
            if (typeof item === "object" && item !== null && "id" in item) {
              return String(item.id);
            }
            if (typeof item === "string") {
              return item;
            }
            return null;
          })
          .filter((id): id is string => id !== null);
      } else if (typeof product.medias === "string") {
        try {
          const parsed = JSON.parse(product.medias);
          if (Array.isArray(parsed)) {
            mediaIds = parsed
              .map((item: any) => {
                if (typeof item === "object" && item !== null && "id" in item) {
                  return String(item.id);
                }
                return String(item);
              })
              .filter(Boolean);
          }
        } catch {
          mediaIds = [];
        }
      }
    }

    // Create in Polar
    const isRecurring = product.prices.some((p) => p.type === "recurring");
    const polarProduct = await createPolarProduct({
      name: product.name,
      description: product.description ?? undefined,
      is_recurring: isRecurring,
      prices: polarPrices,
      medias: mediaIds.length > 0 ? mediaIds : undefined,
      // Only include recurring_interval if product is recurring
      ...(isRecurring && {
        recurring_interval: product.prices.find((p) => p.type === "recurring")
          ?.recurringInterval as "day" | "week" | "month" | "year" | undefined,
      }),
    });

    // Get file infos for medias to get public URLs
    const polarMediaIds = polarProduct.medias
      ? polarProduct.medias.map((m: { id: string }) => m.id)
      : [];
    let mediaObjects: Array<{ id: string; public_url: string }> = [];
    if (polarMediaIds.length > 0) {
      try {
        const fileInfos = await getFileInfos(polarMediaIds);
        mediaObjects = fileInfos
          .filter(
            (fileInfo) =>
              fileInfo.publicUrl && fileInfo.publicUrl.trim() !== "",
          )
          .map((fileInfo) => ({
            id: fileInfo.id,
            public_url: fileInfo.publicUrl,
          }));
      } catch (error) {
        logger.warn(
          { err: error, productId },
          "Failed to fetch media URLs after sync, using IDs",
        );
        // Fallback to objects with empty public_url
        mediaObjects = polarMediaIds.map((id: string) => ({
          id,
          public_url: "",
        }));
      }
    }

    // Update local product with Polar IDs and medias
    await prisma.product.update({
      where: { id: productId },
      data: {
        externalProductId: polarProduct.id,
        externalSyncedAt: new Date(),
        medias: mediaObjects,
      },
    });

    // Update prices with Polar IDs
    for (let i = 0; i < product.prices.length; i++) {
      const localPrice = product.prices[i];
      const polarPrice = polarProduct.prices[i];

      if (localPrice && polarPrice) {
        await prisma.price.update({
          where: { id: localPrice.id },
          data: { externalPriceId: polarPrice.id },
        });
      }
    }

    logger.info(
      { externalProductId: polarProduct.id, productId },
      "Product synced successfully",
    );
  } catch (error) {
    logger.error({ err: error, productId }, "Failed to sync product");

    // Convert error to string message
    let errorMessage = "Unknown error";
    if (error instanceof AppError) {
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "object" && error !== null) {
      // Handle complex error objects (like validation errors)
      if ("message" in error) {
        errorMessage = String(error.message);
      } else {
        errorMessage = JSON.stringify(error);
      }
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    // Truncate error message if too long (database constraint)
    const maxLength = 1000;
    if (errorMessage.length > maxLength) {
      errorMessage = errorMessage.substring(0, maxLength) + "...";
    }

    throw error;
  }
}

/**
 * @deprecated Use syncProductToExternal instead
 */
export const syncProductToPolar = syncProductToExternal;

/**
 * Sync all pending products to Polar
 */
export async function syncAllPendingProducts(): Promise<{
  synced: number;
  failed: number;
}> {
  logger.info("Syncing all pending products to Polar");

  const pendingProducts = await prisma.product.findMany({
    where: { externalSyncedAt: null },
  });

  let synced = 0;
  let failed = 0;

  for (const product of pendingProducts) {
    try {
      await syncProductToExternal(product.id);
      synced++;
    } catch (error) {
      logger.error(
        { err: error, productId: product.id },
        "Failed to sync product",
      );
      failed++;
    }
  }

  logger.info({ synced, failed }, "Sync complete");
  return { synced, failed };
}

/**
 * Handle Polar product update (from webhook)
 */
export async function handlePolarProductUpdate(
  externalProductId: string,
  data: Partial<PolarProductResponse>,
): Promise<void> {
  logger.info({ externalProductId }, "Handling Polar product update");

  const product = await prisma.product.findUnique({
    where: { externalProductId },
  });

  if (!product) {
    logger.warn({ externalProductId }, "Product not found for Polar ID");
    return;
  }

  // Extract media IDs from Polar webhook data
  // medias array contains objects with id field, we need to extract just the IDs
  const mediaIds =
    data.medias && Array.isArray(data.medias)
      ? data.medias.map((media) => media.id).filter(Boolean)
      : undefined;

  const updateData: {
    name?: string;
    description?: string | null;
    isArchived?: boolean;
    medias?: any;
  } = {
    name: data.name ?? product.name,
    description: data.description ?? product.description,
    isArchived: data.is_archived ?? product.isArchived,
  };

  // Update medias if provided in webhook data - convert IDs to objects with id and public_url
  if (mediaIds !== undefined && mediaIds.length > 0) {
    try {
      const fileInfos = await getFileInfos(mediaIds);
      const mediaObjects = fileInfos
        .filter(
          (fileInfo) => fileInfo.publicUrl && fileInfo.publicUrl.trim() !== "",
        )
        .map((fileInfo) => ({
          id: fileInfo.id,
          public_url: fileInfo.publicUrl,
        }));
      updateData.medias = mediaObjects as any; // Prisma accepts JSON values
      logger.info(
        {
          productId: product.id,
          mediaCount: mediaIds.length,
          objectCount: mediaObjects.length,
        },
        "Updating medias",
      );
    } catch (error) {
      logger.warn(
        { err: error, externalProductId },
        "Failed to fetch media URLs from webhook, using IDs",
      );
      // Fallback to objects with empty public_url if URL fetch fails
      updateData.medias = mediaIds.map((id) => ({ id, public_url: "" })) as any;
    }
  }

  await prisma.product.update({
    where: { id: product.id },
    data: updateData,
  });

  logger.info({ productId: product.id }, "Product updated from Polar");
}

/**
 * Fetch all products from Polar
 */
export async function fetchPolarProducts(): Promise<PolarProductResponse[]> {
  logger.info("Fetching products from Polar");

  const response = await polarRequest<PolarProductsListResponse>("/products/");

  logger.info({ count: response.items.length }, "Found products in Polar");
  return response.items;
}

/**
 * Import products from Polar to local DB
 * Creates products that exist in Polar but not in local DB
 * Updates existing products to sync with Polar (isArchived, name, description, medias, prices)
 */
export async function importPolarProducts(): Promise<{
  imported: number;
  updated: number;
  skipped: number;
  products: { id: string; name: string; externalProductId: string }[];
}> {
  logger.info("Importing and syncing products from Polar to DB");

  const polarProducts = await fetchPolarProducts();

  let imported = 0;
  let updated = 0;
  let skipped = 0;
  const importedProducts: {
    id: string;
    name: string;
    externalProductId: string;
  }[] = [];

  // Extract media IDs from Polar product
  const getMediaIds = (
    medias?: Array<{ id: string; [key: string]: any }>,
  ): string[] => {
    if (!medias || !Array.isArray(medias)) return [];
    return medias.map((media) => media.id).filter(Boolean);
  };

  // Collect all media IDs from all products
  const allMediaIds = new Set<string>();
  for (const polarProduct of polarProducts) {
    const mediaIds = getMediaIds(polarProduct.medias);
    for (const mediaId of mediaIds) {
      allMediaIds.add(mediaId);
    }
  }

  // Get public URLs for all media IDs
  logger.info(
    { mediaCount: allMediaIds.size },
    "Fetching public URLs for media files",
  );
  const mediaIdToUrlMap = new Map<string, string>();
  if (allMediaIds.size > 0) {
    try {
      const fileInfos = await getFileInfos(Array.from(allMediaIds));
      for (const fileInfo of fileInfos) {
        mediaIdToUrlMap.set(fileInfo.id, fileInfo.publicUrl);
      }
      logger.info({ count: fileInfos.length }, "Retrieved public URLs");
    } catch (error) {
      logger.warn(
        { err: error },
        "Failed to fetch media URLs, continuing with IDs",
      );
      // Continue without URLs - we'll store IDs as fallback
    }
  }

  // Helper function to convert media IDs to media objects with id and public_url
  const getMediaObjects = (
    mediaIds: string[],
  ): Array<{ id: string; public_url: string }> => {
    return mediaIds
      .map((id) => {
        const url = mediaIdToUrlMap.get(id);
        // Only return object if URL is available
        if (url && url.trim() !== "") {
          return { id, public_url: url };
        }
        return null;
      })
      .filter((obj): obj is { id: string; public_url: string } => obj !== null);
  };

  for (const polarProduct of polarProducts) {
    // Check if product already exists in DB
    const existing = await prisma.product.findUnique({
      where: { externalProductId: polarProduct.id },
      include: { prices: true },
    });

    if (existing) {
      // Update existing product to sync with Polar
      const mediaIds = getMediaIds(polarProduct.medias);
      const mediaObjects = getMediaObjects(mediaIds); // Convert IDs to objects with id and public_url

      // Update product fields
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: polarProduct.name,
          description: polarProduct.description || null,
          isRecurring: polarProduct.is_recurring,
          isArchived: polarProduct.is_archived, // Sync archive status from Polar
          medias: mediaObjects, // Store as JSON array of {id, public_url} objects
          externalSyncedAt: new Date(),
        },
      });

      // Sync prices - update existing or create new ones
      const existingPriceIds = new Set(
        existing.prices.map((p) => p.externalPriceId).filter(Boolean),
      );
      const polarPriceIds = new Set(polarProduct.prices.map((p) => p.id));

      // Update existing prices
      for (const polarPrice of polarProduct.prices) {
        // Skip prices with invalid price_amount
        if (
          polarPrice.price_amount === undefined ||
          polarPrice.price_amount === null
        ) {
          logger.warn(
            {
              polarProductId: polarProduct.id,
              priceId: polarPrice.id,
              productId: existing.id,
            },
            "Skipping price update with invalid price_amount",
          );
          continue;
        }

        const existingPrice = existing.prices.find(
          (p) => p.externalPriceId === polarPrice.id,
        );
        if (existingPrice) {
          await prisma.price.update({
            where: { id: existingPrice.id },
            data: {
              priceAmount: polarPrice.price_amount,
              priceCurrency: polarPrice.price_currency,
              type: polarPrice.type,
              recurringInterval: polarPrice.recurring_interval || null,
              isArchived: false, // Reset archive status when syncing from Polar
            },
          });
        } else {
          // Create new price that exists in Polar but not in DB
          await prisma.price.create({
            data: {
              productId: existing.id,
              externalPriceId: polarPrice.id,
              priceAmount: polarPrice.price_amount,
              priceCurrency: polarPrice.price_currency,
              type: polarPrice.type,
              recurringInterval: polarPrice.recurring_interval || null,
            },
          });
        }
      }

      // Archive prices that no longer exist in Polar (if needed)
      // Note: We don't delete prices, just mark them as archived
      for (const existingPrice of existing.prices) {
        if (
          existingPrice.externalPriceId &&
          !polarPriceIds.has(existingPrice.externalPriceId)
        ) {
          await prisma.price.update({
            where: { id: existingPrice.id },
            data: { isArchived: true },
          });
        }
      }

      logger.info(
        { productName: polarProduct.name, productId: existing.id },
        "Updated product from Polar",
      );
      updated++;
      importedProducts.push({
        id: existing.id,
        name: polarProduct.name,
        externalProductId: polarProduct.id,
      });
      continue;
    }

    // Create new product in local DB
    const mediaIds = getMediaIds(polarProduct.medias);
    const mediaObjects = getMediaObjects(mediaIds); // Convert IDs to objects with id and public_url

    // Filter out prices with invalid price_amount (required field)
    const validPrices = polarProduct.prices.filter((price) => {
      if (price.price_amount === undefined || price.price_amount === null) {
        logger.warn(
          {
            polarProductId: polarProduct.id,
            priceId: price.id,
            priceAmount: price.price_amount,
          },
          "Skipping price with invalid price_amount",
        );
        return false;
      }
      return true;
    });

    if (validPrices.length === 0) {
      logger.warn(
        { polarProductId: polarProduct.id, productName: polarProduct.name },
        "Product has no valid prices, skipping import",
      );
      skipped++;
      continue;
    }

    const product = await prisma.product.create({
      data: {
        externalProductId: polarProduct.id,
        name: polarProduct.name,
        description: polarProduct.description || null,
        isRecurring: polarProduct.is_recurring,
        isArchived: polarProduct.is_archived,
        medias: mediaObjects, // Store as JSON array of {id, public_url} objects
        externalSyncedAt: new Date(),
        prices: {
          create: validPrices.map((price) => ({
            externalPriceId: price.id,
            priceAmount: price.price_amount!,
            priceCurrency: price.price_currency,
            type: price.type,
            recurringInterval: price.recurring_interval || null,
          })),
        },
      },
    });

    logger.info(
      { productName: polarProduct.name, productId: product.id },
      "Imported product from Polar",
    );
    imported++;
    importedProducts.push({
      id: product.id,
      name: product.name,
      externalProductId: polarProduct.id,
    });
  }

  logger.info({ imported, updated, skipped }, "Import complete");
  return { imported, updated, skipped, products: importedProducts };
}

export async function fetchPolarCustomers(): Promise<PolarCustomerResponse[]> {
  logger.info("Fetching customers from Polar");

  const response =
    await polarRequest<PolarCustomersListResponse>("/customers/");

  logger.info({ count: response.items.length }, "Found customers in Polar");
  return response.items;
}

export async function importPolarCustomers(): Promise<{
  imported: number;
  updated: number;
  skipped: number;
  customers: { id: string; name: string | null; externalCustomerId: string }[];
}> {
  logger.info("Importing and syncing customers from Polar to DB");

  const polarCustomers = await fetchPolarCustomers();

  logger.info({ count: polarCustomers.length }, "Found customers in Polar");

  let imported = 0;
  let updated = 0;
  let skipped = 0;
  const importedCustomers: {
    id: string;
    name: string | null;
    externalCustomerId: string;
  }[] = [];

  for (const polarCustomer of polarCustomers) {
    // Find user by external_id or email (optional - can be null)
    let resolvedUserId: string | null = null;

    if (polarCustomer.external_id) {
      const userExists = await prisma.user.findUnique({
        where: { id: polarCustomer.external_id },
        select: { id: true },
      });
      resolvedUserId = userExists?.id ?? null;
    }

    if (!resolvedUserId && polarCustomer.email) {
      const userByEmail = await prisma.user.findUnique({
        where: { email: polarCustomer.email },
        select: { id: true },
      });
      resolvedUserId = userByEmail?.id ?? null;
    }

    // Check if customer already exists by externalCustomerId
    const existing = await prisma.customer.findUnique({
      where: { externalCustomerId: polarCustomer.id },
    });

    const data = {
      externalCustomerId: polarCustomer.id,
      userId: resolvedUserId, // Can be null - customer without user
      email: polarCustomer.email,
      name: polarCustomer.name ?? null,
      metadata: polarCustomer.metadata ?? undefined,
    };

    if (existing) {
      const updatedCustomer = await prisma.customer.update({
        where: { id: existing.id },
        data,
      });
      updated++;
      importedCustomers.push({
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        externalCustomerId: updatedCustomer.externalCustomerId,
      });
      continue;
    }

    const createdCustomer = await prisma.customer.create({ data });
    imported++;
    importedCustomers.push({
      id: createdCustomer.id,
      name: createdCustomer.name,
      externalCustomerId: createdCustomer.externalCustomerId,
    });
  }

  logger.info(
    { imported, updated, skipped, total: polarCustomers.length },
    "Customer import complete. Skipped customers do not have a matching user in the database (by external_id or email)",
  );
  return { imported, updated, skipped, customers: importedCustomers };
}

/**
 * Create a checkout session in Polar
 */
export async function createCheckoutSession(payload: {
  priceId: string;
  successUrl: string;
  userId: string;
  userEmail: string;
}): Promise<CheckoutSessionResponse> {
  logger.info(
    { priceId: payload.priceId, userId: payload.userId },
    "Creating checkout session for price",
  );

  const body = {
    product_price_id: payload.priceId,
    success_url: payload.successUrl,
    customer_email: payload.userEmail,
    metadata: {
      userId: payload.userId,
    },
  };

  return polarRequest<CheckoutSessionResponse>("/checkouts/custom", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Handle order.created webhook event
 * Orders are managed by Polar.sh, we don't store them locally
 */
export async function handleOrderCreated(
  data: PolarOrderPayload,
): Promise<void> {
  logger.info({ orderId: data.id }, "Order created in Polar");
  // Orders are managed by Polar.sh, no local storage needed
}

/**
 * Handle subscription.created and subscription.updated events
 */
export async function handleSubscriptionUpdate(
  data: PolarSubscriptionUpdatePayload,
): Promise<void> {
  logger.info({ subscriptionId: data.id }, "Handling subscription update");

  const userId = data.metadata?.userId;
  if (!userId) {
    logger.warn(
      { subscriptionId: data.id },
      "No userId in subscription metadata, skipping local update",
    );
    return;
  }

  const product = await prisma.product.findUnique({
    where: { externalProductId: data.product_id },
  });

  const price = await prisma.price.findUnique({
    where: { externalPriceId: data.product_price_id },
  });

  if (!product || !price) {
    logger.warn(
      {
        subscriptionId: data.id,
        productId: data.product_id,
        priceId: data.product_price_id,
      },
      "Product or Price not found for subscription",
    );
    return;
  }

  await prisma.subscription.upsert({
    where: { externalSubscriptionId: data.id },
    create: {
      externalSubscriptionId: data.id,
      userId,
      productId: product.id,
      priceId: price.id,
      status: data.status,
      currentPeriodStart: new Date(data.current_period_start),
      currentPeriodEnd: new Date(data.current_period_end),
      cancelAtPeriodEnd: data.cancel_at_period_end,
      canceledAt: data.canceled_at ? new Date(data.canceled_at) : null,
      externalCustomerId: data.customer_id,
      metadata: data.metadata,
    },
    update: {
      status: data.status,
      currentPeriodStart: new Date(data.current_period_start),
      currentPeriodEnd: new Date(data.current_period_end),
      cancelAtPeriodEnd: data.cancel_at_period_end,
      canceledAt: data.canceled_at ? new Date(data.canceled_at) : null,
      externalCustomerId: data.customer_id,
      metadata: data.metadata,
    },
  });

  logger.info({ subscriptionId: data.id, userId }, "Subscription processed");
}
/**
 * Polar'a dosya yükleme (3 adımlı süreç)
 *
 * Süreç:
 * 1. POST /files - Dosya metadata gönder, S3 signed URL al
 * 2. PUT (S3 URL) - Dosya içeriğini S3'e yükle
 * 3. POST /files/uploaded - Checksum ve ETag ile yüklemeyi tamamla
 *
 * @param file - Yüklenecek dosya
 * @returns Polar'daki dosya ID'si
 */
export async function uploadFile(file: File): Promise<string> {
  logger.info(
    { fileName: file.name, fileSize: file.size },
    "Uploading file to Polar",
  );

  try {
    // --- ADIM -1: (OPSİYONEL) RESİM OPTİMİZASYONU ---
    // Ayarlar aktifse dosyayı resize/format/quality ile optimize ederiz.
    const originalBuffer = await file.arrayBuffer();
    const optimized = await maybeOptimizeImage(file, originalBuffer);
    const uploadFileObj = optimized.file;
    const uploadBuffer = optimized.buffer;

    // --- ADIM 0: CHECKSUM HESAPLAMA (En Başta Yapılmalı) ---
    // S3 yükleme anında bu özeti beklediği için en başta hesaplıyoruz.
    const hashBuffer = await crypto.subtle.digest("SHA-256", uploadBuffer);
    const checksumSha256Base64 = Buffer.from(hashBuffer).toString("base64");
    logger.debug({ checksumSha256Base64 }, "SHA256 checksum calculated");

    // --- ADIM 1: POLAR'DA KAYIT OLUŞTURMA ---
    logger.debug("Step 1: Creating file record");

    const createPayload = {
      name: uploadFileObj.name,
      mime_type: uploadFileObj.type || "application/octet-stream",
      size: uploadFileObj.size,
      checksum_sha256_base64: checksumSha256Base64, // Polar'a bildiriyoruz
      upload: {
        parts: [
          {
            number: 1,
            chunk_start: 0,
            chunk_end: uploadFileObj.size - 1,
            checksum_sha256_base64: checksumSha256Base64, // Part içine ekliyoruz
          },
        ],
      },
      service: "product_media",
    };

    const fileRecord = await polarRequest<any>("/files", {
      method: "POST",
      body: JSON.stringify(createPayload),
    });

    const uploadPart = fileRecord.upload.parts[0];

    // --- ADIM 2: S3'E YÜKLEME ---
    logger.debug("Step 2: Uploading to S3");

    // ÖNEMLİ: S3 "sha256" tipi beklediğinde header anahtarı "x-amz-checksum-sha256" olmalıdır.
    // "x-amz-content-sha256" genelde farklı bir imzalama süreci için kullanılır.
    const uploadHeaders: Record<string, string> = {
      "Content-Type": uploadFileObj.type || "application/octet-stream",
      "x-amz-checksum-sha256": checksumSha256Base64, // Hata veren kısım burasıydı
    };

    // Polar bazen kendi ek header'larını (imza vb.) gönderir, onları da dahil edelim
    if (uploadPart.headers) {
      Object.assign(uploadHeaders, uploadPart.headers);
    }

    const s3Response = await fetch(uploadPart.url, {
      method: "PUT",
      headers: uploadHeaders,
      body: uploadFileObj, // Optimize edilmiş dosya (veya original)
    });

    if (!s3Response.ok) {
      const errorText = await s3Response.text();
      throw new AppError(
        "UPLOAD_ERROR",
        `S3 yükleme başarısız: ${s3Response.status} - ${errorText}`,
        500,
      );
    }

    const etag = s3Response.headers.get("etag")?.replace(/"/g, "");
    logger.debug({ etag }, "File uploaded to S3");

    // --- ADIM 3: POLAR'A TAMAMLANDI BİLGİSİ VERME ---
    logger.debug("Step 3: Completing upload");

    // Polar API dokümantasyonuna göre payload formatı
    const completePayload = {
      id: fileRecord.upload.id, // Upload ID'si
      path: fileRecord.upload.path,
      parts: [
        {
          number: uploadPart.number,
          checksum_etag: etag || "", // snake_case
          checksum_sha256_base64: checksumSha256Base64, // snake_case
        },
      ],
    };

    // Completion endpoint'i zaten dosya bilgisini döndürüyor
    const fileInfo = await polarRequest<FileUploadResponse>(
      `/files/${fileRecord.id}/uploaded`,
      {
        method: "POST",
        body: JSON.stringify(completePayload),
      },
    );
    logger.info(
      { fileId: fileInfo.id, fileName: file.name },
      "File upload completed successfully",
    );
    return fileInfo.id;
  } catch (error) {
    // Hata yönetimi aynı kalabilir
    throw error;
  }
}

/**
 * Cancel a subscription in Polar
 */
export async function cancelExternalSubscription(
  externalSubscriptionId: string,
  immediate: boolean = false,
): Promise<void> {
  logger.info(
    { externalSubscriptionId, immediate },
    "Canceling subscription in Polar",
  );

  if (immediate) {
    await polarRequest(`/subscriptions/${externalSubscriptionId}/revoke`, {
      method: "POST",
    });
  } else {
    await polarRequest(`/subscriptions/${externalSubscriptionId}`, {
      method: "PATCH",
      body: JSON.stringify({ cancel_at_period_end: true }),
    });
  }
}

/**
 * @deprecated Use cancelExternalSubscription instead
 */
export const cancelPolarSubscription = cancelExternalSubscription;

/**
 * Reactivate a canceling subscription in Polar
 */
export async function reactivateExternalSubscription(
  externalSubscriptionId: string,
): Promise<void> {
  logger.info({ externalSubscriptionId }, "Reactivating subscription in Polar");

  await polarRequest(`/subscriptions/${externalSubscriptionId}`, {
    method: "PATCH",
    body: JSON.stringify({ cancel_at_period_end: false }),
  });
}

/**
 * @deprecated Use reactivateExternalSubscription instead
 */
export const reactivatePolarSubscription = reactivateExternalSubscription;

/**
 * Get file information from Polar by file IDs
 * Returns file info including publicUrl for displaying images
 * Polar API: GET /files?ids=id1&ids=id2&ids=id3
 * Response: { items: [...], pagination: {...} }
 */
export async function getFileInfos(
  fileIds: string[],
): Promise<Array<ProductMediaFileRead>> {
  logger.info({ fileCount: fileIds.length }, "Getting file info from Polar");

  if (fileIds.length === 0) {
    return [];
  }

  try {
    // Polar API'de ids query parametresi tekrar eden parametre olarak gönderilmeli
    const arrayQuery = fileIds
      .map((id) => `ids=${encodeURIComponent(id)}`)
      .join("&");
    const url = `/files?${arrayQuery}`;

    logger.debug({ url }, "Requesting file info");

    // Polar API response formatı: { items: [...], pagination: {...} }
    // Field'lar snake_case formatında geliyor
    const response = await polarRequest<{
      items: Array<{
        id: string;
        organization_id: string;
        name: string;
        path: string;
        mime_type: string;
        size: number;
        storage_version: string;
        checksum_etag: string;
        checksum_sha256_base64: string;
        checksum_sha256_hex: string;
        last_modified_at: string | null;
        version: string | null;
        service: string;
        is_uploaded: boolean;
        created_at: string;
        size_readable: string;
        public_url: string;
      }>;
      pagination: {
        total_count: number;
        max_page: number;
      };
    }>(url, {
      method: "GET",
    });

    logger.info({ count: response.items.length }, "Retrieved files from Polar");

    // Snake_case'den camelCase'e map et
    const fileInfos: ProductMediaFileRead[] = response.items.map((item) => ({
      id: item.id,
      organizationId: item.organization_id,
      name: item.name,
      path: item.path,
      mimeType: item.mime_type,
      size: item.size,
      storageVersion: item.storage_version,
      checksumEtag: item.checksum_etag,
      checksumSha256Base64: item.checksum_sha256_base64,
      checksumSha256Hex: item.checksum_sha256_hex,
      lastModifiedAt: item.last_modified_at,
      version: item.version || "",
      service: item.service,
      isUploaded: item.is_uploaded,
      createdAt: item.created_at,
      sizeReadable: item.size_readable,
      publicUrl: item.public_url,
    }));

    // Eğer bazı file'lar bulunamadıysa (response'da eksik ID'ler varsa)
    const foundIds = new Set(fileInfos.map((f) => f.id));
    const missingIds = fileIds.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      logger.warn({ missingIds }, "Some files not found");
      // Eksik file'lar için boş publicUrl ile object oluştur
      missingIds.forEach((fileId) => {
        fileInfos.push({
          id: fileId,
          organizationId: "",
          name: "Unknown",
          path: "",
          mimeType: "image/jpeg",
          size: 0,
          storageVersion: "",
          checksumEtag: "",
          checksumSha256Base64: "",
          checksumSha256Hex: "",
          lastModifiedAt: null,
          version: "",
          service: "product_media",
          isUploaded: false,
          createdAt: new Date().toISOString(),
          sizeReadable: "0 B",
          publicUrl: "", // No public URL available - Polar API'den gelmedi
        });
      });
    }

    return fileInfos;
  } catch (error) {
    logger.error({ err: error, fileIds }, "Failed to get file info from Polar");
    // Hata durumunda boş publicUrl ile file bilgileri oluştur
    return fileIds.map((fileId) => ({
      id: fileId,
      organizationId: "",
      name: "Unknown",
      path: "",
      mimeType: "image/jpeg",
      size: 0,
      storageVersion: "",
      checksumEtag: "",
      checksumSha256Base64: "",
      checksumSha256Hex: "",
      lastModifiedAt: null,
      version: "",
      service: "product_media",
      isUploaded: false,
      createdAt: new Date().toISOString(),
      sizeReadable: "0 B",
      publicUrl: "", // No public URL available - Polar API'den gelmedi
    }));
  }
}

/**
 * Create a customer portal session in Polar
 */
export async function createCustomerPortalSession(
  polarCustomerId: string,
  returnUrl?: string,
): Promise<{ url: string }> {
  logger.info({ polarCustomerId }, "Creating customer portal session");

  const response = await polarRequest<{ customer_portal_url: string }>(
    "/customer-sessions/",
    {
      method: "POST",
      body: JSON.stringify({
        customer_id: polarCustomerId,
        // Optional: you can add return_url here if supported by the endpoint
        // return_url: returnUrl
      }),
    },
  );

  return { url: response.customer_portal_url };
}

/**
 * Fetch all orders from Polar API
 */
export async function fetchPolarOrders(): Promise<PolarOrderResponse[]> {
  logger.info("Fetching orders from Polar");

  const response = await polarRequest<PolarOrdersListResponse>("/orders", {
    method: "GET",
  });

  logger.info({ count: response.items.length }, "Found orders in Polar");
  return response.items;
}

/**
 * Fetch single order from Polar API by ID
 */
export async function fetchPolarOrderById(
  orderId: string,
): Promise<PolarOrderResponse> {
  logger.info({ orderId }, "Fetching order from Polar");

  return polarRequest<PolarOrderResponse>(`/orders/${orderId}`, {
    method: "GET",
  });
}

/**
 * Fetch invoice for an order from Polar API
 */
export async function fetchPolarOrderInvoice(
  orderId: string,
): Promise<PolarInvoiceResponse> {
  logger.info({ orderId }, "Fetching invoice for order from Polar");

  return polarRequest<PolarInvoiceResponse>(`/orders/${orderId}/invoice`, {
    method: "GET",
  });
}

/**
 * Create customer in Polar
 */
export async function createPolarCustomer(
  payload: CreatePolarCustomerPayload,
): Promise<PolarCustomerResponse> {
  logger.info({ email: payload.email }, "Creating customer in Polar");

  return polarRequest<PolarCustomerResponse>("/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Get customer from Polar by ID
 */
export async function getPolarCustomerById(
  customerId: string,
): Promise<PolarCustomerResponse> {
  logger.info({ customerId }, "Fetching customer from Polar");

  return polarRequest<PolarCustomerResponse>(`/customers/${customerId}`, {
    method: "GET",
  });
}
