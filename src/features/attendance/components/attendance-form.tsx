"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertAttendanceAction, type AttendanceActionState } from "@/features/attendance/actions";
import { nativeSelectClassName } from "@/lib/native-form-classes";

const initial: AttendanceActionState = { ok: false, error: null };

function SubmitAttendance() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "جاري الحفظ…" : "تسجيل الحضور"}
    </Button>
  );
}

type StudentOption = { id: string; fullName: string };

export function AttendanceForm({ students, defaultDate }: { students: StudentOption[]; defaultDate: string }) {
  const [state, formAction] = useActionState(upsertAttendanceAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <p className="text-sm font-bold text-red-600">{state.error}</p> : null}
      {state.ok ? (
        <p className="text-sm font-bold text-emerald-700">تم حفظ السجل.</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">التاريخ</Label>
          <Input id="date" name="date" type="date" required defaultValue={defaultDate} />
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
        <div className="space-y-2">
          <Label htmlFor="status">الحالة</Label>
          <select
            id="status"
            name="status"
            required
            defaultValue="PRESENT"
            className={nativeSelectClassName}
          >
            <option value="PRESENT">حاضر</option>
            <option value="ABSENT">غائب</option>
            <option value="EXCUSED">معذور</option>
            <option value="LATE">متأخر</option>
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="note">ملاحظة (اختياري)</Label>
          <Input id="note" name="note" maxLength={500} />
        </div>
      </div>
      <SubmitAttendance />
    </form>
  );
}
