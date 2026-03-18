"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@repo/shadcn-ui/button";
import { Card, CardContent } from "@repo/shadcn-ui/card";
import { Input } from "@repo/shadcn-ui/input";
import { Label } from "@repo/shadcn-ui/label";
import { Textarea } from "@repo/shadcn-ui/textarea";
import { Badge } from "@repo/shadcn-ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/shadcn-ui/tooltip";
import {
  Loader2,
  ArrowLeft,
  Check,
  AlertCircle,
  Clock,
  Upload,
  X,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { productService, type Product } from "@/services";
import { toast } from "sonner";

type UploadedImage = {
  id: string;
  file?: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  polarFileId?: string;
  isExisting?: boolean;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isRecurring: false,
  });
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [metadata, setMetadata] = useState<
    Array<{ key: string; value: string }>
  >([]);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProduct(productId);
      if (response.success && response.data) {
        setProduct(response.data);
        setFormData({
          name: response.data.name,
          description: response.data.description || "",
          isRecurring: response.data.isRecurring,
        });

        if (response.data.medias && response.data.medias.length > 0) {
          const mediaInfoResponse = await productService.getMediaInfo(
            response.data.medias.map((m) => m.id),
          );

          if (mediaInfoResponse.success && mediaInfoResponse.data) {
            const existingImages: UploadedImage[] = mediaInfoResponse.data.map(
              (fileInfo) => ({
                id: `existing-${fileInfo.id}`,
                preview: fileInfo.publicUrl,
                uploading: false,
                uploaded: true,
                polarFileId: fileInfo.id,
                isExisting: true,
              }),
            );

            setUploadedImages(existingImages);
          } else {
            const existingImages: UploadedImage[] = response.data.medias.map(
              (media) => ({
                id: `existing-${media.id}`,
                preview:
                  media.public_url || `https://polar.sh/files/${media.id}`,
                uploading: false,
                uploaded: true,
                polarFileId: media.id,
                isExisting: true,
              }),
            );

            setUploadedImages(existingImages);
          }
        } else {
          setUploadedImages([]);
        }
      } else {
        toast.error("Product not found");
        router.push("/panel/products");
      }
    } catch (error) {
      console.error("Failed to load product:", error);
      toast.error("Error loading product");
    } finally {
      setLoading(false);
    }
  };

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
      isExisting: false,
    }));

    setUploadedImages((prev) => [...prev, ...newImages]);

    for (const image of newImages) {
      try {
        const uploadResponse = await productService.uploadMedia(image.file!);

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
          toast.success(`${image.file!.name} uploaded successfully`);
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
          toast.error(`${image.file!.name} failed to upload`);
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
        toast.error(`Error uploading ${image.file!.name}`);
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
      if (image && image.file) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const pendingImages = uploadedImages.filter(
        (img) => img.uploading || (!img.uploaded && !img.isExisting),
      );
      if (pendingImages.length > 0) {
        toast.error("Please wait for all images to finish uploading");
        setSaving(false);
        return;
      }

      const mediaIds = uploadedImages
        .filter((img) => img.uploaded && img.polarFileId)
        .map((img) => img.polarFileId!);

      const response = await productService.updateProduct(productId, {
        ...formData,
        medias: mediaIds.length > 0 ? mediaIds : undefined,
      });

      if (response.success) {
        toast.success("Product updated successfully");
        router.push("/panel/products");
      } else {
        toast.error(response.error || "Update failed");
      }
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error("Error updating product");
    } finally {
      setSaving(false);
    }
  };

  const getSyncStatusBadge = () => {
    if (!product) return null;
    const isSynced = product.externalSyncedAt != null;

    if (isSynced) {
      return (
        <Badge variant="default" className="bg-green-600">
          <Check className="h-3 w-3 mr-1" />
          Synced with Polar
        </Badge>
      );
    }

    return (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const formatPrice = (price: {
    priceAmount: number;
    priceCurrency: string;
    recurringInterval?: string | null;
  }) => {
    const amount = (price.priceAmount / 100).toFixed(2);
    const interval = price.recurringInterval
      ? `/${price.recurringInterval}`
      : "";
    return `${amount} ${price.priceCurrency}${interval}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Product not found</p>
        <Button asChild className="mt-4">
          <Link href="/panel/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  const firstPrice =
    product.prices && product.prices.length > 0 ? product.prices[0] : null;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/panel/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            {getSyncStatusBadge()}
          </div>
          <p className="text-muted-foreground">
            Update product information (both DB and Polar will be updated)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Product Type (Read-only) */}
            <div className="space-y-2">
              <Label>Product Type</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {product.isRecurring ? "Subscription" : "One-time Purchase"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  (Managed by Polar)
                </span>
              </div>
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

            {/* Current Price (Read-only) */}
            {firstPrice && (
              <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                <Label>Current Price</Label>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-lg">
                      {formatPrice(firstPrice)}
                    </span>
                    <Badge variant="outline" className="ml-2">
                      {firstPrice.type === "recurring"
                        ? "Subscription"
                        : "One-time"}
                    </Badge>
                  </div>
                  {firstPrice.externalPriceId && (
                    <span className="text-xs text-muted-foreground">
                      Polar ID: {firstPrice.externalPriceId.slice(0, 8)}...
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Prices are managed by Polar and cannot be changed here
                </p>
              </div>
            )}

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
                        alt={image.file?.name || "Product image"}
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
                        {image.isExisting ? (
                          <div className="bg-blue-500/90 text-white text-xs px-2 py-1 rounded shadow-sm">
                            Existing
                          </div>
                        ) : image.uploading ? (
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

                      {image.file && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">
                          {image.file.name}
                        </div>
                      )}

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

            {/* Polar Info */}
            {product.externalProductId && (
              <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                <Label>Polar Information</Label>
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    Polar Product ID:{" "}
                  </span>
                  <code className="bg-background px-2 py-1 rounded">
                    {product.externalProductId}
                  </code>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" disabled={saving} size="lg">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Product
          </Button>
          <Button type="button" variant="outline" size="lg" asChild>
            <Link href="/panel/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
