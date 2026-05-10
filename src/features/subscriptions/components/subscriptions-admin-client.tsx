"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { nativeSelectClassName } from "@/lib/native-form-classes";
import {
  assignStudentSubscriptionFormAction,
  createSubscriptionPlanFormAction,
  updateStudentSubscriptionStatusFormAction,
} from "@/features/subscriptions/actions";
import { cn } from "@/lib/utils";
import type { StudentSubscriptionClient, SubscriptionPlanClient } from "@/features/subscriptions/serialize-for-client";

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

export function SubscriptionsAdminClient({
  plans,
  subscriptions,
  students,
}: {
  plans: SubscriptionPlanClient[];
  subscriptions: StudentSubscriptionClient[];
  students: { id: string; fullName: string }[];
}) {
  const [planState, planAction] = useActionState(async (_prev: typeof initial, fd: FormData) => createSubscriptionPlanFormAction(fd), initial);
  const [assignState, assignAction] = useActionState(
    async (_prev: typeof initial, fd: FormData) => assignStudentSubscriptionFormAction(fd),
    initial,
  );

  const defaultDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>باقة جديدة</CardTitle>
            <CardDescription>اسم، سعر شهري تقريبي، رمز اختياري (فريد).</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={planAction} className="space-y-4">
              {planState.error ? (
                <p className="text-sm font-bold text-destructive" role="alert">
                  {planState.error}
                </p>
              ) : null}
              {planState.ok ? (
                <p className="text-sm font-bold text-primary" role="status">
                  تم إنشاء الباقة.
                </p>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="plan-name">اسم الباقة</Label>
                <Input id="plan-name" name="name" required placeholder="مثال: حلقة شهرية" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-code">رمز (اختياري)</Label>
                <Input id="plan-code" name="code" dir="ltr" placeholder="MONTHLY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-desc">وصف (اختياري)</Label>
                <Input id="plan-desc" name="description" placeholder="ملاحظات داخلية" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-price">السعر الشهري</Label>
                <Input id="plan-price" name="priceMonthly" type="number" step="0.01" min={0} required defaultValue={0} dir="ltr" />
              </div>
              <Submit label="حفظ الباقة" />
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ربط اشتراك بطالب</CardTitle>
            <CardDescription>اختر طالبًا وباقةً وتاريخ بداية (افتراضي: اليوم UTC).</CardDescription>
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
                      {p.name} — {p.priceMonthly} {p.currency}
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الباقات</CardTitle>
          <CardDescription>{plans.length} باقة</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {plans.length === 0 ? (
            <p className="text-sm font-bold text-muted">لا توجد باقات بعد. أنشئ باقة من النموذج أعلاه.</p>
          ) : (
            <table className="w-full min-w-[480px] border-collapse text-start text-sm font-bold">
              <thead>
                <tr className="border-b border-border bg-muted-bg/80">
                  <th className="px-4 py-3">الاسم</th>
                  <th className="px-4 py-3">الرمز</th>
                  <th className="px-4 py-3">السعر</th>
                  <th className="px-4 py-3">اشتراكات</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} className="border-b border-border odd:bg-muted-bg/25">
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3 text-muted" dir="ltr">
                      {p.code ?? "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums" dir="ltr">
                      {p.priceMonthly} {p.currency}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{p._count.subscriptions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>اشتراكات الطلاب</CardTitle>
          <CardDescription>آخر {subscriptions.length} سجلًا — تعديل الحالة يحدّث المالية فورًا.</CardDescription>
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
                  <th className="px-4 py-3 w-[14rem]">تغيير</th>
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
                    <td className="px-4 py-3 text-muted">{s.plan.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={s.status === "ACTIVE" ? "success" : s.status === "PAUSED" ? "warning" : "secondary"}>
                        {statusAr[s.status] ?? s.status}
                      </Badge>
                    </td>
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
                        <select name="status" defaultValue={s.status} className={cn(nativeSelectClassName, "max-w-[10rem]")}>
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
