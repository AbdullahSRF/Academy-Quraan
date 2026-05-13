"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { nativeSelectClassName } from "@/lib/native-form-classes";
import { assignStudentSubscriptionFormAction, updateStudentSubscriptionStatusFormAction } from "@/features/subscriptions/actions";
import type { StudentSubscriptionClient, SubscriptionPlanClient } from "@/features/subscriptions/serialize-for-client";
import { formatEgp } from "@/lib/format-egp";

const statusAr: Record<string, string> = {
  ACTIVE: "نشط",
  PAUSED: "موقوف",
  CANCELLED: "ملغى",
  EXPIRED: "منتهي",
};

const initial = { ok: false, error: null as string | null };

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "…" : label}
    </Button>
  );
}

function planOptionLabel(p: SubscriptionPlanClient): string {
  return `${p.name} — ${formatEgp(p.priceMonthly, { monthly: true })}`;
}

export function SubscriptionsAdminClient({
  plans,
  subscriptions,
  students,
}: {
  plans: SubscriptionPlanClient[];
  subscriptions: StudentSubscriptionClient[];
  students: { id: string; fullName: string }[];
}) {
  const [assignState, assignAction] = useActionState(
    async (_prev: typeof initial, fd: FormData) => assignStudentSubscriptionFormAction(fd),
    initial,
  );

  const defaultDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      <section className="space-y-3" aria-labelledby="fixed-plans-heading">
        <h2 id="fixed-plans-heading" className="text-lg font-bold text-foreground">
          الباقات المعتمدة
        </h2>
        <p className="text-sm font-bold text-muted">
          أربع باقات ثابتة بالنظام بالجنيه المصري — مرتبة: 8 حصص، ثم 12، ثم 16، ثم 24. لا يوجد إنشاء أو تعديل باقات من هذه الصفحة.
        </p>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[520px] border-collapse text-start text-sm font-bold">
            <thead>
              <tr className="border-b border-border bg-muted-bg/80">
                <th className="px-4 py-3">اسم الباقة</th>
                <th className="px-4 py-3">عدد الحصص الشهرية</th>
                <th className="px-4 py-3">السعر</th>
                <th className="px-4 py-3">عدد الاشتراكات</th>
              </tr>
            </thead>
            <tbody>
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted">
                    لا توجد باقات معروضة. تأكد من اتصال قاعدة البيانات وتشغيل المزامنة.
                  </td>
                </tr>
              ) : (
                plans.map((p) => (
                  <tr key={p.id} className="border-b border-border odd:bg-muted-bg/20">
                    <td className="px-4 py-3 text-foreground">{p.name}</td>
                    <td className="px-4 py-3 tabular-nums text-muted">{p.sessionsPerMonth ?? "—"}</td>
                    <td className="px-4 py-3 tabular-nums text-muted" dir="ltr">
                      {formatEgp(p.priceMonthly)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted">{p._count.subscriptions}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>ربط اشتراك بطالب</CardTitle>
          <CardDescription>اختر طالبًا وإحدى الباقات الأربع المعتمدة وتاريخ البداية.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={assignAction} className="space-y-4">
            {assignState.error ? (
              <p className="text-sm font-bold text-destructive" role="alert">
                {assignState.error}
              </p>
            ) : null}
            {assignState.ok ? (
              <p className="text-sm font-bold text-primary" role="status">
                تم إنشاء الاشتراك.
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="sub-student">الطالب</Label>
              <select id="sub-student" name="studentId" required className={nativeSelectClassName}>
                <option value="">— اختر —</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-plan">الباقة</Label>
              <select id="sub-plan" name="planId" required className={nativeSelectClassName}>
                <option value="">— اختر —</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {planOptionLabel(p)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sub-start">تاريخ البداية</Label>
                <Input id="sub-start" name="startedAt" type="date" defaultValue={defaultDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-end">تاريخ النهاية (اختياري)</Label>
                <Input id="sub-end" name="endsAt" type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-notes">ملاحظات</Label>
              <Input id="sub-notes" name="notes" placeholder="اختياري" />
            </div>
            <Submit label="ربط الاشتراك" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>اشتراكات الطلاب</CardTitle>
          <CardDescription>آخر {subscriptions.length} سجلًا — تعديل الحالة يحدّث المالية واللوحات.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 sm:p-6">
          {subscriptions.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm font-bold text-muted">لا اشتراكات بعد.</p>
          ) : (
            <table className="w-full min-w-[720px] border-collapse text-start text-sm font-bold">
              <thead>
                <tr className="border-b border-border bg-muted-bg/80">
                  <th className="px-4 py-3">الطالب</th>
                  <th className="px-4 py-3">الباقة</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3">من — إلى</th>
                  <th className="w-[14rem] px-4 py-3">تغيير الحالة</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s) => (
                  <tr key={s.id} className="border-b border-border odd:bg-muted-bg/25">
                    <td className="px-4 py-3">
                      <Link className="text-primary hover:underline" href={`/admin/students/${s.student.id}`}>
                        {s.student.fullName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      <span className="block text-foreground">{s.plan.name}</span>
                      {s.plan.sessionsPerMonth != null ? (
                        <span className="block text-xs font-bold">الحصص الشهرية: {s.plan.sessionsPerMonth}</span>
                      ) : null}
                      <span className="block text-xs font-bold" dir="ltr">
                        {formatEgp(s.plan.priceMonthly, { monthly: true })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{statusAr[s.status] ?? s.status}</td>
                    <td className="px-4 py-3 text-xs text-muted" dir="ltr">
                      {s.startedAt.slice(0, 10)}
                      {s.endsAt ? ` → ${s.endsAt.slice(0, 10)}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <form
                        action={async (fd) => {
                          await updateStudentSubscriptionStatusFormAction(fd);
                        }}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <input type="hidden" name="id" value={s.id} />
                        <select name="status" defaultValue={s.status} className={`${nativeSelectClassName} max-w-[10rem]`}>
                          <option value="ACTIVE">نشط</option>
                          <option value="PAUSED">موقوف</option>
                          <option value="CANCELLED">ملغى</option>
                          <option value="EXPIRED">منتهي</option>
                        </select>
                        <Button type="submit" size="sm" variant="outline">
                          تحديث
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
