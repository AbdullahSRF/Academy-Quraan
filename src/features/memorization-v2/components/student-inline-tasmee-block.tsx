import dynamic from "next/dynamic";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { planSessionDraft } from "@/features/memorization-v2/application/plan-session-draft";
import { SessionZonePreview } from "@/features/memorization-v2/components/session-zone-preview";
import { getMemorizationSessionDraftDb } from "@/features/memorization-v2/data/session-draft-db";
import type { SessionDraftPayload } from "@/features/memorization-v2/data/session-draft-db";

const SessionCompleteForm = dynamic(
  () =>
    import("@/features/memorization-v2/components/session-complete-form").then((m) => ({
      default: m.SessionCompleteForm,
    })),
  {
    loading: () => (
      <div className="space-y-3 py-6" aria-busy="true">
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted-bg" />
        <div className="h-40 w-full animate-pulse rounded-lg bg-muted-bg" />
        <p className="text-center text-sm font-bold text-muted">جاري تحميل نموذج الحصة…</p>
      </div>
    ),
  },
);

type Props = { studentId: string; studentName: string };

/** نموذج تسميع كامل داخل ملف الطالب — نفس منطق صفحة «حصة تسميع» مع تثبيت الطالب. */
export async function StudentInlineTasmeeBlock({ studentId, studentName }: Props) {
  const defaultDate = new Date().toISOString().slice(0, 10);
  let draft = await planSessionDraft(studentId);

  const dbRow = await getMemorizationSessionDraftDb(studentId, new Date(`${defaultDate}T12:00:00.000Z`));
  const p = dbRow?.payload;
  if (p && typeof p === "object" && !Array.isArray(p)) {
    const pl = p as SessionDraftPayload;
    draft = {
      ...draft,
      newStartSurah: pl.newStartSurah ?? draft.newStartSurah,
      newStartAyah: pl.newStartAyah ?? draft.newStartAyah,
      newEndSurah: pl.newEndSurah ?? draft.newEndSurah,
      newEndAyah: pl.newEndAyah ?? draft.newEndAyah,
      homeworkNext: pl.homeworkNext ?? draft.homeworkNext,
      autoPromoteCompletedSurah: pl.autoPromoteCompletedSurah ?? draft.autoPromoteCompletedSurah,
      notes: pl.notes ?? draft.notes ?? null,
    };
  }

  const students = [{ id: studentId, fullName: studentName }];

  return (
    <div className="space-y-6">
      <SessionZonePreview studentId={studentId} />
      <Card>
        <CardHeader>
          <CardTitle>تسجيل حصة اليوم</CardTitle>
          <CardDescription>
            سجّل ما سمعه الطالب في <strong>الجديد</strong> واختياريًا في <strong>الماضي القريب</strong> و
            <strong>الماضي البعيد</strong> ضمن حدود المعاينة أعلاه. البيانات تُحدّث الحضور والحفظ والمالية عند وجود دفع.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SessionCompleteForm
            students={students}
            defaultDate={defaultDate}
            initialStudentId={studentId}
            lockedStudentId={studentId}
            draft={draft}
          />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/memorization/session?studentId=${encodeURIComponent(studentId)}`}>فتح صفحة الحصة كاملة</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
