import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStudentForAdmin } from "@/features/students/data";
import { StudentForm } from "@/features/students/components/student-form";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditStudentPage({ params }: PageProps) {
  const { id } = await params;
  const student = await getStudentForAdmin(id);
  if (!student) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-950">تعديل الطالب</h1>
          <p className="text-base font-bold text-stone-600">{student.fullName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/admin/memorization/session?studentId=${encodeURIComponent(student.id)}`}>بدء الحصة</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/students/${student.id}/memorization`}>لوحة الحفظ</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/students">العودة للقائمة</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات الطالب</CardTitle>
          <CardDescription>عدّل الحقول ثم احفظ. للحصص والمناطق استخدم «بدء الحصة» أو «لوحة الحفظ».</CardDescription>
        </CardHeader>
        <CardContent>
          <StudentForm
            mode="edit"
            studentId={student.id}
            defaultValues={{
              fullName: student.fullName,
              age: student.age,
              phone: student.phone,
              parentPhone: student.parentPhone,
              level: student.level,
              status: student.status,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
