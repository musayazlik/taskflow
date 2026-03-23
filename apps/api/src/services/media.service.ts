/**
 * Media Service
 * Unified service for file uploads, media management, and settings
 */

import { prisma } from "@repo/database";
import type { MediaFile } from "@repo/database";
import { AppError } from "@api/lib/errors";
import { isAdminRole, type RequesterContext } from "@api/lib/auth-roles";
import { logger } from "@api/lib/logger";
import { getUtapi } from "@api/lib/uploadthing";
import { optimizeImage as optimizeImageUtil, maybeOptimizeImage } from "@api/lib/utils";
import {
	FileProvider,
	FileServiceFactory,
	type UploadResult,
} from "@api/lib/file-service";
import { MEDIA_UPLOAD_DEFAULTS } from "@api/constants";
import type { ImageOptimizationSettingsDTO } from "@repo/types";

// ============================================
// Types
// ============================================

export interface UploadFileOptions {
	file: File;
	folder?: string;
	preferredProvider?: FileProvider;
	metadata?: Record<string, string>;
}

export interface FileListOptions {
	limit?: number;
	offset?: number;
	folder?: string;
}

export interface MediaUploadSettingsDTO {
	maxFileSize: number;
	maxFileCount: number;
	allowedMimeTypes: string[];
}

export interface OptimizeImageOptions {
	quality?: number;
	format?: "webp" | "jpeg" | "png" | "original";
	maxWidth?: number;
	maxHeight?: number;
}

// ============================================
// Media file authorization
// ============================================

function assertCanManageMediaFile(
	fileRecord: Pick<MediaFile, "uploadedBy">,
	requester: RequesterContext,
): void {
	if (isAdminRole(requester.role)) {
		return;
	}
	if (fileRecord.uploadedBy === null) {
		throw new AppError(
			"FORBIDDEN",
			"Only administrators can manage this file",
			403,
		);
	}
	if (fileRecord.uploadedBy !== requester.userId) {
		throw new AppError(
			"FORBIDDEN",
			"You can only manage your own files",
			403,
		);
	}
}

/**
 * Resolve DB record and canonical key (same heuristics as delete).
 */
