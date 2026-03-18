import { Elysia, t } from "elysia";
import crypto from "crypto";
import { prisma } from "@repo/database";
import * as polarService from "@api/services/polar.service";
import { AppError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";

const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;

function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!POLAR_WEBHOOK_SECRET) {
    logger.warn("POLAR_WEBHOOK_SECRET not configured");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", POLAR_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

interface PolarWebhookEvent {
  type: string;
  data: {
    id: string;
    [key: string]: any;
  };
}

export const polarWebhookRoutes = new Elysia({
  prefix: "/webhooks/polar",
}).post(
  "/",
  async ({ body, request }) => {
    const signature = request.headers.get("polar-signature") || "";
    const rawBody = JSON.stringify(body);

    if (process.env.NODE_ENV === "production") {
      if (!verifyWebhookSignature(rawBody, signature)) {
        throw new AppError(
          "WEBHOOK_INVALID_SIGNATURE",
          "Invalid webhook signature",
          401,
        );
      }
    }

    const event = body as PolarWebhookEvent;
    logger.info({ eventType: event.type }, "Polar webhook received");

    try {
      switch (event.type) {
        case "product.created":
        case "product.updated":
          // Only update sync timestamp - DB is source of truth
          await prisma.product.updateMany({
            where: { externalProductId: event.data.id },
            data: { externalSyncedAt: new Date() },
          });
          logger.info(
            { externalProductId: event.data.id },
            "Product sync timestamp updated",
          );
          break;

        case "order.created":
          logger.info({ orderId: event.data.id }, "Order created");
          await polarService.handleOrderCreated(event.data as any);
          break;

        case "subscription.created":
        case "subscription.updated":
        case "subscription.canceled":
          logger.info(
            {
              subscriptionId: event.data.id,
              action: event.type.split(".")[1],
            },
            "Subscription event",
          );
          await polarService.handleSubscriptionUpdate(event.data as any);
          break;

        default:
          logger.warn({ eventType: event.type }, "Unknown event type");
      }

      return { received: true };
    } catch (error) {
      logger.error(
        { err: error, eventType: event.type },
        "Webhook processing error",
      );
      throw new AppError(
        "WEBHOOK_PROCESSING_ERROR",
        "Failed to process webhook",
        500,
      );
    }
  },
  {
    body: t.Any(),
    detail: {
      tags: ["Webhooks"],
      summary: "Handle Polar webhook",
      description: "Receives and processes webhook events from Polar.sh",
    },
  },
);
