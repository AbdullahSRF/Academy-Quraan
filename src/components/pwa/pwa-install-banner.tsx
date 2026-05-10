"use client";

import * as React from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "academy-pwa-install-dismissed";

export function PwaInstallBanner() {
  const [deferred, setDeferred] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = React.useState(true);
  const [standalone, setStandalone] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(display-mode: standalone)");
    const check = () => setStandalone(mq.matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true);
    check();
    mq.addEventListener("change", check);
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) setHidden(true);
    } catch {
      /* ignore */
    }
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      try {
        if (!sessionStorage.getItem(DISMISS_KEY)) setHidden(false);
      } catch {
        setHidden(false);
      }
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => {
      mq.removeEventListener("change", check);
      window.removeEventListener("beforeinstallprompt", onBip);
    };
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => undefined);
    setDeferred(null);
    setHidden(true);
  }

  function dismiss() {
    setHidden(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  if (process.env.NODE_ENV === "development") return null;
  if (standalone || hidden || !deferred) return null;

  return (
    <div
      role="region"
      aria-label="تثبيت التطبيق"
      className="fixed bottom-[max(5.5rem,env(safe-area-inset-bottom))] start-3 end-3 z-50 md:start-auto md:end-6 md:bottom-6 md:max-w-sm"
    >
      <div className="flex items-start gap-3 rounded-2xl border-2 border-primary/30 bg-card p-4 shadow-xl backdrop-blur-md">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Download className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">ثبّت الأكاديمية على جهازك</p>
          <p className="mt-1 text-xs font-bold leading-relaxed text-muted">تجربة أقرب للتطبيق، مع تحميل أسرع للصفحات المخزّنة.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" className="gap-1" onClick={() => void install()}>
              <Download className="size-4" aria-hidden />
              تثبيت
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={dismiss}>
              لاحقًا
            </Button>
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-lg p-1 text-muted hover:bg-muted-bg hover:text-foreground"
          onClick={dismiss}
          aria-label="إغلاق"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
}
