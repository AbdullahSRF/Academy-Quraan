import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { getStudentForAdmin } from "@/features/students/data";
import { MemorizationDashboardBody } from "@/features/memorization-v2/components/memorization-dashboard-body";
import { countSessionsByUtcMonth, loadStudentMemorizationDashboard } from "@/features/memorization-v2/data/student-dashboard";

type PageProps = { params: Promise<{ id: string }> };

export default async function StudentMemorizationDashboardPage({ params }: PageProps) {
  const { id } = await params;
  const student = await getStudentForAdmin(id);
  if (!student) notFound();

  const { zones, stats, sessions, livePercent, absenceDays } = await loadStudentMemorizationDashboard(student.id);
  const monthly = countSessionsByUtcMonth(sessions);

  return (
    <div className="space-y-8">
      <PageHeader
        title="الحفظ والتسميع — تفصيلي"
        description={student.fullName}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild className="gap-2">
              <Link href={`/admin/memorization/session?studentId=${encodeURIComponent(student.id)}`}>
                <CalendarCheck className="size-4" aria-hidden />
                بدء الحصة
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/admin/students/${student.id}`}>الملف الشامل</Link>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href={`/admin/students/${student.id}/edit`}>
                <Pencil className="size-4" aria-hidden />
                تعديل
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/students">الطلاب</Link>
            </Button>
          </div>
        }
      />

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
