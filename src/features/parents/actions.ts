"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth-guard";
import {
  createParentUserRecord,
  linkParentToStudent,
  setParentDisabledByUserId,
  setParentPasswordByUserId,
  unlinkParentFromStudent,
} from "@/features/parents/data";

export type ParentAccountActionState = { ok: boolean; error: string | null; flashEmail?: string | null };

const createParentSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().pipe(z.string().email()),
  tempPassword: z.string().min(8).max(128),
});

export async function createParentAccountAction(
  _prev: ParentAccountActionState,
  formData: FormData,
): Promise<ParentAccountActionState> {
  if (!(await requireAdminSession())) return { ok: false, error: "غير مصرّح." };
  const parsed = createParentSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    tempPassword: formData.get("tempPassword"),
  });
  if (!parsed.success) {
    return { ok: false, error: "تحقق من الاسم والبريد وكلمة المرور (8 أحرف على الأقل)." };
  }
  try {
    await createParentUserRecord(parsed.data);
    revalidatePath("/admin/accounts");
    return { ok: true, error: null, flashEmail: parsed.data.email };
  } catch (e) {
    if (e instanceof Error && e.message === "EMAIL_IN_USE") {
      return { ok: false, error: "البريد مستخدم بالفعل." };
    }
    return { ok: false, error: "تعذر إنشاء الحساب." };
  }
}

export async function linkParentStudentAction(_prev: ParentAccountActionState, formData: FormData): Promise<ParentAccountActionState> {
  if (!(await requireAdminSession())) return { ok: false, error: "غير مصرّح." };
  const parentId = String(formData.get("parentId") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const relation = String(formData.get("relation") ?? "").trim();
  const isPrimary = formData.get("isPrimary") === "on";
  if (!parentId || !studentId) return { ok: false, error: "اختر ولي الأمر والطالب." };
  try {
    await linkParentToStudent(parentId, studentId, relation || null, isPrimary);
    revalidatePath("/admin/accounts");
    revalidatePath("/admin/students");
    return { ok: true, error: null };
  } catch {
    return { ok: false, error: "الربط موجود مسبقًا أو بيانات غير صالحة." };
  }
}

export async function unlinkParentStudentAction(_prev: ParentAccountActionState, formData: FormData): Promise<ParentAccountActionState> {
  if (!(await requireAdminSession())) return { ok: false, error: "غير مصرّح." };
  const parentId = String(formData.get("parentId") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();
  if (!parentId || !studentId) return { ok: false, error: "بيانات ناقصة." };
  try {
    await unlinkParentFromStudent(parentId, studentId);
    revalidatePath("/admin/accounts");
    revalidatePath("/admin/students");
    return { ok: true, error: null };
  } catch {
    return { ok: false, error: "تعذر إلغاء الربط." };
  }
}

export async function resetParentPasswordAction(_prev: ParentAccountActionState, formData: FormData): Promise<ParentAccountActionState> {
  if (!(await requireAdminSession())) return { ok: false, error: "غير مصرّح." };
  const userId = String(formData.get("userId") ?? "").trim();
  const pwd = String(formData.get("newPassword") ?? "");
  const parsed = z.string().min(8).max(128).safeParse(pwd);
  if (!userId || !parsed.success) return { ok: false, error: "معرّف المستخدم وكلمة مرور صالحة مطلوبة." };
  await setParentPasswordByUserId(userId, parsed.data);
  revalidatePath("/admin/accounts");
  return { ok: true, error: null };
}

export async function toggleParentDisabledAction(_prev: ParentAccountActionState, formData: FormData): Promise<ParentAccountActionState> {
  if (!(await requireAdminSession())) return { ok: false, error: "غير مصرّح." };
  const userId = String(formData.get("userId") ?? "").trim();
  const disabled = String(formData.get("disabled") ?? "") === "1";
  if (!userId) return { ok: false, error: "معرّف المستخدم مفقود." };
  await setParentDisabledByUserId(userId, disabled);
  revalidatePath("/admin/accounts");
  return { ok: true, error: null };
}
