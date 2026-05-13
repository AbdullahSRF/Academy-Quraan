import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/auth";
import { MemorizationDashboardBody } from "@/features/memorization-v2/components/memorization-dashboard-body";
import { countSessionsByUtcMonth, loadStudentMemorizationDashboard } from "@/features/memorization-v2/data/student-dashboard";
import { getStudentForUserId } from "@/features/students/data";
import { getActiveStudentSubscriptionSummary } from "@/features/subscriptions/data";
import prisma from "@/infrastructure/db/prisma";
import { redirect } from "next/navigation";
import { AdminInboxSection } from "@/components/messaging/admin-inbox-section";
import { formatEgp } from "@/lib/format-egp";

const ratingAr: Record<string, string> = {
  EXCELLENT: "ممتاز",
  VERY_GOOD: "جيد جدًا",
  GOOD: "جيد",
  WEAK: "ضعيف",
};

const attLabel: Record<string, string> = {
  PRESENT: "حاضر",
  ABSENT: "غائب",
  EXCUSED: "معذور",
  LATE: "متأخر",
};

const invStatus: Record<string, string> = {
  DRAFT: "مسودة",
  ISSUED: "صادرة",
  PAID: "مدفوعة",
  OVERDUE: "متأخرة",
  CANCELLED: "ملغاة",
};

export default async function StudentDashboardPage() {
  const session = await auth();
  if (session?.user?.role !== "STUDENT" || !session.user?.id) {
    redirect("/login");
  }

  const link = await getStudentForUserId(session.user.id);
  const student = link?.student;
  const subSummary = student ? await getActiveStudentSubscriptionSummary(student.id) : null;

  let memorizationBlock: ReactNode = null;
  if (student) {
    const [dash, atts, invs] = await Promise.all([
      loadStudentMemorizationDashboard(student.id),
      prisma.attendance.findMany({
        where: { studentId: student.id },
        orderBy: { date: "desc" },
        take: 21,
        select: { id: true, date: true, status: true },
      }),
      prisma.invoice.findMany({
        where: { studentId: student.id },
        orderBy: { issuedAt: "desc" },
        take: 10,
        select: { id: true, title: true, amount: true, status: true, dueDate: true },
      }),
    ]);
    const { zones, stats, sessions, livePercent, absenceDays } = dash;
    const monthly = countSessionsByUtcMonth(sessions);
    const last = sessions[0] ?? null;
    const openInv = invs.filter((i) => i.status === "ISSUED" || i.status === "OVERDUE");

    memorizationBlock = (
      <>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-primary/25 bg-accent/25 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">الواجب والمتابعة</CardTitle>
              <CardDescription>عرض القراءة — تسجيل الحصة من لوحة المحفظ.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">الواجب القادم (آخر حصة)</p>
                <p className="mt-1 text-base font-bold text-foreground">{last?.homeworkNext?.trim() || "— لا يوجد واجب مسجّل بعد —"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">التغطية {livePercent}%</Badge>
                {last?.rating ? <Badge variant="outline">{ratingAr[last.rating] ?? last.rating}</Badge> : null}
                {last ? (
                  <Badge variant="outline" dir="ltr">
                    آخر تسميع {last.sessionDate.toISOString().slice(0, 10)}
                  </Badge>
                ) : null}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">الحضور</CardTitle>
              <CardDescription>آخر {atts.length} يومًا مسجّلة</CardDescription>
            </CardHeader>
            <CardContent className="max-h-52 space-y-1 overflow-y-auto text-xs font-bold">
              {atts.length === 0 ? (
                <p className="text-muted">لا سجلات بعد.</p>
              ) : (
                atts.map((a) => (
                  <div key={a.id} className="flex justify-between gap-2 border-b border-border py-1 last:border-0">
                    <span dir="ltr" className="text-muted">
                      {a.date.toISOString().slice(0, 10)}
                    </span>
                    <span className="text-foreground">{attLabel[a.status] ?? a.status}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">الفواتير</CardTitle>
            <CardDescription>آخر فواتيرك — للاستفسار تواصل مع الإدارة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {openInv.length > 0 ? (
              <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                لديك {openInv.length} فاتورة بحالة «صادرة» أو «متأخرة» — راجع التفاصيل مع ولي الأمر أو الإدارة.
              </p>
            ) : (
              <p className="text-sm font-bold text-muted">لا توجد فواتير مفتوحة في آخر العيّنة المعروضة.</p>
            )}
            <ul className="space-y-2 text-sm font-bold">
              {invs.map((inv) => (
                <li key={inv.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted-bg/30 px-3 py-2">
                  <span className="text-foreground">{inv.title}</span>
                  <span className="tabular-nums text-muted" dir="ltr">
                    {formatEgp(inv.amount)}
                  </span>
                  <Badge variant={inv.status === "OVERDUE" ? "warning" : "secondary"}>{invStatus[inv.status] ?? inv.status}</Badge>
                </li>
              ))}
            </ul>
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
      </>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="لوحة الطالب"
        description={`مرحبًا ${session.user.name ?? student?.fullName ?? "طالبنا الكريم"}`}
      />

      <AdminInboxSection userId={session.user.id} />

      {student ? (
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">الاشتراك</CardTitle>
            <CardDescription>الباقة المعتمدة والحصص الشهرية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm font-bold">
            {subSummary ? (
              <>
                <p className="text-muted">
                  الباقة: <span className="text-foreground">{subSummary.planName}</span>
                </p>
                <p className="text-muted">
                  الحصص الشهرية: <span className="text-foreground">{subSummary.sessionsPerMonth}</span>
                </p>
                <p className="text-muted">
                  السعر المرجعي:{" "}
                  <span className="text-foreground" dir="ltr">
                    {formatEgp(subSummary.priceMonthly, { monthly: true })}
                  </span>
                </p>
              </>
            ) : (
              <p className="text-muted">لا يوجد اشتراك نشط. يمكن للإدارة ربط باقة من صفحة الاشتراكات.</p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {!student ? (
        <Card>
          <CardHeader>
            <CardTitle>لم يُربط ملفك بعد</CardTitle>
            <CardDescription>يتطلّب الأمر ربط حسابك بسجل طالب في الأكاديمية.</CardDescription>
          </CardHeader>
          <CardContent className="text-base font-bold leading-relaxed text-muted">
            تواصل مع الإدارة لإكمال ربط الحساب بملف الطالب حتى تظهر هنا بيانات الحفظ والحضور.
          </CardContent>
        </Card>
      ) : (
        memorizationBlock
      )}
    </div>
  );
}
