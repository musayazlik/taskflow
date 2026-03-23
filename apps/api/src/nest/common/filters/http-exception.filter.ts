import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";

import { env } from "@api/lib/env";
import { logger } from "@api/lib/logger";
import { AppError } from "@api/lib/errors";
import type { RequestWithRequestId } from "../../middleware/request-id.middleware";

function httpExceptionStatusToErrorCode(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return "VALIDATION_ERROR";
    case HttpStatus.UNAUTHORIZED:
      return "UNAUTHORIZED";
    case HttpStatus.FORBIDDEN:
      return "FORBIDDEN";
    case HttpStatus.NOT_FOUND:
      return "NOT_FOUND";
    case HttpStatus.CONFLICT:
      return "CONFLICT";
    case HttpStatus.TOO_MANY_REQUESTS:
      return "RATE_LIMIT_EXCEEDED";
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return "UNPROCESSABLE_ENTITY";
    default:
      if (status >= 400 && status < 500) {
        return "CLIENT_ERROR";
      }
      return "INTERNAL_ERROR";
  }
}

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
    const basePayload = {
      success: false as const,
      timestamp: new Date().toISOString(),
      path: req.originalUrl || req.url,
      requestId,
    };

    if (exception instanceof AppError) {
      res.status(exception.status).json({
        ...basePayload,
        error: exception.code || "INTERNAL_ERROR",
        message: exception.message || "An unexpected error occurred",
        ...(exception.details && { details: exception.details }),
      });

      logger.error(
        {
          requestId,
          method: req.method,
          path: req.originalUrl || req.url,
          code: exception.code,
          message: exception.message,
          details: exception.details,
        },
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
      const details =
        typeof response === "object" && response !== null
          ? (() => {
              const record = response as Record<string, unknown>;
              if (Array.isArray(record.message)) {
                return record.message.filter(
                  (item): item is string => typeof item === "string",
                );
              }
              if (record.details && typeof record.details === "object") {
                return record.details;
              }
              return undefined;
            })()
          : undefined;

      if (status === HttpStatus.BAD_REQUEST) {
        res.status(status).json({
          ...basePayload,
          error: "VALIDATION_ERROR",
          message: message || "Validation failed",
          ...(details && { details }),
        });

        logger.error(
          {
            requestId,
            method: req.method,
            path: req.originalUrl || req.url,
            status,
            message,
            details,
          },
          `[ERROR] VALIDATION_ERROR: ${String(message)}`,
        );
        return;
      }

      const hideDetails =
        env.NODE_ENV === "production" && status >= HttpStatus.INTERNAL_SERVER_ERROR;
      const responseMessage = hideDetails
        ? "An unexpected error occurred"
        : message || "Request failed";

      const errorCode = httpExceptionStatusToErrorCode(status);

      res.status(status).json({
        ...basePayload,
        error: errorCode,
        message: responseMessage,
        ...(details && { details }),
      });

      logger.error(
        {
          requestId,
          method: req.method,
          path: req.originalUrl || req.url,
          status,
          message,
          errorCode,
          details,
        },
        `[ERROR] HTTP ${status} (${errorCode}): ${String(message)}`,
      );
      return;
    }

    const status = 500;
    const rawMessage =
      exception instanceof Error ? exception.message : "Unknown error";

    res.status(status).json({
      ...basePayload,
      error: "INTERNAL_ERROR",
      message:
        env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : rawMessage || "An unexpected error occurred",
    });

    logger.error(
      {
        requestId,
        method: req.method,
        path: req.originalUrl || req.url,
        rawMessage,
        stack: exception instanceof Error ? exception.stack : undefined,
      },
      `[ERROR] INTERNAL_ERROR: ${rawMessage}`,
    );
  }
}
