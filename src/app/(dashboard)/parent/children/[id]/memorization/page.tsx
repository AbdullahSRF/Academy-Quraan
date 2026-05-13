import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { MemorizationDashboardBody } from "@/features/memorization-v2/components/memorization-dashboard-body";
import { countSessionsByUtcMonth, loadStudentMemorizationDashboard } from "@/features/memorization-v2/data/student-dashboard";
import { getParentIdForUser } from "@/features/parent/data";
import { getParentChildFinanceAttendance } from "@/features/parent/parent-dashboard-data";
import prisma from "@/infrastructure/db/prisma";
import { PriceAmount } from "@/components/ui/price-amount";

const invStatus: Record<string, string> = {
  DRAFT: "مسودة",
  ISSUED: "صادرة",
  PAID: "مدفوعة",
  OVERDUE: "متأخرة",
  CANCELLED: "ملغاة",
};

const attLabel: Record<string, string> = {
  PRESENT: "حاضر",
  ABSENT: "غائب",
  EXCUSED: "معذور",
  LATE: "متأخر",
};

const ratingAr: Record<string, string> = {
  EXCELLENT: "ممتاز",
  VERY_GOOD: "جيد جدًا",
  GOOD: "جيد",
  WEAK: "ضعيف",
};

type PageProps = { params: Promise<{ id: string }> };

export default async function ParentChildMemorizationPage({ params }: PageProps) {
  const session = await auth();
  if (session?.user?.role !== "PARENT" || !session.user.id) {
    redirect("/login");
  }

  const { id: studentId } = await params;
  const parentId = await getParentIdForUser(session.user.id);
  if (!parentId) notFound();

  const student = await prisma.student.findFirst({
    where: { id: studentId, parents: { some: { parentId } } },
    select: { fullName: true },
  });
  if (!student) notFound();

  const [{ zones, stats, sessions, livePercent, absenceDays }, { atts, invs }] = await Promise.all([
    loadStudentMemorizationDashboard(studentId),
    getParentChildFinanceAttendance(studentId),
  ]);

  const monthly = countSessionsByUtcMonth(sessions);
  const last = sessions[0] ?? null;
  let paidOnInvoices = 0;
  for (const inv of invs) {
    for (const p of inv.payments) {
      paidOnInvoices += Number(p.amount.toString());
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="متابعة الحفظ والتسميع"
        description={`عرض للقراءة — ${student.fullName}`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/parent">العودة لأبنائي</Link>
          </Button>
        }
      />

      <p className="text-sm font-bold text-muted">
        هذه الصفحة للاطلاع فقط. تسجيل الحصص يتم من حساب المشرف في الأكاديمية.
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-primary/25 bg-accent/30 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">الواجب والوضع الحالي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm font-bold">
            <div>
              <p className="text-xs uppercase text-muted">الواجب القادم</p>
              <p className="mt-1 text-base text-foreground">{last?.homeworkNext?.trim() || "—"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">التغطية {livePercent}%</Badge>
              {last?.rating ? <Badge variant="outline">{ratingAr[last.rating] ?? last.rating}</Badge> : null}
              {last ? (
                <Badge variant="outline" dir="ltr">
                  آخر حصة {last.sessionDate.toISOString().slice(0, 10)}
                </Badge>
              ) : null}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">الحضور</CardTitle>
            <CardDescription>آخر {atts.length} سجلًا</CardDescription>
          </CardHeader>
          <CardContent className="max-h-48 space-y-1 overflow-y-auto text-xs font-bold">
            {atts.length === 0 ? (
              <p className="text-muted">لا سجلات.</p>
            ) : (
              atts.map((a) => (
                <div key={a.id} className="flex justify-between gap-2 border-b border-border py-1 last:border-0">
                  <span dir="ltr" className="text-muted">
                    {a.date.toISOString().slice(0, 10)}
                  </span>
                  <span>{attLabel[a.status] ?? a.status}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الفواتير والمدفوعات</CardTitle>
          <CardDescription>
            آخر فواتير الطالب — إجمالي ما دُفع على هذه العيّنة:{" "}
            <PriceAmount>{paidOnInvoices.toFixed(2)}</PriceAmount>
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 sm:p-6">
          {invs.length === 0 ? (
            <p className="px-6 py-6 text-center text-sm font-bold text-muted">لا فواتير مسجّلة.</p>
          ) : (
            <table className="w-full min-w-[520px] border-collapse text-start text-sm font-bold">
              <thead>
                <tr className="border-b border-border bg-muted-bg/80">
                  <th className="px-4 py-3">العنوان</th>
                  <th className="px-4 py-3">المبلغ</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3">دفعات</th>
                </tr>
              </thead>
              <tbody>
                {invs.map((inv) => (
                  <tr key={inv.id} className="border-b border-border odd:bg-muted-bg/25">
                    <td className="px-4 py-3 text-foreground">{inv.title}</td>
                    <td className="px-4 py-3 tabular-nums">
                      <PriceAmount>{inv.amount.toString()}</PriceAmount>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={inv.status === "OVERDUE" ? "warning" : "secondary"}>{invStatus[inv.status] ?? inv.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{inv.payments.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <MemorizationDashboardBody
        zones={zones}
        stats={stats}
        sessions={sessions}
        livePercent={livePercent}
        monthly={monthly}
        absenceDays={absenceDays}
        showSessionWorkColumns
      />
    </div>
  );
}
