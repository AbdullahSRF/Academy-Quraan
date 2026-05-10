import Link from "next/link";
import type { StudentStatus } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { listStudentsForAdminTable } from "@/features/students/admin-students-table-data";
import { StudentForm } from "@/features/students/components/student-form";
import { StudentsDirectory } from "@/features/students/components/students-directory";

const STATUS_OPTS = ["ALL", "REGULAR", "PAUSED", "FROZEN", "WITHDRAWN", "ARCHIVED"] as const;

type PageProps = {
  searchParams: Promise<{ q?: string; status?: string; page?: string; archived?: string }>;
};

export default async function AdminStudentsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(String(sp.page ?? "1"), 10) || 1);
  const q = typeof sp.q === "string" ? sp.q : "";
  const stRaw = typeof sp.status === "string" ? sp.status : "ALL";
  const status = (STATUS_OPTS as readonly string[]).includes(stRaw) ? stRaw : "ALL";
  const includeArchived = sp.archived === "1";

  const { rows: raw, total } = await listStudentsForAdminTable({
    search: q.trim() || undefined,
    status: status === "ALL" ? "ALL" : (status as StudentStatus),
    page,
    pageSize: 25,
    includeArchived,
  });

  const rows = raw.map((r) => ({
    ...r,
    lastAttendanceDate: r.lastAttendanceDate ? r.lastAttendanceDate.toISOString() : null,
  }));

  const totalPages = Math.max(1, Math.ceil(total / 25));
  const qs = (p: number) => {
    const u = new URLSearchParams();
    if (q.trim()) u.set("q", q.trim());
    if (status !== "ALL") u.set("status", status);
    if (includeArchived) u.set("archived", "1");
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="space-y-10">
      <PageHeader
        title="الطلاب"
        description="بحث وفلترة سريعة، آخر حضور، مستوى الحفظ، ومتابعة الفواتير — مع بدء حصة من صف واحد."
      />

      <Card>
        <CardHeader>
          <CardTitle>إضافة طالب</CardTitle>
          <CardDescription>يُنشأ حساب داخلي للطالب (بريد داخلي)؛ يمكن لاحقًا ربط بريد حقيقي لتسجيل الدخول.</CardDescription>
        </CardHeader>
        <CardContent>
          <StudentForm mode="create" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>دليل الطلاب</CardTitle>
          <CardDescription>
            {total} طالبًا مطابقًا — الصفحة {page} من {totalPages}. فلترة من الخادم + بحث نصي.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <form className="flex flex-wrap items-end gap-3" method="get" action="/admin/students">
            <div className="grid gap-1">
              <label className="text-xs font-bold text-muted" htmlFor="q">
                بحث
              </label>
              <input
                id="q"
                name="q"
                defaultValue={q}
                placeholder="اسم، هاتف، بريد…"
                className="h-10 min-w-[12rem] rounded-xl border-2 border-border bg-card px-3 text-sm font-bold"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-bold text-muted" htmlFor="status">
                الحالة
              </label>
              <select
                id="status"
                name="status"
                defaultValue={status}
                className="h-10 rounded-xl border-2 border-border bg-card px-3 text-sm font-bold"
              >
                {STATUS_OPTS.map((s) => (
                  <option key={s} value={s}>
                    {s === "ALL"
                      ? "الكل"
                      : s === "REGULAR"
                        ? "منتظم"
                        : s === "PAUSED"
                          ? "متوقف"
                          : s === "FROZEN"
                            ? "مجمد"
                            : s === "WITHDRAWN"
                              ? "منسحب"
                              : "مؤرشف"}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">
              <input type="checkbox" name="archived" value="1" defaultChecked={includeArchived} />
              إظهار المؤرشفين
            </label>
            <Button type="submit">تطبيق</Button>
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/students">مسح</Link>
            </Button>
          </form>
          {rows.length === 0 ? (
            <p className="py-8 text-center text-base font-bold text-muted">لا يوجد طلاب مطابقون. غيّر الفلتر أو أضف طالبًا.</p>
          ) : (
            <StudentsDirectory rows={rows} />
          )}
          {totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-sm font-bold">
              {page <= 1 ? (
                <span className="inline-flex h-9 items-center rounded-xl border border-border px-3 opacity-50">السابق</span>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/students${qs(page - 1)}`}>السابق</Link>
                </Button>
              )}
              <span className="text-muted">
                صفحة {page} / {totalPages}
              </span>
              {page >= totalPages ? (
                <span className="inline-flex h-9 items-center rounded-xl border border-border px-3 opacity-50">التالي</span>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/students${qs(page + 1)}`}>التالي</Link>
                </Button>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
