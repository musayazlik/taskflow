import { Elysia, t } from "elysia";
import { getSession, successResponse } from "@api/lib/route-helpers";
import * as aiService from "@api/services/ai.service";
import { processAIRequest } from "@api/services/ai.service";
import { SystemPromptCategory } from "@repo/types";

export const aiRoutes = new Elysia({ prefix: "/ai" })
  .post(
    "/chat",
    async ({ request: { headers }, body }) => {
      await getSession(headers);

      const { model, messages, temperature, maxTokens } = body;

      // Validate and normalize messages
      const normalizedMessages = messages.map((msg: any) => {
        // Validate content type
        if (typeof msg.content === "string") {
          return msg;
        }
        if (Array.isArray(msg.content)) {
          // Validate multimodal content structure
          const validatedContent = msg.content.map((item: any) => {
            if (item.type === "text" && typeof item.text === "string") {
              return item;
            }
            if (
              item.type === "image_url" &&
              item.image_url &&
              typeof item.image_url.url === "string"
            ) {
              return item;
            }
            if (
              item.type === "audio_url" &&
              item.audio_url &&
              typeof item.audio_url.url === "string"
            ) {
              return item;
            }
            throw new Error(`Invalid content item: ${JSON.stringify(item)}`);
          });
          return { ...msg, content: validatedContent };
        }
        throw new Error(
          `Content must be string or array, got: ${typeof msg.content}`,
        );
      });

      const response = await aiService.chatCompletion({
        model,
        messages: normalizedMessages,
        temperature,
        maxTokens,
      });

      return successResponse(response);
    },
    {
      body: t.Object({
        model: t.String(),
        messages: t.Array(
          t.Object({
            role: t.Union([
              t.Literal("user"),
              t.Literal("assistant"),
              t.Literal("system"),
            ]),
            // Support both string (text-only) and array (multimodal)
            // Using Any() and validate at runtime for better flexibility
            content: t.Any(),
          }),
        ),
        temperature: t.Optional(t.Number({ minimum: 0, maximum: 2 })),
        maxTokens: t.Optional(t.Number({ minimum: 1, maximum: 128000 })),
      }),
      detail: {
        tags: ["AI"],
        summary: "Chat with AI",
        description: "Send messages to an AI model and get a response",
      },
    },
  )

  .post(
    "/seo",
    async ({ request: { headers }, body }) => {
      await getSession(headers);

      const result = await aiService.generateSEO({
        model: body.model,
        topic: body.topic,
        targetKeyword: body.targetKeyword,
        tone: body.tone,
        language: body.language,
        creativity: body.creativity,
      });

      return successResponse(result);
    },
    {
      body: t.Object({
        model: t.String(),
        topic: t.String({ minLength: 1 }),
        targetKeyword: t.Optional(t.String()),
        tone: t.String({ default: "professional" }),
        language: t.String({ default: "en" }),
        creativity: t.Number({ minimum: 0, maximum: 1, default: 0.7 }),
      }),
      detail: {
        tags: ["AI"],
        summary: "Generate SEO content",
        description:
          "Generate SEO-optimized title, description, and keywords for a topic",
      },
    },
  )

  .post(
    "/content",
    async ({ request: { headers }, body }) => {
      await getSession(headers);

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
    },
    {
      body: t.Object({
        model: t.String(),
        topic: t.String({ minLength: 1 }),
        keywords: t.Optional(t.String()),
        contentType: t.String({ default: "blog" }),
        tone: t.String({ default: "professional" }),
        language: t.String({ default: "en" }),
        targetLength: t.Number({ minimum: 100, maximum: 5000, default: 500 }),
        creativity: t.Number({ minimum: 0, maximum: 1, default: 0.7 }),
      }),
      detail: {
        tags: ["AI"],
        summary: "Generate content",
        description: "Generate blog posts, articles, or other content",
      },
    },
  )

  .post(
    "/image",
    async ({ request: { headers }, body }) => {
      const session = await getSession(headers);

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
    },
    {
      body: t.Object({
        model: t.String(),
        prompt: t.String({ minLength: 1 }),
        negativePrompt: t.Optional(t.String()),
        aspectRatio: t.String({ default: "1:1" }),
        style: t.String({ default: "realistic" }),
        quality: t.Number({ minimum: 50, maximum: 100, default: 80 }),
        count: t.Number({ minimum: 1, maximum: 4, default: 1 }),
        baseImageUrl: t.Optional(t.String()), // For image-to-image generation
      }),
      detail: {
        tags: ["AI"],
        summary: "Generate images",
        description: "Generate images using AI image models",
      },
    },
  )

  .get(
    "/models",
    async ({ request: { headers } }) => {
      await getSession(headers);

      const models = await aiService.listModels();

      return successResponse(models);
    },
    {
      detail: {
        tags: ["AI"],
        summary: "List available models",
        description: "Get list of available AI models from OpenRouter",
      },
    },
  )

  .get(
    "/models/image",
    async ({ request: { headers } }) => {
      await getSession(headers);

      const models = await aiService.getImageGenerationModels();

      return successResponse(models);
    },
    {
      detail: {
        tags: ["AI"],
        summary: "List image generation models",
        description:
          "Get list of AI models that support image generation (have 'image' in output_modalities)",
      },
    },
  )

  // AI Management - Standardized interface
  .post(
    "/process",
    async ({ request: { headers }, body }) => {
      await getSession(headers);

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
    },
    {
      body: t.Object({
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
      }),
      detail: {
        tags: ["AI"],
        summary: "Process AI request (standardized)",
        description:
          "Process an AI request with standardized parameters and return a standardized response. Requires userPrompt, aiModelName, and aiProvider.",
      },
    },
  );
