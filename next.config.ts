import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

/** عطّل الـ PWA إذا ظهرت صفحة بيضاء بعد نشر تحديث: ضع NEXT_DISABLE_PWA=1 في `.env` ثم أعد `npm run build`. */
const pwaDisabled =
  process.env.NODE_ENV === "development" || process.env.NEXT_DISABLE_PWA === "1";

const withPWA = withPWAInit({
  dest: "public",
  disable: pwaDisabled,
  /** الصفحة الرئيسية تختلف حسب الجلسة — عدم تخزينها يقلّل صفحات بيضاء/نسخ قديمة من الـ Service Worker */
  cacheStartUrl: false,
  cacheOnFrontEndNav: false,
  reloadOnOnline: true,
  workboxOptions: {
    /** انتظار إغلاق التبويبات بدل استبدال الـ SW فورًا يقلّل تعارض أسماء الـ chunks بعد `next build` */
    skipWaiting: false,
    clientsClaim: false,
    cleanupOutdatedCaches: true,
    /** دعم جزئي للتصفح بدون شبكة — صفحة ثابتة خارج تطبيق Next */
    navigateFallback: "/offline.html",
    navigateFallbackDenylist: [/^\/api\//, /^\/_next\//],
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    const security = [
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
    ];
    return [{ source: "/:path*", headers: security }];
  },
};

export default withPWA(nextConfig);
