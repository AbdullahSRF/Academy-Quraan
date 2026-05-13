import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArchiveStudentButton } from "@/features/students/components/archive-student-button";
import { StudentAccountPanel } from "@/features/students/components/student-account-panel";
import { MemorizationDashboardBody } from "@/features/memorization-v2/components/memorization-dashboard-body";
import { countSessionsByUtcMonth, loadStudentMemorizationDashboard } from "@/features/memorization-v2/data/student-dashboard";
import { getStudentProfileBundle, sumPaymentsForInvoices } from "@/features/students/student-profile-data";
import { formatEgp } from "@/lib/format-egp";

const statusLabel: Record<string, string> = {
  REGULAR: "منتظم",
  PAUSED: "متوقف",
  FROZEN: "مجمد",
  WITHDRAWN: "منسحب",
  ARCHIVED: "مؤرشف",
};

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

type PageProps = { params: Promise<{ id: string }> };

export default async function StudentProfilePage({ params }: PageProps) {
  const { id } = await params;
  const [bundle, dash] = await Promise.all([getStudentProfileBundle(id), loadStudentMemorizationDashboard(id)]);
  if (!bundle) notFound();

  const { student, invoices, attendances } = bundle;
  const monthly = countSessionsByUtcMonth(dash.sessions);
  const paidTotal = sumPaymentsForInvoices(invoices);

  return (
    <div className="space-y-8">
      <PageHeader
        title={student.fullName}
        description={[statusLabel[student.status] ?? student.status, student.level ? `المستوى: ${student.level}` : null]
          .filter(Boolean)
          .join(" — ")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild className="gap-2">
              <Link href={`/admin/memorization/session?studentId=${encodeURIComponent(student.id)}`}>
                <CalendarCheck className="size-4" aria-hidden />
                بدء الحصة
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href={`/admin/students/${student.id}/edit`}>
                <Pencil className="size-4" aria-hidden />
                تعديل
              </Link>
            </Button>
            {student.status !== "ARCHIVED" ? <ArchiveStudentButton studentId={student.id} /> : null}
            <Button variant="outline" asChild>
              <Link href="/admin/students">كل الطلاب</Link>
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="overview" dir="rtl" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap gap-1 p-2">
          <TabsTrigger value="overview" className="flex-1 min-w-[7rem]">
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="memorization" className="flex-1 min-w-[7rem]">
            الحفظ والحصص
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex-1 min-w-[7rem]">
            المالية
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex-1 min-w-[7rem]">
            الحضور
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">بيانات التواصل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm font-bold text-muted">
                <p>
                  هاتف الطالب:{" "}
                  <span className="text-foreground" dir="ltr">
                    {student.phone ?? "—"}
                  </span>
                </p>
                <p>
                  ولي الأمر:{" "}
                  <span className="text-foreground" dir="ltr">
                    {student.parentPhone ?? "—"}
                  </span>
                </p>
                <p>
                  بريد الحساب:{" "}
                  <span className="text-foreground" dir="ltr">
                    {student.profile?.user?.email ?? "—"}
                  </span>
                </p>
                <p>العمر: {student.age ?? "—"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">الجدول الأسبوعي</CardTitle>
                <CardDescription>حصص مسجّلة في الملف</CardDescription>
              </CardHeader>
              <CardContent className="text-sm font-bold text-muted">
                {student.schedules.length === 0 ? (
                  <p>لا يوجد جدول مسجّل.</p>
                ) : (
                  <ul className="space-y-1">
                    {student.schedules.map((sc) => (
                      <li key={sc.id} className="text-foreground">
                        {sc.weekday}: {sc.startTime} — {sc.endTime}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">ملخص سريع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm font-bold">
                <p className="text-muted">
                  تغطية الحفظ: <span className="text-2xl text-primary">{dash.livePercent}%</span>
                </p>
                <p className="text-muted">
                  آخر حصة:{" "}
                  <span className="text-foreground">
                    {dash.sessions[0] ? dash.sessions[0].sessionDate.toISOString().slice(0, 10) : "—"}
                  </span>
                </p>
                <p className="text-muted">
                  الواجب القادم:{" "}
                  <span className="font-bold text-foreground">
                    {dash.sessions[0]?.homeworkNext?.trim() || "—"}
                  </span>
                </p>
                <p className="text-muted">
                  إجمالي مدفوعات الفواتير المعروضة:{" "}
                  <span className="text-foreground" dir="ltr">
                    {paidTotal.toString()}
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">حساب تسجيل الدخول</CardTitle>
                <CardDescription>إدارة البريد وكلمة المرور وتعطيل الدخول — للمشرف فقط.</CardDescription>
              </CardHeader>
              <CardContent>
                {student.profile?.user ? (
                  <StudentAccountPanel
                    studentId={student.id}
                    loginEmail={student.profile.user.email}
                    disabled={student.profile.user.disabled}
                    hasPassword={student.profile.user.hasPassword}
                  />
                ) : (
                  <p className="text-sm font-bold text-muted">لا يوجد مستخدم مربوط بهذا الطالب.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="memorization">
          <MemorizationDashboardBody
            zones={dash.zones}
            stats={dash.stats}
            sessions={dash.sessions}
            livePercent={dash.livePercent}
            monthly={monthly}
            absenceDays={dash.absenceDays}
            showSessionWorkColumns
            showExtendedSessionColumns
          />
        </TabsContent>

        <TabsContent value="finance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الفواتير</CardTitle>
              <CardDescription>آخر الفواتير المرتبطة بالطالب</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0 sm:p-6">
              {invoices.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm font-bold text-muted">لا توجد فواتير.</p>
              ) : (
                <table className="w-full min-w-[640px] border-collapse text-start text-sm font-bold">
                  <thead>
                    <tr className="border-b border-border bg-muted-bg/80">
                      <th className="px-4 py-3">العنوان</th>
                      <th className="px-4 py-3">المبلغ</th>
                      <th className="px-4 py-3">الحالة</th>
                      <th className="px-4 py-3">الاستحقاق</th>
                      <th className="px-4 py-3">دفعات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-border odd:bg-muted-bg/25">
                        <td className="px-4 py-3 text-foreground">{inv.title}</td>
                        <td className="px-4 py-3" dir="ltr">
                          {formatEgp(inv.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              inv.status === "OVERDUE" ? "warning" : inv.status === "PAID" ? "success" : "secondary"
                            }
                          >
                            {invStatus[inv.status] ?? inv.status}
                          </Badge>
                        </td>
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
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>سجل الحضور</CardTitle>
              <CardDescription>آخر {attendances.length} يومًا مسجّلة</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0 sm:p-6">
              {attendances.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm font-bold text-muted">لا سجلات بعد.</p>
              ) : (
                <table className="w-full min-w-[480px] border-collapse text-start text-sm font-bold">
                  <thead>
                    <tr className="border-b border-border bg-muted-bg/80">
                      <th className="px-4 py-3">التاريخ</th>
                      <th className="px-4 py-3">الحالة</th>
                      <th className="px-4 py-3">ملاحظة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendances.map((a) => (
                      <tr key={a.id} className="border-b border-border odd:bg-muted-bg/25">
                        <td className="px-4 py-3 text-muted" dir="ltr">
                          {a.date.toISOString().slice(0, 10)}
                        </td>
                        <td className="px-4 py-3">{attLabel[a.status] ?? a.status}</td>
                        <td className="max-w-xs truncate px-4 py-3 text-muted">{a.note ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
