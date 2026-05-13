"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/infrastructure/db/prisma";
import { requireAdminSession } from "@/lib/auth-guard";

export type AccountActionState = { ok: boolean; error: string | null };

const passwordSchema = z.string().min(8).max(128);

export async function setStudentPasswordAction(_prev: AccountActionState, formData: FormData): Promise<AccountActionState> {
  if (!(await requireAdminSession())) return { ok: false, error: "غير مصرّح." };
  const studentId = String(formData.get("studentId") ?? "").trim();
  const password = String(formData.get("newPassword") ?? "");
  const parsed = passwordSchema.safeParse(password);
  if (!studentId || !parsed.success) {
    return { ok: false, error: "معرّف الطالب وكلمة مرور (8 أحرف على الأقل) مطلوبة." };
  }
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { profile: { include: { user: true } } },
  });
  if (!student?.profile?.user) return { ok: false, error: "الطالب غير موجود." };
  const hash = await bcrypt.hash(parsed.data, 12);
  await prisma.user.update({
    where: { id: student.profile.user.id },
    data: { passwordHash: hash, disabled: false },
  });
  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin/students");
  return { ok: true, error: null };
}

export async function setStudentLoginEmailAction(_prev: AccountActionState, formData: FormData): Promise<AccountActionState> {
  if (!(await requireAdminSession())) return { ok: false, error: "غير مصرّح." };
  const studentId = String(formData.get("studentId") ?? "").trim();
  const email = z.string().trim().toLowerCase().pipe(z.string().email()).safeParse(String(formData.get("loginEmail") ?? ""));
  if (!studentId || !email.success) {
    return { ok: false, error: "بريد إلكتروني صالح مطلوب." };
  }
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { profile: { include: { user: true } } },
  });
  if (!student?.profile?.user) return { ok: false, error: "الطالب غير موجود." };
  const dup = await prisma.user.findFirst({
    where: { email: email.data, NOT: { id: student.profile.user.id } },
  });
  if (dup) return { ok: false, error: "البريد مستخدم لحساب آخر." };
  await prisma.user.update({
    where: { id: student.profile.user.id },
    data: { email: email.data },
  });
  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin/students");
  return { ok: true, error: null };
}

export async function setStudentAccountDisabledAction(_prev: AccountActionState, formData: FormData): Promise<AccountActionState> {
  if (!(await requireAdminSession())) return { ok: false, error: "غير مصرّح." };
  const studentId = String(formData.get("studentId") ?? "").trim();
  const disabled = String(formData.get("disabled") ?? "") === "1";
  if (!studentId) return { ok: false, error: "معرّف الطالب مفقود." };
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { profile: true },
  });
  if (!student?.profile) return { ok: false, error: "الطالب غير موجود." };
  await prisma.user.update({
    where: { id: student.profile.userId },
    data: { disabled },
  });
  revalidatePath(`/admin/students/${studentId}`);
  return { ok: true, error: null };
}
