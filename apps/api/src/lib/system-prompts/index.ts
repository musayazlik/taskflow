/**
 * System Prompts Module
 * 
 * Centralized system prompts organized by category.
 * Each category contains specialized prompts for different use cases.
 * 
 * @module system-prompts
 */

export * from "./text-generation";
export * from "./image-generation";
export * from "./seo-optimization";
export * from "./code-generation";

// Re-export SystemPromptCategory from types package
export { SystemPromptCategory } from "@repo/types";
import { SystemPromptCategory } from "@repo/types";

/**
 * Get system prompt by category and type
 * 
 * @param category - The prompt category
 * @param type - The specific prompt type within the category
 * @returns The system prompt string
 * @throws Error if category or type is invalid
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
