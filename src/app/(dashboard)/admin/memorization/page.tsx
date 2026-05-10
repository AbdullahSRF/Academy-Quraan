import Link from "next/link";
import { BookMarked, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { listRecentMemorization, listStudentsForMemorization } from "@/features/memorization/data";
import { MemorizationForm } from "@/features/memorization/components/memorization-form";

const typeLabel: Record<string, string> = {
  NEW_MEMORIZATION: "حفظ جديد",
  REVIEW: "مراجعة",
  RECITATION: "تسميع",
};

export default async function AdminMemorizationPage() {
  const defaultDate = new Date().toISOString().slice(0, 10);
  const [students, records] = await Promise.all([listStudentsForMemorization(), listRecentMemorization(50)]);

  return (
    <div className="space-y-10">
      <PageHeader
        title="الحفظ والتسميع"
        description="منظومتان: السجل التقليدي أدناه، والنظام الموصى به «مناطق + جلسات» للحصص السريعة والترقية التلقائية."
        actions={
          <Button asChild className="gap-2">
            <Link href="/admin/memorization/session">
              <Layers className="size-4" aria-hidden />
              حصة تسميع (مناطق)
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-primary/25 bg-gradient-to-br from-accent/50 to-card">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Layers className="size-5" aria-hidden />
            </div>
            <CardTitle className="text-lg">النظام الحديث (مناطق)</CardTitle>
            <CardDescription className="text-sm font-bold leading-relaxed text-muted">
              ثلاث مناطق للطالب: الجديد، الماضي القريب، الماضي البعيد — مع جلسة واحدة تُحدّث الحضور والإحصائيات والتغطية.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/admin/memorization/session">فتح صفحة الحصة</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/students">اختيار طالب من القائمة</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border bg-muted-bg/50">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-foreground/85 text-background">
              <BookMarked className="size-5" aria-hidden />
            </div>
            <CardTitle className="text-lg">السجل التقليدي</CardTitle>
            <CardDescription className="text-sm font-bold leading-relaxed text-muted">
              جدول MemorizationRecord للتوافق مع البيانات القديمة أو الإدخال اليدوي البسيط دون مناطق.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-bold text-muted">استخدم النموذج أدناه لإضافة سجلات لهذا النمط.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إضافة سجل (تقليدي)</CardTitle>
          <CardDescription>نوع الجلسة، الطالب، التاريخ، والنطاق والدرجة عند الحاجة.</CardDescription>
        </CardHeader>
        <CardContent>
          <MemorizationForm students={students} defaultDate={defaultDate} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>آخر السجلات (تقليدي)</CardTitle>
          <CardDescription>أحدث 50 سجلًا</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 sm:p-6">
          {records.length === 0 ? (
            <p className="px-6 py-10 text-center text-base font-bold text-muted">لا توجد سجلات بعد.</p>
          ) : (
            <table className="w-full min-w-[720px] border-collapse text-start text-sm font-bold">
              <thead>
                <tr className="border-b border-border bg-muted-bg/80 text-foreground">
                  <th className="px-4 py-3">التاريخ</th>
                  <th className="px-4 py-3">الطالب</th>
                  <th className="px-4 py-3">النوع</th>
                  <th className="px-4 py-3">من — إلى</th>
                  <th className="px-4 py-3">درجة</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-border odd:bg-muted-bg/30">
                    <td className="px-4 py-3 text-muted" dir="ltr">
                      {r.sessionDate.toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/students/${r.studentId}`} className="font-bold text-primary hover:underline">
                        {r.student.fullName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{typeLabel[r.type] ?? r.type}</td>
                    <td
                      className="max-w-[14rem] truncate px-4 py-3 text-muted"
                      title={`${r.fromSurah ?? ""} ${r.fromAyah ?? ""} → ${r.toSurah ?? ""} ${r.toAyah ?? ""}`}
                    >
                      {[r.fromSurah, r.fromAyah, r.toSurah, r.toAyah].filter(Boolean).length
                        ? `${r.fromSurah ?? ""} ${r.fromAyah ?? ""} → ${r.toSurah ?? ""} ${r.toAyah ?? ""}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">{r.score ?? "—"}</td>
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
