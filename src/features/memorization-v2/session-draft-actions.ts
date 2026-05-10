"use server";

import { z } from "zod";
import { requireAdminSession } from "@/lib/auth-guard";
import { upsertMemorizationSessionDraftDb } from "@/features/memorization-v2/data/session-draft-db";
import type { SessionDraftPayload } from "@/features/memorization-v2/data/session-draft-db";

const metaSchema = z.object({
  studentId: z.string().min(1),
  sessionDate: z.string().min(8),
});

export type SessionDraftSaveState = { ok: boolean; error: string | null };

function optionalStr(v: FormDataEntryValue | null): string | undefined {
  const s = String(v ?? "").trim();
  return s === "" ? undefined : s;
}

function optionalInt(v: FormDataEntryValue | null): number | undefined {
  const s = String(v ?? "").trim();
  if (s === "") return undefined;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
}

export async function saveMemorizationSessionDraftAction(
  _prev: SessionDraftSaveState,
  formData: FormData,
): Promise<SessionDraftSaveState> {
  if (!(await requireAdminSession())) return { ok: false, error: "غير مصرّح." };

  const raw = {
    studentId: String(formData.get("studentId") ?? "").trim(),
    sessionDate: String(formData.get("sessionDate") ?? "").trim(),
  };
  const parsed = metaSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "بيانات المسودة غير صالحة." };
  }

  const sessionDate = new Date(`${parsed.data.sessionDate}T12:00:00.000Z`);
  if (Number.isNaN(sessionDate.getTime())) {
    return { ok: false, error: "تاريخ غير صالح." };
  }

  const payload: SessionDraftPayload = {
    homeworkNext: optionalStr(formData.get("draftHomeworkNext")),
    notes: optionalStr(formData.get("draftNotes")),
    newStartSurah: optionalInt(formData.get("draftNewStartSurah")),
    newStartAyah: optionalInt(formData.get("draftNewStartAyah")),
    newEndSurah: optionalInt(formData.get("draftNewEndSurah")),
    newEndAyah: optionalInt(formData.get("draftNewEndAyah")),
    autoPromoteCompletedSurah: formData.get("draftAutoPromote") === "on",
  };

  try {
    await upsertMemorizationSessionDraftDb({
      studentId: parsed.data.studentId,
      sessionDate,
      payload,
    });
    return { ok: true, error: null };
  } catch {
    return { ok: false, error: "تعذر حفظ المسودة على الخادم." };
  }
}
