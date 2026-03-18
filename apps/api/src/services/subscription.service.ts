import { prisma } from "@repo/database";
import { AppError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";
import * as polarService from "./polar.service";
import type {
  PolarSubscriptionResponse,
  PolarSubscriptionsListResponse,
} from "@repo/types";

async function fetchPolarSubscriptionsByCustomer(
  customerId: string,
): Promise<PolarSubscriptionResponse[]> {
  logger.info({ customerId }, "Fetching subscriptions from Polar for customer");

  const response =
    await polarService.polarRequest<PolarSubscriptionsListResponse>(
      `/subscriptions?customer_id=${customerId}`,
      {
        method: "GET",
      },
    );

  logger.info(
    { customerId, count: response.items.length },
    "Found subscriptions in Polar",
  );
  return response.items;
}

async function fetchAllPolarSubscriptions(): Promise<
  PolarSubscriptionResponse[]
> {
  logger.info("Fetching all subscriptions from Polar");

  const response =
    await polarService.polarRequest<PolarSubscriptionsListResponse>(
      "/subscriptions",
      {
        method: "GET",
      },
    );

  logger.info({ count: response.items.length }, "Found subscriptions in Polar");
  return response.items;
}

async function getUserIdFromPolarCustomerId(
  externalCustomerId: string,
): Promise<string | null> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      externalCustomerId,
    },
    select: {
      userId: true,
    },
  });

  return subscription?.userId || null;
}

async function getUserPolarCustomerId(userId: string): Promise<string | null> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      externalCustomerId: { not: null },
    },
    select: {
      externalCustomerId: true,
    },
  });

  return subscription?.externalCustomerId || null;
}

