import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { t } from "elysia";

import { AppError } from "@api/lib/errors";
import { successResponse } from "@api/lib/route-helpers";
import { BetterAuthGuard } from "../auth/better-auth.guard";
import type { RequestWithSession } from "../auth/better-auth.guard";

import * as aiService from "@api/services/ai.service";
import { processAIRequest } from "@api/services/ai.service";
import type {
  ChatMessage,
  MultimodalContent,
  SystemPromptCategory,
} from "@repo/types";
import { TypeBoxValidationPipe } from "../validation/typebox-validation.pipe";

const chatSchema = t.Object({
  model: t.String(),
  messages: t.Array(
    t.Object({
      role: t.Union([
        t.Literal("user"),
        t.Literal("assistant"),
        t.Literal("system"),
      ]),
      // content can be string or array, validated/normalized below
      content: t.Any(),
    }),
  ),
  temperature: t.Optional(t.Number({ minimum: 0, maximum: 2 })),
  maxTokens: t.Optional(t.Number({ minimum: 1, maximum: 128000 })),
});

type ChatRequest = {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
};

const seoSchema = t.Object({
  model: t.String(),
  topic: t.String({ minLength: 1 }),
  targetKeyword: t.Optional(t.String()),
  tone: t.String({ default: "professional" }),
  language: t.String({ default: "en" }),
  creativity: t.Number({ minimum: 0, maximum: 1, default: 0.7 }),
});

type SeoRequest = {
  model: string;
  topic: string;
  targetKeyword?: string;
  tone: string;
  language: string;
  creativity: number;
};

const contentSchema = t.Object({
  model: t.String(),
  topic: t.String({ minLength: 1 }),
  keywords: t.Optional(t.String()),
  contentType: t.String({ default: "blog" }),
  tone: t.String({ default: "professional" }),
  language: t.String({ default: "en" }),
  targetLength: t.Number({ minimum: 100, maximum: 5000, default: 500 }),
  creativity: t.Number({ minimum: 0, maximum: 1, default: 0.7 }),
});

type ContentRequest = {
  model: string;
  topic: string;
  keywords?: string;
  contentType: string;
  tone: string;
  language: string;
  targetLength: number;
  creativity: number;
};

const imageSchema = t.Object({
  model: t.String(),
  prompt: t.String({ minLength: 1 }),
  negativePrompt: t.Optional(t.String()),
  aspectRatio: t.String({ default: "1:1" }),
  style: t.String({ default: "realistic" }),
  quality: t.Number({ minimum: 50, maximum: 100, default: 80 }),
  count: t.Number({ minimum: 1, maximum: 4, default: 1 }),
  baseImageUrl: t.Optional(t.String()),
});

type ImageRequest = {
  model: string;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: string;
  style: string;
  quality: number;
  count: number;
  baseImageUrl?: string;
};

const processSchema = t.Object({
  userPrompt: t.String({ minLength: 1 }),
  aiModelName: t.String({ minLength: 1 }),
  aiProvider: t.Union([
    t.Literal("openrouter"),
    t.Literal("openai"),
    t.Literal("anthropic"),
    t.Literal("google"),
  ]),
  systemPromptCategory: t.Optional(
    t.Union([
      t.Literal("TEXT_GENERATION"),
      t.Literal("IMAGE_GENERATION"),
      t.Literal("SEO_OPTIMIZATION"),
      t.Literal("CODE_GENERATION"),
    ]),
  ),
  systemPromptType: t.Optional(t.String()),
  customSystemPrompt: t.Optional(t.String()),
  temperature: t.Optional(t.Number({ minimum: 0, maximum: 2 })),
  maxTokens: t.Optional(t.Number({ minimum: 1, maximum: 128000 })),
  additionalParams: t.Optional(t.Record(t.String(), t.Any())),
});

type ProcessRequest = {
  userPrompt: string;
  aiModelName: string;
  aiProvider: "openrouter" | "openai" | "anthropic" | "google";
  systemPromptCategory?:
    | "TEXT_GENERATION"
    | "IMAGE_GENERATION"
    | "SEO_OPTIMIZATION"
    | "CODE_GENERATION";
  systemPromptType?: string;
  customSystemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  additionalParams?: Record<string, unknown>;
};

