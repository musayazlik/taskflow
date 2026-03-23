/**
 * @fileoverview Category-based LLM system prompts and {@link getSystemPrompt}.
 * @module @api/lib/system-prompts
 */

export * from "./text-generation";
export * from "./image-generation";
export * from "./seo-optimization";
export * from "./code-generation";

export { SystemPromptCategory } from "@repo/types";
import { SystemPromptCategory } from "@repo/types";

/**
 * Resolves the system prompt string for a `SystemPromptCategory` and optional prompt key.
 *
 * @param category - Which prompt family to load (text, image, SEO, code).
 * @param type - Key inside that family’s prompt map; defaults to **`"GENERAL"`** when missing or unknown.
 * @returns The prompt text to send as the system message in chat completions.
 * @throws If `category` is not handled (should not happen for valid enum values).
 *
 * @remarks Uses `require()` internally to load category modules — avoid calling from hot paths
 * if startup-time loading becomes necessary.
 */
export function getSystemPrompt(
  category: SystemPromptCategory,
  type: string = "GENERAL",
): string {
  switch (category) {
    case SystemPromptCategory.TEXT_GENERATION: {
      const prompts = require("./text-generation").TEXT_GENERATION_PROMPTS;
      return prompts[type as keyof typeof prompts] || prompts.GENERAL;
    }
    case SystemPromptCategory.IMAGE_GENERATION: {
      const prompts = require("./image-generation").IMAGE_GENERATION_PROMPTS;
      return prompts[type as keyof typeof prompts] || prompts.GENERAL;
    }
    case SystemPromptCategory.SEO_OPTIMIZATION: {
      const prompts = require("./seo-optimization").SEO_OPTIMIZATION_PROMPTS;
      return prompts[type as keyof typeof prompts] || prompts.GENERAL;
    }
    case SystemPromptCategory.CODE_GENERATION: {
      const prompts = require("./code-generation").CODE_GENERATION_PROMPTS;
      return prompts[type as keyof typeof prompts] || prompts.GENERAL;
    }
    default:
      throw new Error(`Invalid system prompt category: ${category}`);
  }
}
