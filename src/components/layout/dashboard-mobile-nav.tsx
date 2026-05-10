"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarCheck, Wallet, Menu, HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/auth.config";

function NavIcon({
  href,
  label,
  icon: Icon,
  active,
  onMore,
}: {
  href?: string;
  label: string;
  icon: typeof LayoutDashboard;
  active?: boolean;
  onMore?: () => void;
}) {
  const body = (
    <>
      <Icon className="size-5" aria-hidden />
      <span className="mt-0.5 max-w-[4.5rem] truncate text-[10px] font-bold leading-tight">{label}</span>
    </>
  );
  if (onMore) {
    return (
      <button
        type="button"
        onClick={onMore}
        className={cn(
          "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-muted transition-colors hover:text-foreground",
          active && "text-primary",
        )}
      >
        {body}
      </button>
    );
  }
  return (
    <Link
      href={href!}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-muted transition-colors hover:text-foreground",
        active && "text-primary",
      )}
    >
      {body}
    </Link>
  );
}

export function DashboardMobileNav({ role, onOpenMenu }: { role: AppRole; onOpenMenu: () => void }) {
  const pathname = usePathname();

  if (role === "ADMIN") {
    return (
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex h-[4.25rem] items-stretch justify-around border-t border-border bg-card/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-md md:hidden"
        aria-label="تنقل سريع"
      >
        <NavIcon href="/admin" label="الرئيسية" icon={LayoutDashboard} active={pathname === "/admin"} />
        <NavIcon href="/admin/students" label="الطلاب" icon={Users} active={pathname.startsWith("/admin/students")} />
        <NavIcon
          href="/admin/memorization/session"
          label="حصة"
          icon={CalendarCheck}
          active={pathname.startsWith("/admin/memorization/session")}
        />
        <NavIcon href="/admin/finance" label="المالية" icon={Wallet} active={pathname.startsWith("/admin/finance")} />
        <NavIcon label="المزيد" icon={Menu} onMore={onOpenMenu} active={false} />
      </nav>
    );
  }

  if (role === "STUDENT") {
    return (
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-center border-t border-border bg-card/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
        aria-label="تنقل سريع"
      >
        <NavIcon href="/student" label="لوحتي" icon={LayoutDashboard} active={pathname.startsWith("/student")} />
      </nav>
    );
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-center border-t border-border bg-card/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
      aria-label="تنقل سريع"
    >
      <NavIcon href="/parent" label="لوحة ولي الأمر" icon={HeartHandshake} active={pathname.startsWith("/parent")} />
    </nav>
  );
}
