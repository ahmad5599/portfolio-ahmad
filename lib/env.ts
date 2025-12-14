import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NODE_ENV: z.string().default("development"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  CONTACT_EMAIL: z.string().email().optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_GA_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
});

const isServer = typeof window === "undefined";

const parsedServer = serverSchema.safeParse(process.env);
const parsedClient = clientSchema.safeParse(process.env);

if (isServer && !parsedServer.success) {
  console.error("❌ Invalid server environment variables", parsedServer.error.flatten().fieldErrors);
  throw new Error("Invalid server environment variables");
}

if (!parsedClient.success) {
  console.error("❌ Invalid client environment variables", parsedClient.error.flatten().fieldErrors);
  throw new Error("Invalid client environment variables");
}

const serverData = parsedServer.success ? parsedServer.data : ({} as z.infer<typeof serverSchema>);
const clientData = parsedClient.data;

const envVars = { ...serverData, ...clientData };

export const env = {
  databaseUrl: envVars.DATABASE_URL,
  nextauthUrl: envVars.NEXTAUTH_URL,
  nextauthSecret: envVars.NEXTAUTH_SECRET,
  nodeEnv: envVars.NODE_ENV,
  isDevelopment: envVars.NODE_ENV === "development",
  isProduction: envVars.NODE_ENV === "production",
  cloudinary: {
    cloudName: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },
  resend: {
    apiKey: envVars.RESEND_API_KEY,
    contactEmail: envVars.CONTACT_EMAIL,
  },
  googleAnalyticsId: envVars.NEXT_PUBLIC_GA_ID,
  turnstile: {
    siteKey: envVars.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    secretKey: envVars.TURNSTILE_SECRET_KEY,
  },
} as const;
