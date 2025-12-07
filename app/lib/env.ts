import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NODE_ENV: z.string().default("development"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

const envVars = parsed.data;

export const env = {
  databaseUrl: envVars.DATABASE_URL,
  nextauthUrl: envVars.NEXTAUTH_URL,
  nextauthSecret: envVars.NEXTAUTH_SECRET,
  nodeEnv: envVars.NODE_ENV,
  isDevelopment: envVars.NODE_ENV === "development",
  isProduction: envVars.NODE_ENV === "production",
} as const;
