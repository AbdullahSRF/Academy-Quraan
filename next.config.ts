import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

/**
 * على Vercel: PWA معطّل افتراضيًا (Service Worker يسبب أحيانًا «لا يوجد اتصال» رغم عمل الموقع).
 * لتفعيله: عيّن NEXT_ENABLE_PWA=1 وNEXT_PUBLIC_ENABLE_PWA=1 ثم أعد النشر.
 * محليًا: عطّل بـ NEXT_DISABLE_PWA=1 أو يبقى مفعّلًا في production غير Vercel.
 */
const pwaEnabledOnVercel = process.env.NEXT_ENABLE_PWA === "1";
const pwaDisabled =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_DISABLE_PWA === "1" ||
  (!!process.env.VERCEL && !pwaEnabledOnVercel);

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
    /**
     * لا نستخدم navigateFallback إلى offline.html: على Vercel/Next يعامل Workbox «فشل التنقل»
     * (500، مهلة، فشل RSC، تعارض SW) كسقوط شبكة فيعرض صفحة «لا يوجد اتصال» بشكل مضلّل.
     * للوضع بدون شبكة يبقى الأصل يفشل بصدق؛ يمكن فتح /offline.html يدويًا أو تعطيل PWA بـ NEXT_DISABLE_PWA=1.
     */
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
    const noStoreSw = [{ key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" }];
    return [
      { source: "/sw.js", headers: noStoreSw },
      { source: "/:path*", headers: security },
    ];
  },
};

export default withPWA(nextConfig);
