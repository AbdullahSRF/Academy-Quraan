"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

export default function AdminSectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("admin route error", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-6 text-center">
      <h2 className="text-lg font-bold text-foreground">تعذر تحميل هذه الصفحة</h2>
      <p className="text-sm font-bold text-muted">{error.message || "حدث خطأ غير متوقع."}</p>
      {error.digest ? (
        <p className="text-xs text-muted" dir="ltr">
          Digest: {error.digest}
        </p>
      ) : null}
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={() => reset()}>
          إعادة المحاولة
        </Button>
        <Button type="button" variant="outline" onClick={() => (window.location.href = "/admin")}>
          لوحة المشرف
        </Button>
      </div>
    </div>
  );
}