@Controller("/api/ai")
@UseGuards(BetterAuthGuard)
export class AiController {
  @Post("/chat")
  async chat(
    @Req() req: RequestWithSession,
    @Body(new TypeBoxValidationPipe(chatSchema)) body: ChatRequest,
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const { model, messages, temperature, maxTokens } = body;

    // Normalize messages to match provider expected format
    const normalizedMessages = messages.map((msg) => {
      if (typeof msg.content === "string") return msg;
      if (Array.isArray(msg.content)) {
        const validatedContent: MultimodalContent[] = msg.content.map((item) => {
          if (item && typeof item === "object") {
            const anyItem = item as unknown as Record<string, unknown>;
            if (anyItem.type === "text" && typeof anyItem.text === "string") {
              return item as MultimodalContent;
            }
            if (
              anyItem.type === "image_url" &&
              anyItem.image_url &&
              typeof (anyItem.image_url as { url?: unknown }).url === "string"
            ) {
              return item as MultimodalContent;
            }
            if (
              anyItem.type === "audio_url" &&
              anyItem.audio_url &&
              typeof (anyItem.audio_url as { url?: unknown }).url === "string"
            ) {
              return item as MultimodalContent;
            }
          }
          throw new Error(`Invalid content item: ${JSON.stringify(item)}`);
        });
        return { ...msg, content: validatedContent };
      }
      throw new Error(`Content must be string or array, got: ${typeof msg.content}`);
    });

    const response = await aiService.chatCompletion({
      model,
      messages: normalizedMessages,
      temperature,
      maxTokens,
    });

    return successResponse(response);
  }

  @Post("/seo")
  async seo(
    @Body(new TypeBoxValidationPipe(seoSchema)) body: SeoRequest,
  ) {
    const result = await aiService.generateSEO({
      model: body.model,
      topic: body.topic,
      targetKeyword: body.targetKeyword,
      tone: body.tone,
      language: body.language,
      creativity: body.creativity,
    });
    return successResponse(result);
  }

  @Post("/content")
  async content(
    @Body(new TypeBoxValidationPipe(contentSchema)) body: ContentRequest,
  ) {
    const result = await aiService.generateContent({
      model: body.model,
      topic: body.topic,
      keywords: body.keywords,
      contentType: body.contentType,
      tone: body.tone,
      language: body.language,
      targetLength: body.targetLength,
      creativity: body.creativity,
    });
    return successResponse(result);
  }

  @Post("/image")
  async image(
    @Req() req: RequestWithSession,
    @Body(new TypeBoxValidationPipe(imageSchema)) body: ImageRequest,
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const result = await aiService.generateImages(
      {
        model: body.model,
        prompt: body.prompt,
        negativePrompt: body.negativePrompt,
        aspectRatio: body.aspectRatio,
        style: body.style,
        quality: body.quality,
        count: body.count,
        baseImageUrl: body.baseImageUrl,
      },
      session.user.id,
    );

    return successResponse(result);
  }

  @Get("/models")
  async models() {
    const models = await aiService.listModels();
    return successResponse(models);
  }

  @Get("/models/image")
  async imageModels() {
    const models = await aiService.getImageGenerationModels();
    return successResponse(models);
  }

  @Post("/process")
  async process(
    @Body(new TypeBoxValidationPipe(processSchema)) body: ProcessRequest,
  ) {
    const requestParams = {
      userPrompt: body.userPrompt,
      aiModelName: body.aiModelName,
      aiProvider: body.aiProvider,
      systemPromptCategory: body.systemPromptCategory
        ? (body.systemPromptCategory as SystemPromptCategory)
        : undefined,
      systemPromptType: body.systemPromptType,
      customSystemPrompt: body.customSystemPrompt,
      temperature: body.temperature,
      maxTokens: body.maxTokens,
      additionalParams: body.additionalParams,
    };

    const response = await processAIRequest(requestParams);
    return successResponse(response);
  }
}

