"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BookOpenCheck,
  ClipboardList,
  Command,
  FileSpreadsheet,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  Search,
  Users,
  Wallet,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import type { AppRole } from "@/auth.config";

function useCommandPaletteListener(setOpen: (v: boolean) => void) {
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [setOpen]);
}

export function DashboardCommandMenu({ role }: { role: AppRole }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  useCommandPaletteListener(setOpen);

  const go = React.useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
    },
    [router],
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 gap-1.5 text-muted sm:gap-2"
        onClick={() => setOpen(true)}
        aria-label="فتح قائمة الأوامر"
      >
        <Command className="size-4" aria-hidden />
        <span className="hidden font-bold sm:inline">أوامر</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border border-border bg-muted-bg px-1.5 font-mono text-[10px] font-bold text-muted lg:inline-flex">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="ابحث عن صفحة أو إجراء…" />
        <CommandList>
          <CommandEmpty>لا نتائج.</CommandEmpty>

          {role === "ADMIN" ? (
            <>
              <CommandGroup heading="المشرف">
                <CommandItem onSelect={() => go("/admin")}>
                  <LayoutDashboard className="size-4 text-primary" aria-hidden />
                  نظرة عامة
                  <CommandShortcut>/admin</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => go("/admin/students")}>
                  <Users className="size-4 text-primary" aria-hidden />
                  الطلاب
                </CommandItem>
                <CommandItem onSelect={() => go("/admin/attendance")}>
                  <ClipboardList className="size-4 text-primary" aria-hidden />
                  الحضور والغياب
                </CommandItem>
                <CommandItem onSelect={() => go("/admin/memorization")}>
                  <BookOpenCheck className="size-4 text-primary" aria-hidden />
                  الحفظ والتسميع
                </CommandItem>
                <CommandItem onSelect={() => go("/admin/memorization/session")}>
                  <BookOpenCheck className="size-4 text-primary" aria-hidden />
                  حصة تسميع
                </CommandItem>
                <CommandItem onSelect={() => go("/admin/finance")}>
                  <Wallet className="size-4 text-primary" aria-hidden />
                  المالية
                </CommandItem>
                <CommandItem onSelect={() => go("/admin/subscriptions")}>
                  <Repeat className="size-4 text-primary" aria-hidden />
                  الاشتراكات
                </CommandItem>
                <CommandItem onSelect={() => go("/admin/reports")}>
                  <FileSpreadsheet className="size-4 text-primary" aria-hidden />
                  التقارير
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="بحث سريع">
                <CommandItem onSelect={() => go("/admin/students")}>
                  <Search className="size-4" aria-hidden />
                  فتح دليل الطلاب للبحث المحلي
                </CommandItem>
              </CommandGroup>
            </>
          ) : null}

          {role === "STUDENT" ? (
            <CommandGroup heading="الطالب">
              <CommandItem onSelect={() => go("/student")}>
                <GraduationCap className="size-4 text-primary" aria-hidden />
                لوحة الطالب
              </CommandItem>
            </CommandGroup>
          ) : null}

          {role === "PARENT" ? (
            <CommandGroup heading="ولي الأمر">
              <CommandItem onSelect={() => go("/parent")}>
                <HeartHandshake className="size-4 text-primary" aria-hidden />
                لوحة ولي الأمر
              </CommandItem>
            </CommandGroup>
          ) : null}

          <CommandSeparator />
          <CommandGroup heading="عام">
            <CommandItem onSelect={() => go("/")}>الصفحة العامة</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
