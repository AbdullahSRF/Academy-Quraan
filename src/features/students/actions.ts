"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth-guard";
import { studentUpsertSchema } from "@/features/students/schemas/student.schema";
import {
  archiveStudentRecord,
  createStudentRecord,
  deleteStudentCascade,
  updateStudentRecord,
} from "@/features/students/data";

export type StudentActionState = {
  ok: boolean;
  error: string | null;
};

function emptyToUndef(v: FormDataEntryValue | null): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
}

function parseStudentCoreFromForm(formData: FormData) {
  return {
    fullName: String(formData.get("fullName") ?? "").trim(),
    age: formData.get("age"),
    phone: emptyToUndef(formData.get("phone")),
    parentPhone: emptyToUndef(formData.get("parentPhone")),
    level: emptyToUndef(formData.get("level")),
    status: String(formData.get("status") ?? "REGULAR"),
    subscriptionPlanId: emptyToUndef(formData.get("subscriptionPlanId")),
  };
}

export async function createStudentAction(_prev: StudentActionState, formData: FormData): Promise<StudentActionState> {
  if (!(await requireAdminSession())) return { ok: false, error: "غير مصرّح." };
  const parsed = studentUpsertSchema.safeParse(parseStudentCoreFromForm(formData));
  if (!parsed.success) {
    return { ok: false, error: "تحقق من الحقول: الاسم والحالة صالحة." };
  }
  try {
    await createStudentRecord(parsed.data);
    revalidatePath("/admin/students");
    revalidatePath("/admin/subscriptions");
    revalidatePath("/admin/finance");
    return { ok: true, error: null };
  } catch {
    return { ok: false, error: "تعذر حفظ الطالب. تحقق من الاتصال بقاعدة البيانات." };
  }
}

export async function updateStudentAction(_prev: StudentActionState, formData: FormData): Promise<StudentActionState> {
  if (!(await requireAdminSession())) return { ok: false, error: "غير مصرّح." };
  const id = String(formData.get("studentId") ?? "").trim();
  if (!id) {
    return { ok: false, error: "معرّف الطالب مفقود." };
  }
  const parsed = studentUpsertSchema.safeParse(parseStudentCoreFromForm(formData));
  if (!parsed.success) {
    return { ok: false, error: "تحقق من الحقول." };
  }
  try {
    await updateStudentRecord(id, parsed.data);
    revalidatePath("/admin/students");
    revalidatePath(`/admin/students/${id}/edit`);
    revalidatePath(`/admin/students/${id}`);
    revalidatePath("/admin/subscriptions");
    revalidatePath("/admin/finance");
    return { ok: true, error: null };
  } catch (e) {
    if (e instanceof Error && e.message === "STUDENT_NOT_FOUND") {
      return { ok: false, error: "الطالب غير موجود." };
    }
    return { ok: false, error: "تعذر تحديث البيانات." };
  }
}

export async function deleteStudentAction(_prev: StudentActionState, formData: FormData): Promise<StudentActionState> {
  if (!(await requireAdminSession())) return { ok: false, error: "غير مصرّح." };
  const id = String(formData.get("studentId") ?? "").trim();
  if (!id) {
    return { ok: false, error: "معرّف الطالب مفقود." };
  }
  try {
    await deleteStudentCascade(id);
    revalidatePath("/admin/students");
    return { ok: true, error: null };
  } catch (e) {
    if (e instanceof Error && e.message === "STUDENT_NOT_FOUND") {
      return { ok: false, error: "الطالب غير موجود." };
    }
    return { ok: false, error: "تعذر حذف الطالب." };
  }
}

export async function archiveStudentAction(_prev: StudentActionState, formData: FormData): Promise<StudentActionState> {
  if (!(await requireAdminSession())) return { ok: false, error: "غير مصرّح." };
  const id = String(formData.get("studentId") ?? "").trim();
  if (!id) return { ok: false, error: "معرّف الطالب مفقود." };
  try {
    await archiveStudentRecord(id);
    revalidatePath("/admin/students");
    revalidatePath(`/admin/students/${id}`);
    return { ok: true, error: null };
  } catch (e) {
    if (e instanceof Error && e.message === "STUDENT_NOT_FOUND") {
      return { ok: false, error: "الطالب غير موجود." };
    }
    return { ok: false, error: "تعذر أرشفة الطالب." };
  }
}
