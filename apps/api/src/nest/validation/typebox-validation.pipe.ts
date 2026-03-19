import { ArgumentMetadata, PipeTransform } from "@nestjs/common";

import type { TSchema } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import type { ValueError } from "@sinclair/typebox/value";

import { AppError } from "@api/lib/errors";

export class TypeBoxValidationPipe implements PipeTransform {
  constructor(private readonly schema: TSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    const isValid = Value.Check(this.schema, value);
    if (isValid) {
      return value;
    }

    const firstError = Value.Errors(this.schema, value).First();
    const message = TypeBoxValidationPipe.toUserFriendlyMessage(firstError);

    throw new AppError("VALIDATION_ERROR", message, 400);
  }

  private static toUserFriendlyMessage(
    error: ValueError | undefined,
  ): string {
    if (!error) return "Invalid request data";

    // Try to convert typical TypeBox required-property error messages to the
    // Elysia-style format: "'field' field is required".
    const requiredMatch = error.message.match(
      /required property\\s+([A-Za-z0-9_\\.-]+)/,
    );

    if (requiredMatch?.[1]) {
      return `'${requiredMatch[1]}' field is required`;
    }

    return error.message || "Invalid request data";
  }
}

