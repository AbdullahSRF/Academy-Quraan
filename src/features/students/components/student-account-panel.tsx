"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  setStudentAccountDisabledAction,
  setStudentLoginEmailAction,
  setStudentPasswordAction,
  type AccountActionState,
} from "@/features/students/account-actions";

const initial: AccountActionState = { ok: false, error: null };

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit">{pending ? pendingLabel : label}</Button>;
}

export function StudentAccountPanel({
  studentId,
  loginEmail,
  disabled,
  hasPassword,
}: {
  studentId: string;
  loginEmail: string | null;
  disabled: boolean;
  hasPassword: boolean;
}) {
  const [pwdState, pwdAction] = useActionState(setStudentPasswordAction, initial);
  const [emailState, emailAction] = useActionState(setStudentLoginEmailAction, initial);
  const [disState, disAction] = useActionState(setStudentAccountDisabledAction, initial);

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-4 shadow-sm">
      <p className="text-sm font-bold text-muted">
        حالة الحساب: {disabled ? "معطّل" : "نشط"} — {hasPassword ? "كلمة مرور مضبوطة" : "بدون كلمة مرور"}
      </p>
      <p className="mt-1 text-sm font-bold text-muted">
        البريد الحالي:{" "}
        <span className="text-foreground" dir="ltr">
          {loginEmail ?? "—"}
        </span>
      </p>

      <form action={pwdAction} className="mt-4 space-y-2 border-t border-border pt-4">
        {pwdState.error ? <p className="text-xs font-bold text-destructive">{pwdState.error}</p> : null}
        {pwdState.ok ? <p className="text-xs font-bold text-emerald-700">تم تحديث كلمة المرور.</p> : null}
        <input type="hidden" name="studentId" value={studentId} />
        <Label className="text-xs">كلمة مرور جديدة</Label>
        <div className="flex flex-wrap gap-2">
          <Input name="newPassword" type="password" minLength={8} className="max-w-xs" autoComplete="new-password" />
          <Submit label="حفظ كلمة المرور" pendingLabel="…" />
        </div>
      </form>

      <form action={emailAction} className="mt-4 space-y-2 border-t border-border pt-4">
        {emailState.error ? <p className="text-xs font-bold text-destructive">{emailState.error}</p> : null}
        {emailState.ok ? <p className="text-xs font-bold text-emerald-700">تم تحديث البريد.</p> : null}
        <input type="hidden" name="studentId" value={studentId} />
        <Label className="text-xs">بريد تسجيل الدخول</Label>
        <div className="flex flex-wrap gap-2">
          <Input
            name="loginEmail"
            type="email"
            required
            dir="ltr"
            className="max-w-xs text-left"
            defaultValue={loginEmail ?? ""}
            autoComplete="off"
          />
          <Submit label="حفظ البريد" pendingLabel="…" />
        </div>
      </form>

      <form action={disAction} className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        {disState.error ? <p className="w-full text-xs font-bold text-destructive">{disState.error}</p> : null}
        {disState.ok ? <p className="w-full text-xs font-bold text-emerald-700">تم التحديث.</p> : null}
        <input type="hidden" name="studentId" value={studentId} />
        <input type="hidden" name="disabled" value={disabled ? "0" : "1"} />
        <Button type="submit" variant="outline" size="sm">
          {disabled ? "تفعيل الحساب" : "تعطيل الحساب"}
        </Button>
      </form>
    </div>
  );
}
