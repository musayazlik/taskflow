# uploadthing

**UploadThing** integration: server-side **`UTApi`** (`utapi`) for listing/deleting files and a **`uploadRouter`** used if you expose UploadThing’s client upload routes. Token and auth are tied to [`../env`](../env/README.md) and [`../auth`](../auth/README.md).

## What it exports

### `utapi`

Instance of UploadThing’s **`UTApi`** when `UPLOADTHING_TOKEN` is valid in env.

- If the token is **missing**, a warning is logged and an instance is still created with an empty token — calls may fail until you configure the token (see env schema for expected base64 JSON shape).

- Used by **`media.service`**, **`UploadThingProvider`** ([`../file-service`](../file-service/README.md)), and anywhere else that needs server-side UploadThing API calls — **one shared `UTApi` instance** for the process.

### `uploadRouter` / `OurFileRouter`

Defines **`imageUploader`** route:

- Max **4MB**, **1** file, image types.
- **Middleware**: reads the Web **`Request`**, pulls headers, calls **`auth.api.getSession`** — unauthenticated uploads throw.
- **`onUploadComplete`**: returns metadata (`url`, `name`, `size`); extend here to persist to Prisma if you use client-side UploadThing components against this router.

## Usage

```ts
import { utapi, uploadRouter } from "@api/lib/uploadthing";
import type { OurFileRouter } from "@api/lib/uploadthing";

const urls = await utapi.getFileUrls(fileKey);
```

## Configuration

1. Obtain token from [UploadThing dashboard](https://uploadthing.com/dashboard).
2. Set **`UPLOADTHING_TOKEN`** in `.env` (validated in `env` module when present).

## Related

- [`../file-service`](../file-service/README.md) — wraps UploadThing as a `FileProvider` for domain logic.
- [`../utils`](../utils/README.md) — Sharp optimization may run on files originally from UploadThing.
