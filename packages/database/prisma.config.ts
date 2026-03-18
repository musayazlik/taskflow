import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env from root directory first, then fallback to apps/api/.env
const rootEnvPath = path.join(__dirname, "../../.env");
const apiEnvPath = path.join(__dirname, "../../apps/api/.env");

// Try root .env first, then apps/api/.env
config({ path: rootEnvPath });
if (!process.env.DATABASE_URL) {
  config({ path: apiEnvPath });
}

export default defineConfig({
  // Point to schema directory for multi-file schema support
  schema: path.join(__dirname, "prisma/schema"),

  migrations: {
    path: path.join(__dirname, "prisma/migrations"),
  },

  datasource: {
    url: process.env.DATABASE_URL,
  },
});
