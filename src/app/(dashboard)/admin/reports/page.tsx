import Link from "next/link";
import { Prisma } from "@prisma/client";
import { ArrowLeft, BookOpenCheck, Download, LineChart, Users, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/dashboard/stat-tile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import prisma from "@/infrastructure/db/prisma";
import { getActiveSubscriptionsByFixedPlan } from "@/features/subscriptions/data";
import { formatEgp } from "@/lib/format-egp";

const statusLabel: Record<string, string> = {
  REGULAR: "منتظم",
  PAUSED: "متوقف",
  FROZEN: "مجمد",
  WITHDRAWN: "منسحب",
  ARCHIVED: "مؤرشف",
};

const ratingAr: Record<string, string> = {
  EXCELLENT: "ممتاز",
  VERY_GOOD: "جيد جدًا",
  GOOD: "جيد",
  WEAK: "ضعيف",
};

async function memorizationSessionsLast30Days(): Promise<number> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  try {
    return await prisma.memorizationSession.count({
      where: { sessionDate: { gte: since }, status: "COMPLETED" },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021") return 0;
    throw e;
  }
}

export default async function AdminReportsPage() {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [studentTotal, byStatus, attendance30, memo30, memoZones30, invoicesOpen, revenue30, recentSessions, subscriptionsByPlan] =
    await Promise.all([
    prisma.student.count({ where: { NOT: { status: "ARCHIVED" } } }),
    prisma.student.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.attendance.count({
      where: {
        date: {
          gte: since30,
        },
      },
    }),
    prisma.memorizationRecord.count({
      where: {
        sessionDate: {
          gte: since30,
        },
      },
    }),
    memorizationSessionsLast30Days(),
    prisma.invoice.count({
      where: { status: { in: ["ISSUED", "OVERDUE"] } },
    }),
    prisma.payment.aggregate({
      where: { paidAt: { gte: since30 } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    (async () => {
      try {
        return await prisma.memorizationSession.findMany({
          where: { status: "COMPLETED" },
          orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }],
          take: 15,
          include: { student: { select: { id: true, fullName: true } } },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021") return [];
        throw e;
      }
    })(),
    getActiveSubscriptionsByFixedPlan(),
  ]);

  const payCount = revenue30._count._all;
  const payLabel = payCount === 0 ? "لا دفعات" : payCount === 1 ? "دفعة واحدة" : `${payCount} دفعات`;

  return (
    <div className="space-y-10">
      <PageHeader
        title="التقارير والمؤشرات"
        description="ملخص تشغيلي لآخر 30 يومًا مع تصدير ملخص للوحة (CSV / PDF) وروابط سريعة للعمل اليومي."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <a href="/api/admin/reports/export?format=csv&type=summary" download>
                <Download className="size-4 sm:me-1" aria-hidden />
                CSV
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/api/admin/reports/export?format=pdf&type=summary" download>
                <Download className="size-4 sm:me-1" aria-hidden />
                PDF
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/finance">
                <Wallet className="size-4 sm:me-1" aria-hidden />
                المالية
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/memorization/session">
                <BookOpenCheck className="size-4 sm:me-1" aria-hidden />
                حصة
              </Link>
            </Button>
          </div>
        }
      />

      <section aria-labelledby="rep-stats" className="space-y-3">
        <h2 id="rep-stats" className="sr-only">
          ملخص 30 يومًا
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatTile label="إيرادات (30 يومًا)" value={formatEgp(revenue30._sum.amount)} hint={payLabel} hintInline />
          <StatTile label="إجمالي الطلاب" value={studentTotal} />
          <StatTile label="سجلات حضور (30 يومًا)" value={attendance30} hint="عدد الصفوف" />
          <StatTile label="سجل حفظ قديم (30 يومًا)" value={memo30} tone="stone" />
          <StatTile label="حصص مناطق (30 يومًا)" value={memoZones30} hint="مكتملة" hintInline />
          <StatTile label="فواتير مفتوحة" value={invoicesOpen} tone="amber" />
        </div>
      </section>

      <section aria-labelledby="rep-subscriptions" className="space-y-3">
        <h2 id="rep-subscriptions" className="text-lg font-bold text-foreground">
          الاشتراكات النشطة حسب الباقة
        </h2>
        <p className="text-sm font-bold text-muted">باقات شهرية ثابتة بالجنيه المصري — عدد الطلاب الذين لديهم اشتراك نشط لكل باقة.</p>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[360px] border-collapse text-start text-sm font-bold">
            <thead>
              <tr className="border-b border-border bg-muted-bg/80">
                <th className="px-4 py-3">الباقة</th>
                <th className="px-4 py-3">الحصص الشهرية</th>
                <th className="px-4 py-3">اشتراكات نشطة</th>
              </tr>
            </thead>
            <tbody>
              {subscriptionsByPlan.map((row) => (
                <tr key={row.planLabel} className="border-b border-border odd:bg-muted-bg/25">
                  <td className="px-4 py-3 text-foreground">{row.planLabel}</td>
                  <td className="px-4 py-3 tabular-nums text-muted">{row.sessionsPerMonth}</td>
                  <td className="px-4 py-3 tabular-nums text-muted">{row.activeCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-primary" aria-hidden />
              الطلاب
            </CardTitle>
            <CardDescription>بحث وفلترة وبدء حصة</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild className="w-full gap-2">
              <Link href="/admin/students">
                انتقل
                <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <LineChart className="size-4 text-primary" aria-hidden />
              لوحة المشرف
            </CardTitle>
            <CardDescription>نظرة يومية وتقويم</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild className="w-full gap-2">
              <Link href="/admin">
                انتقل
                <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="size-4 text-primary" aria-hidden />
              المالية
            </CardTitle>
            <CardDescription>فواتير ودفعات</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild className="w-full gap-2">
              <Link href="/admin/finance">
                انتقل
                <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpenCheck className="size-4 text-primary" aria-hidden />
              حصة تسميع
            </CardTitle>
            <CardDescription>تسجيل سريع</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild className="w-full gap-2">
              <Link href="/admin/memorization/session">
                انتقل
                <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>الطلاب حسب الحالة</CardTitle>
            <CardDescription>تجميع من جدول الطلاب</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {byStatus.length === 0 ? (
              <p className="text-base font-bold text-muted">لا بيانات.</p>
            ) : (
              <ul className="space-y-2 text-base font-bold">
                {byStatus.map((row) => (
                  <li key={row.status} className="flex justify-between gap-4 border-b border-border py-2">
                    <span className="text-foreground">{statusLabel[row.status] ?? row.status}</span>
                    <span className="tabular-nums text-primary">{row._count._all}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أحدث حصص التسميع</CardTitle>
            <CardDescription>عيّنة من كل الطلاب — آخر 15 حصة مكتملة</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0 sm:p-6">
            {recentSessions.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm font-bold text-muted">لا حصص مسجّلة بعد.</p>
            ) : (
              <table className="w-full min-w-[400px] border-collapse text-start text-sm font-bold">
                <thead>
                  <tr className="border-b border-border bg-muted-bg/80">
                    <th className="px-4 py-3">التاريخ</th>
                    <th className="px-4 py-3">الطالب</th>
                    <th className="px-4 py-3">التقييم</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((s) => (
                    <tr key={s.id} className="border-b border-border odd:bg-muted-bg/25">
                      <td className="px-4 py-3 text-muted" dir="ltr">
                        {s.sessionDate.toISOString().slice(0, 10)}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/students/${s.studentId}`} className="text-primary hover:underline">
                          {s.student.fullName}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {s.rating ? (
                          <Badge variant="outline">{ratingAr[s.rating] ?? s.rating}</Badge>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
