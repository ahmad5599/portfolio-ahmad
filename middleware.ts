import { authConfig } from "@/lib/auth.config";
import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const protectedPaths = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isLogin = pathname.startsWith("/admin/login");
  const isAuthApi = pathname.startsWith("/api/auth");

  if (!isProtected || isLogin || isAuthApi) return NextResponse.next();

  const session = await auth();
  if (!session?.user) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
