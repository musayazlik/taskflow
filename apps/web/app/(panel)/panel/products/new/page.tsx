"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/shadcn-ui/button";
import { Card, CardContent } from "@repo/shadcn-ui/card";
import { Input } from "@repo/shadcn-ui/input";
import { Label } from "@repo/shadcn-ui/label";
import { Textarea } from "@repo/shadcn-ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/shadcn-ui/select";
import {
  Loader2,
  ArrowLeft,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { productService } from "@/services";
import { toast } from "sonner";

type UploadedImage = {
  id: string;
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  polarFileId?: string;
};

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [productType, setProductType] = useState<"one_time" | "recurring">(
    "one_time",
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [price, setPrice] = useState({
    priceAmount: "",
    priceCurrency: "USD",
    recurringInterval: "month" as "day" | "week" | "month" | "year",
  });
  const [recurringIntervalCount, setRecurringIntervalCount] =
    useState<number>(1);
  const [trialInterval, setTrialInterval] = useState<
    "day" | "week" | "month" | "year"
  >("day");
  const [trialIntervalCount, setTrialIntervalCount] = useState<number>(0);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (imageFiles.length === 0) {
      toast.error("Please select a valid image file");
      return;
    }

    const newImages: UploadedImage[] = imageFiles.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
      uploaded: false,
    }));

    setUploadedImages((prev) => [...prev, ...newImages]);

    for (const image of newImages) {
      try {
        const uploadResponse = await productService.uploadMedia(image.file);

        if (uploadResponse.success && uploadResponse.data) {
          setUploadedImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? {
                    ...img,
                    uploading: false,
                    uploaded: true,
                    polarFileId: uploadResponse.data!.id,
                  }
                : img,
            ),
          );
          toast.success(`${image.file.name} uploaded successfully`);
        } else {
          setUploadedImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? {
                    ...img,
                    uploading: false,
                    uploaded: false,
                    error: uploadResponse.error || "Upload failed",
                  }
                : img,
            ),
          );
          toast.error(`${image.file.name} failed to upload`);
        }
      } catch (error) {
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  uploading: false,
                  uploaded: false,
                  error: "Upload error",
                }
              : img,
          ),
        );
        toast.error(`Error uploading ${image.file.name}`);
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  const removeImage = useCallback((id: string) => {
    setUploadedImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pendingImages = uploadedImages.filter(
        (img) => img.uploading || !img.uploaded,
      );
      if (pendingImages.length > 0) {
        toast.error("Please wait for all images to finish uploading");
        setLoading(false);
        return;
      }

      const mediaIds = uploadedImages
        .filter((img) => img.uploaded && img.polarFileId)
        .map((img) => img.polarFileId!);

      if (!price.priceAmount) {
        toast.error("Please enter a price amount");
        setLoading(false);
        return;
      }

      const formattedPrices = [
        {
          type: productType,
          priceAmount: Math.round(parseFloat(price.priceAmount) * 100),
          priceCurrency: price.priceCurrency,
          recurringInterval:
            productType === "recurring" ? price.recurringInterval : undefined,
        },
      ];

      const response = await productService.createProduct({
        name: formData.name,
        description: formData.description || undefined,
        isRecurring: productType === "recurring",
        prices: formattedPrices,
        medias: mediaIds.length > 0 ? mediaIds : undefined,
        recurringInterval:
          productType === "recurring" ? price.recurringInterval : undefined,
        recurringIntervalCount:
          productType === "recurring" ? recurringIntervalCount : undefined,
        trialInterval: productType === "recurring" ? trialInterval : undefined,
        trialIntervalCount:
          productType === "recurring" ? trialIntervalCount : undefined,
      });

      if (response.success) {
        toast.success("Product created successfully");
        router.push("/panel/products");
      } else {
        toast.error(
          response.error || response.message || "Failed to create product",
        );
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      toast.error("An error occurred while creating the product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/panel/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Product
          </h1>
          <p className="text-muted-foreground">Add a new product for sale</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Product Type */}
            <div className="space-y-2">
              <Label htmlFor="productType">Product Type *</Label>
              <Select
                value={productType}
                onValueChange={(value: "one_time" | "recurring") => {
                  setProductType(value);
                  if (value === "one_time") {
                    setPrice({ ...price, recurringInterval: "month" });
                  }
                }}
              >
                <SelectTrigger id="productType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">One-time Purchase</SelectItem>
                  <SelectItem value="recurring">Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Basic Information */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Premium Plan"
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detailed description about the product..."
                maxLength={500}
                rows={4}
              />
            </div>

            {/* Pricing */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price.priceAmount}
                    onChange={(e) =>
                      setPrice({ ...price, priceAmount: e.target.value })
                    }
                    placeholder="29.99"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Currency *</Label>
                  <Select
                    value={price.priceCurrency}
                    onValueChange={(value) =>
                      setPrice({ ...price, priceCurrency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="TRY">TRY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subscription-specific fields */}
              {productType === "recurring" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Recurring Interval *</Label>
                      <Select
                        value={price.recurringInterval}
                        onValueChange={(
                          value: "day" | "week" | "month" | "year",
                        ) => setPrice({ ...price, recurringInterval: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Daily</SelectItem>
                          <SelectItem value="week">Weekly</SelectItem>
                          <SelectItem value="month">Monthly</SelectItem>
                          <SelectItem value="year">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Recurring Interval Count</Label>
                      <Input
                        type="number"
                        min={1}
                        value={recurringIntervalCount}
                        onChange={(e) =>
                          setRecurringIntervalCount(Number(e.target.value) || 1)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Trial Interval</Label>
                      <Select
                        value={trialInterval}
                        onValueChange={(
                          value: "day" | "week" | "month" | "year",
                        ) => setTrialInterval(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Daily</SelectItem>
                          <SelectItem value="week">Weekly</SelectItem>
                          <SelectItem value="month">Monthly</SelectItem>
                          <SelectItem value="year">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Trial Interval Count</Label>
                      <Input
                        type="number"
                        min={0}
                        value={trialIntervalCount}
                        onChange={(e) =>
                          setTrialIntervalCount(Number(e.target.value) || 0)
                        }
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <Label>Product Images</Label>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
									relative border-2 border-dashed rounded-lg p-8 transition-all duration-200
									${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50 bg-muted/30"
                  }
								`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />

                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <div className="rounded-full bg-background p-4 shadow-sm">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Drag images here or{" "}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary underline underline-offset-4 hover:text-primary/80 font-semibold"
                      >
                        browse files
                      </button>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, WEBP (Max 10MB) - Multiple selection supported
                    </p>
                  </div>
                </div>
              </div>

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {uploadedImages.map((image) => (
                    <div
                      key={image.id}
                      className="group relative aspect-square rounded-lg overflow-hidden border-2 border-border bg-muted/50 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <img
                        src={image.preview}
                        alt={image.file.name}
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {image.uploading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        ) : image.uploaded ? (
                          <CheckCircle2 className="h-6 w-6 text-green-400" />
                        ) : (
                          <AlertCircle className="h-6 w-6 text-red-400" />
                        )}
                      </div>

                      <div className="absolute top-2 left-2">
                        {image.uploading ? (
                          <div className="bg-yellow-500/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Uploading
                          </div>
                        ) : image.uploaded ? (
                          <div className="bg-green-500/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="h-3 w-3" />
                            Uploaded
                          </div>
                        ) : (
                          <div className="bg-red-500/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                            <AlertCircle className="h-3 w-3" />
                            Error
                          </div>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={() => removeImage(image.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">
                        {image.file.name}
                      </div>

                      {image.error && (
                        <div className="absolute bottom-8 left-0 right-0 bg-red-500/90 text-white text-xs p-2">
                          {image.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" disabled={loading} size="lg">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Product
          </Button>
          <Button type="button" variant="outline" size="lg" asChild>
            <Link href="/panel/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
