import { Static, Type as t } from "@sinclair/typebox";

export const AiModelSchema = t.Object({
  id: t.String(),
  name: t.String(),
  provider: t.String(),
  modelId: t.String(),
  description: t.Union([t.String(), t.Null()]),
  contextSize: t.Union([t.Number(), t.Null()]),
  pricing: t.Any(),
  capabilities: t.Array(t.String()),
  inputModalities: t.Array(t.String()),
  outputModalities: t.Array(t.String()),
  supportsImageOutput: t.Boolean(),
  isActive: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type AiModel = Static<typeof AiModelSchema>;

export const CreateAiModelSchema = t.Object({
  name: t.String(),
  provider: t.String(),
  modelId: t.String(),
  description: t.Optional(t.String()),
  contextSize: t.Optional(t.Number()),
  pricing: t.Optional(
    t.Object({
      inputPerMillion: t.Number(),
      outputPerMillion: t.Number(),
    }),
  ),
  capabilities: t.Optional(t.Array(t.String())),
  inputModalities: t.Optional(t.Array(t.String())),
  outputModalities: t.Optional(t.Array(t.String())),
  supportsImageOutput: t.Optional(t.Boolean()),
  isActive: t.Optional(t.Boolean()),
});

export type CreateAiModel = Static<typeof CreateAiModelSchema>;

export const UpdateAiModelSchema = t.Object({
  name: t.Optional(t.String()),
  description: t.Optional(t.String()),
  contextSize: t.Optional(t.Number()),
  pricing: t.Optional(
    t.Object({
      inputPerMillion: t.Number(),
      outputPerMillion: t.Number(),
    }),
  ),
  capabilities: t.Optional(t.Array(t.String())),
  inputModalities: t.Optional(t.Array(t.String())),
  outputModalities: t.Optional(t.Array(t.String())),
  supportsImageOutput: t.Optional(t.Boolean()),
  isActive: t.Optional(t.Boolean()),
});

export type UpdateAiModel = Static<typeof UpdateAiModelSchema>;

export const AiModelQuerySchema = t.Object({
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
  activeOnly: t.Optional(t.String()),
  provider: t.Optional(t.String()),
});

export type AiModelQuery = Static<typeof AiModelQuerySchema>;

// Service-level types
export interface AiModelListParams {
  page?: number;
  limit?: number;
  activeOnly?: boolean;
  provider?: string;
}

export interface CreateAiModelData {
  name: string;
  provider: string;
  modelId: string;
  description?: string;
  contextSize?: number;
  pricing?: { inputPerMillion: number; outputPerMillion: number };
  capabilities?: string[];
  inputModalities?: string[];
  outputModalities?: string[];
  supportsImageOutput?: boolean;
  isActive?: boolean;
}

export interface UpdateAiModelData {
  name?: string;
  description?: string;
  contextSize?: number;
  pricing?: { inputPerMillion: number; outputPerMillion: number };
  capabilities?: string[];
  inputModalities?: string[];
  outputModalities?: string[];
  supportsImageOutput?: boolean;
  isActive?: boolean;
}

// Frontend service type (simplified version)
export interface AiModelFrontend {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  description?: string;
  contextLength?: number;
  promptPrice?: string;
  completionPrice?: string;
  inputModalities: string[];
  outputModalities: string[];
  supportsImageOutput?: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
