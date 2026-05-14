import Link from "next/link";
import { auth } from "@/auth-session";
import { redirect } from "next/navigation";
import { BookOpenCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/dashboard/stat-tile";
import { AdminMonthCalendar } from "@/components/dashboard/admin-month-calendar";
import { Badge } from "@/components/ui/badge";
import { getAdminOverviewStats } from "@/features/dashboard/admin-overview";
import {
  getAdminDashboardBundle,
  getAdminMonthCalendar,
  parseAdminCalendarView,
} from "@/features/dashboard/admin-dashboard-data";
import { AdminCalendarNav } from "@/features/dashboard/admin-calendar-nav";

const ratingAr: Record<string, string> = {
  EXCELLENT: "ممتاز",
  VERY_GOOD: "جيد جدًا",
  GOOD: "جيد",
  WEAK: "ضعيف",
};

function formatRevenue30d(amount: { toString(): string }): string {
  const n = Number(amount.toString());
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat("ar", {
    numberingSystem: "latn",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

function paymentsCountLabel(count: number): string {
  if (count === 0) return "لا دفعات";
  if (count === 1) return "دفعة واحدة";
  if (count === 2) return "دفعتان";
  return `${count} دفعات`;
}

type PageProps = { searchParams: Promise<{ calYear?: string; calMonth?: string }> };

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/login/admin");
  }

  const sp = await searchParams;
  const calView = parseAdminCalendarView(sp);
  const [stats, dash, calendarMonth] = await Promise.all([
    getAdminOverviewStats(),
    getAdminDashboardBundle(),
    getAdminMonthCalendar(calView.year, calView.monthIndex0),
  ]);

  const nowUtc = new Date();
  const todayYear = nowUtc.getUTCFullYear();
  const todayMonth = nowUtc.getUTCMonth() + 1;

  return (
    <div className="space-y-10">
      <PageHeader
        title="لوحة المشرف"
        description={`مرحبًا ${session.user.name ?? ""} — نظرة تشغيلية على اليوم، المالية، والنشاط الأخير.`}
        actions={
          <Button asChild className="gap-2">
            <Link href="/admin/memorization/session">
              <BookOpenCheck className="size-4" aria-hidden />
              بدء حصة تسميع
            </Link>
          </Button>
        }
      />

      <section aria-labelledby="stats-heading" className="space-y-3">
        <h2 id="stats-heading" className="sr-only">
          إحصائيات سريعة
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatTile label="إجمالي الطلاب" value={stats.studentsTotal} hint="كل الحالات" />
          <StatTile label="طلاب منتظمون" value={stats.studentsRegular} tone="emerald" />
          <StatTile label="حضور اليوم (صفوف)" value={dash.attendanceToday} hint={dash.todayStr} tone="emerald" />
          <StatTile label="حصص مكتملة اليوم" value={dash.sessionsToday} hint="MemorizationSession" />
          <StatTile label="فواتير مفتوحة" value={stats.invoicesOpen} tone="amber" hint="صادرة أو متأخرة" />
          <StatTile
            label="إيرادات (30 يومًا)"
            value={formatRevenue30d(dash.revenue30d)}
            hint={paymentsCountLabel(dash.paymentsCount30d)}
            hintInline
            valueDir="rtl"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="سجلات حضور (30 يومًا)" value={stats.attendanceRows30d} hint="عدد الصفوف" />
          <StatTile label="سجل حفظ قديم (30 يومًا)" value={stats.memorizationRecords30d} tone="stone" />
          <StatTile label="حصص مناطق (30 يومًا)" value={stats.memorizationSessions30d} hint="مكتملة" hintInline />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>آخر التسميعات</CardTitle>
            <CardDescription>أحدث حصص مناطق مكتملة</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0 sm:p-6">
            {dash.recentSessions.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm font-bold text-muted">لا حصص بعد.</p>
            ) : (
              <table className="w-full min-w-[480px] border-collapse text-start text-sm font-bold">
                <thead>
                  <tr className="border-b border-border bg-muted-bg/80">
                    <th className="px-4 py-3">التاريخ</th>
                    <th className="px-4 py-3">الطالب</th>
                    <th className="px-4 py-3">التقييم</th>
                  </tr>
                </thead>
                <tbody>
                  {dash.recentSessions.map((s) => (
                    <tr key={s.id} className="border-b border-border odd:bg-muted-bg/25">
                      <td className="px-4 py-3 text-muted" dir="ltr">
                        {s.sessionDate.toISOString().slice(0, 10)}
                      </td>
                      <td className="px-4 py-3">
                        <Link className="text-primary hover:underline" href={`/admin/students/${s.studentId}`}>
                          {s.student.fullName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted">{s.rating ? ratingAr[s.rating] ?? s.rating : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>التقويم التفاعلي</CardTitle>
            <CardDescription>
              شبكة شهرية (UTC): الحضور والحصص المكتملة — استخدم الأسهم للتنقل بين الأشهر.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdminCalendarNav year={calView.year} month={calView.month} todayYear={todayYear} todayMonth={todayMonth} />
            <AdminMonthCalendar calendar={calendarMonth} todayStr={dash.todayStr} />
            <div className="mt-6 border-t border-border pt-4">
              <p className="mb-2 text-xs font-bold text-muted">آخر 14 يومًا (حضور)</p>
              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-muted">
                {dash.calendar14.map((d) => (
                  <div key={d.date} className="rounded-lg border border-border bg-muted-bg/40 p-1.5" title={d.date}>
                    <div dir="ltr" className="truncate text-foreground">
                      {d.date.slice(5)}
                    </div>
                    <div className="text-primary">{d.attendanceCount}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
            <div>
              <CardTitle>متأخرات الدفع</CardTitle>
              <CardDescription>فواتير بحالة «متأخرة»</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/finance">المالية</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {dash.overdueInvoices.length === 0 ? (
              <p className="text-sm font-bold text-muted">لا فواتير متأخرة في العيّنة الحالية.</p>
            ) : (
              dash.overdueInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted-bg/30 px-3 py-2"
                >
                  <div>
                    <p className="font-bold text-foreground">{inv.student.fullName}</p>
                    <p className="text-xs font-bold text-muted">{inv.title}</p>
                  </div>
                  <Badge variant="warning" dir="rtl" className="tabular-nums">
                    {inv.amount.toString()}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>آخر الأنشطة</CardTitle>
            <CardDescription>سجل تدقيق مختصر</CardDescription>
          </CardHeader>
          <CardContent className="max-h-80 space-y-2 overflow-y-auto text-sm font-bold">
            {dash.activity.length === 0 ? (
              <p className="text-muted">لا سجلات.</p>
            ) : (
              dash.activity.map((a) => (
                <div key={a.id} className="rounded-lg border border-border bg-muted-bg/25 px-3 py-2">
                  <p className="text-foreground">{a.action}</p>
                  <p className="text-xs text-muted">
                    {a.entity}
                    {a.entityId ? ` · ${a.entityId.slice(0, 8)}…` : ""}
                  </p>
                  <p className="text-xs text-muted" dir="ltr">
                    {a.createdAt.toISOString().slice(0, 19).replace("T", " ")}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
