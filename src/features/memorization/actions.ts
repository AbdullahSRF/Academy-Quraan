"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/infrastructure/db/prisma";

export type MemoActionState = { ok: boolean; error: string | null };

export async function createMemorizationAction(_prev: MemoActionState, formData: FormData): Promise<MemoActionState> {
  const studentId = String(formData.get("studentId") ?? "").trim();
  const sessionDateStr = String(formData.get("sessionDate") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const fromSurah = String(formData.get("fromSurah") ?? "").trim();
  const toSurah = String(formData.get("toSurah") ?? "").trim();
  const fromAyah = String(formData.get("fromAyah") ?? "").trim();
  const toAyah = String(formData.get("toAyah") ?? "").trim();
  const scoreStr = String(formData.get("score") ?? "").trim();

  if (!studentId || !sessionDateStr || !type) {
    return { ok: false, error: "الطالب والتاريخ والنوع مطلوبة." };
  }

  const allowed = ["NEW_MEMORIZATION", "REVIEW", "RECITATION"] as const;
  if (!allowed.includes(type as (typeof allowed)[number])) {
    return { ok: false, error: "نوع الجلسة غير صالح." };
  }

  const sessionDate = new Date(`${sessionDateStr}T12:00:00.000Z`);
  if (Number.isNaN(sessionDate.getTime())) {
    return { ok: false, error: "تاريخ غير صالح." };
  }

  const parseIntOrUndef = (s: string) => {
    if (!s) return undefined;
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : undefined;
  };

  const score = scoreStr ? parseInt(scoreStr, 10) : undefined;
  if (scoreStr && (typeof score !== "number" || !Number.isFinite(score))) {
    return { ok: false, error: "الدرجة يجب أن تكون رقمًا." };
  }

  try {
    await prisma.memorizationRecord.create({
      data: {
        studentId,
        sessionDate,
        type: type as "NEW_MEMORIZATION" | "REVIEW" | "RECITATION",
        notes: notes || null,
        fromSurah: fromSurah || null,
        toSurah: toSurah || null,
        fromAyah: parseIntOrUndef(fromAyah),
        toAyah: parseIntOrUndef(toAyah),
        score: score ?? null,
      },
    });
    revalidatePath("/admin/memorization");
    return { ok: true, error: null };
  } catch {
    return { ok: false, error: "تعذر حفظ السجل." };
  }
}
