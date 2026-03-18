import { prisma } from "@repo/database";
import type { Order } from "@repo/database";
import { Prisma } from "@repo/database";
import { AppError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";
import * as polarService from "./polar.service";
import type { OrderListParams, PolarOrderResponse } from "@repo/types";

export const getAllOrders = async (
  params: OrderListParams = {},
): Promise<{ orders: Order[]; total: number; page: number; limit: number }> => {
  const { page = 1, limit = 20, status, userId } = params;
  const skip = (page - 1) * limit;

  try {
    const where: {
      status?: string;
      userId?: string;
    } = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          product: true,
          price: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total, page, limit };
  } catch (error) {
    logger.error({ err: error, params }, "Error fetching orders");
    throw new AppError("ORDER_FETCH_ERROR", "Failed to fetch orders", 500);
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (id: string): Promise<Order | null> => {
  try {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        product: true,
        price: true,
      },
    });
  } catch (error) {
    logger.error({ err: error, id }, "Error fetching order");
    throw new AppError("ORDER_FETCH_ERROR", "Failed to fetch order", 500);
  }
};

/**
 * Get order by Polar order ID
 */
export const getOrderByPolarId = async (
  externalOrderId: string,
): Promise<Order | null> => {
  try {
    return await prisma.order.findUnique({
      where: { externalOrderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        product: true,
        price: true,
      },
    });
  } catch (error) {
    logger.error(
      { err: error, externalOrderId },
      "Error fetching order by Polar ID",
    );
    throw new AppError("ORDER_FETCH_ERROR", "Failed to fetch order", 500);
  }
};

/**
 * Sync order from Polar API to database
 */
async function syncOrderFromPolar(
  polarOrder: PolarOrderResponse,
): Promise<Order> {
  // Find local product and price by Polar IDs
  const product = await prisma.product.findUnique({
    where: { externalProductId: polarOrder.product_id },
    include: { prices: true },
  });

  if (!product) {
    throw new AppError(
      "PRODUCT_NOT_FOUND",
      `Product with Polar ID ${polarOrder.product_id} not found`,
      404,
    );
  }

  const price = product.prices.find(
    (p) => p.externalPriceId === polarOrder.product_price_id,
  );

  if (!price) {
    throw new AppError(
      "PRICE_NOT_FOUND",
      `Price with Polar ID ${polarOrder.product_price_id} not found`,
      404,
    );
  }

  // Get user ID from customer ID if available
  let userId: string | null = null;
  if (polarOrder.customer_id) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        externalCustomerId: polarOrder.customer_id,
      },
      select: {
        userId: true,
      },
    });

    userId = subscription?.userId || null;
  }

  // Create or update order in database
  const order = await prisma.order.upsert({
    where: { externalOrderId: polarOrder.id },
    update: {
      amount: polarOrder.amount,
      currency: polarOrder.currency,
      status: polarOrder.status,
      externalCustomerId: polarOrder.customer_id || null,
      metadata: polarOrder.metadata
        ? (polarOrder.metadata as Prisma.InputJsonValue)
        : undefined,
      updatedAt: new Date(),
    },
    create: {
      externalOrderId: polarOrder.id,
      userId: userId || null,
      productId: product.id,
      priceId: price.id,
      amount: polarOrder.amount,
      currency: polarOrder.currency,
      status: polarOrder.status,
      externalCustomerId: polarOrder.customer_id || null,
      metadata: polarOrder.metadata
        ? (polarOrder.metadata as Prisma.InputJsonValue)
        : undefined,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      product: true,
      price: true,
    },
  });

  return order;
}

/**
 * Get all orders from Polar API and sync to database
 */
export async function getAllOrdersFromPolar() {
  try {
    // Fetch all orders from Polar
    const polarOrders = await polarService.fetchPolarOrders();

    // Sync each order to database
    const orders = await Promise.all(
      polarOrders.map((polarOrder) => syncOrderFromPolar(polarOrder)),
    );

    return orders;
  } catch (error) {
    logger.error({ err: error }, "Error fetching all orders from Polar");
    throw new AppError(
      "ORDER_FETCH_ERROR",
      "Failed to fetch orders from Polar",
      500,
    );
  }
}

/**
 * Get single order by ID from Polar API and sync to database
 */
export async function getOrderByIdFromPolar(orderId: string) {
  try {
    // Check if order exists in database first
    const existingOrder = await prisma.order.findUnique({
      where: { externalOrderId: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        product: true,
        price: true,
      },
    });

    // If exists and recently updated, return from database
    if (existingOrder) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (existingOrder.updatedAt > oneHourAgo) {
        return existingOrder;
      }
    }

    // Fetch order from Polar and sync
    const polarOrder = await polarService.fetchPolarOrderById(orderId);
    const order = await syncOrderFromPolar(polarOrder);

    return order;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error({ err: error, orderId }, "Error fetching order from Polar");
    throw new AppError(
      "ORDER_FETCH_ERROR",
      "Failed to fetch order from Polar",
      500,
    );
  }
}

/**
 * Get invoice for an order from Polar API
 */
export async function getOrderInvoice(orderId: string) {
  try {
    // First try to get order from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError("ORDER_NOT_FOUND", "Order not found", 404);
    }

    // Fetch invoice from Polar using Polar order ID
    const polarInvoice = await polarService.fetchPolarOrderInvoice(
      order.externalOrderId,
    );

    // Map from snake_case to camelCase
    return {
      id: polarInvoice.id,
      orderId: polarInvoice.order_id,
      url: polarInvoice.url,
      pdfUrl: polarInvoice.pdf_url,
      createdAt: polarInvoice.created_at,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error({ err: error, orderId }, "Error fetching invoice from Polar");
    throw new AppError(
      "INVOICE_FETCH_ERROR",
      "Failed to fetch invoice from Polar",
      500,
    );
  }
}
