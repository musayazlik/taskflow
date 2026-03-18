/**
 * AI Service
 * Unified service for all AI operations including chat, content generation, image generation, and management
 */

import { env } from "@api/lib/env";
import { AppError, ValidationError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";
import {
	OPENROUTER_API,
	OPENROUTER_IMAGE_MODEL_PATTERNS,
	CONTENT_TYPE_LABELS,
	IMAGE_STYLE_PROMPTS,
	IMAGE_ASPECT_RATIO_MAP,
} from "@api/constants";
import { OpenRouterClient } from "@api/lib/ai-client/openrouter-client";
import { getSystemPrompt } from "@api/lib/system-prompts";
import * as mediaService from "./media.service";
import type {
	AIProvider,
	ChatMessage,
	ChatCompletionParams,
	ChatCompletionResponse,
	SEOGenerationParams,
	SEOResult,
	ContentGenerationParams,
	ContentResult,
	ImageGenerationParams,
	GeneratedImage,
	AIManagementRequest,
	TokenUsage,
	AIManagementResponse,
} from "@repo/types";

// ============================================
// Chat Completion
// ============================================

/**
 * Send a chat completion request to OpenRouter
 */
export const chatCompletion = async (
	params: ChatCompletionParams,
): Promise<ChatCompletionResponse> => {
	if (!env.OPENROUTER_API_KEY) {
		throw new AppError(
			"OPENROUTER_NOT_CONFIGURED",
			"OpenRouter API key is not configured",
			500,
		);
	}

	try {
		// Process messages - support both string and multimodal content
		const processedMessages = params.messages.map((msg) => {
			// If content is already an array (multimodal), use it directly
			if (Array.isArray(msg.content)) {
				return {
					role: msg.role,
					content: msg.content,
				};
			}
			// If content is string, wrap it in text content object for multimodal support
			// or keep as string for backward compatibility
			return {
				role: msg.role,
				content: msg.content,
			};
		});

		const response = await fetch(
			`${OPENROUTER_API.BASE_URL}${OPENROUTER_API.CHAT_COMPLETIONS}`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
					"Content-Type": "application/json",
					"HTTP-Referer": env.FRONTEND_URL || "http://localhost:4100",
					"X-Title": "TurboStack",
				},
				body: JSON.stringify({
					model: params.model,
					messages: processedMessages,
					temperature: params.temperature ?? 0.7,
					max_tokens: params.maxTokens ?? 2048,
				}),
			},
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				(errorData as any)?.error?.message || `HTTP ${response.status}`,
			);
		}

		const data = await response.json();

		const choice = data.choices?.[0];
		if (!choice || !choice.message) {
			throw new AppError("OPENROUTER_ERROR", "No response from AI model", 500);
		}

		return {
			id: data.id,
			model: data.model,
			content: choice.message.content || "",
			finishReason: choice.finish_reason || "stop",
			usage: {
				promptTokens: data.usage?.prompt_tokens || 0,
				completionTokens: data.usage?.completion_tokens || 0,
				totalTokens: data.usage?.total_tokens || 0,
			},
		};
	} catch (error) {
		logger.error({ err: error }, "OpenRouter chat error");
		if (error instanceof AppError) throw error;
		throw new AppError(
			"OPENROUTER_ERROR",
			error instanceof Error ? error.message : "Failed to get AI response",
			500,
		);
	}
};

// ============================================
// SEO Generation
// ============================================

/**
 * Generate SEO content (title, description, keywords)
 */
export const generateSEO = async (
	params: SEOGenerationParams,
): Promise<SEOResult> => {
	const systemPrompt = `You are an expert SEO specialist. Generate optimized SEO content in ${params.language}. 
Your response must be in valid JSON format with no additional text.
Use a ${params.tone} tone.`;

	const userPrompt = `Generate SEO-optimized content for the following topic:
Topic: ${params.topic}
${params.targetKeyword ? `Target Keyword: ${params.targetKeyword}` : ""}

Return a JSON object with exactly these fields:
{
  "title": "SEO-optimized title (max 60 characters)",
  "description": "Meta description (max 160 characters)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "ogTitle": "Open Graph title for social sharing",
  "ogDescription": "Open Graph description for social sharing"
}

Only return the JSON object, no other text.`;

	const response = await chatCompletion({
		model: params.model,
		messages: [
			{ role: "system", content: systemPrompt },
			{ role: "user", content: userPrompt },
		],
		temperature: params.creativity,
	});

	try {
		const jsonMatch = response.content.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			throw new Error("No JSON found in response");
		}
		const result = JSON.parse(jsonMatch[0]) as SEOResult;
		return result;
	} catch (parseError) {
		logger.error({ err: parseError, content: response.content }, "Failed to parse SEO response");
		return {
			title: `${params.topic} - Complete Guide`,
			description: `Discover everything about ${params.topic}. Expert tips and best practices.`,
			keywords: [params.targetKeyword || params.topic.toLowerCase()],
			ogTitle: params.topic,
			ogDescription: `Learn about ${params.topic}`,
		};
	}
};