async function resolveMediaFileKeyAndRecord(
	inputKey: string,
): Promise<{ key: string; record: MediaFile | null }> {
	let fileKey = inputKey;
	let fileRecord = await prisma.mediaFile.findUnique({
		where: { key: fileKey },
	});

	if (!fileRecord && fileKey.includes("utfs.io")) {
		const urlMatch = fileKey.match(/utfs\.io\/f\/([^/?#]+)/);
		if (urlMatch?.[1]) {
			const extractedKey = urlMatch[1];
			fileRecord = await prisma.mediaFile.findUnique({
				where: { key: extractedKey },
			});
			if (fileRecord) {
				fileKey = extractedKey;
			}
		}
	}

	if (!fileRecord) {
		fileRecord = await prisma.mediaFile.findFirst({
			where: {
				OR: [{ key: fileKey }, { url: { contains: fileKey } }],
			},
		});
		if (fileRecord) {
			fileKey = fileRecord.key;
		}
	}

	return { key: fileKey, record: fileRecord };
}

async function deleteProviderOnly(fileKey: string): Promise<void> {
	const provider = FileServiceFactory.getProvider(FileProvider.UPLOADTHING);
	logger.warn(
		{ fileKey },
		"File not found in database, attempting to delete from provider",
	);
	const deleted = await provider.delete(fileKey);
	if (deleted) {
		logger.info(
			{ fileKey },
			"File deleted from provider (was not in database)",
		);
		return;
	}
	throw new AppError("FILE_NOT_FOUND", `File not found: ${fileKey}`, 404);
}

async function deleteProviderAndDbRecord(fileRecord: MediaFile): Promise<void> {
	const provider = FileServiceFactory.getProvider(FileProvider.UPLOADTHING);
	const deleted = await provider.delete(fileRecord.key);
	if (!deleted) {
		logger.warn(
			{ fileKey: fileRecord.key },
			"Failed to delete from storage provider",
		);
	}
	await prisma.mediaFile.delete({
		where: { key: fileRecord.key },
	});
	logger.info(
		{ fileKey: fileRecord.key, fileName: fileRecord.name },
		"File deleted successfully",
	);
}

// ============================================
// File Upload Operations
// ============================================

/**
 * Upload a file with automatic or manual provider selection
 * Automatically optimizes images before upload if optimization is enabled
 */
export const uploadFile = async (
	options: UploadFileOptions,
	userId: string,
): Promise<UploadResult> => {
	const { file, folder, preferredProvider, metadata } = options;

	try {
		// Read file buffer for optimization
		const arrayBuffer = await file.arrayBuffer();
		let fileToUpload = file;
		let bufferToUse = arrayBuffer;

		// Optimize image if it's an image file
		if (file.type?.startsWith("image/")) {
			try {
				const optimized = await maybeOptimizeImage(file, arrayBuffer);
				if (optimized.optimized) {
					fileToUpload = optimized.file;
					bufferToUse = optimized.buffer;
					logger.info(
						{
							originalSize: file.size,
							optimizedSize: optimized.file.size,
							reduction: `${Math.round((1 - optimized.file.size / file.size) * 100)}%`,
							fileName: file.name,
						},
						"Image optimized before upload",
					);
				}
			} catch (error) {
				logger.warn(
					{ err: error, fileName: file.name },
					"Image optimization failed, uploading original",
				);
				// Continue with original file if optimization fails
			}
		}

		// Determine provider based on file type or preference
		const provider = FileServiceFactory.getProviderForFile(
			fileToUpload.type,
			preferredProvider,
		);

		if (!provider.isConfigured()) {
			throw new AppError(
				"PROVIDER_NOT_CONFIGURED",
				`Storage provider ${provider.name} is not configured`,
				500,
			);
		}

		// Upload to selected provider
		const result = await provider.upload({
			file: fileToUpload,
			fileName: fileToUpload.name,
			folder,
			mimeType: fileToUpload.type,
			metadata: {
				...metadata,
				uploadedBy: userId,
			},
		});

		// Save to database
		await prisma.mediaFile.create({
			data: {
				key: result.key,
				name: result.name,
				url: result.url,
				size: result.size,
				type: fileToUpload.type,
				uploadedBy: userId,
				folder,
			},
		});

		return result;
	} catch (error) {
		if (error instanceof AppError) throw error;
		logger.error({ err: error }, "Error uploading file");
		throw new AppError("UPLOAD_ERROR", "Failed to upload file", 500);
	}
};

/**
 * Upload profile image (simplified version using UploadThing directly)
 * Automatically optimizes image before upload if optimization is enabled
 */
export const uploadProfileImage = async (
	file: File,
	userId: string,
): Promise<UploadResult> => {
	try {
		// Read file buffer for optimization
		const arrayBuffer = await file.arrayBuffer();
		let fileToUpload = file;

		// Optimize image if it's an image file
		if (file.type?.startsWith("image/")) {
			try {
				const optimized = await maybeOptimizeImage(file, arrayBuffer);
				if (optimized.optimized) {
					fileToUpload = optimized.file;
					logger.info(
						{
							originalSize: file.size,
							optimizedSize: optimized.file.size,
							reduction: `${Math.round((1 - optimized.file.size / file.size) * 100)}%`,
							fileName: file.name,
							userId,
						},
						"Profile image optimized before upload",
					);
				}
			} catch (error) {
				logger.warn(
					{ err: error, fileName: file.name, userId },
					"Profile image optimization failed, uploading original",
				);
				// Continue with original file if optimization fails
			}
		}

		const response = await getUtapi().uploadFiles(fileToUpload);

		if (response.error) {
			throw new AppError("UPLOAD_ERROR", response.error.message, 500);
		}

		const { data } = response;
		if (!data) {
			throw new AppError("UPLOAD_ERROR", "Upload failed", 500);
		}

		await prisma.user.update({
			where: { id: userId },
			data: { image: data.ufsUrl || data.url },
		});

		return {
			id: data.key,
			url: data.ufsUrl || data.url,
			key: data.key,
			name: data.name,
			size: data.size,
			mimeType: fileToUpload.type,
		};
	} catch (error) {
		if (error instanceof AppError) throw error;
		logger.error({ err: error, userId }, "Error uploading profile image");
		throw new AppError("UPLOAD_ERROR", "Failed to upload image", 500);
	}
};

/**
 * Delete a file from both provider and database (enforces owner-or-admin rules).
 */
export const deleteFile = async (
	fileKey: string,
	requester: RequesterContext,
): Promise<void> => {
	try {
		const { key, record } = await resolveMediaFileKeyAndRecord(fileKey);
		if (!record) {
			if (!isAdminRole(requester.role)) {
				throw new AppError(
					"FORBIDDEN",
					"You do not have permission to delete this file",
					403,
				);
			}
			await deleteProviderOnly(key);
			return;
		}
		assertCanManageMediaFile(record, requester);
		await deleteProviderAndDbRecord(record);
	} catch (error) {
		if (error instanceof AppError) throw error;
		logger.error({ err: error, fileKey }, "Error deleting file");
		throw new AppError("DELETE_ERROR", "Failed to delete file", 500);
	}
};

/**
 * Delete profile image
 */
export const deleteProfileImage = async (userId: string): Promise<void> => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { image: true },
		});

		if (user?.image) {
			const urlMatch = user.image.match(/utfs\.io\/f\/([^/]+)/);
			if (urlMatch?.[1]) {
				const { key, record } = await resolveMediaFileKeyAndRecord(
					urlMatch[1],
				);
				if (!record) {
					await deleteProviderOnly(key);
				} else {
					await deleteProviderAndDbRecord(record);
				}
			}
		}

		await prisma.user.update({
			where: { id: userId },
			data: { image: null },
		});
	} catch (error) {
		if (error instanceof AppError) throw error;
		logger.error({ err: error, userId }, "Error deleting profile image");
		throw new AppError("DELETE_ERROR", "Failed to delete profile image", 500);
	}
};

