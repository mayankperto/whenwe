import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Local dev: resolve the SQLite file relative to the project root
const LOCAL_DB = `file:${path.join(process.cwd(), "prisma", "dev.db")}`;

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  const adapter = new PrismaLibSql({
    url: tursoUrl ?? LOCAL_DB,
    ...(tursoToken ? { authToken: tursoToken } : {}),
  });

  return new PrismaClient({ adapter } as any);
}

// Singleton — reuse across HMR reloads in dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
