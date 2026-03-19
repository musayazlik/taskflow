import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";

import { BetterAuthGuard } from "../auth/better-auth.guard";
import { AdminGuard, SuperAdminGuard } from "../auth/role.guards";
import { AppError } from "@api/lib/errors";
import {
  parsePagination,
  paginatedResponse,
  successResponse,
} from "@api/lib/route-helpers";
import * as aiModelService from "@api/services/ai-model.service";
import { AI_MODEL_DEFAULTS } from "@api/constants";
import {
  CreateAiModelSchema,
  type CreateAiModelData,
  UpdateAiModelSchema,
  type UpdateAiModelData,
} from "@repo/types";
import { TypeBoxValidationPipe } from "../validation/typebox-validation.pipe";

@Controller("/api/ai-models")
export class AiModelsController {
  @Get("/")
  async list(@Query() query: { page?: string; limit?: string; activeOnly?: string; provider?: string }) {
    const { page, limit } = parsePagination(query);
    const params = {
      page,
      limit: (limit || AI_MODEL_DEFAULTS.DEFAULT_LIMIT) as number,
      activeOnly: query.activeOnly === "true",
      provider: query.provider as string | undefined,
    };

    const result = await aiModelService.getAllAiModels(params);
    return paginatedResponse(result.models, result.total, result.page, result.limit);
  }

  @Get("/active")
  async active() {
    const models = await aiModelService.getActiveAiModels();
    return successResponse(models);
  }

  @Get("/:id")
  async getById(@Param("id") id: string) {
    const model = await aiModelService.getAiModelById(id);
    if (!model) {
      throw new AppError("AI_MODEL_NOT_FOUND", "AI model not found", 404);
    }
    return successResponse(model);
  }

  @Post("/")
  @UseGuards(BetterAuthGuard, AdminGuard)
  async create(
    @Body(new TypeBoxValidationPipe(CreateAiModelSchema)) body: CreateAiModelData,
  ) {
    const model = await aiModelService.createAiModel(body);
    return successResponse(model);
  }

  @Patch("/:id")
  @UseGuards(BetterAuthGuard, AdminGuard)
  async update(
    @Param("id") id: string,
    @Body(new TypeBoxValidationPipe(UpdateAiModelSchema)) body: UpdateAiModelData,
  ) {
    const model = await aiModelService.updateAiModel(id, body);
    return successResponse(model);
  }

  @Post("/:id/toggle")
  @UseGuards(BetterAuthGuard, AdminGuard)
  async toggle(@Param("id") id: string) {
    const model = await aiModelService.toggleAiModelStatus(id);
    return successResponse(model);
  }

  @Delete("/:id")
  @UseGuards(BetterAuthGuard, AdminGuard)
  async remove(@Param("id") id: string) {
    await aiModelService.deleteAiModel(id);
    return { success: true, message: "AI model deleted successfully" };
  }

  @Post("/seed")
  @UseGuards(BetterAuthGuard, SuperAdminGuard)
  async seed() {
    await aiModelService.seedDefaultAiModels();
    return { success: true, message: "Default AI models seeded successfully" };
  }
}

