"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createInvoiceAction, type FinanceActionState } from "@/features/finance/actions";
import { nativeSelectClassName } from "@/lib/native-form-classes";

const initial: FinanceActionState = { ok: false, error: null };

function SubmitInv() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "جاري الإنشاء…" : "إصدار فاتورة"}
    </Button>
  );
}

type StudentOption = { id: string; fullName: string };

export function InvoiceForm({ students }: { students: StudentOption[] }) {
  const [state, formAction] = useActionState(createInvoiceAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <p className="text-sm font-bold text-red-600">{state.error}</p> : null}
      {state.ok ? (
        <p className="text-sm font-bold text-emerald-700">تم إنشاء الفاتورة.</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
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
          <Label htmlFor="title">عنوان الفاتورة</Label>
          <Input id="title" name="title" required maxLength={200} placeholder="مثال: رسوم شهر يناير" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">المبلغ</Label>
          <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required dir="ltr" className="text-left" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">تاريخ الاستحقاق (اختياري)</Label>
          <Input id="dueDate" name="dueDate" type="date" />
        </div>
      </div>
      <SubmitInv />
    </form>
  );
}
