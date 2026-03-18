import { prisma } from "@repo/database";
import { AppError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";
import {
  PAGINATION,
  AI_MODEL_DEFAULTS,
  DEFAULT_AI_MODELS,
} from "@api/constants";
import type {
  AiModel,
  AiModelListParams,
  CreateAiModelData,
  UpdateAiModelData,
} from "@repo/types";

export const getAllAiModels = async (
  params: AiModelListParams = {},
): Promise<{
  models: AiModel[];
  total: number;
  page: number;
  limit: number;
}> => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = AI_MODEL_DEFAULTS.DEFAULT_LIMIT,
    activeOnly = false,
    provider,
  } = params;
  const skip = (page - 1) * limit;

  try {
    const where: any = {};
    if (activeOnly) where.isActive = true;
    if (provider) where.provider = provider;

    const [models, total] = await Promise.all([
      prisma.aiModel.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ provider: "asc" }, { name: "asc" }],
      }),
      prisma.aiModel.count({ where }),
    ]);

    return { models, total, page, limit };
  } catch (error) {
    logger.error({ err: error, params }, "Error fetching AI models");
    throw new AppError(
      "AI_MODEL_FETCH_ERROR",
      "Failed to fetch AI models",
      500,
    );
  }
};

export const getActiveAiModels = async (): Promise<AiModel[]> => {
  try {
    return await prisma.aiModel.findMany({
      where: { isActive: true },
      orderBy: [{ provider: "asc" }, { name: "asc" }],
    });
  } catch (error) {
    logger.error({ err: error }, "Error fetching active AI models");
    throw new AppError(
      "AI_MODEL_FETCH_ERROR",
      "Failed to fetch AI models",
      500,
    );
  }
};

export const getAiModelById = async (id: string): Promise<AiModel | null> => {
  try {
    return await prisma.aiModel.findUnique({
      where: { id },
    });
  } catch (error) {
    logger.error({ err: error, id }, "Error fetching AI model by ID");
    throw new AppError("AI_MODEL_FETCH_ERROR", "Failed to fetch AI model", 500);
  }
};

export const getAiModelByModelId = async (
  modelId: string,
): Promise<AiModel | null> => {
  try {
    return await prisma.aiModel.findUnique({
      where: { modelId },
    });
  } catch (error) {
    logger.error({ err: error, modelId }, "Error fetching AI model by modelId");
    throw new AppError("AI_MODEL_FETCH_ERROR", "Failed to fetch AI model", 500);
  }
};

export const createAiModel = async (
  data: CreateAiModelData,
): Promise<AiModel> => {
  try {
    return await prisma.aiModel.create({
      data: {
        name: data.name,
        provider: data.provider,
        modelId: data.modelId,
        description: data.description,
        contextSize: data.contextSize,
        pricing: data.pricing,
        capabilities: data.capabilities || [],
        inputModalities: data.inputModalities || ["text"],
        outputModalities: data.outputModalities || ["text"],
        supportsImageOutput: data.supportsImageOutput ?? false,
        isActive: data.isActive ?? true,
      },
    });
  } catch (error) {
    logger.error({ err: error, data }, "Error creating AI model");
    throw new AppError(
      "AI_MODEL_CREATE_ERROR",
      "Failed to create AI model",
      500,
    );
  }
};

export const updateAiModel = async (
  id: string,
  data: UpdateAiModelData,
): Promise<AiModel> => {
  try {
    return await prisma.aiModel.update({
      where: { id },
      data,
    });
  } catch (error) {
    logger.error({ err: error, id, data }, "Error updating AI model");
    throw new AppError(
      "AI_MODEL_UPDATE_ERROR",
      "Failed to update AI model",
      500,
    );
  }
};

export const toggleAiModelStatus = async (id: string): Promise<AiModel> => {
  try {
    const model = await prisma.aiModel.findUnique({ where: { id } });
    if (!model) {
      throw new AppError("AI_MODEL_NOT_FOUND", "AI model not found", 404);
    }

    return await prisma.aiModel.update({
      where: { id },
      data: { isActive: !model.isActive },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error({ err: error, id }, "Error toggling AI model status");
    throw new AppError(
      "AI_MODEL_UPDATE_ERROR",
      "Failed to update AI model",
      500,
    );
  }
};

export const deleteAiModel = async (id: string): Promise<void> => {
  try {
    await prisma.aiModel.delete({ where: { id } });
  } catch (error) {
    logger.error({ err: error, id }, "Error deleting AI model");
    throw new AppError(
      "AI_MODEL_DELETE_ERROR",
      "Failed to delete AI model",
      500,
    );
  }
};

export const seedDefaultAiModels = async (): Promise<void> => {
  for (const model of DEFAULT_AI_MODELS) {
    try {
      await prisma.aiModel.upsert({
        where: { modelId: model.modelId },
        update: {},
        create: {
          name: model.name,
          provider: model.provider,
          modelId: model.modelId,
          description: model.description,
          contextSize: model.contextSize,
          pricing: model.pricing,
          capabilities: [...model.capabilities],
          inputModalities: ["text", "image"],
          outputModalities: ["text"],
          supportsImageOutput: false,
          isActive: true,
        },
      });
    } catch (error) {
      logger.error(
        { err: error, modelName: model.name, modelId: model.modelId },
        "Error seeding AI model",
      );
    }
  }
};
