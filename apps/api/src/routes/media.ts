import { Elysia, t } from "elysia";
import { AppError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";
import {
	requireAdmin,
	successResponse,
	getSession,
} from "@api/lib/route-helpers";
import * as mediaService from "@api/services/media.service";
import { PAGINATION } from "@api/constants";
import { utapi } from "@api/lib/uploadthing";
import { prisma } from "@repo/database";

export const mediaRoutes = new Elysia({ prefix: "/media" })
	.get(
		"/",
		async ({ request: { headers }, query }) => {
			await requireAdmin(headers);

			const limit = query.limit
				? parseInt(query.limit)
				: PAGINATION.DEFAULT_LIMIT;
			const offset = query.offset
				? parseInt(query.offset)
				: PAGINATION.DEFAULT_OFFSET;

			const result = await mediaService.listFiles({ limit, offset });

			return {
				success: true,
				data: result.files,
				pagination: {
					limit,
					offset,
					hasMore: result.hasMore,
				},
			};
		},
		{
			query: t.Object({
				limit: t.Optional(t.String()),
				offset: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Media"],
				summary: "List all uploaded files",
				description: "Returns list of all files uploaded to UploadThing. Admin/SuperAdmin only.",
			},
		}
	)

	// Single file upload (admin only)
	.post(
		"/upload/single",
		async ({ request: { headers }, body }) => {
			const session = await requireAdmin(headers);

			const { file } = body;
			if (!file) {
				throw new AppError("VALIDATION_ERROR", "File is required", 400);
			}

			const result = await mediaService.uploadFile(
				{ file },
				session.user.id,
			);

			return successResponse(result, "File uploaded successfully");
		},
		{
			body: t.Object({
				file: t.File(),
			}),
			detail: {
				tags: ["Media"],
				summary: "Upload a single file",
				description: "Upload a single file with automatic optimization. Admin/SuperAdmin only.",
			},
		}
	)

	.delete(
		"/:key",
		async ({ request: { headers }, params }) => {
			await requireAdmin(headers);

			await mediaService.deleteFile(params.key);

			return {
				success: true,
				message: "File deleted successfully",
			};
		},
		{
			params: t.Object({
				key: t.String(),
			}),
			detail: {
				tags: ["Media"],
				summary: "Delete a file",
				description: "Delete a file from UploadThing by its key. Admin/SuperAdmin only.",
			},
		}
	)
	
	.post(
		"/sync",
		async ({ request: { headers } }) => {
			await requireAdmin(headers);

			const result = await mediaService.syncFilesFromUploadThing();

			return {
				success: true,
				message: `Synced: +${result.added} added, -${result.removed} removed`,
				data: result,
			};
		},
		{
			detail: {
				tags: ["Media"],
				summary: "Sync files from UploadThing",
				description: "Bi-directional sync: Adds files that exist in UploadThing but not in DB, removes files that exist in DB but not in UploadThing. Admin/SuperAdmin only.",
			},
		}
	)

	.post(
		"/:key/optimize",
		async ({ request: { headers }, params, body }) => {
			await requireAdmin(headers);

			const result = await mediaService.optimizeImage(params.key, {
				quality: body.quality,
				format: body.format,
				maxWidth: body.maxWidth,
				maxHeight: body.maxHeight,
			});

			return successResponse(result, "Image optimized successfully");
		},
		{
			params: t.Object({
				key: t.String(),
			}),
			body: t.Object({
				quality: t.Optional(t.Number()),
				format: t.Optional(t.Union([t.Literal("webp"), t.Literal("jpeg"), t.Literal("png"), t.Literal("original")])),
				maxWidth: t.Optional(t.Number()),
				maxHeight: t.Optional(t.Number()),
			}),
			detail: {
				tags: ["Media"],
				summary: "Optimize an image",
				description: "Optimize an existing image with custom settings (quality, format, dimensions). Admin/SuperAdmin only.",
			},
		}
	)

	// File upload endpoint (replaces UploadThing endpoint)
	.post(
		"/upload",
		async ({ request: { headers }, body }) => {
			const session = await getSession(headers);

			const { files } = body;
			if (!files || files.length === 0) {
				throw new AppError("VALIDATION_ERROR", "No files provided", 400);
			}

			try {
				const uploadResults = await Promise.all(
					files.map(async (file: File) => {
						// Use mediaService.uploadFile for automatic optimization
						const result = await mediaService.uploadFile(
							{ file },
							session?.user?.id || "system",
						);

						return {
							id: result.id,
							name: result.name,
							size: result.size,
							key: result.key,
							url: result.url,
							type: result.mimeType,
							uploadedAt: new Date().getTime(),
						};
					}),
				);

				return uploadResults;
			} catch (error) {
				if (error instanceof AppError) throw error;
				logger.error({ err: error }, "Upload error");
				throw new AppError("UPLOAD_ERROR", "Failed to upload files", 500);
			}
		},
		{
			body: t.Object({
				files: t.Files(),
			}),
			detail: {
				tags: ["Media"],
				summary: "Upload files",
				description: "Upload files with automatic optimization and save to database",
			},
		},
	);
