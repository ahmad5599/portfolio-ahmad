import { PrismaClient } from "@prisma/client";

// Prisma Client Singleton
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Append connection_limit=1 to the DATABASE_URL so each serverless function
 * instance holds at most ONE database connection.  Without this, Prisma's
 * default pool size (5) multiplied across concurrent Netlify invocations
 * instantly saturates Supabase's session-mode pool (15 max).
 *
 * For a permanent fix: switch DATABASE_URL in Netlify to Supabase's
 * Transaction Pooler (port 6543) and append ?pgbouncer=true — that mode is
 * designed for serverless and handles far more concurrent connections.
 */
function buildDatasourceUrl(): string | undefined {
  const base = process.env.DATABASE_URL;
  if (!base) return undefined;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}connection_limit=1&pool_timeout=10`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildDatasourceUrl(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;

