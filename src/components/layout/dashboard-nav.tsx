"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BookOpenCheck,
  Wallet,
  Repeat,
  FileSpreadsheet,
  CalendarCheck,
  UserCog,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/students", label: "الطلاب", icon: Users },
  { href: "/admin/user-accounts", label: "حسابات الدخول", icon: KeyRound },
  { href: "/admin/accounts", label: "الحسابات", icon: UserCog },
  { href: "/admin/attendance", label: "الحضور والغياب", icon: ClipboardList },
  { href: "/admin/memorization", label: "الحفظ والتسميع", icon: BookOpenCheck },
  { href: "/admin/memorization/session", label: "حصة تسميع", icon: CalendarCheck },
  { href: "/admin/finance", label: "المالية", icon: Wallet },
  { href: "/admin/subscriptions", label: "الاشتراكات", icon: Repeat },
  { href: "/admin/reports", label: "التقارير", icon: FileSpreadsheet },
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/memorization") return pathname === "/admin/memorization";
  if (href === "/admin/memorization/session") return pathname.startsWith("/admin/memorization/session");
  if (href === "/admin/subscriptions") return pathname.startsWith("/admin/subscriptions");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto p-3 md:min-h-0 md:flex-1 md:flex-col md:overflow-x-visible md:overflow-y-auto"
      aria-label="التنقل الرئيسي"
    >
      {adminLinks.map(({ href, label, icon: Icon }) => {
        const active = isNavActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => onNavigate?.()}
            className={cn(
              "flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-base font-bold transition-colors md:w-full md:shrink md:whitespace-normal",
              active
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-foreground/85 hover:bg-muted-bg hover:text-foreground",
            )}
          >
            <Icon className="size-5 shrink-0 opacity-90" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
