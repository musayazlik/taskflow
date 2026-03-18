import { Elysia, t } from "elysia";
import * as aiModelService from "@api/services/ai-model.service";
import { AppError } from "@api/lib/errors";
import {
  requireAdmin,
  requireSuperAdmin,
  parsePagination,
  paginatedResponse,
  successResponse,
} from "@api/lib/route-helpers";
import {
  AiModelSchema,
  CreateAiModelSchema,
  UpdateAiModelSchema,
  AiModelQuerySchema,
} from "@repo/types";
import { AI_MODEL_DEFAULTS } from "@api/constants";

export const aiModelsRoutes = new Elysia({ prefix: "/ai-models" })
  .get(
    "/",
    async ({ query }) => {
      const { page, limit } = parsePagination(query);
      const params = {
        page,
        limit: limit || AI_MODEL_DEFAULTS.DEFAULT_LIMIT,
        activeOnly: query.activeOnly ? query.activeOnly === "true" : false,
        provider: query.provider,
      };
      const result = await aiModelService.getAllAiModels(params);
      return paginatedResponse(
        result.models,
        result.total,
        result.page,
        result.limit,
      );
    },
    {
      query: AiModelQuerySchema,
      detail: {
        tags: ["AI Models"],
        summary: "List all AI models",
        description: "Returns list of configured AI models",
      },
      response: t.Object({
        success: t.Boolean(),
        data: t.Array(AiModelSchema),
        meta: t.Object({
          total: t.Number(),
          page: t.Number(),
          limit: t.Number(),
          totalPages: t.Number(),
        }),
      }),
    },
  )

  .get(
    "/active",
    async () => {
      const models = await aiModelService.getActiveAiModels();
      return successResponse(models);
    },
    {
      detail: {
        tags: ["AI Models"],
        summary: "Get active AI models",
        description: "Returns only active AI models for selection",
      },
      response: t.Object({
        success: t.Boolean(),
        data: t.Array(AiModelSchema),
      }),
    },
  )

  .get(
    "/:id",
    async ({ params }) => {
      const model = await aiModelService.getAiModelById(params.id);
      if (!model) {
        throw new AppError("AI_MODEL_NOT_FOUND", "AI model not found", 404);
      }
      return successResponse(model);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["AI Models"],
        summary: "Get AI model by ID",
        description: "Returns a single AI model",
      },
      response: t.Object({
        success: t.Boolean(),
        data: AiModelSchema,
      }),
    },
  )

  .post(
    "/",
    async ({ body, request: { headers } }) => {
      await requireAdmin(headers);
      const model = await aiModelService.createAiModel(body);
      return successResponse(model);
    },
    {
      body: CreateAiModelSchema,
      detail: {
        tags: ["AI Models"],
        summary: "Create AI model",
        description: "Creates a new AI model configuration (admin only)",
      },
      response: t.Object({
        success: t.Boolean(),
        data: AiModelSchema,
      }),
    },
  )

  .patch(
    "/:id",
    async ({ params, body, request: { headers } }) => {
      await requireAdmin(headers);
      const model = await aiModelService.updateAiModel(params.id, body);
      return successResponse(model);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: UpdateAiModelSchema,
      detail: {
        tags: ["AI Models"],
        summary: "Update AI model",
        description: "Updates an AI model configuration (admin only)",
      },
      response: t.Object({
        success: t.Boolean(),
        data: AiModelSchema,
      }),
    },
  )

  .post(
    "/:id/toggle",
    async ({ params, request: { headers } }) => {
      await requireAdmin(headers);
      const model = await aiModelService.toggleAiModelStatus(params.id);
      return successResponse(model);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["AI Models"],
        summary: "Toggle AI model status",
        description: "Toggles the active status of an AI model (admin only)",
      },
      response: t.Object({
        success: t.Boolean(),
        data: AiModelSchema,
      }),
    },
  )

  .delete(
    "/:id",
    async ({ params, request: { headers } }) => {
      await requireAdmin(headers);
      await aiModelService.deleteAiModel(params.id);
      return {
        success: true,
        message: "AI model deleted successfully",
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["AI Models"],
        summary: "Delete AI model",
        description: "Deletes an AI model configuration (admin only)",
      },
      response: t.Object({
        success: t.Boolean(),
        message: t.String(),
      }),
    },
  )

  .post(
    "/seed",
    async ({ request: { headers } }) => {
      await requireSuperAdmin(headers);
      await aiModelService.seedDefaultAiModels();
      return {
        success: true,
        message: "Default AI models seeded successfully",
      };
    },
    {
      detail: {
        tags: ["AI Models"],
        summary: "Seed default AI models",
        description:
          "Seeds the database with default AI model configurations (super admin only)",
      },
      response: t.Object({
        success: t.Boolean(),
        message: t.String(),
      }),
    },
  );
