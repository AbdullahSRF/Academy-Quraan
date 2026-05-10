"use client";

import Link from "next/link";
import { Zap, LayoutDashboard, Users, ClipboardList, BookOpenCheck, CalendarCheck, Wallet, Repeat, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const items = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/students", label: "الطلاب", icon: Users },
  { href: "/admin/attendance", label: "الحضور", icon: ClipboardList },
  { href: "/admin/memorization", label: "الحفظ", icon: BookOpenCheck },
  { href: "/admin/memorization/session", label: "حصة تسميع", icon: CalendarCheck },
  { href: "/admin/finance", label: "المالية", icon: Wallet },
  { href: "/admin/subscriptions", label: "الاشتراكات", icon: Repeat },
  { href: "/admin/reports", label: "التقارير", icon: FileSpreadsheet },
] as const;

export function AdminQuickActions({ className }: { className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" className={className} aria-label="إجراءات سريعة">
          <Zap className="size-4 sm:me-1" aria-hidden />
          <span className="hidden sm:inline">سريع</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[12rem]">
        <DropdownMenuLabel>انتقال سريع</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map(({ href, label, icon: Icon }) => (
          <DropdownMenuItem key={href} asChild>
            <Link href={href} className="flex cursor-pointer items-center gap-2">
              <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
