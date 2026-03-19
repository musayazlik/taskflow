import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";

import { env } from "@api/lib/env";
import { AppError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";
import { RATE_LIMIT } from "@api/constants";
import {
  healthRoutes,
  authRoutes,
  betterAuthPlugin,
  dashboardRoutes,
  usersRoutes,
  aiModelsRoutes,
  profileRoutes,
  settingsRoutes,
  mediaRoutes,
  aiRoutes,
  systemRoutes,
  chatHistoryRoutes,
} from "@api/routes";

// Rate limiting store type
declare global {
  // eslint-disable-next-line no-var
  var rateLimitStore:
    | Map<string, { count: number; resetAt: number }>
    | undefined;
  // eslint-disable-next-line no-var
  var rateLimitCleanupInterval: ReturnType<typeof setInterval> | undefined;
}

/**
 * TurboStack Backend API
 * Elysia.js + Bun runtime
 */
const app = new Elysia()
  // Request logging middleware (early, before derive)
  .onRequest(({ request }) => {
    const method = request.method;
    const url = new URL(request.url);
    const requestId = request.headers.get("x-request-id") || "generating...";
    logger.info(
      { requestId, method, path: url.pathname },
      `[REQUEST] ${method} ${url.pathname}`,
    );
  })
  // Request ID middleware - adds unique ID to every request
  .derive(({ headers }) => {
    const requestId =
      (headers["x-request-id"] as string) || crypto.randomUUID();
    return { requestId };
  })

  // CORS configuration
  .use(
    cors({
      origin: env.FRONTEND_URL,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
    }),
  )

  // Rate limiting - Global: 100 requests/minute (orta seviye limit)
  // IP bazlı rate limiting - çok fazla istek atılmasını engeller
  // ⚠️ Development ortamında devre dışı (sınırsız istek)
  .derive(({ request }) => {
    // Skip rate limiting in development
    if (env.NODE_ENV === "development") {
      return {
        rateLimitRemaining: 999999,
        rateLimitReset: Date.now() + 60000,
      };
    }

    // Get client identifier (IP address)
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientId =
      forwardedFor?.split(",")[0]?.trim() ||
      realIp ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    // Initialize rate limit store if not exists
    if (!globalThis.rateLimitStore) {
      globalThis.rateLimitStore = new Map<
        string,
        { count: number; resetAt: number }
      >();
    }

    const store = globalThis.rateLimitStore;
    const now = Date.now();
    const key = `rate-limit:${clientId}`;
    const limit = store.get(key);

    // Check if limit exists and is still valid
    if (limit && limit.resetAt > now) {
      // Increment counter
      limit.count++;

      // Check if limit exceeded
      if (limit.count > RATE_LIMIT.GLOBAL.max) {
        throw new AppError(
          "RATE_LIMIT_EXCEEDED",
          `Too many requests. Limit: ${RATE_LIMIT.GLOBAL.max} requests per minute. Please try again later.`,
          429,
        );
      }
    } else {
      // Create new limit entry
      store.set(key, {
        count: 1,
        resetAt: now + RATE_LIMIT.GLOBAL.duration,
      });
    }

    // Cleanup old entries periodically (every 5 minutes)
    if (!globalThis.rateLimitCleanupInterval) {
      globalThis.rateLimitCleanupInterval = setInterval(
        () => {
          const cleanupNow = Date.now();
          for (const [cleanupKey, cleanupValue] of store.entries()) {
            if (cleanupValue.resetAt < cleanupNow) {
              store.delete(cleanupKey);
            }
          }
        },
        5 * 60 * 1000,
      ); // 5 minutes
    }

    // Return rate limit info for response headers
    const currentLimit = store.get(key)!;
    return {
      rateLimitRemaining: Math.max(
        0,
        RATE_LIMIT.GLOBAL.max - currentLimit.count,
      ),
      rateLimitReset: currentLimit.resetAt,
    };
  })

  // Add request ID and rate limit info to response headers
  .onAfterHandle(({ set, requestId, rateLimitRemaining, rateLimitReset }) => {
    set.headers["x-request-id"] = requestId;
    if (rateLimitRemaining !== undefined && rateLimitReset !== undefined) {
      set.headers["x-ratelimit-limit"] = String(RATE_LIMIT.GLOBAL.max);
      set.headers["x-ratelimit-remaining"] = String(rateLimitRemaining);
      set.headers["x-ratelimit-reset"] = String(
        Math.ceil((rateLimitReset - Date.now()) / 1000),
      );
    }
  })

  // Global error handler - Standard API Response Format
  .onError(({ error, code, set, requestId }) => {
    // Handle custom AppError instances
    if (error instanceof AppError) {
      set.status = error.status;
      const err = error as any;
      logger.error(
        {
          requestId,
          code: err.code || "UNKNOWN",
          message: err.message,
        },
        `[ERROR] ${err.code || "UNKNOWN"}: ${err.message}`,
      );

      // Standard API response format
      return {
        success: false,
        error: err.code || "INTERNAL_ERROR",
        message: err.message || "An unexpected error occurred",
        ...(err.details && { details: err.details }),
        ...(requestId && { requestId }),
      };
    }

    // Handle Elysia built-in errors
    // Special handling for VALIDATION errors to extract user-friendly messages
    if (code === "VALIDATION" && error && typeof error === "object") {
      set.status = 400;

      // Try to parse Elysia validation error format
      const errorObj = error as any;
      let message = "Validation failed";

      // Elysia validation errors can have different structures
      // Try to extract user-friendly message
      try {
        // Check if it's an Error object with all property
        if (
          errorObj.all &&
          Array.isArray(errorObj.all) &&
          errorObj.all.length > 0
        ) {
          const firstError = errorObj.all[0];
          if (firstError.summary) {
            message = String(firstError.summary)
              .replace(
                /Expected property '(\w+)' to be (\w+) but found: undefined/g,
                "'$1' field is required",
              )
              .replace(
                /Property '(\w+)' is missing/g,
                "'$1' field is required",
              );
          } else if (firstError.path) {
            const fieldName = String(firstError.path).replace(/^\//, "");
            message = `'${fieldName}' field is required`;
          }
        }
        // Check for errors array
        else if (
          errorObj.errors &&
          Array.isArray(errorObj.errors) &&
          errorObj.errors.length > 0
        ) {
          const firstError = errorObj.errors[0];
          if (firstError.summary && typeof firstError.summary === "string") {
            message = firstError.summary
              .replace(
                /Expected property '(\w+)' to be (\w+) but found: undefined/g,
                "'$1' field is required",
              )
              .replace(
                /Property '(\w+)' is missing/g,
                "'$1' field is required",
              );
          } else if (firstError.path) {
            const fieldName = firstError.path.replace(/^\//, "");
            message = `'${fieldName}' field is required`;
          }
        }
        // Check for direct summary
        else if (errorObj.summary && typeof errorObj.summary === "string") {
          message = errorObj.summary
            .replace(
              /Expected property '(\w+)' to be (\w+) but found: undefined/g,
              "'$1' field is required",
            )
            .replace(/Property '(\w+)' is missing/g, "'$1' field is required");
        }
        // Check for message that's not JSON
        else if (
          errorObj.message &&
          typeof errorObj.message === "string" &&
          !errorObj.message.startsWith("{")
        ) {
          message = errorObj.message;
        }
        // Check for property path
        else if (errorObj.property) {
          const propertyPath = errorObj.property
            .replace(/^\//, "")
            .replace(/\//g, ".");
          message = `'${propertyPath}' field is required`;
        }
        // Try to get from validator property
        else if (errorObj.validator?.Errors) {
          const errors = [...errorObj.validator.Errors(errorObj.value)];
          if (errors.length > 0 && errors[0].message) {
            message = String(errors[0].message);
          }
        }
      } catch {
        // If parsing fails, use default message
        message = "Invalid request data";
      }

      logger.error({ requestId, message }, `[ERROR] VALIDATION: ${message}`);

      return {
        success: false,
        error: "VALIDATION_ERROR",
        message,
        ...(requestId && { requestId }),
      };
    }

    const errorMap: Record<
      string,
      { status: number; error: string; message: string }
    > = {
      NOT_FOUND: {
        status: 404,
        error: "NOT_FOUND",
        message: "The requested resource was not found",
      },
      PARSE: {
        status: 400,
        error: "VALIDATION_ERROR",
        message: "Failed to parse request body",
      },
      INTERNAL_SERVER_ERROR: {
        status: 500,
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    };

    const errorInfo = errorMap[code] || {
      status: 500,
      error: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    };

    set.status = errorInfo.status;

    // Get error message safely
    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? String(error.message)
        : "Unknown error";

    logger.error(
      { requestId, code, errorMessage },
      `[ERROR] ${code}: ${errorMessage}`,
    );

    // Don't expose internal error details in production
    const message =
      env.NODE_ENV === "production" ? errorInfo.message : errorMessage;

    // Standard API response format
    return {
      success: false,
      error: errorInfo.error,
      message,
      ...(requestId && { requestId }),
    };
  })

  // OpenAPI documentation (Swagger UI) — sadece development ortamında (güvenlik)
  .use(
    env.NODE_ENV === "development"
      ? openapi({
          documentation: {
            openapi: "3.1.0",
            info: {
              title: "TurboStack API",
              version: "1.0.0",
              description: `
# TurboStack Backend API

Modern full-stack starter kit API built with **Elysia.js** and **Bun** runtime.

## Features
- 🚀 High-performance Bun runtime
- 🔐 JWT-based authentication
- 📧 Email notifications with Resend
- 💳 Payment integration with Polar
- 📁 File uploads with UploadThing

## Authentication
Most endpoints require authentication via Bearer token in the Authorization header.
          `,
              termsOfService: "https://turbostack.pro/terms",
              contact: {
                name: "TurboStack Support",
                email: "support@example.com",
                url: "https://turbostack.pro",
              },
              license: {
                name: "Proprietary",
                url: "https://github.com/musayazlik/turbokit/blob/master/LICENSE",
              },
            },
            servers: [
              {
                url: "http://localhost:4101",
                description: "Development server",
              },
              {
                url: "https://api.example.com",
                description: "Production server",
              },
            ],
            tags: [
              {
                name: "Health",
                description: "Health check and monitoring endpoints",
              },
              {
                name: "Auth",
                description: "Authentication and authorization endpoints",
              },
              {
                name: "Users",
                description: "User management and profile endpoints",
              },
              {
                name: "Media",
                description: "File upload and media management",
              },
              {
                name: "Payments",
                description: "Payment and subscription endpoints",
              },
              {
                name: "Tasks",
                description: "Kanban task management endpoints",
              },
              {
                name: "Versions",
                description: "Version and changelog management endpoints",
              },
            ],
            components: {
              securitySchemes: {
                bearerAuth: {
                  type: "http",
                  scheme: "bearer",
                  bearerFormat: "JWT",
                  description: "JWT token obtained from /auth/login",
                },
              },
              schemas: {
                Error: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    code: { type: "string", example: "VALIDATION_ERROR" },
                    message: { type: "string", example: "Invalid input data" },
                    status: { type: "integer", example: 400 },
                    requestId: {
                      type: "string",
                      example: "550e8400-e29b-41d4-a716-446655440000",
                    },
                  },
                },
                Success: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "object" },
                    requestId: {
                      type: "string",
                      example: "550e8400-e29b-41d4-a716-446655440000",
                    },
                  },
                },
              },
            },
          },
          path: "/openapi",
        })
      : new Elysia({ name: "openapi-disabled" }),
  )

  // Mount routes
  .use(healthRoutes)

  .group(
    "/api",
    (app) =>
      app
        .use(betterAuthPlugin)
        .use(authRoutes)
        .use(dashboardRoutes) // Dashboard stats at /api/dashboard/*
        .use(usersRoutes) // User management at /api/users/*
        .use(aiModelsRoutes) // AI Models at /api/ai-models/*
        .use(chatHistoryRoutes) // Chat History at /api/chat-history/*
        .use(profileRoutes) // Profile at /api/profile/*
        .use(mediaRoutes) // Media management at /api/media/* (includes file upload)
        .group("/settings", (app) => app.use(settingsRoutes)) // Settings at /api/settings/*
        .use(aiRoutes) // AI routes at /api/ai/* (includes AI management)
        .use(systemRoutes) // System statistics at /api/system/*
  )

  // Start server
  .listen(env.PORT);

// Export type for Eden Treaty (type-safe client)
export type App = typeof app;

// Startup message
logger.info(
  {
    port: env.PORT,
    environment: env.NODE_ENV,
    openApi:
      env.NODE_ENV === "development"
        ? `http://localhost:${env.PORT}/openapi`
        : undefined,
  },
  "TurboStack API Server started",
);
