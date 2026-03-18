"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@repo/shadcn-ui/button";
import { toast } from "sonner";
import type { MediaFile } from "@/services";
import { mediaService } from "@/services/media.service";
import { PageHeader } from "@/components/panel/page-header";
import { MediaUploader } from "@/components/media-uploader";
import { StatsGrid, type StatItem } from "@/components/stats";
import { MediaTable } from "./organisms/media-table";
import {
  Images,
  HardDrive,
  FileImage,
  RefreshCw,
  Loader2,
  Sparkles,
} from "lucide-react";
import { formatFileSize } from "./utils";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/shadcn-ui/dialog";
import { Input } from "@repo/shadcn-ui/input";
import { Label } from "@repo/shadcn-ui/label";
import { Slider } from "@repo/shadcn-ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/shadcn-ui/select";

interface MediaPageClientProps {
  initialFiles: MediaFile[];
  initialHasMore: boolean;
}

export function MediaPageClient({
  initialFiles,
  initialHasMore,
}: MediaPageClientProps) {
  const [files, setFiles] = useState<MediaFile[]>(initialFiles);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<MediaFile | null>(null);
  const [optimizeDialogOpen, setOptimizeDialogOpen] = useState(false);
  const [fileToOptimize, setFileToOptimize] = useState<MediaFile | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeSettings, setOptimizeSettings] = useState({
    quality: 85,
    format: "webp" as "webp" | "jpeg" | "png" | "original",
    maxWidth: "",
    maxHeight: "",
  });

  const handleUploadComplete = useCallback((uploaded: MediaFile[]) => {
    if (!uploaded || uploaded.length === 0) return;
    setFiles((prev) => [...uploaded, ...prev]);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await mediaService.syncFromUploadThing();
      if (response.success && response.data) {
        const { added, removed } = response.data;

        if (added === 0 && removed === 0) {
          toast.success("Already in sync - no changes needed");
        } else {
          const parts = [];
          if (added > 0) parts.push(`+${added} added`);
          if (removed > 0) parts.push(`-${removed} removed`);
          toast.success(`Synced: ${parts.join(", ")}`);
          // Reload files
          const listResponse = await mediaService.listFiles({
            limit: 100,
            offset: 0,
          });
          if (listResponse.success && listResponse.data) {
            setFiles(listResponse.data.files);
          }
        }

        if (response.data.errors && response.data.errors.length > 0) {
          console.error("Sync errors:", response.data.errors);
          toast.error(
            `Some files failed to sync (${response.data.errors.length})`,
          );
        }
      } else {
        toast.error(response.error || "Failed to sync files");
      }
    } catch (error) {
      console.error("Error syncing files:", error);
      toast.error("Failed to sync files");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (file: MediaFile) => {
    try {
      const response = await mediaService.deleteFile(file.key);
      if (response.success) {
        setFiles((prev) => prev.filter((f) => f.key !== file.key));
        toast.success("File deleted successfully!");
        setDeleteDialogOpen(false);
        setFileToDelete(null);
      } else {
        toast.error(response.error || "Failed to delete file");
      }
    } catch (error) {
      toast.error("Failed to delete file");
    }
  };

  const handleOptimize = async () => {
    if (!fileToOptimize) return;

    setIsOptimizing(true);
    try {
      const optimizeResponse = await mediaService.optimizeImage(
        fileToOptimize.key,
        {
          quality: optimizeSettings.quality,
          format:
            optimizeSettings.format === "original"
              ? "original"
              : optimizeSettings.format,
          maxWidth: optimizeSettings.maxWidth
            ? parseInt(optimizeSettings.maxWidth)
            : undefined,
          maxHeight: optimizeSettings.maxHeight
            ? parseInt(optimizeSettings.maxHeight)
            : undefined,
        },
      );

      if (optimizeResponse.success) {
        toast.success("Image optimized successfully!");
        const listResponse = await mediaService.listFiles({
          limit: 100,
          offset: 0,
        });
        if (listResponse.success && listResponse.data) {
          setFiles(listResponse.data.files);
        }
        setOptimizeDialogOpen(false);
        setFileToOptimize(null);
        setOptimizeSettings({
          quality: 85,
          format: "webp",
          maxWidth: "",
          maxHeight: "",
        });
      } else {
        toast.error(optimizeResponse.error || "Failed to optimize image");
      }
    } catch (error) {
      console.error("Error optimizing image:", error);
      toast.error("Failed to optimize image");
    } finally {
      setIsOptimizing(false);
    }
  };

  const openDeleteDialog = useCallback((file: MediaFile) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  }, []);

  const openOptimizeDialog = useCallback((file: MediaFile) => {
    const isImage =
      file.type?.startsWith("image/") ||
      file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
    if (!isImage) {
      toast.error("Only image files can be optimized");
      return;
    }
    setFileToOptimize(file);
    setOptimizeSettings({
      quality: 85,
      format: "webp",
      maxWidth: "",
      maxHeight: "",
    });
    setOptimizeDialogOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Images}
        title="Media"
        description="Manage your media files and assets"
        actions={
          <>
            <Button variant="outline" onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync
            </Button>
            <MediaUploader
              onUploadComplete={handleUploadComplete}
              mode="button"
            />
          </>
        }
      />

      <StatsGrid
        items={useMemo<StatItem[]>(() => {
          const totalSize = files.reduce((sum, f) => sum + f.size, 0);
          const imageFiles = files.filter(
            (f) =>
              f.type?.startsWith("image/") ||
              f.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i),
          ).length;
          const otherFiles = files.length - imageFiles;

          return [
            {
              label: "Total Files",
              value: files.length,
              icon: Images,
              color: "blue",
              trend: "+12%",
            },
            {
              label: "Total Size",
              value: totalSize,
              icon: HardDrive,
              color: "purple",
              formatter: (val) => formatFileSize(val as number),
              trend: "+8%",
            },
            {
              label: "Images",
              value: imageFiles,
              icon: FileImage,
              color: "green",
              trend: "+15%",
            },
            {
              label: "Other Files",
              value: otherFiles,
              icon: FileImage,
              color: "orange",
              trend: "+5%",
            },
          ];
        }, [files])}
      />

      <MediaTable
        initialFiles={files}
        initialHasMore={initialHasMore}
        onFilesChange={setFiles}
        onDelete={handleDelete}
        onOptimize={openOptimizeDialog}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{fileToDelete?.name}</span>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => fileToDelete && handleDelete(fileToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Optimize Dialog */}
      <Dialog open={optimizeDialogOpen} onOpenChange={setOptimizeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Optimize Image
            </DialogTitle>
            <DialogDescription>
              Optimize {fileToOptimize?.name} with custom settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Quality: {optimizeSettings.quality}%</Label>
              <Slider
                value={[optimizeSettings.quality]}
                onValueChange={(value) =>
                  setOptimizeSettings({
                    ...optimizeSettings,
                    quality: value[0]!,
                  })
                }
                min={1}
                max={100}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select
                value={optimizeSettings.format}
                onValueChange={(value: "webp" | "jpeg" | "png" | "original") =>
                  setOptimizeSettings({ ...optimizeSettings, format: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webp">WebP</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="original">Original</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Width (px)</Label>
                <Input
                  type="number"
                  placeholder="Auto"
                  value={optimizeSettings.maxWidth}
                  onChange={(e) =>
                    setOptimizeSettings({
                      ...optimizeSettings,
                      maxWidth: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max Height (px)</Label>
                <Input
                  type="number"
                  placeholder="Auto"
                  value={optimizeSettings.maxHeight}
                  onChange={(e) =>
                    setOptimizeSettings({
                      ...optimizeSettings,
                      maxHeight: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOptimizeDialogOpen(false)}
              disabled={isOptimizing}
            >
              Cancel
            </Button>
            <Button onClick={handleOptimize} disabled={isOptimizing}>
              {isOptimizing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Optimize
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
