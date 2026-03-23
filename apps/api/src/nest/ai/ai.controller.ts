import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";

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
import { TypeBoxValidationPipe } from "../common/pipes/typebox-validation.pipe";

import {
  chatSchema,
  contentSchema,
  imageSchema,
  processSchema,
  seoSchema,
  type ChatRequest,
  type ContentRequest,
  type ImageRequest,
  type ProcessRequest,
  type SeoRequest,
} from "./dto/ai.schemas";

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
    const normalizedMessages = (messages as ChatMessage[]).map((msg) => {
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
