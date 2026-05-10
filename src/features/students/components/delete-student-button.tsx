"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteStudentAction } from "@/features/students/actions";

export function DeleteStudentButton({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function onClick() {
    if (!confirm("تأكيد حذف هذا الطالب؟ لا يمكن التراجع.")) return;
    const fd = new FormData();
    fd.set("studentId", studentId);
    start(async () => {
      const r = await deleteStudentAction({ ok: false, error: null }, fd);
      if (r.ok) {
        router.refresh();
      } else if (r.error) {
        alert(r.error);
      }
    });
  }

  return (
    <Button type="button" variant="outline" size="sm" className="text-red-700" disabled={pending} onClick={onClick}>
      {pending ? "…" : "حذف"}
    </Button>
  );
}
