"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

/**
 * يغطي أخطاء React في الجذر — لا يُستخدم خطأ «لا يوجد إنترنت»؛ رسالة تقنية صريحة + إعادة المحاولة.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("global-error", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body className="m-0 flex min-h-dvh items-center justify-center bg-stone-100 p-6 text-stone-900 dark:bg-stone-950 dark:text-stone-50">
        <div className="max-w-md rounded-2xl border-2 border-red-200 bg-white p-6 text-center shadow-lg dark:border-red-900/50 dark:bg-stone-900">
          <h1 className="text-lg font-bold">حدث خطأ في التطبيق</h1>
          <p className="mt-3 text-sm font-bold text-stone-600 dark:text-stone-400">
            {error.message || "خطأ غير متوقع. ليست بالضرورة مشكلة إنترنت — قد يكون إعداد الخادم أو تحديثًا جديدًا."}
          </p>
          {error.digest ? (
            <p className="mt-2 text-xs text-stone-500" dir="ltr">
              Digest: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            className="mt-6 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white dark:bg-emerald-600"
            onClick={() => reset()}
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
