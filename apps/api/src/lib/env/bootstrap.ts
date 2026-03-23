/**
 * Loads `.env` before other `@api/lib/env` imports that read `process.env` at module init (e.g. logger `LOG_LEVEL`).
 * @module @api/lib/env/bootstrap
 */

import { config } from "dotenv";
import { resolve } from "path";

const rootEnvPath = resolve(import.meta.dir, "../../../../../.env");
const apiEnvPath = resolve(import.meta.dir, "../../../.env");

// Root first, then api-level overrides (if both exist).
config({ path: rootEnvPath });
config({ path: apiEnvPath });
