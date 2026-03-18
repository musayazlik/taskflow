"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  ImagePlus,
  Loader2,
  Download,
  Copy,
  Check,
  Sparkles,
  Bot,
  Wand2,
  Palette,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Trash2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@repo/shadcn-ui/button";
import { Textarea } from "@repo/shadcn-ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import { ScrollArea } from "@repo/shadcn-ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/shadcn-ui/select";
import { Label } from "@repo/shadcn-ui/label";
import { RadioGroup, RadioGroupItem } from "@repo/shadcn-ui/radio-group";
import { Slider } from "@repo/shadcn-ui/slider";
import { cn } from "@/lib/utils";
import { useActiveModels } from "@/stores/ai-models-store";
import { aiService } from "@/services/ai.service";
import { PageHeader } from "@/components/panel/page-header";
import type { GeneratedImage } from "@/services/types";
import { ImageZoom } from "@repo/shadcn-ui/image-zoom";
import { Skeleton } from "@repo/shadcn-ui/skeleton";
import { toast } from "sonner";
import { mediaService } from "@/services/media.service";

const aspectRatios = [
  { value: "1:1", label: "Square", icon: Square, width: 1024, height: 1024 },
  {
    value: "16:9",
    label: "Landscape",
    icon: RectangleHorizontal,
    width: 1792,
    height: 1024,
  },
  {
    value: "9:16",
    label: "Portrait",
    icon: RectangleVertical,
    width: 1024,
    height: 1792,
  },
];

const styles = [
  { value: "realistic", label: "Realistic" },
  { value: "artistic", label: "Artistic" },
  { value: "anime", label: "Anime" },
  { value: "3d", label: "3D Render" },
  { value: "digital-art", label: "Digital Art" },
  { value: "watercolor", label: "Watercolor" },
];

// OpenRouter model type
interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt: string;
    completion: string;
    image?: string;
  };
  output_modalities?: string[];
}

// Batch type for grouping generated images
interface ImageBatch {
  id: string;
  images: GeneratedImage[];
  prompt: string;
  timestamp: Date;
  settings: {
    model: string;
    aspectRatio: string;
    style: string;
    quality: number;
  };
}

