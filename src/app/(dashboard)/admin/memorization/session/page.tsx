import Link from "next/link";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { listStudentsForMemorization } from "@/features/memorization/data";
import { planSessionDraft } from "@/features/memorization-v2/application/plan-session-draft";
import { SessionZonePreview } from "@/features/memorization-v2/components/session-zone-preview";
import { listRecentMemorizationSessions } from "@/features/memorization-v2/data/sessions";
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

const ratingAr: Record<string, string> = {
  EXCELLENT: "ممتاز",
  VERY_GOOD: "جيد جدًا",
  GOOD: "جيد",
  WEAK: "ضعيف",
};

type PageProps = { searchParams: Promise<{ studentId?: string }> };

export default async function MemorizationSessionPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const presetStudentId = typeof sp.studentId === "string" ? sp.studentId.trim() : "";

  const defaultDate = new Date().toISOString().slice(0, 10);
  const [students, sessions] = await Promise.all([listStudentsForMemorization(), listRecentMemorizationSessions(25)]);

  let draft =
    presetStudentId && students.some((s) => s.id === presetStudentId)
      ? await planSessionDraft(presetStudentId)
      : null;

  if (presetStudentId && draft) {
    const dbRow = await getMemorizationSessionDraftDb(
      presetStudentId,
      new Date(`${defaultDate}T12:00:00.000Z`),
    );
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
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="حصة تسميع (مناطق)"
        description="سير عمل واحد: حضور + نطاق الجديد + مراجعة اختيارية للقريب/البعيد + تقييم — ثم «تم التسميع» لتحديث المناطق والإحصائيات."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/memorization">سجل الحفظ القديم</Link>
          </Button>
        }
      />

      {presetStudentId && students.some((s) => s.id === presetStudentId) ? (
        <SessionZonePreview studentId={presetStudentId} />
      ) : (
        <Card className="border-dashed border-emerald-300/80 bg-emerald-50/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">معاينة المناطق</CardTitle>
            <CardDescription>
              لعرض NEW / NEAR / FAR قبل الحصة، افتح الصفحة من لوحة طالب (زر «بدء الحصة») أو أضف{" "}
              <code className="rounded bg-white px-1 py-0.5 text-xs font-bold" dir="ltr">
                ?studentId=…
              </code>{" "}
              في الرابط.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/students">قائمة الطلاب</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>بدء الحصة</CardTitle>
          <CardDescription>
            يُحدَّث جدول الحضور لنفس اليوم، وتُحفظ الجلسة مع لقطات المناطق وعمل المراجعة إن وُجد، ثم تُحدَّث مناطق NEW / NEAR / FAR عند الترقية.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionCompleteForm
            students={students}
            defaultDate={defaultDate}
            initialStudentId={presetStudentId || undefined}
            draft={draft}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>آخر جلسات المناطق</CardTitle>
          <CardDescription>MemorizationSession — أحدث 25 حصة</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 sm:p-6">
          {sessions.length === 0 ? (
            <p className="px-6 py-10 text-center text-base font-bold text-muted">لا توجد جلسات بعد.</p>
          ) : (
            <table className="w-full min-w-[720px] border-collapse text-start text-sm font-bold">
              <thead>
                <tr className="border-b border-border bg-muted-bg/80 text-foreground">
                  <th className="px-4 py-3">التاريخ</th>
                  <th className="px-4 py-3">الطالب</th>
                  <th className="px-4 py-3">تقييم</th>
                  <th className="px-4 py-3">الواجب التالي</th>
                  <th className="px-4 py-3">ترقية</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-border odd:bg-muted-bg/30">
                    <td className="px-4 py-3 text-muted" dir="ltr">
                      {s.sessionDate.toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">
                      <Link className="font-bold text-primary hover:underline" href={`/admin/students/${s.studentId}`}>
                        {s.student.fullName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {s.rating ? (
                        <Badge variant="outline">{ratingAr[s.rating] ?? s.rating}</Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="max-w-[14rem] truncate px-4 py-3 text-xs text-muted" title={s.homeworkNext ?? ""}>
                      {s.homeworkNext?.trim() || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">{s.autoPromoteCompletedSurah ? "نعم" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
