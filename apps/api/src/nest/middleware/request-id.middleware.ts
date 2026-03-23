import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";

import { logger } from "@api/lib/logger";

/** Express request augmented by {@link RequestIdAndLoggingMiddleware} */
export type RequestWithRequestId = Request & {
  requestId?: string;
};

@Injectable()
export class RequestIdAndLoggingMiddleware implements NestMiddleware {
  use(
    req: RequestWithRequestId,
    res: Response,
    next: NextFunction,
  ): void {
    const headerValue = req.headers["x-request-id"];
    const requestId =
      typeof headerValue === "string" && headerValue.trim().length > 0
        ? headerValue
        : crypto.randomUUID();

    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);

    const method = req.method;
    const path = req.path;

    logger.info({ requestId, method, path }, `[REQUEST] ${method} ${path}`);
    next();
  }
}

