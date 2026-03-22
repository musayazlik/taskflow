import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import type { Request, Response } from "express";

import { env } from "@api/lib/env";
import { logger } from "@api/lib/logger";
import { AppError } from "@api/lib/errors";
import type { RequestWithRequestId } from "../../middleware/request-id.middleware";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<RequestWithRequestId>();

    const requestId =
      req.requestId ??
      (typeof req.headers["x-request-id"] === "string"
        ? req.headers["x-request-id"]
        : undefined);

    if (exception instanceof AppError) {
      res.status(exception.status).json({
        success: false,
        error: exception.code || "INTERNAL_ERROR",
        message: exception.message || "An unexpected error occurred",
        ...(exception.details && { details: exception.details }),
        ...(requestId && { requestId }),
      });

      logger.error(
        { requestId, code: exception.code, message: exception.message },
        `[ERROR] ${exception.code}: ${exception.message}`,
      );
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      // Common Nest patterns: { message } or string
      const message = (() => {
        if (typeof response === "string") return response;
        if (typeof response === "object" && response !== null) {
          const record = response as Record<string, unknown>;
          const value = record.message;
          if (Array.isArray(value) && value.length > 0) {
            const first = value[0];
            return typeof first === "string" ? first : undefined;
          }
          if (typeof value === "string") return value;
        }
        return undefined;
      })();

      if (status === 400) {
        res.status(status).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: message || "Validation failed",
          ...(requestId && { requestId }),
        });

        logger.error(
          { requestId, status, message },
          `[ERROR] VALIDATION_ERROR: ${String(message)}`,
        );
        return;
      }

      const internalMessage =
        env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : message || "An unexpected error occurred";

      res.status(status).json({
        success: false,
        error: "INTERNAL_ERROR",
        message: internalMessage,
        ...(requestId && { requestId }),
      });

      logger.error(
        { requestId, status, message },
        `[ERROR] HTTP ${status}: ${String(message)}`,
      );
      return;
    }

    const status = 500;
    const rawMessage =
      exception instanceof Error ? exception.message : "Unknown error";

    res.status(status).json({
      success: false,
      error: "INTERNAL_ERROR",
      message:
        env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : rawMessage || "An unexpected error occurred",
      ...(requestId && { requestId }),
    });

    logger.error(
      { requestId, rawMessage },
      `[ERROR] INTERNAL_ERROR: ${rawMessage}`,
    );
  }
}
