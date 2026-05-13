"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AdminGlobalSearch } from "@/components/layout/admin-global-search";
import { AdminQuickActions } from "@/components/layout/admin-quick-actions";
import { DashboardCommandMenu } from "@/components/layout/dashboard-command-menu";
import { DashboardMobileNav } from "@/components/layout/dashboard-mobile-nav";
import { PwaInstallBanner } from "@/components/pwa/pwa-install-banner";
import { useDashboardUiStore } from "@/store/dashboard-ui-store";
import type { AppRole } from "@/auth.config";
import { ImpersonationStrip } from "@/components/auth/impersonation-strip";

export function DashboardAppFrame({
  role,
  userName,
  userEmail,
  impersonation,
  children,
}: {
  role: AppRole;
  userName: string | null | undefined;
  userEmail: string | null | undefined;
  impersonation?: { adminLabel: string } | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const menuOpen = useDashboardUiStore((s) => s.mobileMenuOpen);
  const setMenuOpen = useDashboardUiStore((s) => s.setMobileMenuOpen);
  const display = userName ?? userEmail ?? "مستخدم";

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background pb-[max(4.5rem,env(safe-area-inset-bottom))] md:flex-row md:pb-0">
      <aside className="site-sidebar hidden w-[17rem] max-w-[17rem] shrink-0 flex-col border-e border-border bg-card shadow-sm md:flex">
        <div className="flex flex-col gap-0.5 border-b border-border px-4 py-5">
          <Link href="/" className="text-lg font-bold leading-tight text-foreground">
            أكاديمية التحفيظ
          </Link>
          <p className="text-xs font-bold text-muted">منصة إدارية</p>
        </div>
        <DashboardNav role={role} />
        <div className="mt-auto border-t border-border p-4">
          <p className="mb-3 truncate text-sm font-bold text-muted" title={display}>
            {display}
          </p>
          <SignOutButton />
        </div>
      </aside>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-topbar px-3 backdrop-blur-md md:h-16 md:px-6">
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden" aria-label="فتح القائمة">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            {role === "ADMIN" ? (
              <AdminGlobalSearch className="relative hidden min-w-0 flex-1 md:block md:max-w-md" />
            ) : (
              <div className="hidden flex-1 md:block" />
            )}
            {role === "ADMIN" ? <AdminQuickActions className="shrink-0" /> : null}
            <DashboardCommandMenu role={role} />
            <span className="min-w-0 flex-1 truncate text-center text-sm font-bold text-foreground md:hidden">التحفيظ</span>
            <ThemeToggle />
            <span className="hidden max-w-[11rem] truncate text-end text-xs font-bold text-muted md:block" dir="ltr" title={userEmail ?? ""}>
              {display}
            </span>
          </header>

          {impersonation ? <ImpersonationStrip adminLabel={impersonation.adminLabel} /> : null}

          <main className="site-main flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <motion.div
              key={pathname}
              initial={{ opacity: 0.94, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto max-w-6xl"
            >
              {children}
            </motion.div>
          </main>
        </div>

        <SheetContent side="start" className="flex w-[min(100%,22rem)] flex-col overflow-hidden p-0">
          <SheetHeader className="border-b border-border px-4 py-4 text-start">
            <SheetTitle className="text-base font-bold">القائمة</SheetTitle>
          </SheetHeader>
          {role === "ADMIN" ? (
            <div className="border-b border-border p-3">
              <AdminGlobalSearch className="relative block w-full min-w-0" />
            </div>
          ) : null}
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            <DashboardNav role={role} onNavigate={() => setMenuOpen(false)} />
          </div>
          <div className="mt-auto border-t border-border p-4">
            <p className="mb-2 truncate text-sm font-bold text-muted">{display}</p>
            <SignOutButton />
          </div>
        </SheetContent>
      </Sheet>

      <DashboardMobileNav role={role} onOpenMenu={() => setMenuOpen(true)} />
      <PwaInstallBanner />
    </div>
  );
}
