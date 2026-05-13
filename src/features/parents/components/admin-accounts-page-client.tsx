"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nativeSelectClassName } from "@/lib/native-form-classes";
import {
  createParentAccountAction,
  linkParentStudentAction,
  resetParentPasswordAction,
  toggleParentDisabledAction,
  unlinkParentStudentAction,
  type ParentAccountActionState,
} from "@/features/parents/actions";
import type { ParentWithAccountRow } from "@/features/parents/data";

const initial: ParentAccountActionState = { ok: false, error: null };

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit">{pending ? pendingLabel : label}</Button>;
}

function ParentAccountCard({ parent }: { parent: ParentWithAccountRow }) {
  const [pwdState, pwdAction] = useActionState(resetParentPasswordAction, initial);
  const [disState, disAction] = useActionState(toggleParentDisabledAction, initial);
  const [unlinkState, unlinkAction] = useActionState(unlinkParentStudentAction, initial);

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-base font-bold text-foreground">{parent.name ?? "—"}</p>
          <p className="text-sm font-bold text-muted" dir="ltr">
            {parent.email ?? "—"}
          </p>
          <p className="mt-1 text-xs font-bold text-muted">
            {parent.disabled ? "معطّل" : "نشط"} — {parent.hasPassword ? "كلمة مرور مضبوطة" : "بدون كلمة مرور"}
          </p>
        </div>
      </div>

      <div className="mt-3 text-sm font-bold text-muted">
        الأبناء المرتبطون:
        {parent.children.length === 0 ? (
          <span className="text-foreground"> لا يوجد.</span>
        ) : (
          <ul className="mt-1 list-inside list-disc text-foreground">
            {parent.children.map((c) => (
              <li key={c.studentId} className="flex flex-wrap items-center gap-2">
                <span>{c.fullName}</span>
                <form action={unlinkAction} className="inline">
                  <input type="hidden" name="parentId" value={parent.parentId} />
                  <input type="hidden" name="studentId" value={c.studentId} />
                  <Button type="submit" variant="ghost" size="sm" className="h-7 text-xs text-destructive">
                    إلغاء الربط
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      {unlinkState.error ? <p className="mt-2 text-xs font-bold text-destructive">{unlinkState.error}</p> : null}

      <form action={pwdAction} className="mt-4 space-y-2 border-t border-border pt-4">
        {pwdState.error ? <p className="text-xs font-bold text-destructive">{pwdState.error}</p> : null}
        {pwdState.ok ? <p className="text-xs font-bold text-emerald-700">تم تحديث كلمة المرور.</p> : null}
        <input type="hidden" name="userId" value={parent.userId} />
        <Label className="text-xs">كلمة مرور جديدة</Label>
        <div className="flex flex-wrap gap-2">
          <Input name="newPassword" type="password" minLength={8} className="max-w-xs" autoComplete="new-password" />
          <Submit label="حفظ" pendingLabel="…" />
        </div>
      </form>

      <form action={disAction} className="mt-3 flex flex-wrap items-center gap-2">
        {disState.error ? <p className="w-full text-xs font-bold text-destructive">{disState.error}</p> : null}
        {disState.ok ? <p className="w-full text-xs font-bold text-emerald-700">تم التحديث.</p> : null}
        <input type="hidden" name="userId" value={parent.userId} />
        <input type="hidden" name="disabled" value={parent.disabled ? "0" : "1"} />
        <Button type="submit" variant="outline" size="sm">
          {parent.disabled ? "تفعيل الحساب" : "تعطيل الحساب"}
        </Button>
      </form>
    </div>
  );
}

export function AdminAccountsClient({
  parents,
  students,
}: {
  parents: ParentWithAccountRow[];
  students: { id: string; fullName: string; status: string }[];
}) {
  const [createState, createAction] = useActionState(createParentAccountAction, initial);
  const [linkState, linkAction] = useActionState(linkParentStudentAction, initial);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-foreground">إنشاء حساب ولي أمر</h2>
        <p className="mt-1 text-sm font-bold text-muted">بريد وكلمة مرور مؤقتة — أبلغ ولي الأمر بها عبر قناة آمنة.</p>
        <form action={createAction} className="mt-4 grid max-w-xl gap-4">
          {createState.error ? (
            <p className="rounded-xl border-2 border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive" role="alert">
              {createState.error}
            </p>
          ) : null}
          {createState.ok && createState.flashEmail ? (
            <p className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900" role="status">
              تم إنشاء الحساب. البريد: <span dir="ltr">{createState.flashEmail}</span> — كلمة المرور هي التي أدخلتها للتو (لا تُخزَّن لعرضها لاحقًا).
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="p-name">الاسم</Label>
            <Input id="p-name" name="name" required minLength={2} maxLength={120} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-email">البريد الإلكتروني</Label>
            <Input id="p-email" name="email" type="email" required dir="ltr" className="text-left" autoComplete="off" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-pwd">كلمة مرور مؤقتة</Label>
            <Input id="p-pwd" name="tempPassword" type="password" required minLength={8} autoComplete="new-password" />
          </div>
          <Submit label="إنشاء الحساب" pendingLabel="جاري الإنشاء…" />
        </form>
      </section>

      <section className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-foreground">ربط ولي أمر بطالب</h2>
        <form action={linkAction} className="mt-4 grid max-w-xl gap-4">
          {linkState.error ? (
            <p className="rounded-xl border-2 border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive" role="alert">
              {linkState.error}
            </p>
          ) : null}
          {linkState.ok ? (
            <p className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900">تم الربط.</p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="parentId">ولي الأمر</Label>
            <select id="parentId" name="parentId" required className={nativeSelectClassName}>
              <option value="">— اختر —</option>
              {parents.map((p) => (
                <option key={p.parentId} value={p.parentId}>
                  {(p.name ?? p.email) ?? p.parentId}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentId">الطالب</Label>
            <select id="studentId" name="studentId" required className={nativeSelectClassName}>
              <option value="">— اختر —</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="relation">صلة القرابة (اختياري)</Label>
            <Input id="relation" name="relation" maxLength={80} placeholder="مثال: الأب" />
          </div>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" name="isPrimary" />
            ولي أمر أساسي لهذا الطالب
          </label>
          <Submit label="ربط" pendingLabel="جاري الربط…" />
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">أولياء الأمور ({parents.length})</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {parents.map((p) => (
            <ParentAccountCard key={p.parentId} parent={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
