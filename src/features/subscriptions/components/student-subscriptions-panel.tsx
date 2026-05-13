"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { nativeSelectClassName } from "@/lib/native-form-classes";
import { PriceAmount } from "@/components/ui/price-amount";
import {
  deleteStudentSubscriptionFormAction,
  updateStudentSubscriptionDetailsFormAction,
} from "@/features/subscriptions/actions";
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

function dateInputFromIso(iso: string): string {
  return iso.slice(0, 10);
}

export function StudentSubscriptionsPanel({
  studentId,
  subscriptions,
  plans,
}: {
  studentId: string;
  subscriptions: StudentSubscriptionClient[];
  plans: SubscriptionPlanClient[];
}) {
  const [editing, setEditing] = useState<StudentSubscriptionClient | null>(null);

  const [deleteState, deleteAction] = useActionState(
    async (_prev: typeof initial, fd: FormData) => deleteStudentSubscriptionFormAction(fd),
    initial,
  );

  const [editState, editAction] = useActionState(
    async (_prev: typeof initial, fd: FormData) => updateStudentSubscriptionDetailsFormAction(fd),
    initial,
  );

  useEffect(() => {
    if (editState.ok) setEditing(null);
  }, [editState.ok]);

  return (
    <div className="space-y-3">
      {deleteState.error ? (
        <p className="text-sm font-bold text-destructive" role="alert">
          {deleteState.error}
        </p>
      ) : null}
      {subscriptions.length === 0 ? (
        <p className="text-sm font-bold text-muted">لا توجد اشتراكات مسجّلة لهذا الطالب. يمكنك إضافة اشتراك من صفحة «الاشتراكات» العامة.</p>
      ) : (
        <ul className="space-y-3">
          {subscriptions.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-muted-bg/30 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1 text-sm font-bold">
                <p className="text-foreground">{s.plan.name}</p>
                <p className="text-muted">
                  {statusAr[s.status] ?? s.status} — من{" "}
                  <span dir="ltr">{dateInputFromIso(s.startedAt)}</span>
                  {s.endsAt ? (
                    <>
                      {" "}
                      إلى <span dir="ltr">{dateInputFromIso(s.endsAt)}</span>
                    </>
                  ) : null}
                </p>
                <p className="text-xs text-muted">
                  <PriceAmount>{s.plan.priceMonthly}</PriceAmount> {s.plan.currency} شهريًا
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(s)}>
                  <Pencil className="size-3.5" aria-hidden />
                  تعديل
                </Button>
                <form action={deleteAction} className="inline">
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="studentId" value={studentId} />
                  <Button
                    type="submit"
                    variant="destructive"
                    size="sm"
                    className="gap-1.5"
                    onClick={(e) => {
                      if (!window.confirm("حذف هذا الاشتراك نهائيًا؟ لا يمكن التراجع.")) e.preventDefault();
                    }}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    حذف
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل الاشتراك</DialogTitle>
            <DialogDescription>غيّر الباقة أو التواريخ أو الحالة أو الملاحظات ثم احفظ.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <form key={editing.id} action={editAction} className="space-y-4">
              {editState.error ? (
                <p className="text-sm font-bold text-destructive" role="alert">
                  {editState.error}
                </p>
              ) : null}
              <input type="hidden" name="id" value={editing.id} />
              <input type="hidden" name="studentId" value={studentId} />

              <div className="space-y-2">
                <Label htmlFor="sub-plan">الباقة</Label>
                <select
                  id="sub-plan"
                  name="planId"
                  required
                  defaultValue={editing.plan.id}
                  className={nativeSelectClassName}
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sub-status">الحالة</Label>
                <select
                  id="sub-status"
                  name="status"
                  required
                  defaultValue={editing.status}
                  className={nativeSelectClassName}
                >
                  {(["ACTIVE", "PAUSED", "CANCELLED", "EXPIRED"] as const).map((st) => (
                    <option key={st} value={st}>
                      {statusAr[st]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sub-start">تاريخ البداية</Label>
                  <Input
                    id="sub-start"
                    name="startedAt"
                    type="date"
                    required
                    defaultValue={dateInputFromIso(editing.startedAt)}
                    dir="ltr"
                    className="text-left"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub-end">تاريخ النهاية (اختياري)</Label>
                  <Input
                    id="sub-end"
                    name="endsAt"
                    type="date"
                    defaultValue={editing.endsAt ? dateInputFromIso(editing.endsAt) : ""}
                    dir="ltr"
                    className="text-left"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sub-notes">ملاحظات</Label>
                <Input id="sub-notes" name="notes" maxLength={500} defaultValue={editing.notes ?? ""} placeholder="اختياري" />
              </div>

              <DialogFooter className="gap-2 sm:justify-start">
                <Submit label="حفظ التعديلات" />
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  إلغاء
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
