import type { Express } from "express";

export const multerFileToDomFile = (file: Express.Multer.File): File => {
  // Convert Multer memory buffer to a standard DOM File so existing
  // `mediaService`/`uploadFile` logic (which expects `file.arrayBuffer()`)
  // keeps working.
  const bytes = new Uint8Array(file.buffer);
  return new File([bytes], file.originalname, { type: file.mimetype });
};

export const multerFilesToDomFiles = (
  files: Express.Multer.File[],
): File[] => files.map(multerFileToDomFile);
