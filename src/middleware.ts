import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

/** Edge: نفس إعدادات الجلسة بدون مزودات تعتمد على Node (Prisma/bcrypt). التحقق من JWT فقط. */
const { auth } = NextAuth({
  ...authConfig,
  providers: [],
});

const LOGIN_PATHS = ["/login", "/login/admin"] as const;

export default auth((req) => {
  const { pathname } = req.nextUrl;

  /** عند تعطيل PWA: `/sw.js` يعيد سكربتًا يُلغي أي Service Worker قديم (بدون الاعتماد على ملفات `public` المتبقية). */
  if (pathname === "/sw.js") {
    if (process.env.NEXT_PUBLIC_ENABLE_PWA === "1") {
      return NextResponse.next();
    }
    return NextResponse.rewrite(new URL("/api/pwa/noop-sw", req.url));
  }

  /** واجهات الطالب/ولي الأمر أُزيلت — أي رابط قديم يُوجَّه لبوابة المشرف. */
  if (pathname === "/login/student" || pathname === "/login/parent") {
    return NextResponse.redirect(new URL("/login/admin", req.url));
  }
  if (pathname.startsWith("/student") || pathname.startsWith("/parent")) {
    return NextResponse.redirect(new URL("/login/admin", req.url));
  }

  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isLoginPath = (LOGIN_PATHS as readonly string[]).includes(pathname);
  if (isLoginPath) {
    if (isLoggedIn && role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const url = new URL("/login/admin", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/sw.js",
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
