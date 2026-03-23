import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

import { AppError } from "@api/lib/errors";
import { env } from "@api/lib/env";
import { logger } from "@api/lib/logger";
import { RATE_LIMIT } from "@api/constants";
import type { RequestWithRequestId } from "./request-id.middleware";

type RateLimitEntry = { count: number; resetAt: number };

declare global {
  // eslint-disable-next-line no-var
  var rateLimitStore: Map<string, RateLimitEntry> | undefined;
  // eslint-disable-next-line no-var
  var rateLimitCleanupInterval: ReturnType<typeof setInterval> | undefined;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  use(req: RequestWithRequestId, res: Response, next: NextFunction): void {
    if (env.NODE_ENV === "development") {
      res.setHeader("x-ratelimit-limit", String(RATE_LIMIT.GLOBAL.max));
      res.setHeader("x-ratelimit-remaining", "999999");
      res.setHeader("x-ratelimit-reset", "60");
      next();
      return;
    }

    const forwardedFor = req.headers["x-forwarded-for"];
    const realIp = req.headers["x-real-ip"];
    const cfConnectingIp = req.headers["cf-connecting-ip"];

    const forwardedForValue = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor;
    const realIpValue = Array.isArray(realIp) ? realIp[0] : realIp;
    const cfConnectingIpValue = Array.isArray(cfConnectingIp)
      ? cfConnectingIp[0]
      : cfConnectingIp;

    const clientId =
      (forwardedForValue?.split(",")[0]?.trim() ?? "") ||
      (realIpValue?.toString() ?? "") ||
      (cfConnectingIpValue?.toString() ?? "") ||
      "unknown";

    if (!globalThis.rateLimitStore) {
      globalThis.rateLimitStore = new Map<string, RateLimitEntry>();
    }

    const store = globalThis.rateLimitStore;
    const now = Date.now();
    const key = `rate-limit:${clientId}`;
    const limit = store.get(key);

    if (limit && limit.resetAt > now) {
      limit.count++;

      if (limit.count > RATE_LIMIT.GLOBAL.max) {
        const requestId = req.requestId;
        logger.warn(
          { requestId, clientId, code: "RATE_LIMIT_EXCEEDED" },
          "Rate limit exceeded",
        );
        throw new AppError(
          "RATE_LIMIT_EXCEEDED",
          `Too many requests. Limit: ${RATE_LIMIT.GLOBAL.max} requests per minute. Please try again later.`,
          429,
        );
      }
    } else {
      store.set(key, {
        count: 1,
        resetAt: now + RATE_LIMIT.GLOBAL.duration,
      });
    }

    if (!globalThis.rateLimitCleanupInterval) {
      globalThis.rateLimitCleanupInterval = setInterval(() => {
        const cleanupNow = Date.now();
        for (const [cleanupKey, cleanupValue] of store.entries()) {
          if (cleanupValue.resetAt < cleanupNow) {
            store.delete(cleanupKey);
          }
        }
      }, 5 * 60 * 1000);
    }

    const currentLimit = store.get(key)!;
    const remaining = Math.max(
      0,
      RATE_LIMIT.GLOBAL.max - currentLimit.count,
    );
    const resetInSeconds = Math.max(
      0,
      Math.ceil((currentLimit.resetAt - Date.now()) / 1000),
    );

    res.setHeader("x-ratelimit-limit", String(RATE_LIMIT.GLOBAL.max));
    res.setHeader("x-ratelimit-remaining", String(remaining));
    res.setHeader("x-ratelimit-reset", String(resetInSeconds));

    next();
  }
}

