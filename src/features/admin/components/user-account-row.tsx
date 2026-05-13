"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { KeyRound, Mail, MessageSquare, Trash2 } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import type { UserAccountRowSerialized } from "@/features/admin/user-accounts-data";
import {
  adminDeleteUserAccountAction,
  adminResetUserPasswordAction,
  adminSetUserEmailAction,
  adminToggleUserDisabledAction,
  type UserAccountActionState,
} from "@/features/admin/user-accounts-actions";
import { adminSendInboxMessageAction, type AdminMessageActionState } from "@/features/admin-messages/actions";

const accInitial: UserAccountActionState = { ok: false, error: null };
const msgInitial: AdminMessageActionState = { ok: false, error: null };

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

function roleLabel(role: string) {
  if (role === "STUDENT") return "طالب";
  if (role === "PARENT") return "ولي أمر";
  return role;
}

export function UserAccountRow({ row }: { row: UserAccountRowSerialized }) {
  const [pwdOpen, setPwdOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  const [pwdState, pwdAction] = useActionState(adminResetUserPasswordAction, accInitial);
  const [emailState, emailAction] = useActionState(adminSetUserEmailAction, accInitial);
  const [delState, delAction] = useActionState(adminDeleteUserAccountAction, accInitial);
  const [msgState, msgAction] = useActionState(adminSendInboxMessageAction, msgInitial);
  const [, toggleDisabledAction] = useActionState(adminToggleUserDisabledAction, accInitial);

  const profileLink = row.role === "STUDENT" && row.studentId ? `/admin/students/${row.studentId}` : null;

  return (
    <tr className="border-b border-border odd:bg-muted-bg/20">
      <td className="px-3 py-3 font-bold text-foreground">
        <div className="flex flex-col gap-0.5">
          <span>{row.name ?? "—"}</span>
          {profileLink ? (
            <Link href={profileLink} className="text-xs font-bold text-primary hover:underline">
              ملف الطالب
            </Link>
          ) : null}
        </div>
      </td>
      <td className="max-w-[10rem] truncate px-3 py-3 text-sm font-bold text-muted" dir="ltr" title={row.email ?? ""}>
        {row.email ?? "—"}
      </td>
      <td className="px-3 py-3 text-sm font-bold">{roleLabel(row.role)}</td>
      <td className="px-3 py-3 text-sm font-bold">{row.disabled ? "معطّل" : "نشط"}</td>
      <td className="px-3 py-3 text-xs font-bold text-muted" dir="ltr">
        {row.createdAt.slice(0, 10)}
      </td>
      <td className="px-2 py-3">
        <div className="flex flex-wrap items-center justify-end gap-1">
          <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" variant="outline" className="gap-1 font-bold">
                <KeyRound className="size-3.5" aria-hidden />
                مرور
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>تغيير كلمة المرور</DialogTitle>
                <DialogDescription>لن تُخزَّن كلمة المرور كنص عادي — يتم التشفير بـ bcrypt.</DialogDescription>
              </DialogHeader>
              <form action={pwdAction} className="space-y-3">
                <input type="hidden" name="userId" value={row.userId} />
                {pwdState.error ? <p className="text-sm font-bold text-destructive">{pwdState.error}</p> : null}
                {pwdState.ok && pwdState.flashPassword ? (
                  <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900">
                    كلمة المرور الجديدة (انسخها الآن): <span dir="ltr">{pwdState.flashPassword}</span>
                  </p>
                ) : pwdState.ok ? (
                  <p className="text-sm font-bold text-emerald-700">تم التحديث.</p>
                ) : null}
                <div className="space-y-2">
                  <Label className="text-xs">كلمة مرور يدوية (8 أحرف على الأقل)</Label>
                  <Input name="newPassword" type="password" minLength={8} autoComplete="new-password" />
                </div>
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input type="checkbox" name="generate" />
                  توليد تلقائي وعرضها هنا
                </label>
                <DialogFooter>
                  <Submit label="حفظ" pendingLabel="…" />
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" variant="outline" className="gap-1 font-bold">
                <Mail className="size-3.5" aria-hidden />
                بريد
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>تعديل البريد</DialogTitle>
              </DialogHeader>
              <form action={emailAction} className="space-y-3">
                <input type="hidden" name="userId" value={row.userId} />
                {emailState.error ? <p className="text-sm font-bold text-destructive">{emailState.error}</p> : null}
                {emailState.ok ? <p className="text-sm font-bold text-emerald-700">تم الحفظ.</p> : null}
                <Input name="email" type="email" required dir="ltr" className="text-left" defaultValue={row.email ?? ""} />
                <DialogFooter>
                  <Submit label="حفظ البريد" pendingLabel="…" />
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" variant="outline" className="gap-1 font-bold">
                <MessageSquare className="size-3.5" aria-hidden />
                رسالة
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>إرسال ملاحظة</DialogTitle>
                <DialogDescription>تُسجَّل للمستخدم في النظام (سجلّ داخلي).</DialogDescription>
              </DialogHeader>
              <form action={msgAction} className="space-y-3">
                <input type="hidden" name="recipientUserId" value={row.userId} />
                {msgState.error ? <p className="text-sm font-bold text-destructive">{msgState.error}</p> : null}
                {msgState.ok ? <p className="text-sm font-bold text-emerald-700">تم الإرسال.</p> : null}
                <div className="space-y-2">
                  <Label className="text-xs">العنوان</Label>
                  <Input name="title" required maxLength={200} placeholder="مثال: تنبيه بخصوص الحضور" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">المحتوى</Label>
                  <textarea name="body" required rows={4} className="w-full rounded-xl border-2 border-border bg-card p-3 text-sm font-bold" />
                </div>
                <DialogFooter>
                  <Submit label="إرسال" pendingLabel="…" />
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <form action={toggleDisabledAction}>
            <input type="hidden" name="userId" value={row.userId} />
            <input type="hidden" name="disabled" value={row.disabled ? "0" : "1"} />
            <Button type="submit" size="sm" variant="outline" className="font-bold">
              {row.disabled ? "تفعيل" : "تعطيل"}
            </Button>
          </form>

          <Dialog open={delOpen} onOpenChange={setDelOpen}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" variant="destructive" className="gap-1 font-bold">
                <Trash2 className="size-3.5" aria-hidden />
                حذف
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>حذف الحساب نهائيًا</DialogTitle>
                <DialogDescription>
                  {row.role === "STUDENT"
                    ? "سيُحذف الطالب وجميع بياناته المرتبطة (حضور، حفظ، فواتير…)."
                    : "سيُحذف ولي الأمر وروابطه بالطلاب. الطلاب أنفسهم لا يُحذفون."}
                </DialogDescription>
              </DialogHeader>
              <form action={delAction} className="space-y-3">
                <input type="hidden" name="userId" value={row.userId} />
                {delState.error ? <p className="text-sm font-bold text-destructive">{delState.error}</p> : null}
                {delState.ok ? <p className="text-sm font-bold text-emerald-700">تم الحذف.</p> : null}
                <div className="space-y-2">
                  <Label className="text-xs">اكتب «حذف» للتأكيد</Label>
                  <Input name="confirm" autoComplete="off" />
                </div>
                <DialogFooter>
                  <Submit label="تنفيذ الحذف" pendingLabel="…" />
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </td>
    </tr>
  );
}
