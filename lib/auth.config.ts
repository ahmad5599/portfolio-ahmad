import { env } from "@/lib/env";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: {
    strategy: "jwt",
  },
  secret: env.nextauthSecret,
  providers: [], // Providers are configured in auth.ts to avoid Edge Runtime issues
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const userSession = session.user as { id?: string; role?: string };
        userSession.id = token.id as string;
        userSession.role = (token.role as string) ?? "admin";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
