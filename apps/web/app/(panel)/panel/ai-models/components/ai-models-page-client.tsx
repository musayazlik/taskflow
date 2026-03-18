"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Bot,
  RefreshCw,
  Brain,
  Sparkles,
  Zap,
  MessageSquare,
  ImageIcon,
  Check,
  X,
  Power,
  PowerOff,
  Layers,
  AudioLines,
  Video,
  FileText,
} from "lucide-react";
import { Button } from "@repo/shadcn-ui/button";
import { Input } from "@repo/shadcn-ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/shadcn-ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/shadcn-ui/select";
import { Label } from "@repo/shadcn-ui/label";
import { Badge } from "@repo/shadcn-ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/shadcn-ui/alert-dialog";
import { Textarea } from "@repo/shadcn-ui/textarea";
import { ScrollArea } from "@repo/shadcn-ui/scroll-area";
import { Card, CardContent } from "@repo/shadcn-ui/card";
import { Switch } from "@repo/shadcn-ui/switch";
import { PageHeader } from "@/components/panel/page-header";
import { StatsGrid } from "@/components/stats";
import {
  useAIModelsStore,
  type AIModel,
  type OpenRouterModel,
  type OpenRouterModality,
  getProviderFromModelId,
  formatPrice,
} from "@/stores/ai-models-store";
import {
  DataTable,
  type Column,
  type DataTableAction,
  type BulkAction,
} from "@/components/data-table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { AiModelFrontend } from "@repo/types";

interface ModelFormData {
  modelId: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface AIModelsPageClientProps {
  initialModels: AiModelFrontend[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialTotalPages: number;
}

// Provider badge colors
const providerColors: Record<string, string> = {
  openai:
    "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  anthropic:
    "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30",
  google:
    "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
  meta: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30",
  mistral:
    "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30",
  cohere:
    "bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-500/30",
  default:
    "bg-gray-100 dark:bg-zinc-700/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-600",
};

// Provider Badge Component
function ProviderBadge({ provider }: { provider: string }) {
  const colorClass =
    providerColors[provider.toLowerCase()] || providerColors.default;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border capitalize",
        colorClass,
      )}
    >
      <Zap className="h-3 w-3" />
      {provider}
    </span>
  );
}

// Modality Badge Component - Supports 5 standard modalities
const MODALITY_CONFIG: Record<
  string,
  { icon: React.ReactNode; label: string; className: string }
> = {
  text: {
    icon: <MessageSquare className="h-3 w-3" />,
    label: "Text",
    className:
      "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-500/30",
  },
  image: {
    icon: <ImageIcon className="h-3 w-3" />,
    label: "Image",
    className:
      "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30",
  },
  audio: {
    icon: <AudioLines className="h-3 w-3" />,
    label: "Audio",
    className:
      "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
  },
  video: {
    icon: <Video className="h-3 w-3" />,
    label: "Video",
    className:
      "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30",
  },
  file: {
    icon: <FileText className="h-3 w-3" />,
    label: "File",
    className:
      "bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/30",
  },
};

function ModalityBadge({ modality }: { modality?: string }) {
  if (!modality) return null;

  // Parse comma-separated modalities (e.g., "text,image,audio")
  const modalities = modality
    .toLowerCase()
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  if (modalities.length === 0) return null;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {modalities.map((mod) => {
        const config = MODALITY_CONFIG[mod];
        if (!config) return null;

        return (
          <span
            key={mod}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border",
              config.className,
            )}
          >
            {config.icon}
            {config.label}
          </span>
        );
      })}
    </div>
  );
}

function ModalityPills({
  label,
  values,
}: {
  label: string;
  values?: OpenRouterModality[];
}) {
  if (!values || values.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-[11px] font-medium text-muted-foreground">
        {label}:
      </span>
      {values.map((value) => (
        <span
          key={`${label}-${value}`}
          className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:bg-zinc-800 dark:text-gray-200 capitalize"
        >
          {value}
        </span>
      ))}
    </div>
  );
}

