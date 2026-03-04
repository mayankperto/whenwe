import path from "node:path";
import { defineConfig } from "prisma/config";

// In production (Vercel + Turso), TURSO_DATABASE_URL is set as an env var.
// In local dev, fall back to the local SQLite file.
const url =
  process.env.TURSO_DATABASE_URL ??
  `file:${path.join(import.meta.dirname, "dev.db")}`;

export default defineConfig({
  schema: path.join(import.meta.dirname, "schema.prisma"),
  datasource: { url },
});
