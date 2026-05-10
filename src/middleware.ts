import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

/** Edge: نفس إعدادات الجلسة بدون مزودات تعتمد على Node (Prisma/bcrypt). التحقق من JWT فقط. */
const { auth } = NextAuth({
  ...authConfig,
  providers: [],
});

const LOGIN_PATHS = ["/login", "/login/admin", "/login/student", "/login/parent"] as const;

function dashboardPath(role: string): string {
  if (role === "ADMIN") return "/admin";
  if (role === "STUDENT") return "/student";
  if (role === "PARENT") return "/parent";
  return "/login";
}

function isLoginPath(pathname: string): boolean {
  return (LOGIN_PATHS as readonly string[]).includes(pathname);
}

function loginUrlForProtectedPrefix(prefix: string, req: { url: string }): URL {
  const base =
    prefix === "/admin" ? "/login/admin" : prefix === "/student" ? "/login/student" : prefix === "/parent" ? "/login/parent" : "/login";
  return new URL(base, req.url);
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  if (isLoginPath(pathname)) {
    if (isLoggedIn && role) {
      return NextResponse.redirect(new URL(dashboardPath(role), req.url));
    }
    return NextResponse.next();
  }

  const protectedPrefixes = ["/admin", "/student", "/parent"] as const;
  const matched = protectedPrefixes.find((p) => pathname.startsWith(p));
  if (!matched) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const url = loginUrlForProtectedPrefix(matched, req);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (matched === "/admin" && role !== "ADMIN") {
    return NextResponse.redirect(new URL(dashboardPath(role ?? "STUDENT"), req.url));
  }
  if (matched === "/student" && role !== "STUDENT") {
    return NextResponse.redirect(new URL(dashboardPath(role ?? "ADMIN"), req.url));
  }
  if (matched === "/parent" && role !== "PARENT") {
    return NextResponse.redirect(new URL(dashboardPath(role ?? "ADMIN"), req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