/**
 * Get file details
 */
export const getFile = async (fileKey: string) => {
	try {
		const file = await prisma.mediaFile.findUnique({
			where: { key: fileKey },
			include: {
				uploader: {
					select: { id: true, name: true, email: true },
				},
			},
		});

		if (!file) {
			throw new AppError("FILE_NOT_FOUND", "File not found", 404);
		}

		// Get fresh URL from provider (in case it changed)
		const provider = FileServiceFactory.getProvider(FileProvider.UPLOADTHING);
		const url = provider.getUrl(file.key);

		return {
			...file,
			url,
		};
	} catch (error) {
		if (error instanceof AppError) throw error;
		logger.error({ err: error, fileKey }, "Error getting file");
		throw new AppError("GET_FILE_ERROR", "Failed to get file", 500);
	}
};

/**
 * Get file info from UploadThing
 */
export const getFileInfo = async (fileKey: string) => {
	try {
		const files = await getUtapi().getFileUrls(fileKey);
		return files.data[0] || null;
	} catch (error) {
		logger.error({ err: error, fileKey }, "Error getting file info");
		return null;
	}
};

/**
 * List files with pagination and filtering
 */
export const listFiles = async (options?: FileListOptions) => {
	try {
		const { limit = 50, offset = 0, folder } = options || {};

		const where: any = {};
		if (folder) where.folder = folder;

		const [files, total] = await Promise.all([
			prisma.mediaFile.findMany({
				where,
				take: limit,
				skip: offset,
				orderBy: { uploadedAt: "desc" },
				include: {
					uploader: {
						select: { id: true, name: true, email: true },
					},
				},
			}),
			prisma.mediaFile.count({ where }),
		]);

		return {
			files: files.map((file) => ({
				id: file.id,
				key: file.key,
				name: file.name,
				size: file.size,
				uploadedAt: file.uploadedAt.getTime(),
				url: file.url,
				type: file.type || "unknown",
				uploadedBy: file.uploadedBy,
				uploader: file.uploader,
				tags: file.tags,
				folder: file.folder,
			})),
			hasMore: offset + files.length < total,
			total,
		};
	} catch (error) {
		logger.error({ err: error, options }, "Error listing files");
		throw new AppError("LIST_ERROR", "Failed to list files", 500);
	}
};

