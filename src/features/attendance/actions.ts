"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth-guard";
import prisma from "@/infrastructure/db/prisma";

export type AttendanceActionState = { ok: boolean; error: string | null };

export async function upsertAttendanceAction(
  _prev: AttendanceActionState,
  formData: FormData,
): Promise<AttendanceActionState> {
  if (!(await requireAdminSession())) return { ok: false, error: "غير مصرّح." };
  const studentId = String(formData.get("studentId") ?? "").trim();
  const dateStr = String(formData.get("date") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!studentId || !dateStr || !status) {
    return { ok: false, error: "اختر الطالب والتاريخ والحالة." };
  }

  const allowed = ["PRESENT", "ABSENT", "EXCUSED", "LATE"] as const;
  if (!allowed.includes(status as (typeof allowed)[number])) {
    return { ok: false, error: "حالة حضور غير صالحة." };
  }

  const date = new Date(dateStr + "T12:00:00.000Z");
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "تاريخ غير صالح." };
  }

  try {
    await prisma.attendance.upsert({
      where: { studentId_date: { studentId, date } },
      create: { studentId, date, status: status as "PRESENT" | "ABSENT" | "EXCUSED" | "LATE", note: note || null },
      update: { status: status as "PRESENT" | "ABSENT" | "EXCUSED" | "LATE", note: note || null },
    });
    revalidatePath("/admin/attendance");
    return { ok: true, error: null };
  } catch {
    return { ok: false, error: "تعذر حفظ الحضور." };
  }
}
