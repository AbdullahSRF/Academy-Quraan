"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatEgp } from "@/lib/format-egp";

type AdminSearchStudentHit = { id: string; fullName: string; status: string };
type AdminSearchInvoiceHit = {
  id: string;
  title: string;
  status: string;
  amount: string;
  studentId: string;
  studentFullName: string;
};

export function AdminGlobalSearch({ className }: { className?: string }) {
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [students, setStudents] = React.useState<AdminSearchStudentHit[]>([]);
  const [invoices, setInvoices] = React.useState<AdminSearchInvoiceHit[]>([]);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  React.useEffect(() => {
    if (q.trim().length < 1) {
      setStudents([]);
      setInvoices([]);
      setApiError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setApiError(null);
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q.trim())}`);
        if (!res.ok) {
          setApiError(
            res.status === 403
              ? "غير مصرّح — سجّل الدخول كمشرف."
              : res.status === 429
                ? "طلبات كثيرة — انتظر قليلًا."
                : `تعذر البحث (رمز ${res.status}). ليست بالضرورة مشكلة إنترنت.`,
          );
          setStudents([]);
          setInvoices([]);
          return;
        }
        const data = (await res.json()) as { students?: AdminSearchStudentHit[]; invoices?: AdminSearchInvoiceHit[] };
        setStudents(data.students ?? []);
        setInvoices(data.invoices ?? []);
      } catch {
        setApiError("تعذر الاتصال بالخادم — تحقق من الشبكة أو أعد تحميل الصفحة.");
        setStudents([]);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => window.clearTimeout(t);
  }, [q]);

  const empty = !loading && students.length === 0 && invoices.length === 0;

  return (
    <div ref={wrapRef} className={cn("relative hidden min-w-0 flex-1 md:block md:max-w-md", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="بحث: طالب أو فاتورة…"
          className="h-10 pe-10"
          aria-autocomplete="list"
          aria-expanded={open}
        />
      </div>
      {open && q.trim().length > 0 ? (
        <div
          className="absolute start-0 top-[calc(100%+6px)] z-50 max-h-80 w-full overflow-auto rounded-xl border border-border bg-card py-2 shadow-lg"
          role="listbox"
        >
          {apiError ? (
            <p className="px-3 py-2 text-sm font-bold text-destructive" role="alert">
              {apiError}
            </p>
          ) : loading ? (
            <p className="px-3 py-2 text-sm font-bold text-muted">جاري البحث…</p>
          ) : empty ? (
            <p className="px-3 py-2 text-sm font-bold text-muted">لا نتائج</p>
          ) : (
            <div className="space-y-3 px-1">
              {students.length > 0 ? (
                <div>
                  <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-muted">طلاب</p>
                  <ul className="space-y-0.5">
                    {students.map((h) => (
                      <li key={h.id}>
                        <Link
                          href={`/admin/students/${h.id}`}
                          className="block rounded-lg px-3 py-2 text-sm font-bold text-foreground hover:bg-muted-bg"
                          onClick={() => {
                            setOpen(false);
                            setQ("");
                          }}
                        >
                          {h.fullName}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {invoices.length > 0 ? (
                <div>
                  <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-muted">فواتير</p>
                  <ul className="space-y-0.5">
                    {invoices.map((inv) => (
                      <li key={inv.id}>
                        <Link
                          href={`/admin/students/${inv.studentId}`}
                          className="block rounded-lg px-3 py-2 text-sm font-bold hover:bg-muted-bg"
                          onClick={() => {
                            setOpen(false);
                            setQ("");
                          }}
                        >
                          <span className="text-foreground">{inv.title}</span>
                          <span className="mt-0.5 block text-xs font-bold text-muted">
                            {inv.studentFullName} ·{" "}
                            <span dir="ltr" className="tabular-nums">
                              {formatEgp(inv.amount)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
