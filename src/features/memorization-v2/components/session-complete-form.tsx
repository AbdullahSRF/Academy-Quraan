"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { MemorizationSessionDraft } from "@/features/memorization-v2/application/plan-session-draft";
import { completeMemorizationSessionAction, type CompleteSessionState } from "@/features/memorization-v2/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SessionDraftTextarea } from "@/features/memorization-v2/components/session-draft-textarea";
import { SessionDraftServerSync } from "@/features/memorization-v2/components/session-draft-server-sync";
import { nativeSelectClassName } from "@/lib/native-form-classes";

const initial: CompleteSessionState = { ok: false, error: null };

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "جاري الحفظ…" : "تم التسميع"}
    </Button>
  );
}

type StudentOpt = { id: string; fullName: string };

export function SessionCompleteForm({
  students,
  defaultDate,
  initialStudentId,
  lockedStudentId,
  draft,
}: {
  students: StudentOpt[];
  defaultDate: string;
  initialStudentId?: string;
  /** عند التعيين: يُثبَّت الطالب ويُخفى الاختيار (مثلاً من ملف الطالب). */
  lockedStudentId?: string;
  draft?: MemorizationSessionDraft | null;
}) {
  const studentDefault =
    lockedStudentId && students.some((s) => s.id === lockedStudentId)
      ? lockedStudentId
      : initialStudentId && students.some((s) => s.id === initialStudentId)
        ? initialStudentId
        : "";
  const [state, formAction] = useActionState(completeMemorizationSessionAction, initial);

  return (
    <form id="complete-session-form" action={formAction} className="space-y-5">
      {state.error ? (
        <p className="rounded-xl border-2 border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-xl border-2 border-primary/30 bg-accent px-3 py-2 text-sm font-bold text-accent-foreground">
          تم حفظ الحصة وتحديث المناطق والإحصائيات.
        </p>
      ) : null}

      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-accent/40 p-4 sm:p-5">
          <h3 className="mb-3 text-sm font-bold text-accent-foreground">أساسيات الحصة</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              {lockedStudentId ? <Label>الطالب</Label> : <Label htmlFor="studentId">الطالب</Label>}
              {lockedStudentId ? (
                <>
                  <input type="hidden" name="studentId" value={lockedStudentId} />
                  <p className="rounded-xl border border-border bg-muted-bg/50 px-3 py-2 text-sm font-bold text-foreground">
                    {students.find((s) => s.id === lockedStudentId)?.fullName ?? "—"}
                  </p>
                </>
              ) : (
                <select
                  id="studentId"
                  name="studentId"
                  required
                  className={nativeSelectClassName}
                  defaultValue={studentDefault}
                >
                  <option value="">— اختر —</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionDate">تاريخ الحصة</Label>
              <Input id="sessionDate" name="sessionDate" type="date" required defaultValue={defaultDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendanceStatus">الحضور</Label>
              <select id="attendanceStatus" name="attendanceStatus" required className={nativeSelectClassName} defaultValue="PRESENT">
                <option value="PRESENT">حاضر</option>
                <option value="ABSENT">غائب</option>
                <option value="EXCUSED">معذور</option>
                <option value="LATE">متأخر</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">التقييم</Label>
              <select id="rating" name="rating" className={nativeSelectClassName}>
                <option value="">—</option>
                <option value="EXCELLENT">ممتاز</option>
                <option value="VERY_GOOD">جيد جدًا</option>
                <option value="GOOD">جيد</option>
                <option value="WEAK">ضعيف</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">حالة الدفع</Label>
              <select id="paymentStatus" name="paymentStatus" required className={nativeSelectClassName} defaultValue="NOT_APPLICABLE">
                <option value="NOT_APPLICABLE">لا يطبق</option>
                <option value="PENDING">معلق</option>
                <option value="PAID">مدفوع</option>
                <option value="WAIVED">معفى</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="paymentAmount">مبلغ الدفع (مطلوب عند اختيار «مدفوع»)</Label>
              <Input
                id="paymentAmount"
                name="paymentAmount"
                type="number"
                min={0}
                step="0.01"
                placeholder="0"
                dir="ltr"
                className="text-left"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="paymentMethod">طريقة الدفع (اختياري)</Label>
              <Input id="paymentMethod" name="paymentMethod" maxLength={80} placeholder="نقدًا، تحويل، …" />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-muted-bg/50 p-4 sm:p-5">
          <h3 className="mb-3 text-sm font-bold text-foreground">منطقة الجديد — نطاق الحصة</h3>
          <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <p className="text-sm font-bold text-muted">نطاق الجديد في هذه الحصة (سورة/آية)</p>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="newStartSurah">من سورة</Label>
              <Input
                id="newStartSurah"
                name="newStartSurah"
                type="number"
                min={1}
                max={114}
                required
                defaultValue={draft?.newStartSurah ?? 1}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newStartAyah">من آية</Label>
              <Input
                id="newStartAyah"
                name="newStartAyah"
                type="number"
                min={1}
                required
                defaultValue={draft?.newStartAyah ?? 1}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newEndSurah">إلى سورة</Label>
              <Input
                id="newEndSurah"
                name="newEndSurah"
                type="number"
                min={1}
                max={114}
                required
                defaultValue={draft?.newEndSurah ?? 1}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newEndAyah">إلى آية</Label>
              <Input
                id="newEndAyah"
                name="newEndAyah"
                type="number"
                min={1}
                required
                defaultValue={draft?.newEndAyah ?? 1}
              />
            </div>
          </div>
        </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-amber-500/10 p-4 sm:p-5 dark:bg-amber-500/15">
          <h3 className="mb-3 text-sm font-bold text-foreground">الماضي القريب — مراجعة اختيارية</h3>
          <div className="space-y-2 sm:col-span-2">
          <p className="text-sm font-bold text-muted">ضمن حدود المنطقة الحالية</p>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="nearWorkStartSurah">قريب: من سورة</Label>
              <Input id="nearWorkStartSurah" name="nearWorkStartSurah" type="number" min={1} max={114} placeholder="—" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="nearWorkStartAyah">من آية</Label>
              <Input id="nearWorkStartAyah" name="nearWorkStartAyah" type="number" min={1} placeholder="—" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="nearWorkEndSurah">إلى سورة</Label>
              <Input id="nearWorkEndSurah" name="nearWorkEndSurah" type="number" min={1} max={114} placeholder="—" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="nearWorkEndAyah">إلى آية</Label>
              <Input id="nearWorkEndAyah" name="nearWorkEndAyah" type="number" min={1} placeholder="—" />
            </div>
          </div>
        </div>
        </section>

        <section className="rounded-xl border border-border bg-sky-500/10 p-4 sm:p-5 dark:bg-sky-500/15">
          <h3 className="mb-3 text-sm font-bold text-foreground">الماضي البعيد — مراجعة اختيارية</h3>
          <div className="space-y-2 sm:col-span-2">
          <p className="text-sm font-bold text-muted">ضمن حدود المنطقة الحالية</p>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="farWorkStartSurah">بعيد: من سورة</Label>
              <Input id="farWorkStartSurah" name="farWorkStartSurah" type="number" min={1} max={114} placeholder="—" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="farWorkStartAyah">من آية</Label>
              <Input id="farWorkStartAyah" name="farWorkStartAyah" type="number" min={1} placeholder="—" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="farWorkEndSurah">إلى سورة</Label>
              <Input id="farWorkEndSurah" name="farWorkEndSurah" type="number" min={1} max={114} placeholder="—" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="farWorkEndAyah">إلى آية</Label>
              <Input id="farWorkEndAyah" name="farWorkEndAyah" type="number" min={1} placeholder="—" />
            </div>
          </div>
        </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h3 className="mb-3 text-sm font-bold text-foreground">إنهاء الحصة</h3>
          <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-foreground">
            <input
              type="checkbox"
              name="autoPromoteCompletedSurah"
              className="size-4 rounded border-border"
              defaultChecked={draft?.autoPromoteCompletedSurah ?? false}
            />
            إكمال سورة في الجديد — ترقية تلقائية للمناطق (نقل الجديد → قريب → بعيد)
          </label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="durationMinutes">مدة الحصة (دقيقة)</Label>
          <Input id="durationMinutes" name="durationMinutes" type="number" min={0} placeholder="اختياري" />
        </div>
        <div className="sm:col-span-2">
          <SessionDraftTextarea
            id="homeworkNext"
            name="homeworkNext"
            label="الواجب القادم"
            formId="complete-session-form"
            field="homework"
            defaultDate={defaultDate}
            initialStudentId={lockedStudentId ?? initialStudentId}
            defaultValue={draft?.homeworkNext ?? ""}
            maxLength={2000}
            placeholder="اختياري"
          />
        </div>
        <div className="sm:col-span-2">
          <SessionDraftTextarea
            id="notes"
            name="notes"
            label="ملاحظات"
            formId="complete-session-form"
            field="notes"
            defaultDate={defaultDate}
            initialStudentId={lockedStudentId ?? initialStudentId}
            defaultValue={draft?.notes ?? ""}
            maxLength={2000}
            placeholder="اختياري"
          />
        </div>
          </div>
        </section>
      </div>
      <div className="px-1 pb-2">
        <SessionDraftServerSync formId="complete-session-form" />
      </div>
      <div className="sticky bottom-0 z-20 -mx-1 flex flex-wrap gap-3 border-t border-border bg-background/90 px-1 py-4 backdrop-blur supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <SubmitBtn />
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/memorization">السجل القديم</Link>
        </Button>
      </div>
    </form>
  );
}
