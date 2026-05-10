"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StudentDirectoryRow = {
  id: string;
  fullName: string;
  age: number | null;
  status: string;
  level: string | null;
  phone: string | null;
  parentPhone: string | null;
  accountEmail: string | null;
  lastAttendanceDate: string | null;
  lastAttendanceStatus: string | null;
  progressLevel: string | null;
  completionPercent: number | null;
  openInvoices: number;
  overdueInvoices: number;
};

const statusLabel: Record<string, string> = {
  REGULAR: "منتظم",
  PAUSED: "متوقف",
  FROZEN: "مجمد",
  WITHDRAWN: "منسحب",
  ARCHIVED: "مؤرشف",
};

const attLabel: Record<string, string> = {
  PRESENT: "حاضر",
  ABSENT: "غائب",
  EXCUSED: "معذور",
  LATE: "متأخر",
};

function statusBadgeVariant(status: string): "success" | "warning" | "secondary" | "destructive" {
  if (status === "REGULAR") return "success";
  if (status === "PAUSED" || status === "FROZEN") return "warning";
  if (status === "WITHDRAWN") return "destructive";
  if (status === "ARCHIVED") return "secondary";
  return "secondary";
}

export function StudentsDirectory({ rows }: { rows: StudentDirectoryRow[] }) {
  const [q, setQ] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | "ALL">("ALL");

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (!needle) return true;
      const hay = `${r.fullName} ${r.level ?? ""} ${r.accountEmail ?? ""} ${r.phone ?? ""} ${r.parentPhone ?? ""}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, q, statusFilter]);

  const chips: { id: string | "ALL"; label: string }[] = [
    { id: "ALL", label: "الكل" },
    { id: "REGULAR", label: "منتظم" },
    { id: "PAUSED", label: "متوقف" },
    { id: "FROZEN", label: "مجمد" },
    { id: "WITHDRAWN", label: "منسحب" },
    { id: "ARCHIVED", label: "مؤرشف" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="relative max-w-lg flex-1">
          <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بحث بالاسم، المستوى، الهاتف، البريد…"
            className="h-11 pe-10"
            aria-label="بحث الطلاب"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-muted">
          <Filter className="size-4 shrink-0" aria-hidden />
          <span>الحالة:</span>
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setStatusFilter(c.id)}
              className={cn(
                "rounded-full border px-3 py-1 transition-colors",
                statusFilter === c.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted-bg",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm font-bold text-muted">
        عرض {filtered.length} من {rows.length}
      </p>

      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card md:block">
        <table className="w-full min-w-[920px] border-collapse text-start text-sm font-bold">
          <thead>
            <tr className="border-b border-border bg-muted-bg/80 text-foreground">
              <th className="px-4 py-3">الاسم</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3">آخر حضور</th>
              <th className="px-4 py-3">التقدّم</th>
              <th className="px-4 py-3">الفواتير</th>
              <th className="px-4 py-3 w-[14rem]">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-border odd:bg-muted-bg/30">
                <td className="px-4 py-3">
                  <Link href={`/admin/students/${s.id}`} className="font-bold text-primary hover:underline">
                    {s.fullName}
                  </Link>
                  <p className="mt-0.5 text-xs font-bold text-muted">{s.level ?? "—"}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusBadgeVariant(s.status)}>{statusLabel[s.status] ?? s.status}</Badge>
                </td>
                <td className="px-4 py-3 text-muted" dir="ltr">
                  {s.lastAttendanceDate ? (
                    <>
                      {s.lastAttendanceDate.slice(0, 10)}
                      {s.lastAttendanceStatus ? (
                        <span className="ms-2 text-foreground">({attLabel[s.lastAttendanceStatus] ?? s.lastAttendanceStatus})</span>
                      ) : null}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {s.progressLevel ?? "—"}
                  {s.completionPercent != null ? (
                    <span className="ms-1 text-xs font-bold text-muted">({s.completionPercent}%)</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-muted">
                  مفتوحة: {s.openInvoices}
                  {s.overdueInvoices > 0 ? (
                    <Badge variant="warning" className="ms-2">
                      متأخرة {s.overdueInvoices}
                    </Badge>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" asChild>
                      <Link href={`/admin/memorization/session?studentId=${encodeURIComponent(s.id)}`}>حصة</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/students/${s.id}`}>الملف</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/students/${s.id}/edit`}>تعديل</Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {filtered.map((s) => (
          <Card key={s.id} className="border-border shadow-sm">
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link href={`/admin/students/${s.id}`} className="text-lg font-bold text-primary">
                    {s.fullName}
                  </Link>
                  <p className="text-xs font-bold text-muted">{s.level ?? "—"}</p>
                </div>
                <Badge variant={statusBadgeVariant(s.status)}>{statusLabel[s.status] ?? s.status}</Badge>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-xs font-bold text-muted">
                <div>
                  <dt>آخر حضور</dt>
                  <dd className="text-foreground" dir="ltr">
                    {s.lastAttendanceDate ? s.lastAttendanceDate.slice(0, 10) : "—"}
                  </dd>
                </div>
                <div>
                  <dt>التقدّم</dt>
                  <dd className="text-foreground">{s.progressLevel ?? "—"}</dd>
                </div>
                <div className="col-span-2">
                  <dt>فواتير</dt>
                  <dd className="text-foreground">
                    مفتوحة {s.openInvoices}
                    {s.overdueInvoices > 0 ? ` — متأخرة ${s.overdueInvoices}` : ""}
                  </dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" asChild className="flex-1">
                  <Link href={`/admin/memorization/session?studentId=${encodeURIComponent(s.id)}`}>بدء حصة</Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/admin/students/${s.id}`}>الملف</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
