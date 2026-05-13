"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/infrastructure/db/prisma";
import { requireAdminSession } from "@/lib/auth-guard";
import { deleteStudentCascade } from "@/features/students/data";

export type UserAccountActionState = { ok: boolean; error: string | null; flashPassword?: string | null };

const initial: UserAccountActionState = { ok: false, error: null };

function tempPassword(): string {
  return randomBytes(12).toString("base64url").slice(0, 14);
}

export async function adminResetUserPasswordAction(_prev: UserAccountActionState, formData: FormData): Promise<UserAccountActionState> {
  if (!(await requireAdminSession())) return { ...initial, error: "غير مصرّح." };
  const userId = String(formData.get("userId") ?? "").trim();
  const manual = String(formData.get("newPassword") ?? "").trim();
  const useGenerated = formData.get("generate") === "on";
  const pwd = useGenerated ? tempPassword() : manual;
  const parsed = z.string().min(8).max(128).safeParse(pwd);
  if (!userId || !parsed.success) return { ...initial, error: "معرّف المستخدم وكلمة مرور (8 أحرف على الأقل) مطلوبة." };
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!u || (u.role !== "STUDENT" && u.role !== "PARENT")) return { ...initial, error: "حساب غير صالح." };
  const hash = await bcrypt.hash(parsed.data, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash, disabled: false } });
  revalidatePath("/admin/user-accounts");
  revalidatePath("/admin/accounts");
  revalidatePath("/admin/students");
  return { ok: true, error: null, flashPassword: useGenerated ? parsed.data : null };
}

export async function adminSetUserEmailAction(_prev: UserAccountActionState, formData: FormData): Promise<UserAccountActionState> {
  if (!(await requireAdminSession())) return { ...initial, error: "غير مصرّح." };
  const userId = String(formData.get("userId") ?? "").trim();
  const emailParsed = z.string().trim().toLowerCase().pipe(z.string().email()).safeParse(String(formData.get("email") ?? ""));
  if (!userId || !emailParsed.success) return { ...initial, error: "بريد صالح مطلوب." };
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!u || (u.role !== "STUDENT" && u.role !== "PARENT")) return { ...initial, error: "حساب غير صالح." };
  const dup = await prisma.user.findFirst({ where: { email: emailParsed.data, NOT: { id: userId } } });
  if (dup) return { ...initial, error: "البريد مستخدم لحساب آخر." };
  await prisma.user.update({ where: { id: userId }, data: { email: emailParsed.data } });
  revalidatePath("/admin/user-accounts");
  revalidatePath("/admin/students");
  return { ok: true, error: null };
}

export async function adminToggleUserDisabledAction(_prev: UserAccountActionState, formData: FormData): Promise<UserAccountActionState> {
  if (!(await requireAdminSession())) return { ...initial, error: "غير مصرّح." };
  const userId = String(formData.get("userId") ?? "").trim();
  const disabled = String(formData.get("disabled") ?? "") === "1";
  if (!userId) return { ...initial, error: "معرّف المستخدم مفقود." };
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!u || (u.role !== "STUDENT" && u.role !== "PARENT")) return { ...initial, error: "حساب غير صالح." };
  await prisma.user.update({ where: { id: userId }, data: { disabled } });
  revalidatePath("/admin/user-accounts");
  return { ok: true, error: null };
}

export async function adminDeleteUserAccountAction(_prev: UserAccountActionState, formData: FormData): Promise<UserAccountActionState> {
  if (!(await requireAdminSession())) return { ...initial, error: "غير مصرّح." };
  const userId = String(formData.get("userId") ?? "").trim();
  const confirm = String(formData.get("confirm") ?? "").trim();
  if (!userId) return { ...initial, error: "معرّف المستخدم مفقود." };
  if (confirm !== "حذف") return { ...initial, error: 'اكتب كلمة «حذف» للتأكيد.' };
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, profile: { select: { student: { select: { id: true } } } } },
  });
  if (!u || (u.role !== "STUDENT" && u.role !== "PARENT")) return { ...initial, error: "حساب غير صالح." };
  if (u.role === "STUDENT") {
    const sid = u.profile?.student?.id;
    if (!sid) return { ...initial, error: "لا يوجد سجل طالب مرتبط." };
    await deleteStudentCascade(sid);
  } else {
    await prisma.user.delete({ where: { id: userId } });
  }
  revalidatePath("/admin/user-accounts");
  revalidatePath("/admin/accounts");
  revalidatePath("/admin/students");
  return { ok: true, error: null };
}