/**
 * Sync UploadThing files with database (bi-directional)
 * - Adds files that exist in UploadThing but not in DB
 * - Removes files that exist in DB but not in UploadThing
 */
export const syncFilesFromUploadThing = async (): Promise<{
	added: number;
	removed: number;
	errors: string[];
}> => {
	try {
		// Get all files from UploadThing
		const utFiles = await getUtapi().listFiles({ limit: 500 });
		const utKeys = new Set(utFiles.files.map((f) => f.key));

		// Get all file keys from database
		const dbFiles = await prisma.mediaFile.findMany({
			select: { key: true, name: true },
		});
		const dbKeys = new Set(dbFiles.map((f) => f.key));

		let added = 0;
		let removed = 0;
		const errors: string[] = [];

		// 1. Add files that exist in UploadThing but not in DB
		const missingFiles = utFiles.files.filter((file) => !dbKeys.has(file.key));
		for (const file of missingFiles) {
			try {
				await prisma.mediaFile.create({
					data: {
						key: file.key,
						name: file.name,
						size: file.size,
						url:
							(file as any).ufsUrl ||
							(file as any).url ||
							`https://utfs.io/f/${file.key}`,
						type: (file as any).type || null,
					},
				});
				added++;
			} catch (error) {
				logger.error(
					{ err: error, fileKey: file.key, fileName: file.name },
					"Error adding file",
				);
				errors.push(`Failed to add ${file.name}: ${error}`);
			}
		}

		// 2. Remove files that exist in DB but not in UploadThing
		const orphanedFiles = dbFiles.filter((file) => !utKeys.has(file.key));
		for (const file of orphanedFiles) {
			try {
				await prisma.mediaFile.delete({
					where: { key: file.key },
				});
				removed++;
			} catch (error) {
				logger.error(
					{ err: error, fileKey: file.key, fileName: file.name },
					"Error removing file",
				);
				errors.push(`Failed to remove ${file.name}: ${error}`);
			}
		}

		return { added, removed, errors };
	} catch (error) {
		logger.error({ err: error }, "Error syncing files");
		throw new AppError("SYNC_ERROR", "Failed to sync files", 500);
	}
};

/**
 * Optimize an image with custom settings
 */
export const optimizeImage = async (
	fileKey: string,
	options: OptimizeImageOptions,
): Promise<UploadResult> => {
	try {
		// Get file from database
		const dbFile = await prisma.mediaFile.findUnique({
			where: { key: fileKey },
		});

		if (!dbFile) {
			throw new AppError("FILE_NOT_FOUND", "File not found in database", 404);
		}

		// Fetch the image
		const response = await fetch(dbFile.url);
		if (!response.ok) {
			throw new AppError("FETCH_ERROR", "Failed to fetch image", 500);
		}

		const arrayBuffer = await response.arrayBuffer();
		const blob = new Blob([arrayBuffer], { type: dbFile.type || "image/jpeg" });
		const originalFile = new File([blob], dbFile.name, { type: blob.type });

		// Optimize the image
		const optimizedFile = await optimizeImageUtil(originalFile, arrayBuffer, {
			quality: options.quality,
			format: options.format === "original" ? undefined : options.format,
			maxWidth: options.maxWidth,
			maxHeight: options.maxHeight,
		});

		// Upload optimized image
		const uploadResult = await uploadFile(
			{ file: optimizedFile },
			dbFile.uploadedBy || "system",
		);

		// Check if new key already exists in database
		const existingFile = await prisma.mediaFile.findUnique({
			where: { key: uploadResult.key },
		});

		// Use transaction to ensure data consistency
		await prisma.$transaction(async (tx) => {
			if (existingFile && existingFile.id !== dbFile.id) {
				// New key exists for a different file - delete the old record
				// and update the current record
				await tx.mediaFile.delete({
					where: { key: uploadResult.key },
				});
			}

			// Update current record with new optimized file data
			await tx.mediaFile.update({
				where: { key: fileKey },
				data: {
					key: uploadResult.key,
					name: uploadResult.name,
					size: uploadResult.size,
					url: uploadResult.url,
					type: optimizedFile.type || dbFile.type,
				},
			});
		});

		// Optionally delete old file from UploadThing
		try {
			await getUtapi().deleteFiles(fileKey);
		} catch (error) {
			logger.warn(
				{ err: error, fileKey },
				"Failed to delete old file after optimization",
			);
		}

		return uploadResult;
	} catch (error) {
		if (error instanceof AppError) throw error;
		logger.error({ err: error, fileKey, options }, "Error optimizing image");
		throw new AppError("OPTIMIZE_ERROR", "Failed to optimize image", 500);
	}
};

