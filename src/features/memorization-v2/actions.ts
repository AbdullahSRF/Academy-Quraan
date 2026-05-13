"use server";

import type { AttendanceStatus, SessionPaymentStatus, SessionRating } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { runCompleteMemorizationSession } from "./application/complete-session";

export type CompleteSessionState = { ok: boolean; error: string | null };

const ratings = ["EXCELLENT", "VERY_GOOD", "GOOD", "WEAK"] as const;
const payments = ["NOT_APPLICABLE", "PENDING", "PAID", "WAIVED"] as const;
const attend = ["PRESENT", "ABSENT", "EXCUSED", "LATE"] as const;

type WorkQuad = { startSurah: number; startAyah: number; endSurah: number; endAyah: number };

function parseOptionalReviewWork(fd: FormData, prefix: string, label: string): WorkQuad | null | { error: string } {
  const g = (k: string) => String(fd.get(k) ?? "").trim();
  const a = g(`${prefix}StartSurah`);
  const b = g(`${prefix}StartAyah`);
  const c = g(`${prefix}EndSurah`);
  const d = g(`${prefix}EndAyah`);
  if (!a && !b && !c && !d) return null;
  if (!a || !b || !c || !d) {
    return { error: `أكمل أربعة حقول ${label} أو اتركها كلها فارغة.` };
  }
  const p = (s: string, lab: string): number | { error: string } => {
    const n = parseInt(s, 10);
    if (!Number.isFinite(n)) return { error: `${lab} يجب أن يكون رقمًا.` };
    return n;
  };
  const ns = p(a, `${label} من سورة`);
  if (typeof ns === "object" && "error" in ns) return ns;
  const na = p(b, `${label} من آية`);
  if (typeof na === "object" && "error" in na) return na;
  const es = p(c, `${label} إلى سورة`);
  if (typeof es === "object" && "error" in es) return es;
  const ea = p(d, `${label} إلى آية`);
  if (typeof ea === "object" && "error" in ea) return ea;
  return { startSurah: ns, startAyah: na, endSurah: es, endAyah: ea };
}

export async function completeMemorizationSessionAction(
  _prev: CompleteSessionState,
  formData: FormData,
): Promise<CompleteSessionState> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" || !session.user.id) {
    return { ok: false, error: "غير مصرّح." };
  }

  const studentId = String(formData.get("studentId") ?? "").trim();
  const sessionDateStr = String(formData.get("sessionDate") ?? "").trim();
  const attendanceStatus = String(formData.get("attendanceStatus") ?? "").trim();
  const ratingStr = String(formData.get("rating") ?? "").trim();
  const paymentStatusStr = String(formData.get("paymentStatus") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const homeworkNext = String(formData.get("homeworkNext") ?? "").trim();
  const durationStr = String(formData.get("durationMinutes") ?? "").trim();
  const newStartSurahStr = String(formData.get("newStartSurah") ?? "").trim();
  const newStartAyahStr = String(formData.get("newStartAyah") ?? "").trim();
  const newEndSurahStr = String(formData.get("newEndSurah") ?? "").trim();
  const newEndAyahStr = String(formData.get("newEndAyah") ?? "").trim();
  const autoPromote = formData.get("autoPromoteCompletedSurah") === "on";

  if (!studentId || !sessionDateStr) {
    return { ok: false, error: "الطالب والتاريخ مطلوبان." };
  }
  if (!attend.includes(attendanceStatus as (typeof attend)[number])) {
    return { ok: false, error: "حالة حضور غير صالحة." };
  }
  if (!payments.includes(paymentStatusStr as (typeof payments)[number])) {
    return { ok: false, error: "حالة دفع غير صالحة." };
  }

  const sessionDate = new Date(`${sessionDateStr}T12:00:00.000Z`);
  if (Number.isNaN(sessionDate.getTime())) {
    return { ok: false, error: "تاريخ غير صالح." };
  }

  const parseIntReq = (s: string, label: string): { ok: true; n: number } | { ok: false; error: string } => {
    const n = parseInt(s, 10);
    if (!Number.isFinite(n)) return { ok: false, error: `${label} يجب أن يكون رقمًا.` };
    return { ok: true, n };
  };

  const ns = parseIntReq(newStartSurahStr, "بداية السورة");
  if (!ns.ok) return ns;
  const na = parseIntReq(newStartAyahStr, "بداية الآية");
  if (!na.ok) return na;
  const es = parseIntReq(newEndSurahStr, "نهاية السورة");
  if (!es.ok) return es;
  const ea = parseIntReq(newEndAyahStr, "نهاية الآية");
  if (!ea.ok) return ea;

  let rating: SessionRating | null = null;
  if (ratingStr) {
    if (!ratings.includes(ratingStr as (typeof ratings)[number])) {
      return { ok: false, error: "تقييم غير صالح." };
    }
    rating = ratingStr as SessionRating;
  }

  let durationMinutes: number | null = null;
  if (durationStr) {
    const dm = parseInt(durationStr, 10);
    if (!Number.isFinite(dm) || dm < 0) return { ok: false, error: "مدة الحصة غير صالحة." };
    durationMinutes = dm;
  }

  const nearParsed = parseOptionalReviewWork(formData, "nearWork", "الماضي القريب");
  if (nearParsed && "error" in nearParsed) return { ok: false, error: nearParsed.error };
  const farParsed = parseOptionalReviewWork(formData, "farWork", "الماضي البعيد");
  if (farParsed && "error" in farParsed) return { ok: false, error: farParsed.error };

  const paymentAmountStr = String(formData.get("paymentAmount") ?? "").trim();
  const paymentMethodStr = String(formData.get("paymentMethod") ?? "").trim();
  let paymentAmount: number | null = null;
  if (paymentAmountStr) {
    const amt = Number.parseFloat(paymentAmountStr.replace(",", "."));
    if (!Number.isFinite(amt) || amt < 0) {
      return { ok: false, error: "مبلغ الدفع غير صالح." };
    }
    paymentAmount = amt;
  }

  if (paymentStatusStr === "PAID" && (paymentAmount == null || paymentAmount <= 0)) {
    return { ok: false, error: "عند اختيار «مدفوع» أدخل مبلغًا أكبر من صفر." };
  }

  try {
    await runCompleteMemorizationSession({
      studentId,
      sessionDate,
      attendanceStatus: attendanceStatus as AttendanceStatus,
      rating,
      notes: notes || null,
      homeworkNext: homeworkNext || null,
      durationMinutes,
      paymentStatus: paymentStatusStr as SessionPaymentStatus,
      newStartSurah: ns.n,
      newStartAyah: na.n,
      newEndSurah: es.n,
      newEndAyah: ea.n,
      nearWork: nearParsed,
      farWork: farParsed,
      autoPromoteCompletedSurah: autoPromote,
      createdById: session.user.id,
      paymentAmount: paymentStatusStr === "PAID" ? paymentAmount : null,
      paymentMethod: paymentStatusStr === "PAID" ? paymentMethodStr || null : null,
    });
    revalidatePath("/admin/memorization");
    revalidatePath("/admin/memorization/session");
    revalidatePath("/admin/students");
    revalidatePath(`/admin/students/${studentId}/memorization`);
    return { ok: true, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "تعذر حفظ الحصة.";
    return { ok: false, error: msg };
  }
}
