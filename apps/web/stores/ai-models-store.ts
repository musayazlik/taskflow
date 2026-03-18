import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useMemo } from "react";

// OpenRouter model types (aligned with public API)
export type OpenRouterModality =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "file"
  | "embeddings"
  | string;

export interface OpenRouterArchitecture {
  modality?: string | null;
  input_modalities?: OpenRouterModality[];
  output_modalities?: OpenRouterModality[];
  tokenizer: string;
  instruct_type?: string | null;
}

export interface OpenRouterPricing {
  prompt: string;
  completion: string;
  request?: string;
  image?: string;
  audio?: string;
  input_cache_read?: string;
  input_cache_write?: string;
  web_search?: string;
  internal_reasoning?: string;
}

export interface OpenRouterTopProvider {
  is_moderated: boolean;
  context_length?: number;
  max_completion_tokens?: number;
}

export interface OpenRouterModel {
  id: string;
  canonical_slug?: string;
  hugging_face_id?: string;
  name: string;
  created?: number;
  description?: string;
  context_length: number;
  architecture?: OpenRouterArchitecture;
  pricing: OpenRouterPricing;
  top_provider?: OpenRouterTopProvider;
  per_request_limits?: unknown | null;
  supported_parameters?: string[];
  default_parameters?: Record<string, unknown> | null;
  expiration_date?: string | null;
}

// Saved AI Model (user's selection)
export interface AIModel {
  id: string;
  modelId: string;
  name: string;
  description: string;
  contextLength: number;
  promptPrice: string;
  completionPrice: string;
  provider: string;
  isActive: boolean;
  // Whether this model supports image output (optional for backwards compatibility)
  supportsImageOutput?: boolean;
  // Input and output modalities
  inputModalities: string[];
  outputModalities: string[];
  createdAt: string;
  updatedAt: string;
}

interface AIModelsState {
  // Saved models (user's selections)
  models: AIModel[];

  // Available models from OpenRouter
  availableModels: OpenRouterModel[];
  isLoadingAvailable: boolean;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  setModels: (models: AIModel[]) => void;
  addModel: (model: Omit<AIModel, "id" | "createdAt" | "updatedAt">) => void;
  updateModel: (id: string, data: Partial<AIModel>) => void;
  deleteModel: (id: string) => void;
  toggleModelActive: (id: string) => void;

  // OpenRouter Actions
  fetchAvailableModels: () => Promise<void>;
  setAvailableModels: (models: OpenRouterModel[]) => void;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAIModelsStore = create<AIModelsState>()(
  persist(
    (set) => ({
      // Initial state
      models: [],
      availableModels: [],
      isLoadingAvailable: false,
      isLoading: false,
      error: null,

      // Setters
      setModels: (models) => set({ models }),

      addModel: (modelData) => {
        const now = new Date().toISOString();
        const newModel: AIModel = {
          ...modelData,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          models: [...state.models, newModel],
          error: null,
        }));
      },

      updateModel: (id, data) => {
        set((state) => ({
          models: state.models.map((model) =>
            model.id === id
              ? { ...model, ...data, updatedAt: new Date().toISOString() }
              : model,
          ),
          error: null,
        }));
      },

      deleteModel: (id) => {
        set((state) => ({
          models: state.models.filter((model) => model.id !== id),
          error: null,
        }));
      },

      toggleModelActive: (id) => {
        set((state) => ({
          models: state.models.map((model) =>
            model.id === id
              ? {
                  ...model,
                  isActive: !model.isActive,
                  updatedAt: new Date().toISOString(),
                }
              : model,
          ),
        }));
      },

      // Fetch available models from OpenRouter
      fetchAvailableModels: async () => {
        set({ isLoadingAvailable: true, error: null });

        try {
          const response = await fetch("https://openrouter.ai/api/v1/models", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.statusText}`);
          }

          const data = await response.json();

          if (data.data && Array.isArray(data.data)) {
            set({ availableModels: data.data, isLoadingAvailable: false });
          } else {
            throw new Error("Invalid response format from OpenRouter");
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch models";
          set({ error: errorMessage, isLoadingAvailable: false });
        }
      },

      setAvailableModels: (models) => set({ availableModels: models }),

      // Error handling
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "ai-models-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist user's saved models
      partialize: (state) => ({ models: state.models }),
    },
  ),
);

// Selector hooks for better performance
export const useAIModels = () => useAIModelsStore((state) => state.models);
export const useAvailableModels = () =>
  useAIModelsStore((state) => state.availableModels);

// Use useMemo to cache the filtered result and avoid infinite loops
export const useActiveModels = () => {
  const models = useAIModelsStore((state) => state.models);
  return useMemo(() => models.filter((m) => m.isActive), [models]);
};

// Helper to extract provider from model ID (e.g., "openai/gpt-4" -> "openai")
export const getProviderFromModelId = (modelId: string): string => {
  const parts = modelId.split("/");
  return parts[0] || "unknown";
};

// Helper to format price (OpenRouter returns price per token as string)
export const formatPrice = (price: string): string => {
  const numPrice = parseFloat(price);
  if (numPrice === 0) return "Free";
  if (numPrice < 0.000001)
    return `$${(numPrice * 1000000).toFixed(4)}/M tokens`;
  return `$${(numPrice * 1000000).toFixed(2)}/M tokens`;
};
