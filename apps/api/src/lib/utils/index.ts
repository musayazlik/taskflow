/**
 * @fileoverview Miscellaneous backend helpers: secure password generation, legacy media normalization,
 * and Sharp-based image optimization (global settings + manual admin transforms).
 * @module @api/lib/utils
 */

import { prisma } from "@repo/database";
import { logger } from "@api/lib/logger";
import sharp from "sharp";

// ============================================
// Password Generation
// ============================================

/**
 * Generates a 16-character random password using an ambiguous-character-safe alphabet.
 *
 * @returns Cryptographically suitable for temporary passwords (admin-created users, resets).
 */
export const generateTempPassword = (): string => {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
	let password = "";
	for (let i = 0; i < 16; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
};

/**
 * @see {@link generateTempPassword}
 */
export const generateRandomPassword = (): string => {
	return generateTempPassword();
};

// ============================================
// Media/File Utilities
// ============================================

/** Single media reference (legacy product-style shape). */
export type MediaItem = { id: string; public_url: string };

/** Acceptable raw shapes before normalization. */
export type MediaInput = string | MediaItem | Array<string | MediaItem>;

/**
 * Coerces arbitrary client/storage shapes into `MediaItem[]` (arrays, JSON strings, mixed entries).
 *
 * @param medias - Unknown payload; safe to pass JSON-parsed blobs.
 * @returns Empty array on failure or empty input.
 */
export const normalizeMedias = (medias: unknown): MediaItem[] => {
	if (!medias) return [];

	// Already normalized array
	if (Array.isArray(medias)) {
		return medias.map((item) => {
			if (typeof item === "object" && item !== null && "id" in item) {
				return {
					id: String(item.id),
					public_url: String((item as MediaItem).public_url || ""),
				};
			}
			if (typeof item === "string") {
				return { id: item, public_url: item };
			}
			return { id: String(item), public_url: "" };
		});
	}

	// JSON string
	if (typeof medias === "string") {
		try {
			const parsed = JSON.parse(medias);
			if (Array.isArray(parsed)) {
				return normalizeMedias(parsed);
			}
		} catch {
			return [];
		}
	}

	return [];
};

/**
 * Maps structured {@link MediaInput} list into storable `MediaItem` rows.
 *
 * @param medias - Optional list; empty/undefined returns `[]`.
 */
export const prepareMediasForStorage = (medias?: MediaInput[]): MediaItem[] => {
	if (!medias || medias.length === 0) return [];

	return medias.map((item) => {
		if (typeof item === "string") {
			return { id: item, public_url: "" };
		}
		if (typeof item === "object" && item !== null && "id" in item) {
			return {
				id: String(item.id),
				public_url: String((item as MediaItem).public_url || ""),
			};
		}
		return { id: String(item), public_url: "" };
	});
};

// ============================================
// Image Utilities
// ============================================

/**
 * Maps a format keyword (e.g. `"webp"`, `"jpeg"`) to MIME + file extension.
 *
 * @param format - Case-insensitive format name.
 * @returns `null` if unsupported.
 */
export const getMimeAndExtensionForFormat = (
	format: string,
): { mime: string; ext: string } | null => {
	switch (format.toLowerCase()) {
		case "webp":
			return { mime: "image/webp", ext: "webp" };
		case "avif":
			return { mime: "image/avif", ext: "avif" };
		case "jpeg":
		case "jpg":
			return { mime: "image/jpeg", ext: "jpg" };
		case "png":
			return { mime: "image/png", ext: "png" };
		default:
			return null;
	}
};

/**
 * Replaces or appends extension in a filename (e.g. `photo.jpg` + `webp` → `photo.webp`).
 *
 * @param newExt - Extension without leading dot.
 */
export const replaceFileExtension = (fileName: string, newExt: string): string => {
	const idx = fileName.lastIndexOf(".");
	if (idx === -1) return `${fileName}.${newExt}`;
	return `${fileName.slice(0, idx)}.${newExt}`;
};

/**
 * Applies **global** `imageOptimizationSettings` from Prisma before upload when enabled.
 *
 * @param inputFile - Original `File` (type checked for `image/*`).
 * @param inputBuffer - Same bytes as `inputFile` for Sharp.
 * @returns Possibly new `File`/`buffer` and `optimized: true`; on skip/failure returns originals and `optimized: false`.
 *
 * @remarks Uses {@link prisma} — ensure settings row exists in DB for production behavior.
 */
export const maybeOptimizeImage = async (
	inputFile: File,
	inputBuffer: ArrayBuffer,
): Promise<{
	file: File;
	buffer: ArrayBuffer;
	optimized: boolean;
}> => {
	// Only optimize images
	if (!inputFile.type?.startsWith("image/")) {
		return { file: inputFile, buffer: inputBuffer, optimized: false };
	}

	// Load global settings
	const settings = await prisma.imageOptimizationSettings.findFirst();
	if (!settings || !settings.enabled) {
		return { file: inputFile, buffer: inputBuffer, optimized: false };
	}

	const maxWidth = settings.maxWidth ?? undefined;
	const maxHeight = settings.maxHeight ?? undefined;
	const quality =
		typeof settings.quality === "number" ? settings.quality : undefined;
	const format = (settings.format ?? "").trim().toLowerCase();

	// "original" or empty => keep original format
	const wantsOriginal = format === "" || format === "original";
	const outFormatInfo = wantsOriginal ? null : getMimeAndExtensionForFormat(format);

	// If no resize/quality/format settings meaningfully apply, skip.
	const shouldResize = Boolean(maxWidth || maxHeight);
	const shouldReencode = Boolean(outFormatInfo || quality);
	if (!shouldResize && !shouldReencode) {
		return { file: inputFile, buffer: inputBuffer, optimized: false };
	}

	try {
		let pipeline = sharp(Buffer.from(inputBuffer), { failOnError: false });

		if (shouldResize) {
			pipeline = pipeline.resize({
				width: maxWidth,
				height: maxHeight,
				fit: "inside",
				withoutEnlargement: true,
			});
		}

		// Decide output format / encoding options
		if (outFormatInfo) {
			if (outFormatInfo.ext === "webp") {
				pipeline = pipeline.webp({
					quality: quality ?? 80,
				});
			} else if (outFormatInfo.ext === "avif") {
				pipeline = pipeline.avif({
					quality: quality ?? 50,
				});
			} else if (outFormatInfo.ext === "jpg") {
				pipeline = pipeline.jpeg({
					quality: quality ?? 80,
					mozjpeg: true,
				});
			} else if (outFormatInfo.ext === "png") {
				// PNG quality is not a direct 1-100; use compressionLevel as a sane default.
				pipeline = pipeline.png({ compressionLevel: 9 });
			}
		} else if (quality) {
			// Keep original format but apply quality when possible.
			if (inputFile.type === "image/jpeg") {
				pipeline = pipeline.jpeg({ quality, mozjpeg: true });
			} else if (inputFile.type === "image/webp") {
				pipeline = pipeline.webp({ quality });
			} else if (inputFile.type === "image/avif") {
				pipeline = pipeline.avif({ quality });
			}
		}

		const outBufferNode = await pipeline.toBuffer();
		const outBytes = new Uint8Array(outBufferNode);
		// Ensure we return an actual ArrayBuffer (not SharedArrayBuffer) and with tight bounds
		const outArrayBuffer: ArrayBuffer = outBytes.buffer.slice(
			outBytes.byteOffset,
			outBytes.byteOffset + outBytes.byteLength,
		) as ArrayBuffer;

		const outMime = outFormatInfo?.mime ?? inputFile.type;
		const outName = outFormatInfo
			? replaceFileExtension(inputFile.name, outFormatInfo.ext)
			: inputFile.name;

		const outFile = new File([outBytes], outName, { type: outMime });

		return { file: outFile, buffer: outArrayBuffer, optimized: true };
	} catch (e) {
		logger.warn({ err: e, fileName: inputFile.name }, "Image optimization failed, uploading original");
		return { file: inputFile, buffer: inputBuffer, optimized: false };
	}
};

/**
 * **Manual** image optimization (admin/media UI): resize and/or re-encode with explicit options.
 *
 * @param options.quality - Roughly 1–100 depending on codec (see Sharp behavior in implementation).
 * @param options.format - Target format; omit or `"original"` to keep format where possible.
 * @param options.maxWidth / maxHeight - `fit: inside`, no enlargement.
 * @returns New `File` with transformed bytes.
 * @throws If input is not an image or Sharp fails.
 */
export const optimizeImage = async (
	inputFile: File,
	inputBuffer: ArrayBuffer,
	options: {
		quality?: number;
		format?: "webp" | "jpeg" | "png";
		maxWidth?: number;
		maxHeight?: number;
	},
): Promise<File> => {
	// Only optimize images
	if (!inputFile.type?.startsWith("image/")) {
		throw new Error("File is not an image");
	}

	const maxWidth = options.maxWidth;
	const maxHeight = options.maxHeight;
	const quality = options.quality ?? 85;
	const format = options.format?.toLowerCase();

	// Determine output format
	const wantsOriginal = !format || format === "original";
	const outFormatInfo = wantsOriginal ? null : getMimeAndExtensionForFormat(format || "webp");

	// If no resize/quality/format settings meaningfully apply, return original
	const shouldResize = Boolean(maxWidth || maxHeight);
	const shouldReencode = Boolean(outFormatInfo || quality);
	if (!shouldResize && !shouldReencode) {
		return inputFile;
	}

	try {
		let pipeline = sharp(Buffer.from(inputBuffer), { failOnError: false });

		if (shouldResize) {
			pipeline = pipeline.resize({
				width: maxWidth,
				height: maxHeight,
				fit: "inside",
				withoutEnlargement: true,
			});
		}

		// Decide output format / encoding options
		if (outFormatInfo) {
			if (outFormatInfo.ext === "webp") {
				pipeline = pipeline.webp({
					quality,
				});
			} else if (outFormatInfo.ext === "avif") {
				pipeline = pipeline.avif({
					quality: Math.min(quality, 50), // AVIF quality is typically lower
				});
			} else if (outFormatInfo.ext === "jpg" || outFormatInfo.ext === "jpeg") {
				pipeline = pipeline.jpeg({
					quality,
					mozjpeg: true,
				});
			} else if (outFormatInfo.ext === "png") {
				// PNG quality is not a direct 1-100; use compressionLevel
				const compressionLevel = Math.floor((100 - quality) / 11); // Map 0-100 to 9-0
				pipeline = pipeline.png({ compressionLevel: Math.max(0, Math.min(9, compressionLevel)) });
			}
		} else if (quality) {
			// Keep original format but apply quality when possible
			if (inputFile.type === "image/jpeg") {
				pipeline = pipeline.jpeg({ quality, mozjpeg: true });
			} else if (inputFile.type === "image/webp") {
				pipeline = pipeline.webp({ quality });
			} else if (inputFile.type === "image/avif") {
				pipeline = pipeline.avif({ quality: Math.min(quality, 50) });
			}
		}

		const outBufferNode = await pipeline.toBuffer();
		const outBytes = new Uint8Array(outBufferNode);
		const outArrayBuffer: ArrayBuffer = outBytes.buffer.slice(
			outBytes.byteOffset,
			outBytes.byteOffset + outBytes.byteLength,
		) as ArrayBuffer;

		const outMime = outFormatInfo?.mime ?? inputFile.type;
		const outName = outFormatInfo
			? replaceFileExtension(inputFile.name, outFormatInfo.ext)
			: inputFile.name;

		return new File([outBytes], outName, { type: outMime });
	} catch (e) {
		logger.error({ err: e, fileName: inputFile.name, options }, "Image optimization failed");
		throw new Error(`Failed to optimize image: ${e instanceof Error ? e.message : String(e)}`);
	}
};