async function mapPolarSubscriptionToLocal(
  polarSub: PolarSubscriptionResponse,
  userId?: string,
): Promise<any> {
  const product = await prisma.product.findUnique({
    where: { externalProductId: polarSub.product_id },
    include: { prices: true },
  });

  const price = product?.prices.find(
    (p) => p.externalPriceId === polarSub.product_price_id,
  );

  let finalUserId: string | undefined = userId;
  if (!finalUserId) {
    const foundUserId = await getUserIdFromPolarCustomerId(
      polarSub.customer_id,
    );
    finalUserId = foundUserId ?? undefined;
  }

  let user = null;
  if (finalUserId) {
    const userData = await prisma.user.findUnique({
      where: { id: finalUserId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    user = userData;
  }

  return {
    id: polarSub.id,
    externalSubscriptionId: polarSub.id,
    userId: finalUserId || "",
    productId: product?.id || "",
    priceId: price?.id || "",
    status: polarSub.status,
    currentPeriodStart: new Date(polarSub.current_period_start),
    currentPeriodEnd: new Date(polarSub.current_period_end),
    cancelAtPeriodEnd: polarSub.cancel_at_period_end,
    canceledAt: polarSub.canceled_at ? new Date(polarSub.canceled_at) : null,
    externalCustomerId: polarSub.customer_id,
    metadata: polarSub.metadata,
    createdAt: new Date(polarSub.created_at),
    updatedAt: new Date(polarSub.updated_at),
    product: product
      ? {
          id: product.id,
          name: product.name,
          description: product.description,
          isRecurring: product.isRecurring,
          isArchived: product.isArchived,
          medias: product.medias,
          externalProductId: product.externalProductId,
          externalSyncedAt: product.externalSyncedAt,
          externalSyncAttempts: product.externalSyncAttempts,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        }
      : null,
    price: price
      ? {
          id: price.id,
          type: price.type,
          priceAmount: price.priceAmount,
          priceCurrency: price.priceCurrency,
          recurringInterval: price.recurringInterval,
          externalPriceId: price.externalPriceId,
          isArchived: price.isArchived,
          createdAt: price.createdAt,
          updatedAt: price.updatedAt,
        }
      : null,
    user: user,
  };
}

export async function getUserSubscriptions(userId: string) {
  try {
    const polarCustomerId = await getUserPolarCustomerId(userId);

    if (!polarCustomerId) {
      logger.warn({ userId }, "No Polar customer ID found for user");
      return [];
    }

    const polarSubscriptions =
      await fetchPolarSubscriptionsByCustomer(polarCustomerId);

    const subscriptions = await Promise.all(
      polarSubscriptions.map((polarSub) =>
        mapPolarSubscriptionToLocal(polarSub, userId),
      ),
    );

    return subscriptions;
  } catch (error) {
    logger.error(
      { err: error, userId },
      "Error fetching subscriptions from Polar",
    );
    throw new AppError(
      "SUBSCRIPTION_FETCH_ERROR",
      "Failed to fetch subscriptions from Polar",
      500,
    );
  }
}

export async function getSubscriptionById(
  subscriptionId: string,
  userId: string,
  isAdmin: boolean = false,
) {
  try {
    const polarSub = await polarService.polarRequest<PolarSubscriptionResponse>(
      `/subscriptions/${subscriptionId}`,
      {
        method: "GET",
      },
    );

    if (!isAdmin) {
      const polarCustomerId = await getUserPolarCustomerId(userId);
      if (!polarCustomerId) {
        throw new AppError(
          "NOT_FOUND",
          "No Polar customer found for this user",
          404,
        );
      }
      if (polarSub.customer_id !== polarCustomerId) {
        throw new AppError("NOT_FOUND", "Subscription not found", 404);
      }
    }

    const subscription = await mapPolarSubscriptionToLocal(polarSub, userId);
    return subscription;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(
      { err: error, subscriptionId, userId },
      "Error fetching subscription from Polar",
    );
    throw new AppError(
      "SUBSCRIPTION_FETCH_ERROR",
      "Failed to fetch subscription from Polar",
      500,
    );
  }
}

export async function cancelSubscription(
  subscriptionId: string,
  userId: string,
  immediate: boolean = false,
  isAdmin: boolean = false,
) {
  try {
    const subscription = await getSubscriptionById(
      subscriptionId,
      userId,
      isAdmin,
    );

    await polarService.cancelPolarSubscription(
      subscription.externalSubscriptionId,
      immediate,
    );

    const updated = await getSubscriptionById(subscriptionId, userId, isAdmin);

    return {
      ...updated,
      message: immediate
        ? "Subscription canceled immediately"
        : "Subscription will be canceled at period end",
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(
      { err: error, subscriptionId, userId },
      "Error canceling subscription",
    );
    throw new AppError(
      "SUBSCRIPTION_CANCEL_ERROR",
      "Failed to cancel subscription",
      500,
    );
  }
}

export async function reactivateSubscription(
  subscriptionId: string,
  userId: string,
  isAdmin: boolean = false,
) {
  try {
    const subscription = await getSubscriptionById(
      subscriptionId,
      userId,
      isAdmin,
    );

    await polarService.reactivatePolarSubscription(
      subscription.externalSubscriptionId,
    );

    const updated = await getSubscriptionById(subscriptionId, userId, isAdmin);

    return {
      ...updated,
      message: "Subscription reactivated successfully",
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(
      { err: error, subscriptionId, userId },
      "Error reactivating subscription",
    );
    throw new AppError(
      "SUBSCRIPTION_REACTIVATE_ERROR",
      "Failed to reactivate subscription",
      500,
    );
  }
}

export async function getAllSubscriptions() {
  try {
    const polarSubscriptions = await fetchAllPolarSubscriptions();

    const subscriptions = await Promise.all(
      polarSubscriptions.map((polarSub) =>
        mapPolarSubscriptionToLocal(polarSub),
      ),
    );

    return subscriptions;
  } catch (error) {
    logger.error({ err: error }, "Error fetching all subscriptions from Polar");
    throw new AppError(
      "SUBSCRIPTION_FETCH_ERROR",
      "Failed to fetch subscriptions from Polar",
      500,
    );
  }
}

export async function getCustomerPortalUrl(userId: string) {
  try {
    const polarCustomerId = await getUserPolarCustomerId(userId);

    if (!polarCustomerId) {
      throw new AppError(
        "NOT_FOUND",
        "No active Polar customer found for this user",
        404,
      );
    }

    const portal =
      await polarService.createCustomerPortalSession(polarCustomerId);

    return portal;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error({ err: error, userId }, "Error getting customer portal URL");
    throw new AppError(
      "PORTAL_ERROR",
      "Failed to get customer portal URL",
      500,
    );
  }
}