export default function ImageGeneratorPage() {
  // Get user's active models from store
  const activeModels = useActiveModels();

  const [openRouterImageModels, setOpenRouterImageModels] = useState<
    OpenRouterModel[]
  >([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [style, setStyle] = useState("realistic");
  const [quality, setQuality] = useState([80]);
  const [count, setCount] = useState("1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [batches, setBatches] = useState<ImageBatch[]>([]); // All batches
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0); // Current page/batch index
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0); // Track how many images are being generated
  const [uploadedImage, setUploadedImage] = useState<{
    url: string;
    file: File;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter active models to only those that support image output
  const imageActiveModels = useMemo(
    () => activeModels.filter((model) => model.supportsImageOutput),
    [activeModels],
  );

  // Ensure we only use OpenRouter models that can output images
  const imageOutputOpenRouterModels = useMemo(
    () =>
      openRouterImageModels.filter((model) =>
        (model.output_modalities || []).includes("image"),
      ),
    [openRouterImageModels],
  );

  // Get current batch images
  const currentBatch = batches[currentBatchIndex];
  const currentImages = currentBatch?.images || [];

  // Load image-capable models from OpenRouter API
  const loadImageModels = useCallback(async () => {
    setIsLoadingModels(true);
    try {
      const response = await aiService.listImageModels();
      if (response.success && response.data) {
        setOpenRouterImageModels(response.data);
      }
    } catch (error) {
      console.error("Failed to load image models from OpenRouter:", error);
    } finally {
      setIsLoadingModels(false);
    }
  }, []);

  // Load models on mount
  useEffect(() => {
    loadImageModels();
  }, [loadImageModels]);

  // Auto-select first model
  useEffect(() => {
    if (!selectedModel) {
      // Prefer user's active models first
      if (imageActiveModels.length > 0) {
        setSelectedModel(imageActiveModels[0]!.modelId);
      } else if (imageOutputOpenRouterModels.length > 0) {
        setSelectedModel(imageOutputOpenRouterModels[0]!.id);
      }
    }
  }, [imageActiveModels, imageOutputOpenRouterModels, selectedModel]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to get URL
      const uploadResponse = await mediaService.uploadFiles([file]);
      if (
        uploadResponse.success &&
        uploadResponse.data &&
        uploadResponse.data[0]
      ) {
        setUploadedImage({
          url: uploadResponse.data[0].url,
          file,
        });
        toast.success("Image uploaded successfully");
      } else {
        toast.error(uploadResponse.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedModel) return;

    const requestedCount = parseInt(count);
    setIsGenerating(true);
    setPendingCount(requestedCount); // Show skeleton for requested number of images

    try {
      const response = await aiService.generateImages({
        model: selectedModel,
        prompt,
        negativePrompt: negativePrompt || undefined,
        aspectRatio,
        style,
        quality: quality[0] ?? 0.8,
        count: requestedCount,
        baseImageUrl: uploadedImage?.url,
      });

      if (response.success && response.data) {
        // Convert timestamp strings to Date objects
        const images = response.data.map((img) => ({
          ...img,
          timestamp: new Date(img.timestamp),
        }));

        // Create a new batch with these images
        const newBatch: ImageBatch = {
          id: crypto.randomUUID(),
          images,
          prompt,
          timestamp: new Date(),
          settings: {
            model: selectedModel,
            aspectRatio,
            style,
            quality: quality[0] ?? 0.8,
          },
        };

        // Add to beginning of batches array
        setBatches((prev) => [newBatch, ...prev]);
        // Set current batch to the new one (index 0)
        setCurrentBatchIndex(0);

        toast.success(
          `${images.length} image(s) generated and saved to media library!`,
        );
      } else {
        toast.error(response.message || "Failed to generate images");
      }
    } catch (error) {
      console.error("Image generation error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsGenerating(false);
      setPendingCount(0);
    }
  };

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Prompt copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = async (url: string, id: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `ai-generated-${id}.png`;
      a.click();
      URL.revokeObjectURL(downloadUrl);
      toast.success("Download started");
    } catch {
      window.open(url, "_blank");
    }
  };

  const handleDelete = (imageId: string) => {
    // Remove image from current batch
    setBatches(
      (prev) =>
        prev
          .map((batch, index) => {
            if (index === currentBatchIndex) {
              return {
                ...batch,
                images: batch.images.filter((img) => img.id !== imageId),
              };
            }
            return batch;
          })
          .filter((batch) => batch.images.length > 0), // Remove empty batches
    );
    toast.success("Image removed");
  };

  const handleDeleteBatch = (batchIndex: number) => {
    setBatches((prev) => prev.filter((_, index) => index !== batchIndex));
    // Adjust current index if needed
    if (currentBatchIndex >= batchIndex && currentBatchIndex > 0) {
      setCurrentBatchIndex((prev) => prev - 1);
    }
    toast.success("Batch deleted");
  };

  const handleClearAll = () => {
    setBatches([]);
    setCurrentBatchIndex(0);
    toast.success("All images cleared");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[600px] overflow-hidden">
      <PageHeader
        icon={ImagePlus}
        title="Image Generator"
        description="Create stunning images with AI"
        className="shrink-0 mb-6"
        actions={
          <>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[280px]">
                {isLoadingModels ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading models...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select model" />
                )}
              </SelectTrigger>
              <SelectContent className="max-h-[400px]">
                {isLoadingModels ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading models...
                    </div>
                  </SelectItem>
                ) : (
                  <>
                    {/* User's Active Models (image-capable only) */}
                    {imageActiveModels.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                          Your Active Models
                        </div>
                        {imageActiveModels.map((model) => (
                          <SelectItem
                            key={`active-${model.id}`}
                            value={model.modelId}
                          >
                            <div className="flex items-center gap-2">
                              <Bot className="h-4 w-4 text-primary" />
                              <span className="truncate">{model.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}

                    {/* OpenRouter Image Models */}
                    {imageOutputOpenRouterModels.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 mt-1">
                          OpenRouter Image Models
                        </div>
                        {imageOutputOpenRouterModels.map((model) => (
                          <SelectItem key={`or-${model.id}`} value={model.id}>
                            <div className="flex items-center gap-2">
                              <ImagePlus className="h-4 w-4 text-pink-500" />
                              <span className="truncate">{model.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}

                    {/* No models at all */}
                    {activeModels.length === 0 &&
                      openRouterImageModels.length === 0 && (
                        <SelectItem value="none" disabled>
                          No models available
                        </SelectItem>
                      )}
                  </>
                )}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={loadImageModels}
              disabled={isLoadingModels}
              title="Refresh OpenRouter models"
            >
              <RefreshCw
                className={cn("h-4 w-4", isLoadingModels && "animate-spin")}
              />
            </Button>
            {batches.length > 0 && (
              <Button variant="outline" size="icon" onClick={handleClearAll}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </>
        }
      />

      {/* No Models Warning */}
      {!isLoadingModels &&
        imageActiveModels.length === 0 &&
        imageOutputOpenRouterModels.length === 0 && (
          <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 shrink-0 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  No models available
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Please add AI models in the Model Settings page first, or try
                  refreshing the OpenRouter model list.
                </p>
              </div>
            </div>
          </Card>
        )}

      {/* Model Info */}
      {selectedModel && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shrink-0 mb-6">
          <div className="flex items-center gap-3">
            <ImagePlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <p className="font-medium text-blue-800 dark:text-blue-200">
                {imageActiveModels.find((m) => m.modelId === selectedModel)
                  ?.name ||
                  imageOutputOpenRouterModels.find(
                    (m) => m.id === selectedModel,
                  )?.name ||
                  selectedModel}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Selected model will be used for image generation
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Settings Panel */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden h-full">
          <CardHeader className="shrink-0">
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Generation Settings
            </CardTitle>
            <CardDescription>
              Configure your image generation parameters
            </CardDescription>
          </CardHeader>
          <ScrollArea className="flex-1 min-h-0">
            <CardContent className="space-y-6 pb-6">
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Base Image (Optional)</Label>
                {uploadedImage ? (
                  <div className="relative rounded-lg border overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadedImage.url}
                      alt="Uploaded base image"
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="p-2 bg-muted/50 text-xs text-muted-foreground">
                      {uploadedImage.file.name}
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer",
                      isUploading
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50 bg-muted/30",
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                    />
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {isUploading
                            ? "Uploading..."
                            : "Click to upload image"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG, WEBP (Max 10MB)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {uploadedImage && (
                  <p className="text-xs text-muted-foreground">
                    AI will use this image as a base for generation
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Prompt *</Label>
                <Textarea
                  placeholder={
                    uploadedImage
                      ? "Describe how you want to edit or transform the image..."
                      : "Describe the image you want to create..."
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Negative Prompt</Label>
                <Textarea
                  placeholder="What to avoid in the image..."
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <Label>Aspect Ratio</Label>
                <RadioGroup
                  value={aspectRatio}
                  onValueChange={setAspectRatio}
                  className="grid grid-cols-3 gap-2"
                >
                  {aspectRatios.map((ratio) => {
                    const Icon = ratio.icon;
                    return (
                      <Label
                        key={ratio.value}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all",
                          aspectRatio === ratio.value
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 dark:border-zinc-700 hover:border-primary/50",
                        )}
                      >
                        <RadioGroupItem
                          value={ratio.value}
                          className="sr-only"
                        />
                        <Icon
                          className={cn(
                            "h-6 w-6",
                            aspectRatio === ratio.value
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        />
                        <span className="text-xs font-medium">
                          {ratio.label}
                        </span>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Quality</Label>
                  <span className="text-sm text-muted-foreground">
                    {quality[0]}%
                  </span>
                </div>
                <Slider
                  value={quality}
                  onValueChange={setQuality}
                  min={50}
                  max={100}
                  step={10}
                />
              </div>

              <div className="space-y-2">
                <Label>Number of Images</Label>
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} {n === 1 ? "image" : "images"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || !selectedModel || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Images
                  </>
                )}
              </Button>
            </CardContent>
          </ScrollArea>
        </Card>

        {/* Generated Images */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          <CardHeader className="shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Generated Images
                </CardTitle>
                <CardDescription>
                  {isGenerating
                    ? `Generating ${pendingCount} image(s)...`
                    : batches.length > 0
                      ? `${batches.length} batch(es) • ${batches.reduce((acc, b) => acc + b.images.length, 0)} total image(s)`
                      : "No images generated yet"}
                </CardDescription>
              </div>
              {batches.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent>
              {/* Show skeletons while generating */}
              {isGenerating && pendingCount > 0 && (
                <div
                  className={cn(
                    "grid gap-4",
                    pendingCount === 1 && "grid-cols-1",
                    pendingCount === 2 && "grid-cols-2",
                    pendingCount === 3 && "grid-cols-2",
                    pendingCount >= 4 && "grid-cols-2",
                  )}
                >
                  {Array.from({ length: pendingCount }).map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className={cn(
                        "relative rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 border",
                        pendingCount === 1 && "aspect-square max-h-[500px]",
                        pendingCount === 2 && "aspect-square",
                        pendingCount === 3 &&
                          index === 0 &&
                          "col-span-2 aspect-video",
                        pendingCount === 3 && index > 0 && "aspect-square",
                        pendingCount >= 4 && "aspect-square",
                      )}
                    >
                      <Skeleton className="absolute inset-0 w-full h-full" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                        <span className="text-sm text-muted-foreground">
                          Generating image {index + 1}...
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show generated images or empty state */}
              {!isGenerating && batches.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-100 dark:bg-pink-900/30 mb-4">
                    <ImagePlus className="h-8 w-8 text-pink-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Images Yet
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                    Enter a prompt and click Generate to create AI-powered
                    images. Generated images will be automatically saved to your
                    media library.
                  </p>
                </div>
              ) : !isGenerating && batches.length > 0 ? (
                <div className="space-y-4">
                  {/* Current Batch Info */}
                  {currentBatch && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Layers className="h-4 w-4" />
                          <span>
                            Batch {currentBatchIndex + 1} of {batches.length}
                          </span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {currentBatch.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            setCurrentBatchIndex((prev) => prev + 1)
                          }
                          disabled={currentBatchIndex >= batches.length - 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-[3rem] text-center">
                          {currentBatchIndex + 1} / {batches.length}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            setCurrentBatchIndex((prev) => prev - 1)
                          }
                          disabled={currentBatchIndex <= 0}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Current Batch Prompt */}
                  {currentBatch && (
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <p className="text-sm">
                        <span className="font-medium">Prompt:</span>{" "}
                        <span className="text-muted-foreground">
                          {currentBatch.prompt}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Images Grid */}
                  {currentImages.length > 0 && (
                    <div
                      className={cn(
                        "grid gap-4",
                        currentImages.length === 1 && "grid-cols-1",
                        currentImages.length === 2 && "grid-cols-2",
                        currentImages.length === 3 && "grid-cols-2",
                        currentImages.length >= 4 && "grid-cols-2",
                      )}
                    >
                      {currentImages.map((image, index) => (
                        <div
                          key={image.id}
                          className={cn(
                            "group relative rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 border",
                            currentImages.length === 1 &&
                              "aspect-square max-h-[500px] mx-auto w-full",
                            currentImages.length === 2 && "aspect-square",
                            currentImages.length === 3 &&
                              index === 0 &&
                              "col-span-2 aspect-video",
                            currentImages.length === 3 &&
                              index > 0 &&
                              "aspect-square",
                            currentImages.length >= 4 && "aspect-square",
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image.url}
                            alt={image.prompt}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  handleDownload(image.url, image.id)
                                }
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  handleCopyPrompt(image.prompt, image.id)
                                }
                              >
                                {copiedId === image.id ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => window.open(image.url, "_blank")}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(image.id)}
                              className="mt-2"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Batch Thumbnails / Quick Navigation */}
                  {batches.length > 1 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-3">All Batches</p>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {batches.map((batch, index) => (
                          <button
                            key={batch.id}
                            onClick={() => setCurrentBatchIndex(index)}
                            className={cn(
                              "relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                              currentBatchIndex === index
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-transparent hover:border-gray-300 dark:hover:border-zinc-600",
                            )}
                          >
                            {batch.images[0] && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={batch.images[0].url}
                                alt={`Batch ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {batch.images.length}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
