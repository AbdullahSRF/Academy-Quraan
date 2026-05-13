"use client";

import { Button } from "@/components/ui/button";
import { deleteMemorizationSessionAction } from "@/features/memorization-v2/actions";

export function MemorizationSessionDeleteForm({
  sessionId,
  studentId,
  disabled,
}: {
  sessionId: string;
  studentId: string;
  disabled: boolean;
}) {
  return (
    <form
      action={async (fd) => {
        const r = await deleteMemorizationSessionAction(fd);
        if (!r.ok) {
          window.alert(r.error ?? "تعذر الحذف.");
          return;
        }
        window.location.reload();
      }}
      className="inline"
    >
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="studentId" value={studentId} />
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        disabled={disabled}
        className="h-8 px-2 text-xs"
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
            return;
          }
          if (!window.confirm("حذف هذه الحصة؟ حدود المناطق في النظام لا تُرجع تلقائيًا بعد الحذف.")) {
            e.preventDefault();
          }
        }}
      >
        حذف
      </Button>
    </form>
  );
}
