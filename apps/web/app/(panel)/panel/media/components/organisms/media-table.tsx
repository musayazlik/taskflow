"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import {
  DataTable,
  type Column,
  type DataTableAction,
  type BulkAction,
} from "@/components/data-table";
import { FilePreview } from "../atoms/file-preview";
import { FileNameCell } from "../molecules/file-name-cell";
import { FileSizeCell } from "../molecules/file-size-cell";
import { UploadDateCell } from "../molecules/upload-date-cell";
import { UrlCopyButton } from "../molecules/url-copy-button";
import type { MediaFile } from "@/services";
import { Eye, Download, Copy, Trash2, Sparkles, FileImage } from "lucide-react";
import { mediaService } from "@/services/media.service";
import { toast } from "sonner";

interface MediaTableProps {
  initialFiles: MediaFile[];
  initialHasMore: boolean;
  onFilesChange?: (files: MediaFile[]) => void;
  onDelete?: (file: MediaFile) => void;
  onOptimize?: (file: MediaFile) => void;
}

export function MediaTable({
  initialFiles,
  initialHasMore,
  onFilesChange,
  onDelete,
  onOptimize,
}: MediaTableProps) {
  const [files, setFiles] = useState<MediaFile[]>(initialFiles);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<MediaFile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Sync files when initialFiles prop changes (e.g., after upload)
  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await mediaService.listFiles({
        limit: 100,
        offset: 0,
      });

      if (response.success && response.data) {
        setFiles(response.data.files);
        onFilesChange?.(response.data.files);
      } else {
        toast.error(response.error || "Failed to load files");
      }
    } catch (error) {
      console.error("Error loading files:", error);
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [onFilesChange]);

  const handleCopyUrl = useCallback(async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  }, []);

  const handleDelete = useCallback(
    async (file: MediaFile) => {
      try {
        const response = await mediaService.deleteFile(file.key);
        if (response.success) {
          setFiles((prev) => prev.filter((f) => f.key !== file.key));
          onDelete?.(file);
          toast.success("File deleted successfully!");
        } else {
          toast.error(response.error || "Failed to delete file");
        }
      } catch (error) {
        toast.error("Failed to delete file");
      }
    },
    [onDelete],
  );

  const handleBulkDelete = useCallback(async (rows: MediaFile[]) => {
    if (rows.length === 0) return;

    try {
      let deleted = 0;
      for (const file of rows) {
        const response = await mediaService.deleteFile(file.key);
        if (response.success) deleted++;
      }
      setFiles((prev) =>
        prev.filter((f) => !rows.some((r) => r.key === f.key)),
      );
      setSelectedRows([]);
      toast.success(`${deleted} file(s) deleted successfully!`);
    } catch {
      toast.error("Failed to delete some files");
    }
  }, []);

  const openDeleteDialog = useCallback(
    (file: MediaFile) => {
      handleDelete(file);
    },
    [handleDelete],
  );

  const openOptimizeDialog = useCallback(
    (file: MediaFile) => {
      const isImage =
        file.type?.startsWith("image/") ||
        file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
      if (!isImage) {
        toast.error("Only image files can be optimized");
        return;
      }
      onOptimize?.(file);
    },
    [onOptimize],
  );

  const filteredFiles = useMemo(() => {
    if (!searchTerm) return files;
    const term = searchTerm.toLowerCase();
    return files.filter(
      (file) =>
        file.name.toLowerCase().includes(term) ||
        file.type?.toLowerCase().includes(term),
    );
  }, [files, searchTerm]);

  const paginatedFiles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFiles.slice(start, start + pageSize);
  }, [filteredFiles, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredFiles.length / pageSize);

  const columns: Column<MediaFile>[] = useMemo(
    () => [
      {
        key: "preview",
        header: "Preview",
        cell: (file) => <FilePreview file={file} />,
        className: "w-16",
      },
      {
        key: "name",
        header: "File Name",
        cell: (file) => <FileNameCell file={file} />,
        sortable: true,
      },
      {
        key: "size",
        header: "Size",
        cell: (file) => <FileSizeCell file={file} />,
        sortable: true,
      },
      {
        key: "uploadedAt",
        header: "Uploaded",
        cell: (file) => <UploadDateCell file={file} />,
        sortable: true,
      },
      {
        key: "url",
        header: "URL",
        cell: (file) => <UrlCopyButton url={file.url} />,
      },
    ],
    [],
  );

  const actions: DataTableAction<MediaFile>[] = useMemo(
    () => [
      {
        label: "View",
        icon: <Eye className="h-4 w-4" />,
        onClick: (file) => window.open(file.url, "_blank"),
      },
      {
        label: "Optimize",
        icon: <Sparkles className="h-4 w-4" />,
        onClick: openOptimizeDialog,
      },
      {
        label: "Download",
        icon: <Download className="h-4 w-4" />,
        onClick: (file) => {
          const a = document.createElement("a");
          a.href = file.url;
          a.download = file.name;
          a.target = "_blank";
          a.click();
        },
      },
      {
        label: "Copy URL",
        icon: <Copy className="h-4 w-4" />,
        onClick: (file) => handleCopyUrl(file.url),
      },
      {
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: openDeleteDialog,
        variant: "destructive",
      },
    ],
    [openDeleteDialog, openOptimizeDialog, handleCopyUrl],
  );

  const bulkActions: BulkAction<MediaFile>[] = useMemo(
    () => [
      {
        label: "Delete Selected",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: handleBulkDelete,
        variant: "destructive",
      },
    ],
    [handleBulkDelete],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Files</CardTitle>
        <CardDescription>
          {files.length} file{files.length === 1 ? "" : "s"} total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={paginatedFiles}
          columns={columns}
          actions={actions}
          bulkActions={bulkActions}
          loading={loading}
          loadingText="Loading files..."
          emptyIcon={<FileImage className="h-8 w-8 text-gray-400" />}
          emptyTitle="No files found"
          emptyDescription="Upload your first file to get started."
          searchable
          searchPlaceholder="Search by name or type..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredFiles.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          selectable
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          getRowId={(file) => file.key}
          onRefresh={loadFiles}
        />
      </CardContent>
    </Card>
  );
}
