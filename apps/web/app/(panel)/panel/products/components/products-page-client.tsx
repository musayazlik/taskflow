"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
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
  Plus,
  Pencil,
  Archive,
  Loader2,
  Package,
  Eye,
  Upload,
  Filter,
  DollarSign,
  Star,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/shadcn-ui/select";
import { productService, type Product } from "@/services";
import { toast } from "sonner";
import {
  DataTable,
  type Column,
  type DataTableAction,
  type BulkAction,
} from "@/components/data-table";
import { PageHeader } from "@/components/panel/page-header";
import { cn } from "@/lib/utils";
import { ImageZoom } from "@repo/shadcn-ui/image-zoom";
import { ProductTypeBadge, StatusBadge } from "./atoms";
import { formatPrice } from "./utils";

interface ProductsPageClientProps {
  initialProducts: Product[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  initialTotalPages: number;
}

export function ProductsPageClient({
  initialProducts,
  initialTotal,
  initialPage,
  initialPageSize,
  initialTotalPages,
}: ProductsPageClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [archiving, setArchiving] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<Product[]>([]);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [productToArchive, setProductToArchive] = useState<Product | null>(
    null,
  );

  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "archived"
  >("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
        page: currentPage,
        limit: pageSize,
        status: statusFilter,
        search: searchTerm || undefined,
        includeArchived: true,
      });
      if (response.success && response.data) {
        setProducts(response.data.data || []);
        setTotal(response.data.meta?.total ?? 0);
        setTotalPages(response.data.meta?.totalPages ?? 1);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, statusFilter]);

  useEffect(() => {
    setProducts(initialProducts);
    setTotal(initialTotal);
    setTotalPages(initialTotalPages);
  }, [initialProducts, initialTotal, initialTotalPages]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Stats calculations
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => !p.isArchived).length;
    const subscriptionProducts = products.filter((p) => p.isRecurring).length;
    const oneTimeProducts = products.filter((p) => !p.isRecurring).length;

    // Calculate total revenue potential (sum of all prices)
    let totalRevenue = 0;
    products.forEach((p) => {
      if (p.prices && p.prices.length > 0) {
        p.prices.forEach((price) => {
          totalRevenue += price.priceAmount / 100;
        });
      }
    });

    return {
      totalProducts,
      activeProducts,
      subscriptionProducts,
      oneTimeProducts,
      totalRevenue,
    };
  }, [products]);

  const handleArchive = async (product: Product) => {
    try {
      setArchiving(product.id);
      const response = await productService.archiveProduct(product.id);

      if (!response.success) {
        toast.error(response.error || "Failed to archive product");
        return;
      }

      toast.success("Product archived successfully");
      await loadProducts();
    } catch (error) {
      toast.error("Failed to archive product");
    } finally {
      setArchiving(null);
      setArchiveDialogOpen(false);
      setProductToArchive(null);
    }
  };

  const handleBulkArchive = useCallback(
    async (rows: Product[]) => {
      const activeProducts = rows.filter((p) => !p.isArchived);
      if (activeProducts.length === 0) {
        toast.error("No active products to archive");
        return;
      }

      try {
        for (const product of activeProducts) {
          await productService.archiveProduct(product.id);
        }
        toast.success(`${activeProducts.length} products archived`);
        setSelectedRows([]);
        await loadProducts();
      } catch {
        toast.error("Failed to archive products");
      }
    },
    [loadProducts],
  );

  const handleImportFromPolar = async () => {
    try {
      setImporting(true);
      const response = await productService.importFromPolar();

      if (!response.success) {
        toast.error(response.error || "Import failed");
        return;
      }

      toast.success(response.message || "Products imported successfully");
      await loadProducts();
    } catch (error) {
      toast.error("Failed to import products");
    } finally {
      setImporting(false);
    }
  };

  const openArchiveDialog = useCallback((product: Product) => {
    setProductToArchive(product);
    setArchiveDialogOpen(true);
  }, []);

  // DataTable columns
  const columns: Column<Product>[] = useMemo(
    () => [
      {
        key: "product",
        header: "Product",
        cell: (product) => (
          <div className="flex items-center gap-3">
            {(() => {
              if (
                !product.medias ||
                !Array.isArray(product.medias) ||
                product.medias.length === 0
              ) {
                return (
                  <div className="w-12 h-12 bg-linear-to-br from-gray-100 to-gray-50 dark:from-zinc-800 dark:to-zinc-900 rounded-xl flex items-center justify-center ring-1 ring-gray-200 dark:ring-zinc-700">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                );
              }

              const firstMedia = product.medias[0];
              let imageUrl: string | null = null;

              if (typeof firstMedia === "string") {
                imageUrl = firstMedia;
              } else if (
                typeof firstMedia === "object" &&
                firstMedia !== null
              ) {
                if ("public_url" in firstMedia && firstMedia.public_url) {
                  imageUrl = String(firstMedia.public_url);
                } else if ("id" in firstMedia && firstMedia.id) {
                  imageUrl = String(firstMedia.id);
                }
              }

              const isValidUrl =
                imageUrl &&
                typeof imageUrl === "string" &&
                (imageUrl.startsWith("http://") ||
                  imageUrl.startsWith("https://"));

              return isValidUrl && imageUrl ? (
                <ImageZoom>
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 ring-1 ring-gray-200 dark:ring-zinc-700 flex-shrink-0 cursor-zoom-in">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                      loading="lazy"
                      unoptimized={true}
                      sizes="48px"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                </ImageZoom>
              ) : (
                <div className="w-12 h-12 bg-linear-to-br from-gray-100 to-gray-50 dark:from-zinc-800 dark:to-zinc-900 rounded-xl flex items-center justify-center ring-1 ring-gray-200 dark:ring-zinc-700">
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
              );
            })()}
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {product.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                {product.description || "No description"}
              </p>
            </div>
          </div>
        ),
        className: "min-w-[280px]",
      },
      {
        key: "type",
        header: "Type",
        cell: (product) => (
          <ProductTypeBadge isRecurring={product.isRecurring} />
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (product) => <StatusBadge isArchived={product.isArchived} />,
      },
      {
        key: "prices",
        header: "Prices",
        cell: (product) => {
          if (!product.prices || product.prices.length === 0) {
            return <span className="text-gray-400">-</span>;
          }

          return (
            <div className="space-y-1">
              {product.prices.slice(0, 2).map((price, index) => (
                <div
                  key={price.id || `price-${product.id}-${index}`}
                  className="flex items-center gap-1"
                >
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatPrice(price)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                    {price.priceCurrency}
                  </span>
                </div>
              ))}
              {product.prices.length > 2 && (
                <span className="text-xs text-primary font-medium">
                  +{product.prices.length - 2} more
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "created",
        header: "Created",
        cell: (product) => {
          const date = product.createdAt ? new Date(product.createdAt) : null;
          if (!date) return <span className="text-gray-400">-</span>;
          return (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {date.toLocaleDateString("en-US")}
            </div>
          );
        },
      },
    ],
    [],
  );

  // DataTable actions
  const actions: DataTableAction<Product>[] = useMemo(
    () => [
      {
        label: "View Details",
        icon: <Eye className="h-4 w-4" />,
        onClick: (product) => {
          window.location.href = `/panel/products/${product.id}/edit`;
        },
      },
      {
        label: "Edit Product",
        icon: <Pencil className="h-4 w-4" />,
        onClick: (product) => {
          window.location.href = `/panel/products/${product.id}/edit`;
        },
        disabled: (product) => product.isArchived || false,
      },
      {
        label: "Archive Product",
        icon: <Archive className="h-4 w-4" />,
        onClick: openArchiveDialog,
        variant: "destructive",
        disabled: (product) => product.isArchived || archiving === product.id,
      },
    ],
    [openArchiveDialog, archiving],
  );

  // Bulk actions
  const bulkActions: BulkAction<Product>[] = useMemo(
    () => [
      {
        label: "Archive Selected",
        icon: <Archive className="h-4 w-4" />,
        onClick: handleBulkArchive,
        variant: "destructive",
      },
    ],
    [handleBulkArchive],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Package}
        title="Products"
        description="Manage your products and subscriptions"
        actions={[
          {
            label: "Import from Polar",
            icon: importing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            ),
            onClick: handleImportFromPolar,
            variant: "outline",
            disabled: importing,
            loading: importing,
          },
          {
            label: "New Product",
            icon: <Plus className="h-4 w-4" />,
            href: "/panel/products/new",
          },
        ]}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden bg-linear-to-br from-blue-500/10 to-cyan-500/5 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-linear-to-br from-white/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Package className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-linear-to-br from-green-500/10 to-emerald-500/5 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-linear-to-br from-white/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-500/20">
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              $
              {stats.totalRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-linear-to-br from-emerald-500/10 to-teal-500/5 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-linear-to-br from-white/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Products
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Star className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeProducts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              {total} product{total === 1 ? "" : "s"} total
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as "all" | "active" | "archived");
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={products}
            columns={columns}
            actions={actions}
            bulkActions={bulkActions}
            loading={loading}
            loadingText="Loading products..."
            emptyIcon={<Package className="h-8 w-8 text-gray-400" />}
            emptyTitle="No products found"
            emptyDescription="Create your first product or import from Polar"
            searchable={true}
            searchPlaceholder="Search by product name or description..."
            searchValue={searchTerm}
            onSearchChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            pagination={true}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            selectable={true}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            getRowId={(row) => row.id}
            onRefresh={loadProducts}
          />
        </CardContent>
      </Card>

      {/* Archive Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive &quot;{productToArchive?.name}
              &quot;? This product will no longer be available for purchase.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                productToArchive && handleArchive(productToArchive)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {archiving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Archive className="h-4 w-4 mr-2" />
              )}
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
