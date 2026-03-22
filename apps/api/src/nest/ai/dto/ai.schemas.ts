import { Type as t } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

export const chatSchema = t.Object({
  model: t.String(),
  messages: t.Array(
    t.Object({
      role: t.Union([
        t.Literal("user"),
        t.Literal("assistant"),
        t.Literal("system"),
      ]),
      // content can be string or array, validated/normalized in controller
      content: t.Any(),
    }),
  ),
  temperature: t.Optional(t.Number({ minimum: 0, maximum: 2 })),
  maxTokens: t.Optional(t.Number({ minimum: 1, maximum: 128000 })),
});

export type ChatRequest = Static<typeof chatSchema>;

export const seoSchema = t.Object({
  model: t.String(),
  topic: t.String({ minLength: 1 }),
  targetKeyword: t.Optional(t.String()),
  tone: t.String({ default: "professional" }),
  language: t.String({ default: "en" }),
  creativity: t.Number({ minimum: 0, maximum: 1, default: 0.7 }),
});

export type SeoRequest = Static<typeof seoSchema>;

export const contentSchema = t.Object({
  model: t.String(),
  topic: t.String({ minLength: 1 }),
  keywords: t.Optional(t.String()),
  contentType: t.String({ default: "blog" }),
  tone: t.String({ default: "professional" }),
  language: t.String({ default: "en" }),
  targetLength: t.Number({ minimum: 100, maximum: 5000, default: 500 }),
  creativity: t.Number({ minimum: 0, maximum: 1, default: 0.7 }),
});

export type ContentRequest = Static<typeof contentSchema>;

export const imageSchema = t.Object({
  model: t.String(),
  prompt: t.String({ minLength: 1 }),
  negativePrompt: t.Optional(t.String()),
  aspectRatio: t.String({ default: "1:1" }),
  style: t.String({ default: "realistic" }),
  quality: t.Number({ minimum: 50, maximum: 100, default: 80 }),
  count: t.Number({ minimum: 1, maximum: 4, default: 1 }),
  baseImageUrl: t.Optional(t.String()),
});

export type ImageRequest = Static<typeof imageSchema>;

export const processSchema = t.Object({
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

export type ProcessRequest = Static<typeof processSchema>;