/**
 * Get available providers
 */
export const getAvailableProviders = () => {
	return FileServiceFactory.getConfiguredProviders().map((p) => ({
		id: p.provider,
		name: p.name,
		configured: p.isConfigured(),
	}));
};

/**
 * Migrate file between providers
 */
export const migrateFile = async (
	fileKey: string,
	targetProvider: FileProvider,
	requester: RequesterContext,
): Promise<UploadResult> => {
	try {
		// Get current file info
		const fileRecord = await prisma.mediaFile.findUnique({
			where: { key: fileKey },
		});

		if (!fileRecord) {
			throw new AppError("FILE_NOT_FOUND", "File not found", 404);
		}

		assertCanManageMediaFile(fileRecord, requester);

		// Get source and target providers
		const sourceProvider = FileServiceFactory.getProvider(
			FileProvider.UPLOADTHING,
		);
		const target = FileServiceFactory.getProvider(targetProvider);

		// Download from source
		const response = await fetch(fileRecord.url);
		if (!response.ok) {
			throw new AppError("DOWNLOAD_FAILED", "Failed to download file", 500);
		}

		const buffer = Buffer.from(await response.arrayBuffer());

		// Upload to target
		const result = await target.upload({
			file: buffer,
			fileName: fileRecord.name,
			folder: fileRecord.folder || undefined,
			mimeType: fileRecord.type || undefined,
			metadata: {
				migratedFrom: FileProvider.UPLOADTHING,
				originalKey: fileRecord.key,
			},
		});

		// Delete from source
		await sourceProvider.delete(fileKey);

		// Update database
		await prisma.mediaFile.update({
			where: { key: fileKey },
			data: {
				key: result.key,
				url: result.url,
			},
		});

		return result;
	} catch (error) {
		if (error instanceof AppError) throw error;
		logger.error({ err: error, fileKey, targetProvider }, "Error migrating file");
		throw new AppError("MIGRATE_ERROR", "Failed to migrate file", 500);
	}
};

// ============================================
// Image Optimization Settings
// ============================================

/**
 * Get image optimization settings
 */
export async function getImageOptimizationSettings(): Promise<ImageOptimizationSettingsDTO> {
	try {
		let settings = await prisma.imageOptimizationSettings.findFirst();

		if (!settings) {
			// Create default settings with optimization enabled
			settings = await prisma.imageOptimizationSettings.create({
				data: {
					enabled: true, // Enable by default
					maxWidth: 1920, // Max width for modern displays
					maxHeight: 1920, // Max height for modern displays
					quality: 85, // Good quality with reasonable file size
					format: "webp", // Modern format with better compression
				},
			});
		}

		return {
			enabled: settings.enabled,
			maxWidth: settings.maxWidth,
			maxHeight: settings.maxHeight,
			quality: settings.quality,
			format: settings.format,
		};
	} catch (error) {
		logger.error({ err: error }, "Error fetching image optimization settings");
		throw new AppError(
			"IMAGE_OPT_SETTINGS_FETCH_ERROR",
			"Failed to fetch image optimization settings",
			500,
		);
	}
}

/**
 * Update image optimization settings
 */