// Helper to detect models that can output images (based on OpenRouter architecture)
function isImageOutputModel(model: OpenRouterModel): boolean {
  const outputs =
    model.architecture?.output_modalities?.map((m) => m.toLowerCase()) ?? [];

  if (outputs.includes("image")) return true;

  // Fallback to legacy modality / naming heuristics
  const modality = model.architecture?.modality?.toLowerCase() ?? "";
  const id = model.id.toLowerCase();
  const name = model.name.toLowerCase();

  if (modality.includes("image")) return true;
  if (id.includes("image") || id.includes("vision")) return true;
  if (name.includes("image") || name.includes("vision")) return true;

  return false;
}

// Status Badge Component
function StatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
        <Power className="h-3 w-3" />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-700/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-600">
      <PowerOff className="h-3 w-3" />
      Inactive
    </span>
  );
}

export function AIModelsPageClient({
  initialModels,
  initialTotal,
  initialPage,
  initialPageSize,
  initialTotalPages,
}: AIModelsPageClientProps) {
  // Zustand store
  const {
    models,
    availableModels,
    isLoadingAvailable,
    error,
    addModel,
    updateModel,
    deleteModel,
    toggleModelActive,
    fetchAvailableModels,
    clearError,
  } = useAIModelsStore();

  // Initialize store with server data
  useEffect(() => {
    if (initialModels.length > 0 && models.length === 0) {
      // Store will be initialized by the store itself
      // We just ensure we have the initial data available
    }
  }, [initialModels, models.length]);

  // Local UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [modelSearchTerm, setModelSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [selectedOpenRouterModel, setSelectedOpenRouterModel] =
    useState<OpenRouterModel | null>(null);
  const [formData, setFormData] = useState<ModelFormData>({
    modelId: "",
    name: "",
    description: "",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [inputModalityFilter, setInputModalityFilter] = useState<
    OpenRouterModality | "all"
  >("all");
  const [outputModalityFilter, setOutputModalityFilter] = useState<
    OpenRouterModality | "all"
  >("all");
  const [selectedRows, setSelectedRows] = useState<AIModel[]>([]);

  // Fetch available models on mount
  useEffect(() => {
    if (availableModels.length === 0) {
      fetchAvailableModels();
    }
  }, [availableModels.length, fetchAvailableModels]);

  // Get unique providers for filter
  const providers = useMemo(() => {
    const uniqueProviders = new Set<string>();
    availableModels.forEach((model) => {
      const provider = getProviderFromModelId(model.id);
      uniqueProviders.add(provider);
    });
    return Array.from(uniqueProviders).sort();
  }, [availableModels]);

  // Filter available models for selection
  const filteredAvailableModels = useMemo(() => {
    return availableModels.filter((model) => {
      const matchesSearch =
        model.id.toLowerCase().includes(modelSearchTerm.toLowerCase()) ||
        model.name.toLowerCase().includes(modelSearchTerm.toLowerCase());

      const matchesProvider =
        providerFilter === "all" ||
        getProviderFromModelId(model.id) === providerFilter;

      const inputs =
        model.architecture?.input_modalities?.map((m) => m.toLowerCase()) ?? [];
      const outputs =
        model.architecture?.output_modalities?.map((m) => m.toLowerCase()) ??
        [];

      const matchesInputModality =
        inputModalityFilter === "all" ||
        inputs.includes(inputModalityFilter.toLowerCase());

      const matchesOutputModality =
        outputModalityFilter === "all" ||
        outputs.includes(outputModalityFilter.toLowerCase());

      // Exclude already added models
      const isNotAdded = !models.some((m) => m.modelId === model.id);

      return (
        matchesSearch &&
        matchesProvider &&
        matchesInputModality &&
        matchesOutputModality &&
        isNotAdded
      );
    });
  }, [
    availableModels,
    modelSearchTerm,
    providerFilter,
    inputModalityFilter,
    outputModalityFilter,
    models,
  ]);

  // Filter saved models for display - use store models or fallback to initial
  // Convert AiModelFrontend[] to AIModel[] for consistent type handling
  const displayModels: AIModel[] = useMemo(() => {
    if (models.length > 0) {
      return models;
    }
    // Convert AiModelFrontend to AIModel format
    return initialModels.map((model) => ({
      id: model.id,
      modelId: model.modelId,
      name: model.name,
      description: model.description ?? "",
      contextLength: model.contextLength ?? 0,
      promptPrice: model.promptPrice ?? "0",
      completionPrice: model.completionPrice ?? "0",
      provider: model.provider,
      isActive: model.active,
      inputModalities: model.inputModalities ?? ["text"],
      outputModalities: model.outputModalities ?? ["text"],
      supportsImageOutput: model.supportsImageOutput ?? false,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    }));
  }, [models, initialModels]);

  const filteredModels = useMemo(() => {
    return displayModels.filter(
      (model) =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.modelId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [displayModels, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const activeModels = displayModels.filter((m) => m.isActive).length;
    const totalCost = displayModels.reduce(
      (acc, m) => acc + parseFloat(m.promptPrice),
      0,
    );
    const uniqueProviders = new Set(displayModels.map((m) => m.provider)).size;

    return {
      total: displayModels.length,
      active: activeModels,
      inactive: displayModels.length - activeModels,
      providers: uniqueProviders,
    };
  }, [displayModels]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.modelId) errors.modelId = "Please select a model";
    if (!formData.name.trim()) errors.name = "Name is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSelectModel = (model: OpenRouterModel) => {
    setSelectedOpenRouterModel(model);
    setFormData({
      modelId: model.id,
      name: model.name,
      description: model.description || "",
      isActive: true,
    });
    setFormErrors({});
  };

  const handleAdd = async () => {
    if (!validateForm() || !selectedOpenRouterModel) return;

    try {
      setIsSubmitting(true);

      const inputModalities = selectedOpenRouterModel.architecture
        ?.input_modalities ?? ["text"];
      const outputModalities = selectedOpenRouterModel.architecture
        ?.output_modalities ?? ["text"];

      addModel({
        modelId: formData.modelId,
        name: formData.name,
        description: formData.description,
        contextLength: selectedOpenRouterModel.context_length,
        promptPrice: selectedOpenRouterModel.pricing.prompt,
        completionPrice: selectedOpenRouterModel.pricing.completion,
        provider: getProviderFromModelId(selectedOpenRouterModel.id),
        isActive: formData.isActive,
        supportsImageOutput: isImageOutputModel(selectedOpenRouterModel),
        inputModalities,
        outputModalities,
      });

      toast.success(`${formData.name} model added successfully`);
      setIsAddDialogOpen(false);
      resetForm();
    } catch {
      setFormErrors({ submit: "Failed to add model" });
      toast.error("Failed to add model");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedModel || !validateForm()) return;

    try {
      setIsSubmitting(true);

      updateModel(selectedModel.id, {
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
      });

      toast.success("Model updated successfully");
      setIsEditDialogOpen(false);
      resetForm();
    } catch {
      setFormErrors({ submit: "Failed to update model" });
      toast.error("Failed to update model");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedModel) return;

    try {
      setIsSubmitting(true);
      deleteModel(selectedModel.id);
      toast.success(`${selectedModel.name} deleted successfully`);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete model:", error);
      toast.error("Failed to delete model");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = useCallback(
    (model: AIModel) => {
      toggleModelActive(model.id);
      toast.success(
        `${model.name} is now ${model.isActive ? "inactive" : "active"}`,
      );
    },
    [toggleModelActive],
  );

  const resetForm = () => {
    setFormData({
      modelId: "",
      name: "",
      description: "",
      isActive: true,
    });
    setSelectedOpenRouterModel(null);
    setModelSearchTerm("");
    setProviderFilter("all");
    setInputModalityFilter("all");
    setOutputModalityFilter("all");
    setFormErrors({});
  };

  const openEditDialog = useCallback((model: AIModel) => {
    setSelectedModel(model);
    setFormData({
      modelId: model.modelId,
      name: model.name,
      description: model.description,
      isActive: model.isActive,
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((model: AIModel) => {
    setSelectedModel(model);
    setIsDeleteDialogOpen(true);
  }, []);

  // DataTable Columns
  const columns: Column<AIModel>[] = useMemo(
    () => [
      {
        key: "model",
        header: "Model",
        cell: (model) => (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 ring-1 ring-primary/20">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {model.name}
              </p>
              <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                {model.modelId}
              </p>
            </div>
          </div>
        ),
        className: "min-w-[280px]",
        sortable: true,
      },
      {
        key: "provider",
        header: "Provider",
        cell: (model) => <ProviderBadge provider={model.provider} />,
        sortable: true,
      },
      {
        key: "input",
        header: "Input",
        cell: (model) => (
          <ModalityBadge
            modality={(model.inputModalities ?? ["text"]).join(",")}
          />
        ),
      },
      {
        key: "output",
        header: "Output",
        cell: (model) => (
          <ModalityBadge
            modality={(model.outputModalities ?? ["text"]).join(",")}
          />
        ),
      },
      {
        key: "context",
        header: "Context",
        cell: (model) => (
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {(model.contextLength / 1000).toFixed(0)}K
            </span>
          </div>
        ),
        sortable: true,
      },
      {
        key: "pricing",
        header: "Pricing",
        cell: (model) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                ↑ {formatPrice(model.promptPrice)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                ↓ {formatPrice(model.completionPrice)}
              </span>
            </div>
          </div>
        ),
      },
    ],
    [],
  );

  // DataTable Actions
  const actions: DataTableAction<AIModel>[] = useMemo(
    () => [
      {
        label: (model) => (model.isActive ? "Deactivate" : "Activate"),
        icon: <Power className="h-4 w-4" />,
        onClick: handleToggleActive,
      },
      {
        label: "Edit",
        icon: <Pencil className="h-4 w-4" />,
        onClick: openEditDialog,
      },
      {
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: openDeleteDialog,
        variant: "destructive",
      },
    ],
    [handleToggleActive, openEditDialog, openDeleteDialog],
  );

  // Bulk Actions
  const handleBulkActivate = async (models: AIModel[]) => {
    models.forEach((m) => {
      if (!m.isActive) toggleModelActive(m.id);
    });
    toast.success(`${models.length} models activated`);
    setSelectedRows([]);
  };

  const handleBulkDeactivate = async (models: AIModel[]) => {
    models.forEach((m) => {
      if (m.isActive) toggleModelActive(m.id);
    });
    toast.success(`${models.length} models deactivated`);
    setSelectedRows([]);
  };

  const handleBulkDelete = async (models: AIModel[]) => {
    models.forEach((m) => deleteModel(m.id));
    toast.success(`${models.length} models deleted`);
    setSelectedRows([]);
  };

  const bulkActions: BulkAction<AIModel>[] = [
    {
      label: "Activate All",
      icon: <Power className="h-4 w-4" />,
      onClick: handleBulkActivate,
      variant: "default",
    },
    {
      label: "Deactivate All",
      icon: <PowerOff className="h-4 w-4" />,
      onClick: handleBulkDeactivate,
      variant: "warning",
    },
    {
      label: "Delete All",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Brain}
        title="AI Models"
        description="Manage AI models from OpenRouter"
        badge={{
          icon: <Sparkles className="h-4 w-4" />,
          label: `${stats.total} models configured`,
        }}
        actions={[
          {
            label: "Add Model",
            icon: <Plus className="w-4 h-4" />,
            onClick: () => {
              resetForm();
              setIsAddDialogOpen(true);
            },
            className: "shadow-lg shadow-primary/25",
          },
        ]}
      />

      {/* Stats Cards */}
      <StatsGrid
        items={[
          {
            label: "Total Models",
            value: stats.total,
            icon: Brain,
            color: "blue",
          },
          {
            label: "Active Models",
            value: stats.active,
            icon: Power,
            color: "emerald",
          },
          {
            label: "Inactive Models",
            value: stats.inactive,
            icon: PowerOff,
            color: "gray",
          },
          {
            label: "Providers",
            value: stats.providers,
            icon: Zap,
            color: "violet",
          },
          {
            label: "Available",
            value: availableModels.length,
            icon: Bot,
            color: "amber",
          },
        ]}
        columns={{ default: 2, sm: 2, lg: 5 }}
        showTrends={false}
      />

      {/* Error Alert */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={filteredModels}
        columns={columns}
        actions={actions}
        bulkActions={bulkActions}
        loading={false}
        loadingText="Loading models..."
        emptyIcon={<Bot className="h-8 w-8 text-gray-400" />}
        emptyTitle="No AI models configured"
        emptyDescription="Get started by adding your first AI model from OpenRouter."
        searchable
        searchPlaceholder="Search models..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        getRowId={(model) => model.id}
        onRefresh={() => fetchAvailableModels()}
      />

      {/* Add Model Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-3xl h-[90vh] bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-gray-900 dark:text-white">
                  Add AI Model
                </DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400">
                  Select a model from OpenRouter to add to your configuration.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-3 pb-4 sm:p-2">
            <div className="space-y-4">
              {/* Search & Filter Row */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search models..."
                    value={modelSearchTerm}
                    onChange={(e) => setModelSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                  />
                </div>
                <Select
                  value={providerFilter}
                  onValueChange={setProviderFilter}
                >
                  <SelectTrigger className="w-full sm:w-40 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700">
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                    <SelectItem value="all">All Providers</SelectItem>
                    {providers.map((provider) => (
                      <SelectItem
                        key={provider}
                        value={provider}
                        className="capitalize"
                      >
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-1 gap-2">
                  <Select
                    value={inputModalityFilter}
                    onValueChange={setInputModalityFilter}
                  >
                    <SelectTrigger className="w-full bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700">
                      <SelectValue placeholder="Input type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                      <SelectItem value="all">All Inputs</SelectItem>
                      <SelectItem value="text">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-3.5 w-3.5" />
                          Text
                        </div>
                      </SelectItem>
                      <SelectItem value="image">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-3.5 w-3.5" />
                          Image
                        </div>
                      </SelectItem>
                      <SelectItem value="audio">
                        <div className="flex items-center gap-2">
                          <AudioLines className="h-3.5 w-3.5" />
                          Audio
                        </div>
                      </SelectItem>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <Video className="h-3.5 w-3.5" />
                          Video
                        </div>
                      </SelectItem>
                      <SelectItem value="file">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5" />
                          File
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={outputModalityFilter}
                    onValueChange={setOutputModalityFilter}
                  >
                    <SelectTrigger className="w-full bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700">
                      <SelectValue placeholder="Output type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                      <SelectItem value="all">All Outputs</SelectItem>
                      <SelectItem value="text">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-3.5 w-3.5" />
                          Text
                        </div>
                      </SelectItem>
                      <SelectItem value="image">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-3.5 w-3.5" />
                          Image
                        </div>
                      </SelectItem>
                      <SelectItem value="audio">
                        <div className="flex items-center gap-2">
                          <AudioLines className="h-3.5 w-3.5" />
                          Audio
                        </div>
                      </SelectItem>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <Video className="h-3.5 w-3.5" />
                          Video
                        </div>
                      </SelectItem>
                      <SelectItem value="file">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5" />
                          File
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fetchAvailableModels()}
                  disabled={isLoadingAvailable}
                  className="shrink-0"
                >
                  <RefreshCw
                    className={cn(
                      "w-4 h-4",
                      isLoadingAvailable && "animate-spin",
                    )}
                  />
                </Button>
              </div>

              {/* Model List */}
              <div className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 overflow-hidden">
                <ScrollArea className="h-[40vh] max-h-[420px]">
                  {isLoadingAvailable ? (
                    <div className="flex flex-col items-center justify-center h-[260px] gap-3 p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">
                        Loading models from OpenRouter...
                      </p>
                    </div>
                  ) : filteredAvailableModels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[260px] gap-3 p-8">
                      <Bot className="h-12 w-12 text-muted-foreground/50" />
                      <div className="text-center">
                        <p className="font-medium text-muted-foreground">
                          No models found
                        </p>
                        <p className="text-sm text-muted-foreground/70">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-zinc-700">
                      {filteredAvailableModels.slice(0, 50).map((model) => {
                        const provider = getProviderFromModelId(model.id);
                        const isSelected =
                          selectedOpenRouterModel?.id === model.id;
                        const modality = model.architecture?.modality || "text";

                        return (
                          <button
                            type="button"
                            key={model.id}
                            onClick={() => handleSelectModel(model)}
                            className={cn(
                              "w-full text-left px-4 py-3 hover:bg-white dark:hover:bg-zinc-800 transition-colors",
                              isSelected &&
                                "bg-primary/5 dark:bg-primary/10 border-l-2 border-primary",
                            )}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div
                                  className={cn(
                                    "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
                                    isSelected
                                      ? "bg-primary/20 dark:bg-primary/30"
                                      : "bg-gray-200 dark:bg-zinc-700",
                                  )}
                                >
                                  {isSelected ? (
                                    <Check className="h-4 w-4 text-primary" />
                                  ) : (
                                    <Bot className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                                    {model.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                                    {model.id}
                                  </p>
                                  {model.description && (
                                    <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                                      {model.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <ProviderBadge provider={provider} />
                                <ModalityBadge modality={modality} />
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Layers className="h-3 w-3" />
                                  {(model.context_length / 1000).toFixed(0)}K
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Selected Model Preview */}
              {selectedOpenRouterModel && (
                <Card className="border border-primary/15 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent dark:from-primary/10 dark:via-primary/5 dark:to-transparent">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {selectedOpenRouterModel.name}
                            </p>
                            <p className="text-[11px] font-mono text-muted-foreground truncate max-w-[260px] sm:max-w-none">
                              {selectedOpenRouterModel.id}
                            </p>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 sm:mt-0 sm:justify-end">
                            <Badge
                              variant="outline"
                              className="border-primary/40 bg-primary/5 text-[11px] font-medium capitalize"
                            >
                              {getProviderFromModelId(
                                selectedOpenRouterModel.id,
                              )}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[11px] font-normal text-muted-foreground"
                            >
                              Context{" "}
                              {(
                                selectedOpenRouterModel.context_length / 1000
                              ).toFixed(0)}
                              K
                            </Badge>
                          </div>
                        </div>

                        {selectedOpenRouterModel.description && (
                          <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
                            {selectedOpenRouterModel.description}
                          </p>
                        )}

                        <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                          <div className="space-y-1.5 rounded-lg border border-gray-200 bg-white/60 p-3 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
                            <ModalityPills
                              label="Inputs"
                              values={
                                selectedOpenRouterModel.architecture
                                  ?.input_modalities
                              }
                            />
                            <ModalityPills
                              label="Outputs"
                              values={
                                selectedOpenRouterModel.architecture
                                  ?.output_modalities
                              }
                            />
                          </div>
                          <div className="space-y-1.5 rounded-lg border border-gray-200 bg-white/60 p-3 text-xs text-right shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                              Pricing (per 1M tokens)
                            </p>
                            <p className="text-emerald-600 dark:text-emerald-400">
                              Input:{" "}
                              {formatPrice(
                                selectedOpenRouterModel.pricing.prompt,
                              )}
                            </p>
                            <p className="text-blue-600 dark:text-blue-400">
                              Output:{" "}
                              {formatPrice(
                                selectedOpenRouterModel.pricing.completion,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Form Fields */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
                <div className="space-y-2">
                  <Label htmlFor="add-name">Model Name *</Label>
                  <Input
                    id="add-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter a custom name for this model"
                    className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                  />
                  {formErrors.name && (
                    <p className="text-sm text-destructive">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-description">Description</Label>
                  <Textarea
                    id="add-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Optional description for this model"
                    rows={3}
                    className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                  <div className="flex items-center gap-2">
                    <Power
                      className={cn(
                        "h-4 w-4",
                        formData.isActive
                          ? "text-emerald-500"
                          : "text-gray-400",
                      )}
                    />
                    <Label
                      htmlFor="add-active"
                      className="text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      {formData.isActive
                        ? "Model is Active"
                        : "Model is Inactive"}
                    </Label>
                  </div>
                  <Switch
                    id="add-active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>

                {formErrors.submit && (
                  <p className="text-sm text-destructive font-medium">
                    {formErrors.submit}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 pt-4 border-t border-gray-200 dark:border-zinc-700">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Model"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Model Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20">
                <Pencil className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-gray-900 dark:text-white">
                  Edit AI Model
                </DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400">
                  Update model configuration
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Model Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
              />
              {formErrors.name && (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <Power
                  className={cn(
                    "h-4 w-4",
                    formData.isActive ? "text-emerald-500" : "text-gray-400",
                  )}
                />
                <Label
                  htmlFor="edit-active"
                  className="text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {formData.isActive ? "Model is Active" : "Model is Inactive"}
                </Label>
              </div>
              <Switch
                id="edit-active"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            {formErrors.submit && (
              <p className="text-sm text-destructive font-medium">
                {formErrors.submit}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete AI Model?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
              This will remove{" "}
              <strong className="text-gray-900 dark:text-white">
                {selectedModel?.name}
              </strong>{" "}
              from your configuration. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Model"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
