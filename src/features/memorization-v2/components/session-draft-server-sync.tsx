"use client";

import { useActionState, useCallback, useEffect, useRef } from "react";
import { saveMemorizationSessionDraftAction, type SessionDraftSaveState } from "@/features/memorization-v2/session-draft-actions";

const initial: SessionDraftSaveState = { ok: false, error: null };

/** مزامنة تلقائية (debounced) لمسودة الحصة على قاعدة البيانات بجانب localStorage. */
export function SessionDraftServerSync({ formId }: { formId: string }) {
  const [state, saveDraft] = useActionState(saveMemorizationSessionDraftAction, initial);
  /** توافق أنواع DOM (`number`) مع `@types/node` (`NodeJS.Timeout`) */
  const timerRef = useRef<number | NodeJS.Timeout | null>(null);

  const scheduleSave = useCallback(() => {
    if (timerRef.current != null) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const form = document.getElementById(formId) as HTMLFormElement | null;
      if (!form) return;
      const f = new FormData(form);
      const studentId = String(f.get("studentId") ?? "").trim();
      const sessionDate = String(f.get("sessionDate") ?? "").trim();
      if (!studentId || !sessionDate) return;

      const fd = new FormData();
      fd.set("studentId", studentId);
      fd.set("sessionDate", sessionDate);
      fd.set("draftHomeworkNext", String(f.get("homeworkNext") ?? ""));
      fd.set("draftNotes", String(f.get("notes") ?? ""));
      fd.set("draftNewStartSurah", String(f.get("newStartSurah") ?? ""));
      fd.set("draftNewStartAyah", String(f.get("newStartAyah") ?? ""));
      fd.set("draftNewEndSurah", String(f.get("newEndSurah") ?? ""));
      fd.set("draftNewEndAyah", String(f.get("newEndAyah") ?? ""));
      if (f.get("autoPromoteCompletedSurah") === "on") fd.set("draftAutoPromote", "on");

      saveDraft(fd);
    }, 2200);
  }, [formId, saveDraft]);

  useEffect(() => {
    const form = document.getElementById(formId);
    if (!form) return;
    const on = () => scheduleSave();
    form.addEventListener("input", on);
    form.addEventListener("change", on);
    return () => {
      form.removeEventListener("input", on);
      form.removeEventListener("change", on);
      if (timerRef.current != null) clearTimeout(timerRef.current);
    };
  }, [formId, scheduleSave]);

  if (!state.ok && !state.error) return null;
  return (
    <p className="text-xs font-bold text-muted" aria-live="polite">
      {state.ok ? "تم حفظ مسودة الخادم." : state.error}
    </p>
  );
}
