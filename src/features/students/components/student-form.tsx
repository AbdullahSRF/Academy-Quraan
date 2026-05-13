"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { StudentStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStudentAction, updateStudentAction, type StudentActionState } from "@/features/students/actions";
import { nativeSelectClassName, nativeTextareaClassName } from "@/lib/native-form-classes";

const initial: StudentActionState = { ok: false, error: null };

const statusOptions: { value: StudentStatus; label: string }[] = [
  { value: "REGULAR", label: "منتظم" },
  { value: "PAUSED", label: "متوقف" },
  { value: "FROZEN", label: "مجمد" },
  { value: "WITHDRAWN", label: "منسحب" },
  { value: "ARCHIVED", label: "مؤرشف" },
];

function SubmitLabel({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  if (pending) return mode === "create" ? "جاري الإضافة…" : "جاري الحفظ…";
  return mode === "create" ? "إضافة الطالب" : "حفظ التعديلات";
}

type DefaultValues = {
  fullName: string;
  age: number | null;
  phone: string | null;
  parentPhone: string | null;
  address: string | null;
  level: string | null;
  status: StudentStatus;
};

type Props = {
  mode: "create" | "edit";
  studentId?: string;
  defaultValues?: DefaultValues;
};

export function StudentForm({ mode, studentId, defaultValues }: Props) {
  const action = mode === "create" ? createStudentAction : updateStudentAction;
  const [state, formAction] = useActionState(action, initial);

  const dv: DefaultValues = defaultValues ?? {
    fullName: "",
    age: null,
    phone: null,
    parentPhone: null,
    address: null,
    level: null,
    status: "REGULAR",
  };

  return (
    <form action={formAction} className="space-y-4">
      {mode === "edit" && studentId ? <input type="hidden" name="studentId" value={studentId} /> : null}
      {state.error ? (
        <p
          className="rounded-xl border-2 border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
          {mode === "create" ? (
            <>
              تمت إضافة الطالب بنجاح.
              {state.createdLoginEmail ? (
                <>
                  {" "}
                  بريد تسجيل الدخول: <span dir="ltr">{state.createdLoginEmail}</span> — أبلغ الطالب بكلمة المرور المؤقتة التي أدخلتها (لا تُعرض لاحقًا من النظام).
                </>
              ) : null}
            </>
          ) : (
            "تم حفظ التعديلات."
          )}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fullName">الاسم الكامل</Label>
          <Input id="fullName" name="fullName" required defaultValue={dv.fullName} maxLength={120} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">العمر</Label>
          <Input id="age" name="age" type="number" min={3} max={120} defaultValue={dv.age ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">حالة الطالب</Label>
          <select
            id="status"
            name="status"
            defaultValue={dv.status}
            className={nativeSelectClassName}
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">رقم هاتف الطالب</Label>
          <Input id="phone" name="phone" type="tel" dir="ltr" className="text-left" defaultValue={dv.phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parentPhone">هاتف ولي الأمر</Label>
          <Input
            id="parentPhone"
            name="parentPhone"
            type="tel"
            dir="ltr"
            className="text-left"
            defaultValue={dv.parentPhone ?? ""}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">العنوان</Label>
          <textarea
            id="address"
            name="address"
            rows={2}
            maxLength={500}
            defaultValue={dv.address ?? ""}
            className={nativeTextareaClassName}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="level">المستوى</Label>
          <Input id="level" name="level" defaultValue={dv.level ?? ""} maxLength={80} />
        </div>
        {mode === "create" ? (
          <>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="loginEmail">بريد تسجيل الدخول للطالب</Label>
              <Input
                id="loginEmail"
                name="loginEmail"
                type="email"
                required
                dir="ltr"
                className="text-left"
                autoComplete="off"
                placeholder="example@domain.com"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="tempPassword">كلمة مرور مؤقتة</Label>
              <Input id="tempPassword" name="tempPassword" type="password" required minLength={8} autoComplete="new-password" />
            </div>
          </>
        ) : null}
      </div>

      <Button type="submit" className="w-full sm:w-auto">
        <SubmitLabel mode={mode} />
      </Button>
    </form>
  );
}