export async function updateImageOptimizationSettings(
	data: Partial<ImageOptimizationSettingsDTO>,
): Promise<ImageOptimizationSettingsDTO> {
	try {
		let existing = await prisma.imageOptimizationSettings.findFirst();

		if (!existing) {
			existing = await prisma.imageOptimizationSettings.create({
				data: {
					enabled: false,
					maxWidth: null,
					maxHeight: null,
					quality: null,
					format: null,
				},
			});
		}

		const updated = await prisma.imageOptimizationSettings.update({
			where: { id: existing.id },
			data: {
				enabled:
					typeof data.enabled === "boolean" ? data.enabled : existing.enabled,
				maxWidth:
					data.maxWidth !== undefined ? data.maxWidth : existing.maxWidth,
				maxHeight:
					data.maxHeight !== undefined ? data.maxHeight : existing.maxHeight,
				quality: data.quality !== undefined ? data.quality : existing.quality,
				format: data.format !== undefined ? data.format : existing.format,
			},
		});

		return {
			enabled: updated.enabled,
			maxWidth: updated.maxWidth,
			maxHeight: updated.maxHeight,
			quality: updated.quality,
			format: updated.format,
		};
	} catch (error) {
		logger.error({ err: error }, "Error updating image optimization settings");
		throw new AppError(
			"IMAGE_OPT_SETTINGS_UPDATE_ERROR",
			"Failed to update image optimization settings",
			500,
		);
	}
}

// ============================================
// Media Upload Settings
// ============================================

/**
 * Get media upload settings
 */
export async function getMediaUploadSettings(): Promise<MediaUploadSettingsDTO> {
	try {
		let settings = await prisma.mediaUploadSettings.findFirst();

		if (!settings) {
			settings = await prisma.mediaUploadSettings.create({
				data: {
					maxFileSize: MEDIA_UPLOAD_DEFAULTS.MAX_FILE_SIZE,
					maxFileCount: MEDIA_UPLOAD_DEFAULTS.MAX_FILE_COUNT,
					allowedMimeTypes: [...MEDIA_UPLOAD_DEFAULTS.ALLOWED_MIME_TYPES],
				},
			});
		}

		return {
			maxFileSize: settings.maxFileSize,
			maxFileCount: settings.maxFileCount,
			allowedMimeTypes: settings.allowedMimeTypes,
		};
	} catch (error) {
		logger.error({ err: error }, "Error fetching media upload settings");
		throw new AppError(
			"MEDIA_UPLOAD_SETTINGS_FETCH_ERROR",
			"Failed to fetch media upload settings",
			500,
		);
	}
}

/**
 * Update media upload settings
 */
export async function updateMediaUploadSettings(
	data: Partial<MediaUploadSettingsDTO>,
): Promise<MediaUploadSettingsDTO> {
	try {
		let existing = await prisma.mediaUploadSettings.findFirst();

		if (!existing) {
			existing = await prisma.mediaUploadSettings.create({
				data: {
					maxFileSize: MEDIA_UPLOAD_DEFAULTS.MAX_FILE_SIZE,
					maxFileCount: MEDIA_UPLOAD_DEFAULTS.MAX_FILE_COUNT,
					allowedMimeTypes: [...MEDIA_UPLOAD_DEFAULTS.ALLOWED_MIME_TYPES],
				},
			});
		}

		const updated = await prisma.mediaUploadSettings.update({
			where: { id: existing.id },
			data: {
				maxFileSize:
					data.maxFileSize !== undefined
						? data.maxFileSize
						: existing.maxFileSize,
				maxFileCount:
					data.maxFileCount !== undefined
						? data.maxFileCount
						: existing.maxFileCount,
				allowedMimeTypes:
					data.allowedMimeTypes !== undefined
						? data.allowedMimeTypes
						: existing.allowedMimeTypes,
			},
		});

		return {
			maxFileSize: updated.maxFileSize,
			maxFileCount: updated.maxFileCount,
			allowedMimeTypes: updated.allowedMimeTypes,
		};
	} catch (error) {
		logger.error({ err: error }, "Error updating media upload settings");
		throw new AppError(
			"MEDIA_UPLOAD_SETTINGS_UPDATE_ERROR",
			"Failed to update media upload settings",
			500,
		);
	}
}
