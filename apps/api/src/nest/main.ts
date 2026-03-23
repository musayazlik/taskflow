import "reflect-metadata";

import express from "express";
import type { NextFunction, Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import { NestFactory } from "@nestjs/core";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

import { env } from "@api/lib/env";
import { FileServiceFactory } from "@api/lib/file-service";
import { logger } from "@api/lib/logger";
import { refreshUploadthingTokenCache } from "@api/lib/uploadthing";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { mergeBetterAuthPathsIntoSwaggerDocument } from "./swagger/swagger-better-auth-paths";
import { auth } from "@api/lib/auth";

async function bootstrap(): Promise<void> {
  await refreshUploadthingTokenCache();
  FileServiceFactory.initialize();

  const app = await NestFactory.create(AppModule, {
    cors: false,
    bodyParser: false,
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  const allowedOrigins = [
    env.FRONTEND_URL,
    env.BETTER_AUTH_URL,
  ].filter((v): v is string => Boolean(v));

  app.enableCors({
    origin: allowedOrigins,
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

    const doc = document as unknown as {
      paths: Record<string, Record<string, unknown>>;
    };
    mergeBetterAuthPathsIntoSwaggerDocument(doc);

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
  // Respect reverse-proxy headers (x-forwarded-proto, x-forwarded-host) in production.
  // This is required for correct secure cookie behavior behind TLS-terminating proxies.
  expressApp.set("trust proxy", 1);
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
