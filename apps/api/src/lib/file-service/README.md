# file-service

**Storage abstraction** for uploads: a small **factory** + **interface** layer over concrete providers. Today the implementation is **UploadThing** (`UploadThingProvider`); the API is shaped so you could add S3-compatible or other backends later.

## What it does

- **`FileProvider`** enum — identifies the active backend (e.g. `UPLOADTHING`).
- **`FileService` interface** — upload, delete, public URL, “configured?” checks.
- **`FileServiceFactory`** — resolves the right provider for a file MIME type or explicit preference; reads **storage settings** from DB / env where applicable.
- **`UploadThingProvider`** — implements `FileService` using env token and UploadThing APIs.

Consumers (**`media.service`**, storage settings) depend on **`FileServiceFactory`** and types from this module, not on UploadThing SDK details directly (except where `utapi` is still used for listing/sync).

## Typical flow

1. Call **`FileServiceFactory.getProviderForFile(mime, preferred?)`** or **`getProvider(enum)`**.
2. Check **`provider.isConfigured()`** before upload.
3. Call **`upload`**, **`delete`**, etc. on the returned service.

## Usage

```ts
import {
  FileProvider,
  FileServiceFactory,
  type UploadResult,
} from "@api/lib/file-service";
```

## File map

| Path | Content |
|------|---------|
| `interface.ts` | Types + `FileProvider` enum + abstract capabilities. |
| `factory.ts` | Provider selection and singleton-style access. |
| `providers/uploadthing.provider.ts` | UploadThing-specific implementation. |
| `index.ts` | Public exports (also re-exports `FileServiceFactory as FileUploadService` for legacy naming). |

## Related

- [`../uploadthing`](../uploadthing/README.md) — lower-level `UTApi` and router.
- [`../env`](../env/README.md) — `UPLOADTHING_TOKEN` validation.
