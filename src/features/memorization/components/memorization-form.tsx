"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMemorizationAction, type MemoActionState } from "@/features/memorization/actions";
import { nativeSelectClassName, nativeTextareaClassName } from "@/lib/native-form-classes";

const initial: MemoActionState = { ok: false, error: null };

function SubmitMemo() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "جاري الحفظ…" : "حفظ السجل"}
    </Button>
  );
}

type StudentOption = { id: string; fullName: string };

export function MemorizationForm({ students, defaultDate }: { students: StudentOption[]; defaultDate: string }) {
  const [state, formAction] = useActionState(createMemorizationAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <p className="text-sm font-bold text-red-600">{state.error}</p> : null}
      {state.ok ? (
        <p className="text-sm font-bold text-emerald-700">تم إضافة السجل.</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sessionDate">تاريخ الجلسة</Label>
          <Input id="sessionDate" name="sessionDate" type="date" required defaultValue={defaultDate} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="studentId">الطالب</Label>
          <select
            id="studentId"
            name="studentId"
            required
            className={nativeSelectClassName}
          >
            <option value="">— اختر —</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="type">نوع الجلسة</Label>
          <select
            id="type"
            name="type"
            required
            defaultValue="NEW_MEMORIZATION"
            className={nativeSelectClassName}
          >
            <option value="NEW_MEMORIZATION">حفظ جديد</option>
            <option value="REVIEW">مراجعة</option>
            <option value="RECITATION">تسميع</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fromSurah">من سورة</Label>
          <Input id="fromSurah" name="fromSurah" maxLength={80} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fromAyah">من آية</Label>
          <Input id="fromAyah" name="fromAyah" type="number" min={1} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="toSurah">إلى سورة</Label>
          <Input id="toSurah" name="toSurah" maxLength={80} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="toAyah">إلى آية</Label>
          <Input id="toAyah" name="toAyah" type="number" min={1} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="score">الدرجة (اختياري)</Label>
          <Input id="score" name="score" type="number" min={0} max={100} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">ملاحظات</Label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            maxLength={2000}
            className={nativeTextareaClassName}
          />
        </div>
      </div>
      <SubmitMemo />
    </form>
  );
}
