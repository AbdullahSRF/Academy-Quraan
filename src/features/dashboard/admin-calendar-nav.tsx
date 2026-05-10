"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

function shiftMonth(year: number, month1to12: number, delta: number) {
  const d = new Date(Date.UTC(year, month1to12 - 1 + delta, 1, 12, 0, 0, 0));
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 };
}

export function AdminCalendarNav({
  year,
  month,
  todayYear,
  todayMonth,
}: {
  year: number;
  month: number;
  todayYear: number;
  todayMonth: number;
}) {
  const prev = useMemo(() => shiftMonth(year, month, -1), [year, month]);
  const next = useMemo(() => shiftMonth(year, month, 1), [year, month]);
  const isCurrent = year === todayYear && month === todayMonth;

  const href = (y: number, m: number) => `/admin?calYear=${y}&calMonth=${m}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="size-9 shrink-0" asChild aria-label="الشهر السابق">
          <Link href={href(prev.y, prev.m)}>
            <ChevronRight className="size-4" />
          </Link>
        </Button>
        <Button variant="outline" size="icon" className="size-9 shrink-0" asChild aria-label="الشهر التالي">
          <Link href={href(next.y, next.m)}>
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {!isCurrent ? (
          <Button variant="default" size="sm" asChild className="gap-1">
            <Link href="/admin">
              <CalendarDays className="size-4" aria-hidden />
              الشهر الحالي
            </Link>
          </Button>
        ) : (
          <span className="text-xs font-bold text-muted">عرض الشهر الحالي (UTC)</span>
        )}
      </div>
    </div>
  );
}