// ============================================
// Content Generation
// ============================================

/**
 * Generate content (blog post, article, etc.)
 */
export const generateContent = async (
	params: ContentGenerationParams,
): Promise<ContentResult> => {
	const contentType = CONTENT_TYPE_LABELS[params.contentType] || "content";

	const systemPrompt = `You are a professional content writer. Write a ${contentType} in ${params.language}.
Use a ${params.tone} tone. Target approximately ${params.targetLength} words.
Write in markdown format.`;

	const userPrompt = `Write a ${contentType} about: ${params.topic}
${params.keywords ? `Include these keywords naturally: ${params.keywords}` : ""}

First provide an outline with main sections, then write the full content in markdown format.
Make sure the content is well-structured, engaging, and informative.`;

	const response = await chatCompletion({
		model: params.model,
		messages: [
			{ role: "system", content: systemPrompt },
			{ role: "user", content: userPrompt },
		],
		temperature: params.creativity,
		maxTokens: Math.max(2048, params.targetLength * 2),
	});

	const content = response.content;
	const wordCount = content.split(/\s+/).length;

	const outlineMatches = content.match(/^#{1,3}\s+(.+)$/gm) || [];
	const outline = outlineMatches.map((match) =>
		match.replace(/^#{1,3}\s+/, ""),
	);

	const titleMatch = content.match(/^#\s+(.+)$/m);
	const title: string = titleMatch?.[1] ?? `${params.topic} - A Complete Guide`;

	const slug = title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");

	const filteredOutline: string[] = outline.filter(
		(item): item is string => typeof item === "string",
	);

	return {
		title,
		slug,
		content,
		outline: filteredOutline.length > 0 ? filteredOutline : [title],
		wordCount,
	};
};

// ============================================
// Image Generation
// ============================================

/**
 * Check if a model likely supports image generation
 */
export const checkModelSupportsImageGeneration = (modelId: string): boolean => {
	const lowerModelId = modelId.toLowerCase();
	return OPENROUTER_IMAGE_MODEL_PATTERNS.some((pattern) =>
		lowerModelId.includes(pattern),
	);
};

/**
 * Check model info from OpenRouter API for image support
 */
export const checkModelImageSupportFromAPI = async (
	modelId: string,
): Promise<{ supported: boolean; hasOutputModalities: boolean }> => {
	try {
		const models = await listModels();
		const model = models.find((m: any) => m.id === modelId);

		if (!model) {
			return { supported: false, hasOutputModalities: false };
		}

		const outputModalities = model.output_modalities || [];
		const hasOutputModalities = outputModalities.length > 0;
		const supported = outputModalities.includes("image");

		return { supported, hasOutputModalities };
	} catch {
		return { supported: false, hasOutputModalities: false };
	}
};

/**
 * Get list of models that support image generation
 */
export const getImageGenerationModels = async () => {
	const models = await listModels();
	return models.filter((model: any) => {
		const outputModalities = model.output_modalities || [];
		if (outputModalities.includes("image")) {
			return true;
		}
		if (checkModelSupportsImageGeneration(model.id)) {
			return true;
		}
		return false;
	});
};

/**
 * Generate images using AI image models via OpenRouter
 */
export const generateImages = async (
	params: ImageGenerationParams,
	userId: string,
): Promise<GeneratedImage[]> => {
	if (!env.OPENROUTER_API_KEY) {
		throw new AppError(
			"OPENROUTER_NOT_CONFIGURED",
			"OpenRouter API key is not configured",
			500,
		);
	}

	const likelySupportsImage = checkModelSupportsImageGeneration(params.model);
	const apiCheck = await checkModelImageSupportFromAPI(params.model);

	if (!likelySupportsImage && !apiCheck.supported) {
		logger.warn(
			{
				model: params.model,
				likelySupportsImage,
				apiCheck,
			},
			"Model may not support image generation",
		);
	}

	const styleAddition = IMAGE_STYLE_PROMPTS[params.style] || "";
	let enhancedPrompt = `${params.prompt}. ${styleAddition}`.trim();

	if (params.negativePrompt) {
		enhancedPrompt += ` Avoid: ${params.negativePrompt}`;
	}

	const generatedImages: GeneratedImage[] = [];

	try {
		let requestCount = 0;
		const maxRequests = params.count;

		while (
			generatedImages.length < params.count &&
			requestCount < maxRequests
		) {
			requestCount++;

			const messages: any[] = [
				{
					role: "user",
					content: params.baseImageUrl
						? [
								{
									type: "text",
									text: enhancedPrompt,
								},
								{
									type: "image_url",
									image_url: {
										url: params.baseImageUrl,
									},
								},
							]
						: enhancedPrompt,
				},
			];

			const response = await fetch(
				`${OPENROUTER_API.BASE_URL}${OPENROUTER_API.CHAT_COMPLETIONS}`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
						"Content-Type": "application/json",
						"HTTP-Referer": env.FRONTEND_URL || "http://localhost:4100",
						"X-Title": "TurboStack",
					},
					body: JSON.stringify({
						model: params.model,
						messages,
						modalities: ["text", "image"],
						...(IMAGE_ASPECT_RATIO_MAP[params.aspectRatio] && {
							image_config: {
								aspect_ratio: IMAGE_ASPECT_RATIO_MAP[params.aspectRatio],
							},
						}),
					}),
				},
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				logger.error({ err: errorData }, "OpenRouter image error");
				throw new Error(
					(errorData as any)?.error?.message || `HTTP ${response.status}`,
				);
			}

			const data = await response.json();
			const choice = data.choices?.[0];

			if (choice?.message) {
				const images = choice.message.images || [];

				for (const imageData of images) {
					let imageUrl = "";

					if (imageData.type === "image_url" && imageData.image_url?.url) {
						const dataUrl = imageData.image_url.url;

						if (dataUrl.startsWith("data:image/")) {
							try {
								const base64Match = dataUrl.match(
									/^data:image\/\w+;base64,(.+)$/,
								);
								if (base64Match) {
									const base64Data = base64Match[1];
									const buffer = Buffer.from(base64Data, "base64");
									const file = new File(
										[buffer],
										`ai-generated-${Date.now()}-${requestCount}.png`,
										{ type: "image/png" },
									);

									const uploadResult = await mediaService.uploadFile(
										{ file },
										userId,
									);
									imageUrl = uploadResult.url;
								}
							} catch (uploadError) {
								logger.error({ err: uploadError }, "Upload to UploadThing failed");
								imageUrl = dataUrl;
							}
						} else {
							try {
								const imageResponse = await fetch(dataUrl);
								const imageBlob = await imageResponse.blob();
								const buffer = Buffer.from(await imageBlob.arrayBuffer());
								const file = new File(
									[buffer],
									`ai-generated-${Date.now()}-${requestCount}.png`,
									{ type: "image/png" },
								);

								const uploadResult = await mediaService.uploadFile(
									{ file },
									"system",
								);
								imageUrl = uploadResult.url;
							} catch (uploadError) {
								logger.error({ err: uploadError }, "Upload to UploadThing failed");
								imageUrl = dataUrl;
							}
						}
					}

					if (imageUrl && generatedImages.length < params.count) {
						generatedImages.push({
							id: crypto.randomUUID(),
							url: imageUrl,
							prompt: params.prompt,
							timestamp: new Date(),
						});
					}
				}

				if (
					generatedImages.length === 0 &&
					Array.isArray(choice.message.content)
				) {
					for (const content of choice.message.content) {
						if (content.type === "image_url" && content.image_url?.url) {
							const dataUrl = content.image_url.url;
							let imageUrl = "";

							if (dataUrl.startsWith("data:image/")) {
								try {
									const base64Match = dataUrl.match(
										/^data:image\/\w+;base64,(.+)$/,
									);
									if (base64Match) {
										const base64Data = base64Match[1];
										const buffer = Buffer.from(base64Data, "base64");
										const file = new File(
											[buffer],
											`ai-generated-${Date.now()}-${generatedImages.length}.png`,
											{ type: "image/png" },
										);

										const uploadResult = await mediaService.uploadFile(
											{ file },
											"system",
										);
										imageUrl = uploadResult.url;
									}
								} catch (uploadError) {
									logger.error({ err: uploadError }, "Upload failed");
									imageUrl = dataUrl;
								}
							} else {
								try {
									const imageResponse = await fetch(dataUrl);
									const imageBlob = await imageResponse.blob();
									const buffer = Buffer.from(await imageBlob.arrayBuffer());
									const file = new File(
										[buffer],
										`ai-generated-${Date.now()}-${generatedImages.length}.png`,
										{ type: "image/png" },
									);

									const uploadResult = await mediaService.uploadFile(
										{ file },
										userId,
									);
									imageUrl = uploadResult.url;
								} catch {
									imageUrl = dataUrl;
								}
							}

							if (imageUrl && generatedImages.length < params.count) {
								generatedImages.push({
									id: crypto.randomUUID(),
									url: imageUrl,
									prompt: params.prompt,
									timestamp: new Date(),
								});
							}
						}
					}
				}
			}

			if (generatedImages.length >= params.count) {
				break;
			}
		}

		if (generatedImages.length === 0) {
			throw new AppError(
				"IMAGE_GENERATION_FAILED",
				"No images were generated. The model may have returned text only. Please try a different prompt or model.",
				500,
			);
		}

		return generatedImages;
	} catch (error) {
		logger.error({ err: error }, "Image generation error");
		if (error instanceof AppError) throw error;
		throw new AppError(
			"IMAGE_GENERATION_ERROR",
			error instanceof Error ? error.message : "Failed to generate images",
			500,
		);
	}
};

// ============================================
// Model Management
// ============================================

/**
 * List available models from OpenRouter
 */
export const listModels = async () => {
	if (!env.OPENROUTER_API_KEY) {
		throw new AppError(
			"OPENROUTER_NOT_CONFIGURED",
			"OpenRouter API key is not configured",
			500,
		);
	}

	try {
		const response = await fetch(
			`${OPENROUTER_API.BASE_URL}${OPENROUTER_API.MODELS}`,
			{
				headers: {
					Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch models: ${response.statusText}`);
		}

		const data = await response.json();
		return data.data || [];
	} catch (error) {
		logger.error({ err: error }, "List models error");
		throw new AppError("OPENROUTER_ERROR", "Failed to list models", 500);
	}
};

// ============================================
// AI Management (Standardized Interface)
// ============================================

/**
 * AI Management Service Class
 */
class AIManagementService {
	private clients: Map<AIProvider, OpenRouterClient>;

	constructor() {
		this.clients = new Map();
	}

	private getClient(provider: AIProvider): OpenRouterClient {
		if (!this.clients.has(provider)) {
			if (provider !== "openrouter") {
				throw new AppError(
					"UNSUPPORTED_PROVIDER",
					`Provider '${provider}' is not yet supported. Currently only 'openrouter' is supported.`,
					400,
				);
			}
			this.clients.set(provider, new OpenRouterClient());
		}
		return this.clients.get(provider)!;
	}

	private validateRequest(params: AIManagementRequest): void {
		const errors: string[] = [];

		if (!params.userPrompt || typeof params.userPrompt !== "string") {
			errors.push("userPrompt is required and must be a non-empty string");
		} else if (params.userPrompt.trim().length === 0) {
			errors.push("userPrompt cannot be empty");
		}

		if (!params.aiModelName || typeof params.aiModelName !== "string") {
			errors.push("aiModelName is required and must be a non-empty string");
		} else if (params.aiModelName.trim().length === 0) {
			errors.push("aiModelName cannot be empty");
		}

		const validProviders: AIProvider[] = [
			"openrouter",
			"openai",
			"anthropic",
			"google",
		];
		if (!params.aiProvider || !validProviders.includes(params.aiProvider)) {
			errors.push(
				`aiProvider must be one of: ${validProviders.join(", ")}`,
			);
		}

		if (
			params.temperature !== undefined &&
			(typeof params.temperature !== "number" ||
				params.temperature < 0 ||
				params.temperature > 2)
		) {
			errors.push("temperature must be a number between 0 and 2");
		}

		if (
			params.maxTokens !== undefined &&
			(typeof params.maxTokens !== "number" ||
				params.maxTokens < 1 ||
				params.maxTokens > 128000)
		) {
			errors.push("maxTokens must be a number between 1 and 128000");
		}

		if (errors.length > 0) {
			throw new ValidationError(`Validation failed: ${errors.join("; ")}`, {
				errors,
			});
		}
	}

	private buildSystemPrompt(params: AIManagementRequest): string | undefined {
		if (params.customSystemPrompt) {
			return params.customSystemPrompt;
		}

		if (params.systemPromptCategory) {
			return getSystemPrompt(
				params.systemPromptCategory,
				params.systemPromptType || "GENERAL",
			);
		}

		return undefined;
	}

	async processRequest(
		params: AIManagementRequest,
	): Promise<AIManagementResponse> {
		const startTime = Date.now();

		try {
			this.validateRequest(params);

			logger.info(
				{
					provider: params.aiProvider,
					model: params.aiModelName,
					userPromptLength: params.userPrompt.length,
					systemPromptCategory: params.systemPromptCategory,
				},
				"Processing AI management request",
			);

			const client = this.getClient(params.aiProvider);
			const systemPrompt = this.buildSystemPrompt(params);

			const messages: Array<{
				role: "user" | "assistant" | "system";
				content: string;
			}> = [];

			if (systemPrompt) {
				messages.push({
					role: "system",
					content: systemPrompt,
				});
			}

			messages.push({
				role: "user",
				content: params.userPrompt,
			});

			const requestParams: {
				model: string;
				messages: typeof messages;
				temperature?: number;
				max_tokens?: number;
				[key: string]: unknown;
			} = {
				model: params.aiModelName,
				messages,
				temperature: params.temperature ?? 0.7,
				max_tokens: params.maxTokens ?? 2048,
			};

			if (params.additionalParams) {
				Object.assign(requestParams, params.additionalParams);
			}

			const response = await client.chatCompletion(requestParams);

			const choice = response.choices?.[0];
			if (!choice || !choice.message) {
				throw new AppError(
					"AI_RESPONSE_ERROR",
					"No valid response from AI model",
					500,
				);
			}

			const content = choice.message.content || "";
			const finishReason = choice.finish_reason || "stop";

			const usage: TokenUsage | undefined = response.usage
				? {
						promptTokens: response.usage.prompt_tokens || 0,
						completionTokens: response.usage.completion_tokens || 0,
						totalTokens: response.usage.total_tokens || 0,
					}
				: undefined;

			const duration = Date.now() - startTime;

			logger.info(
				{
					provider: params.aiProvider,
					model: response.model,
					contentLength: content.length,
					usage,
					finishReason,
					duration,
				},
				"AI management request completed successfully",
			);

			return {
				success: true,
				content,
				model: response.model,
				provider: params.aiProvider,
				usage,
				finishReason,
				responseId: response.id,
				timestamp: new Date(),
			};
		} catch (error) {
			const duration = Date.now() - startTime;

			logger.error(
				{
					error,
					provider: params.aiProvider,
					model: params.aiModelName,
					duration,
				},
				"AI management request failed",
			);

			if (error instanceof ValidationError) {
				return {
					success: false,
					model: params.aiModelName,
					provider: params.aiProvider,
					errorCode: error.code,
					errorMessage: error.message,
					errorDetails: error.details,
					timestamp: new Date(),
				};
			}

			if (error instanceof AppError) {
				return {
					success: false,
					model: params.aiModelName,
					provider: params.aiProvider,
					errorCode: error.code,
					errorMessage: error.message,
					errorDetails: error.details,
					timestamp: new Date(),
				};
			}

			return {
				success: false,
				model: params.aiModelName,
				provider: params.aiProvider,
				errorCode: "UNKNOWN_ERROR",
				errorMessage:
					error instanceof Error ? error.message : "An unknown error occurred",
				errorDetails: { originalError: String(error) },
				timestamp: new Date(),
			};
		}
	}
}

// Export singleton instance
export const aiManagementService = new AIManagementService();

// Export convenience function
export async function processAIRequest(
	params: AIManagementRequest,
): Promise<AIManagementResponse> {
	return aiManagementService.processRequest(params);
}
