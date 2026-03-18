# File Management

> Multi-provider file upload with UploadThing and Cloudinary support

## 🎯 Overview

TurboStack supports multiple file storage providers:
- **UploadThing** - General file storage
- **Cloudinary** - Image optimization and transformations

## 🏗️ Architecture

### Provider Pattern

```
┌─────────────────────────────────────────┐
│         FileService (Interface)         │
├─────────────────────────────────────────┤
│  upload()                               │
│  delete()                               │
│  getFile()                              │
│  getUrl()                               │
│  getSignedUrl()                         │
│  isConfigured()                         │
├─────────────────┬───────────────────────┤
│ UploadThing     │      Cloudinary       │
│ Provider        │      Provider         │
└─────────────────┴───────────────────────┘
```

## 📁 File Structure

```
apps/api/src/lib/file-service/
├── interface.ts                    # FileService abstract interface
├── factory.ts                      # FileServiceFactory for DI
├── index.ts                        # Barrel exports
└── providers/
    ├── uploadthing.provider.ts     # UploadThing implementation
    └── cloudinary.provider.ts      # Cloudinary implementation
```

## 🔗 Interface Definition

```typescript
// lib/file-service/interface.ts
export enum FileProvider {
  UPLOADTHING = "UPLOADTHING",
  CLOUDINARY = "CLOUDINARY",
}

export abstract class FileService {
  abstract readonly provider: FileProvider;
  abstract upload(params: UploadFileParams): Promise<UploadResult>;
  abstract delete(key: string): Promise<boolean>;
  abstract getFile(key: string): Promise<FileMetadata | null>;
  abstract getUrl(key: string): string;
  abstract getSignedUrl(key: string, options?: SignedUrlOptions): Promise<string>;
  abstract isConfigured(): boolean;
}
```

## 🏭 Factory Pattern (Dependency Injection)

```typescript
// lib/file-service/factory.ts
export class FileServiceFactory {
  static getProvider(type: FileProvider): FileService;
  static getProviderForFile(mimeType: string, preferred?: FileProvider): FileService;
  static getDefaultProvider(): FileService | null;
  static getConfiguredProviders(): FileService[];
}

// Usage in routes
const provider = FileServiceFactory.getProviderForFile(
  file.type,           // Auto-select based on file type
  FileProvider.CLOUDINARY  // Optional: force provider
);
```

## 📊 Provider Selection Rules

| File Type | Default Provider | Reason |
|-----------|-----------------|--------|
| Images (jpg, png, webp) | Cloudinary | Better transformations |
| Documents (pdf, doc) | UploadThing | Simple storage |
| Videos | Cloudinary | Streaming support |
| Other | UploadThing | Default |

## 📤 Upload Implementation

```typescript
// services/file-upload.service.ts
export const uploadFile = async (
  options: {
    file: File;
    folder?: string;
    preferredProvider?: FileProvider;
  },
  userId: string
): Promise<UploadResult> => {
  // 1. Determine provider (auto or manual)
  const provider = FileServiceFactory.getProviderForFile(
    file.type,
    options.preferredProvider
  );

  // 2. Upload to provider
  const result = await provider.upload({
    file,
    fileName: file.name,
    folder: options.folder,
  });

  // 3. Save to database with provider info
  await prisma.mediaFile.create({
    data: {
      provider: result.provider,  // Track which provider
      key: result.key,
      url: result.url,
      // ... other fields
    },
  });

  return result;
};
```

## 🗄️ Database Schema

```prisma
enum FileProvider {
  UPLOADTHING
  CLOUDINARY
}

model MediaFile {
  id            String        @id @default(cuid())
  provider      FileProvider  @default(UPLOADTHING)  // Track provider
  key           String        @unique
  url           String
  // ... other fields
}

model FileStorageSettings {
  id                  String       @id @default(cuid())
  defaultProvider     FileProvider @default(UPLOADTHING)
  cloudinaryCloudName String?
  cloudinaryApiKey    String?
  cloudinaryApiSecret String?      // Encrypted
  uploadthingToken    String?
  selectionRules      Json         // {"images": "CLOUDINARY"}
}
```

## 🛣️ API Routes

```typescript
// routes/file-storage.ts
export const fileStorageRoutes = new Elysia({ prefix: "/file-storage" })
  // List files with provider filter
  .get("/files", async ({ query }) => {
    return listFiles({
      provider: query.provider,  // Filter by provider
      folder: query.folder,
    });
  })

  // Upload with provider selection
  .post("/upload", async ({ body }) => {
    return uploadFile({
      file: body.file,
      preferredProvider: body.provider,  // Optional force
    });
  })

  // Migrate between providers
  .post("/files/:key/migrate", async ({ params, body }) => {
    return migrateFile(params.key, body.targetProvider);
  })

  // Get available providers
  .get("/providers", async () => {
    return getAvailableProviders();
  });
```

## 🔄 Migration Between Providers

```typescript
export const migrateFile = async (
  fileKey: string,
  targetProvider: FileProvider
): Promise<UploadResult> => {
  // 1. Get current file info
  const fileRecord = await prisma.mediaFile.findUnique({
    where: { key: fileKey },
  });

  // 2. Get source and target providers
  const sourceProvider = FileServiceFactory.getProvider(fileRecord.provider);
  const target = FileServiceFactory.getProvider(targetProvider);

  // 3. Download from source
  const response = await fetch(fileRecord.url);
  const buffer = Buffer.from(await response.arrayBuffer());

  // 4. Upload to target
  const result = await target.upload({
    file: buffer,
    fileName: fileRecord.name,
  });

  // 5. Delete from source
  await sourceProvider.delete(fileKey);

  // 6. Update database
  await prisma.mediaFile.update({
    where: { key: fileKey },
    data: {
      provider: result.provider,
      key: result.key,
      url: result.url,
    },
  });

  return result;
};
```

## 🔐 Environment Variables

```bash
# UploadThing
UPLOADTHING_TOKEN=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## 🤖 AI MUST Rules

1. **Use FileServiceFactory** - Never instantiate providers directly
2. **Track provider in database** - Always save provider field
3. **Auto-select based on file type** - Images → Cloudinary, others → UploadThing
4. **Handle migration gracefully** - Download, upload, verify, delete
5. **Encrypt sensitive settings** - Cloudinary API secret
6. **Check provider configuration** - Use isConfigured() before operations
7. **Use dependency injection** - Access factory via context
8. **Support provider override** - Allow explicit provider selection
