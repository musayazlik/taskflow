import { Injectable, type NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

type Sanitizable = Record<string, unknown> | unknown[] | string | null | undefined;

function sanitizeString(value: string): string {
  return value
    .replace(/\u0000/g, "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .trim();
}

function sanitizeValue(value: Sanitizable): Sanitizable {
  if (typeof value === "string") {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item as Sanitizable)) as unknown[];
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};

    for (const [key, item] of Object.entries(record)) {
      sanitized[key] = sanitizeValue(item as Sanitizable);
    }

    return sanitized;
  }

  return value;
}

@Injectable()
export class InputSanitizationMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    req.body = sanitizeValue(req.body) as Request["body"];
    req.query = sanitizeValue(req.query) as Request["query"];
    req.params = sanitizeValue(req.params) as Request["params"];
    next();
  }
}
