/**
 * ربط تحليلات الإنتاج دون إجبار حزمة في كل بيئة.
 *
 * مثال (Vercel Analytics): ثبّت `@vercel/analytics` ثم في `src/app/layout.tsx`:
 *   import { Analytics } from "@vercel/analytics/react";
 *   … داخل <body> … <Analytics />
 *
 * مثال (Plausible): أضف سكربت في layout أو استخدم `next/script`.
 */

export type PageViewPayload = {
  path: string;
  title?: string;
};

/** استدعِ من عميل بعد التنقل إن احتجت تتبعًا يدويًا */
export function trackPageView(payload: PageViewPayload): void {
  if (typeof window === "undefined") return;
  void payload;
  // امتداد: window.plausible?.('pageview', { props: { ... } })
}
