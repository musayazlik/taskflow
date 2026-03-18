import { Elysia, t } from "elysia";
import * as productService from "@api/services/product.service";
import { AppError } from "@api/lib/errors";
import {
  requireAdmin,
  parsePagination,
  paginatedResponse,
  successResponse,
} from "@api/lib/route-helpers";
import { FILE_UPLOAD_LIMITS } from "@api/constants";
import {
  ProductSchema,
  ProductWithPricesSchema,
  CreateProductSchema,
  UpdateProductSchema,
  ProductQuerySchema,
} from "@repo/types";

export const productsRoutes = new Elysia({ prefix: "/products" })
  .get(
    "/",
    async ({ query }) => {
      const { page, limit } = parsePagination(query);
      const params = {
        page,
        limit,
        includeArchived: query.includeArchived === "true",
        search: query.search,
        status: query.status || "all",
      };
      const result = await productService.getAllProducts(params);
      return paginatedResponse(
        result.products,
        result.total,
        result.page,
        result.limit,
      );
    },
    {
      query: ProductQuerySchema,
      detail: {
        tags: ["Products"],
        summary: "List all products",
        description: "Returns paginated list of products",
      },
      response: t.Object({
        success: t.Boolean(),
        data: t.Array(ProductSchema),
        meta: t.Object({
          total: t.Number(),
          page: t.Number(),
          limit: t.Number(),
          totalPages: t.Number(),
        }),
      }),
    },
  )

  .get(
    "/:id",
    async ({ params }) => {
      const product = await productService.getProductWithPrices(params.id);
      if (!product) {
        throw new AppError("PRODUCT_NOT_FOUND", "Product not found", 404);
      }
      return successResponse(product);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Products"],
        summary: "Get product by ID",
        description: "Returns a single product with prices",
      },
      response: t.Object({
        success: t.Boolean(),
        data: ProductWithPricesSchema,
      }),
    },
  )

  .post(
    "/",
    async ({ body, request: { headers } }) => {
      await requireAdmin(headers);
      const product = await productService.createProduct(body);
      return successResponse(product);
    },
    {
      body: CreateProductSchema,
      detail: {
        tags: ["Products"],
        summary: "Create product",
        description: "Creates a new product (admin only)",
      },
      response: t.Object({
        success: t.Boolean(),
        data: ProductSchema,
      }),
    },
  )

  .patch(
    "/:id",
    async ({ params, body, request: { headers } }) => {
      await requireAdmin(headers);
      const product = await productService.updateProduct(params.id, body);
      return successResponse(product);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: UpdateProductSchema,
      detail: {
        tags: ["Products"],
        summary: "Update product",
        description: "Updates a product (admin only)",
      },
      response: t.Object({
        success: t.Boolean(),
        data: ProductSchema,
      }),
    },
  )

  .delete(
    "/:id",
    async ({ params, request: { headers } }) => {
      await requireAdmin(headers);
      await productService.archiveProduct(params.id);
      return {
        success: true,
        message: "Product archived successfully",
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Products"],
        summary: "Archive product",
        description: "Archives a product (soft delete)",
      },
      response: t.Object({
        success: t.Boolean(),
        message: t.String(),
      }),
    },
  )

  .post(
    "/:id/sync",
    async ({ params, request: { headers } }) => {
      await requireAdmin(headers);
      const polarService = await import("@api/services/polar.service");
      await polarService.syncProductToPolar(params.id);

      const product = await productService.getProductWithPrices(params.id);
      if (!product) {
        throw new AppError("PRODUCT_NOT_FOUND", "Product not found", 404);
      }

      return {
        success: true,
        data: product,
        message: "Product synced to Polar",
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Products"],
        summary: "Sync product to Polar",
        description: "Syncs a product to Polar.sh for payment processing",
      },
      response: t.Object({
        success: t.Boolean(),
        data: ProductSchema,
        message: t.String(),
      }),
    },
  )

  .post(
    "/import-from-polar",
    async ({ request: { headers } }) => {
      await requireAdmin(headers);
      const polarService = await import("@api/services/polar.service");
      const result = await polarService.importPolarProducts();

      return {
        success: true,
        data: result,
        message: `${result.imported} products imported, ${result.updated} updated, ${result.skipped} skipped`,
      };
    },
    {
      detail: {
        tags: ["Products"],
        summary: "Import products from Polar",
        description: "Imports products from Polar.sh to local database",
      },
      response: t.Object({
        success: t.Boolean(),
        data: t.Object({
          imported: t.Number(),
          updated: t.Number(),
          skipped: t.Number(),
          products: t.Array(
            t.Object({
              id: t.String(),
              name: t.String(),
              externalProductId: t.String(),
            }),
          ),
        }),
        message: t.String(),
      }),
    },
  )

  .post(
    "/upload-media",
    async ({ body, request: { headers } }) => {
      await requireAdmin(headers);

      const file = body.file;
      if (!file) {
        throw new AppError("BAD_REQUEST", "File is required", 400);
      }

      if (!file.type.startsWith("image/")) {
        throw new AppError(
          "INVALID_FILE_TYPE",
          "Only image files are allowed",
          400,
        );
      }

      if (file.size > FILE_UPLOAD_LIMITS.MAX_SIZE_BYTES) {
        throw new AppError(
          "FILE_TOO_LARGE",
          `File size must be less than ${FILE_UPLOAD_LIMITS.MAX_SIZE_MB}MB`,
          400,
        );
      }

      const polarService = await import("@api/services/polar.service");
      const fileId = await polarService.uploadFile(file);

      return {
        success: true,
        data: { id: fileId },
        message: "File uploaded successfully",
      };
    },
    {
      body: t.Object({
        file: t.File(),
      }),
      detail: {
        tags: ["Products"],
        summary: "Upload product media",
        description:
          "Uploads an image/file to Polar for use in products. Accepts multipart/form-data.",
      },
      response: t.Object({
        success: t.Boolean(),
        data: t.Object({
          id: t.String(),
        }),
        message: t.String(),
      }),
    },
  )

  .post(
    "/get-media-info",
    async ({ body, request: { headers } }) => {
      await requireAdmin(headers);

      const { fileIds } = body;
      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        throw new AppError("BAD_REQUEST", "fileIds array is required", 400);
      }

      const polarService = await import("@api/services/polar.service");
      const fileInfos = await polarService.getFileInfos(fileIds);

      const responseData = fileInfos.map((fileInfo) => ({
        id: fileInfo.id,
        publicUrl: fileInfo.publicUrl,
        name: fileInfo.name,
        mimeType: fileInfo.mimeType,
        size: fileInfo.size,
      }));

      return successResponse(responseData);
    },
    {
      body: t.Object({
        fileIds: t.Array(t.String()),
      }),
      detail: {
        tags: ["Products"],
        summary: "Get Polar file information",
        description:
          "Gets file information (including publicUrl) from Polar by file IDs",
      },
      response: t.Object({
        success: t.Boolean(),
        data: t.Array(
          t.Object({
            id: t.String(),
            publicUrl: t.String(),
            name: t.String(),
            mimeType: t.String(),
            size: t.Number(),
          }),
        ),
      }),
    },
  );
