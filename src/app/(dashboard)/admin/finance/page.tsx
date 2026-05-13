import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/dashboard/stat-tile";
import { Badge } from "@/components/ui/badge";
import { listRecentInvoices, listStudentsForFinance } from "@/features/finance/data";
import { getFinanceDashboardData } from "@/features/finance/finance-dashboard-data";
import { InvoiceForm } from "@/features/finance/components/invoice-form";
import { formatEgp } from "@/lib/format-egp";

const invStatus: Record<string, string> = {
  DRAFT: "مسودة",
  ISSUED: "صادرة",
  PAID: "مدفوعة",
  OVERDUE: "متأخرة",
  CANCELLED: "ملغاة",
};

const paySessionAr: Record<string, string> = {
  NOT_APPLICABLE: "لا يطبق",
  PENDING: "معلق",
  PAID: "مدفوع",
  WAIVED: "معفى",
};

function paymentsCountLabel(count: number): string {
  if (count === 0) return "لا دفعات";
  if (count === 1) return "دفعة واحدة";
  if (count === 2) return "دفعتان";
  return `${count} دفعات`;
}

export default async function AdminFinancePage() {
  const [students, invoices, fin] = await Promise.all([
    listStudentsForFinance(),
    listRecentInvoices(80),
    getFinanceDashboardData(),
  ]);

  const overdue = invoices.filter((i) => i.status === "OVERDUE").length;
  const issued = invoices.filter((i) => i.status === "ISSUED").length;

  const br = fin.sessionPaymentBreakdown30d;

  return (
    <div className="space-y-10">
      <PageHeader
        title="المالية"
        description="أرباح، دفعات، حصص تسميع، فواتير، ومؤشرات اشتراك تشغيلية للطلاب — في لوحة واحدة."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/reports">التقارير</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/students">الطلاب</Link>
            </Button>
          </div>
        }
      />

      <section aria-labelledby="fin-kpi" className="space-y-3">
        <h2 id="fin-kpi" className="sr-only">
          مؤشرات مالية
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatTile label="إيرادات (30 يومًا)" value={formatEgp(fin.revenue30d)} hint={paymentsCountLabel(fin.paymentsCount30d)} hintInline />
          <StatTile label="إيرادات (365 يومًا)" value={formatEgp(fin.revenue365d)} hint={paymentsCountLabel(fin.paymentsCount365d)} hintInline />
          <StatTile label="حصص مناطق مكتملة (30 يومًا)" value={fin.sessionsCompleted30d} hint="MemorizationSession" hintInline />
          <StatTile label="حصص — دفع معلّق" value={fin.pendingMemoPayments120d} tone="amber" hint="120 يومًا" hintInline />
          <StatTile label="فواتير مفتوحة (مبلغ)" value={formatEgp(fin.openInvoicesAmount)} hint={`${fin.openInvoicesCount} فاتورة`} hintInline />
          <StatTile label="عيّنة — متأخرة / صادرة" value={`${overdue} / ${issued}`} hint="من آخر 80 فاتورة" />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
            <div>
              <CardTitle>الاشتراكات (قاعدة البيانات)</CardTitle>
              <CardDescription>
                أربع باقات ثابتة بالجنيه المصري — MRR تقريبي من مجموع أسعار الباقات للاشتراكات النشطة المرتبطة بهذه الباقات فقط.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/subscriptions">إدارة الاشتراكات</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 text-sm font-bold">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted-bg/40 px-4 py-3">
                <span className="text-muted">باقات نشطة</span>
                <span className="text-2xl tabular-nums text-primary">{fin.subscriptionPlansActive}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted-bg/40 px-4 py-3">
                <span className="text-muted">اشتراكات نشطة</span>
                <span className="text-2xl tabular-nums text-foreground">{fin.subscriptionsActive}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted-bg/40 px-4 py-3">
                <span className="text-muted">موقوفة</span>
                <span className="text-2xl tabular-nums text-amber-600 dark:text-amber-400">{fin.subscriptionsPaused}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted-bg/40 px-4 py-3">
                <span className="text-muted">MRR تقريبي شهريًا</span>
                <span className="text-xl tabular-nums text-primary" dir="ltr">
                  {formatEgp(fin.subscriptionsMrrApprox)}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted-bg/40 px-4 py-3">
              <span className="text-muted">طلاب منتظمون (مرجع)</span>
              <span className="text-2xl tabular-nums text-foreground">{fin.studentsRegular}</span>
            </div>
            <p className="leading-relaxed text-muted">
              الفواتير والدفعات مستقلة عن الاشتراكات — اربطها تشغيليًا عند الحاجة من صفحة الطالب أو المالية.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/students">الطلاب</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>حصص التسميع — توزيع حالة الدفع (30 يومًا)</CardTitle>
            <CardDescription>للحصص المكتملة فقط ضمن آخر 30 يومًا</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm font-bold">
              {(["NOT_APPLICABLE", "PENDING", "PAID", "WAIVED"] as const).map((k) => (
                <li key={k} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted-bg/30 px-3 py-2">
                  <span className="text-muted">{paySessionAr[k]}</span>
                  <Badge variant="secondary" className="tabular-nums">
                    {br[k]}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>توزيع حالات الفواتير (عيّنة)</CardTitle>
            <CardDescription>حسب آخر 200 فاتورة مرتبة بتاريخ الإصدار</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-wrap gap-2">
              {Object.entries(fin.invoicesByStatus).map(([st, n]) => (
                <li key={st}>
                  <Badge variant="outline" className="gap-1 font-bold">
                    {invStatus[st] ?? st}: <span className="tabular-nums text-foreground">{n}</span>
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>آخر الدفعات</CardTitle>
            <CardDescription>أحدث 18 دفعة مسجّلة</CardDescription>
          </CardHeader>
          <CardContent className="max-h-80 space-y-2 overflow-y-auto text-sm font-bold">
            {fin.recentPayments.length === 0 ? (
              <p className="text-muted">لا دفعات بعد.</p>
            ) : (
              fin.recentPayments.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted-bg/25 px-3 py-2">
                  <div>
                    <p className="text-foreground">{p.student.fullName}</p>
                    <p className="text-xs text-muted" dir="ltr">
                      {p.paidAt.toISOString().slice(0, 10)} {p.method ? `· ${p.method}` : ""}
                    </p>
                  </div>
                  <span className="tabular-nums text-primary" dir="ltr">
                    {formatEgp(p.amount)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إصدار فاتورة</CardTitle>
          <CardDescription>تُنشأ بحالة «صادرة». يمكن ربط الدفعات لاحقًا بحصص التسميع.</CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceForm students={students} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الفواتير</CardTitle>
          <CardDescription>أحدث 80 فاتورة — اضغط على اسم الطالب للانتقال لملفه</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 sm:p-6">
          {invoices.length === 0 ? (
            <p className="px-6 py-10 text-center text-base font-bold text-muted">لا توجد فواتير بعد.</p>
          ) : (
            <table className="w-full min-w-[720px] border-collapse text-start text-sm font-bold">
              <thead>
                <tr className="border-b border-border bg-muted-bg/80 text-foreground">
                  <th className="px-4 py-3">الطالب</th>
                  <th className="px-4 py-3">العنوان</th>
                  <th className="px-4 py-3">المبلغ</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3">الاستحقاق</th>
                  <th className="px-4 py-3">دفعات</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border odd:bg-muted-bg/30">
                    <td className="px-4 py-3">
                      <Link className="text-primary hover:underline" href={`/admin/students/${inv.studentId}`}>
                        {inv.student.fullName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground">{inv.title}</td>
                    <td className="px-4 py-3 text-foreground" dir="ltr">
                      {formatEgp(inv.amount)}
                    </td>
                    <td className="px-4 py-3 text-muted">{invStatus[inv.status] ?? inv.status}</td>
                    <td className="px-4 py-3 text-muted" dir="ltr">
                      {inv.dueDate ? inv.dueDate.toISOString().slice(0, 10) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">{inv.payments.length}</td>
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
