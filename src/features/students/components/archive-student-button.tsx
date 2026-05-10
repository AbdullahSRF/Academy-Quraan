"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { archiveStudentAction, type StudentActionState } from "@/features/students/actions";
import { Button } from "@/components/ui/button";

const initial: StudentActionState = { ok: false, error: null };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending} className="border-amber-600/50 text-amber-900 dark:text-amber-100">
      {pending ? "جاري الأرشفة…" : "أرشفة الطالب"}
    </Button>
  );
}

/** أرشفة لطيفة: لا تحذف السجل ولا يظهر في القوائم الافتراضية. */
export function ArchiveStudentButton({ studentId }: { studentId: string }) {
  const [state, formAction] = useActionState(archiveStudentAction, initial);

  return (
    <form action={formAction} className="inline-flex flex-col items-start gap-1">
      <input type="hidden" name="studentId" value={studentId} />
      {state.error ? (
        <span className="text-xs font-bold text-destructive" role="alert">
          {state.error}
        </span>
      ) : null}
      {state.ok ? <span className="text-xs font-bold text-primary">تمت الأرشفة.</span> : null}
      <Submit />
    </form>
  );
}
