import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { listAttendanceForDate, listStudentsForAttendance } from "@/features/attendance/data";
import { AttendanceForm } from "@/features/attendance/components/attendance-form";

const statusLabel: Record<string, string> = {
  PRESENT: "حاضر",
  ABSENT: "غائب",
  EXCUSED: "معذور",
  LATE: "متأخر",
};

function addDaysIso(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

type PageProps = { searchParams: Promise<{ date?: string }> };

export default async function AdminAttendancePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const dateStr = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : new Date().toISOString().slice(0, 10);
  const date = new Date(`${dateStr}T12:00:00.000Z`);
  const prev = addDaysIso(dateStr, -1);
  const next = addDaysIso(dateStr, 1);
  const today = new Date().toISOString().slice(0, 10);

  const [students, rows] = await Promise.all([listStudentsForAttendance(), listAttendanceForDate(date)]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="الحضور والغياب"
        description="تسجيل حالة كل طالب ليوم محدد. يمكنك التنقل بين الأيام أو العودة لتاريخ اليوم."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/attendance?date=${prev}`}>اليوم السابق</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/attendance">اليوم</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/attendance?date=${next}`}>اليوم التالي</Link>
            </Button>
            <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-900" dir="ltr">
              {dateStr}
            </span>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>تسجيل حضور</CardTitle>
          <CardDescription>
            اختر التاريخ والطالب والحالة ثم احفظ. يمكن تعديل نفس اليوم لنفس الطالب. التاريخ النشط:{" "}
            <span className="font-bold text-emerald-800" dir="ltr">
              {dateStr}
            </span>
            {dateStr !== today ? (
              <>
                {" "}
                —{" "}
                <Link className="font-bold text-emerald-700 underline-offset-2 hover:underline" href="/admin/attendance">
                  العودة ليوم اليوم ({today})
                </Link>
              </>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceForm students={students} defaultDate={dateStr} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>سجل اليوم</CardTitle>
          <CardDescription>جميع الطلاب المسجَّل حضورهم لهذا التاريخ.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 sm:p-6">
          {rows.length === 0 ? (
            <p className="px-6 py-10 text-center text-base font-bold text-stone-600">
              لا توجد سجلات لهذا التاريخ. استخدم النموذج أعلاه لإضافة أول سجل.
            </p>
          ) : (
            <table className="w-full min-w-[480px] border-collapse text-start text-sm font-bold">
              <thead>
                <tr className="border-b border-border bg-muted-bg/80 text-foreground">
                  <th className="px-4 py-3">الطالب</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3">ملاحظة</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-emerald-100/90 odd:bg-stone-50/50">
                    <td className="px-4 py-3 text-stone-900">{r.student.fullName}</td>
                    <td className="px-4 py-3 text-stone-700">{statusLabel[r.status] ?? r.status}</td>
                    <td className="px-4 py-3 text-stone-600">{r.note ?? "—"}</td>
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
