import "reflect-metadata";

import express from "express";
import type { NextFunction, Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

import { env } from "@api/lib/env";
import { logger } from "@api/lib/logger";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { auth } from "@api/lib/auth";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    cors: false,
    bodyParser: false,
  });

  app.enableCors({
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  if (env.NODE_ENV === "development") {
    const config = new DocumentBuilder()
      .setTitle("TaskFlow API")
      .setDescription("OpenAPI documentation for TaskFlow (NestJS)")
      .setVersion("1.0.0")
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // `better-auth` endpoints are mounted directly in Express via `toNodeHandler(auth)`,
    // so Nest's Swagger scanner doesn't "see" them. We manually add the most
    // important auth routes (login/register) to keep docs parity.
    const doc = document as unknown as {
      paths: Record<string, Record<string, unknown>>;
    };

    doc.paths["/api/auth/sign-up/email"] = {
      post: {
        tags: ["Auth"],
        summary: "Register (email/password)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8, maxLength: 128 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "User registered successfully" },
        },
      },
    };

    doc.paths["/api/auth/sign-in/email"] = {
      post: {
        tags: ["Auth"],
        summary: "Login (email/password)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8, maxLength: 128 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "User logged in successfully" },
        },
      },
    };

    doc.paths["/api/auth/sign-out"] = {
      post: {
        tags: ["Auth"],
        summary: "Sign out",
        responses: {
          200: { description: "Signed out successfully" },
        },
      },
    };

    // Password reset + email verification endpoints.
    // These are mounted via `toNodeHandler(auth)` (Express), so we add them
    // manually to Swagger because they are mounted outside Nest's route graph.

    doc.paths["/api/auth/get-session"] = {
      get: {
        tags: ["Auth"],
        summary: "Get current session",
        responses: {
          200: { description: "Session (user + session) or nulls" },
        },
      },
    };

    doc.paths["/api/auth/forgot-password"] = {
      post: {
        tags: ["Auth"],
        summary: "Request password reset (email)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Password reset email is sent (if account exists)",
          },
        },
      },
    };

    doc.paths["/api/auth/reset-password"] = {
      post: {
        tags: ["Auth"],
        summary: "Reset password (token + newPassword)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token", "newPassword"],
                properties: {
                  token: { type: "string" },
                  newPassword: { type: "string", minLength: 8, maxLength: 128 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Password reset successfully" },
          400: { description: "Invalid token or bad request" },
        },
      },
    };

    doc.paths["/api/auth/verify-email"] = {
      get: {
        tags: ["Auth"],
        summary: "Verify email with token",
        parameters: [
          {
            name: "token",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "callbackURL",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Email verified (redirect or session)" },
        },
      },
    };

    doc.paths["/api/auth/send-verification-email"] = {
      post: {
        tags: ["Auth"],
        summary: "Send verification email (email + callbackURL)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email" },
                  callbackURL: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Verification email was sent (if allowed)" },
        },
      },
    };

    // TaskFlow spec: Swagger at /api/docs
    SwaggerModule.setup("/api/docs", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: "TaskFlow API Docs",
    });
  }

  // Better Auth expects to be mounted on an Express catch-all route.
  // Keep JSON parsing for all other routes; auth handler comes first.
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use("/api/auth", toNodeHandler(auth));

  const jsonParser = express.json();
  expressApp.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api/auth")) {
      next();
      return;
    }
    jsonParser(req, res, next);
  });

  await app.listen(env.PORT);

  logger.info(
    {
      port: env.PORT,
      environment: env.NODE_ENV,
    },
    "NestJS API Server started",
  );
}

void bootstrap();
