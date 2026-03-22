# uploadthing

**UploadThing** server-side integration: shared **`UTApi`** singleton (`utapi`) for uploads, deletes, listing, and URL helpers. Token validation lives in [`../env`](../env/README.md).

## What it exports

### `utapi`

Instance of UploadThing’s **`UTApi`** when `UPLOADTHING_TOKEN` is valid in env.

- If the token is **missing**, a warning is logged and an instance is still created with an empty token — calls may fail until you configure the token (see env schema for expected base64 JSON shape).

- Used by **`media.service`**, **`UploadThingProvider`** ([`../file-service`](../file-service/README.md)), and anywhere else that needs server-side UploadThing API calls — **one shared `UTApi` instance** for the process.

### Client-side uploads

This package does **not** export a **FileRouter**. If you use `@uploadthing/react` in the web app, define the router next to your Next.js (or other) route handler that calls `createRouteHandler` / UploadThing’s app integration, and keep types there.

## Usage

```ts
import { utapi } from "@api/lib/uploadthing";

const urls = await utapi.getFileUrls(fileKey);
```

## Configuration

1. Obtain token from [UploadThing dashboard](https://uploadthing.com/dashboard).
2. Set **`UPLOADTHING_TOKEN`** in `.env` (validated in `env` module when present).

## Related

- [`../file-service`](../file-service/README.md) — wraps UploadThing as a `FileProvider` for domain logic.
- [`../utils`](../utils/README.md) — Sharp optimization may run on files originally from UploadThing.
