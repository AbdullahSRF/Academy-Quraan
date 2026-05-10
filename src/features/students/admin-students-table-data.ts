import type { Prisma, StudentStatus } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";

export type AdminStudentTableRow = {
  id: string;
  fullName: string;
  age: number | null;
  status: string;
  level: string | null;
  phone: string | null;
  parentPhone: string | null;
  accountEmail: string | null;
  lastAttendanceDate: Date | null;
  lastAttendanceStatus: string | null;
  progressLevel: string | null;
  completionPercent: number | null;
  openInvoices: number;
  overdueInvoices: number;
};

export type AdminStudentsListOptions = {
  /** بحث نصي في الاسم والمستوى والهاتف والبريد */
  search?: string;
  status?: StudentStatus | "ALL";
  page?: number;
  pageSize?: number;
  /** عند true يُعرض الجميع بما فيهم المؤرشفون (ما لم يُحدَّد status صريحًا غير ALL) */
  includeArchived?: boolean;
};

const DEFAULT_PAGE_SIZE = 25;

function buildWhere(opts?: AdminStudentsListOptions): Prisma.StudentWhereInput {
  const parts: Prisma.StudentWhereInput[] = [];

  const status = opts?.status ?? "ALL";
  if (status !== "ALL") {
    parts.push({ status });
  } else if (!opts?.includeArchived) {
    parts.push({ NOT: { status: "ARCHIVED" } });
  }

  const q = opts?.search?.trim();
  if (q) {
    parts.push({
      OR: [
        { fullName: { contains: q, mode: "insensitive" } },
        { level: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { parentPhone: { contains: q, mode: "insensitive" } },
        { profile: { user: { email: { contains: q, mode: "insensitive" } } } },
      ],
    });
  }

  if (parts.length === 0) return {};
  return { AND: parts };
}

/** قائمة الطلاب للجدول الإداري مع عدّ وترقيم صفحات واستعلامات محسّنة. */
export async function listStudentsForAdminTable(
  opts?: AdminStudentsListOptions,
): Promise<{ rows: AdminStudentTableRow[]; total: number }> {
  const page = Math.max(1, opts?.page ?? 1);
  const pageSize = Math.min(100, Math.max(5, opts?.pageSize ?? DEFAULT_PAGE_SIZE));
  const skip = (page - 1) * pageSize;
  const where = buildWhere(opts);

  const [total, students] = await prisma.$transaction([
    prisma.student.count({ where }),
    prisma.student.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        profile: { include: { user: { select: { email: true } } } },
        attendances: { orderBy: { date: "desc" }, take: 1, select: { date: true, status: true } },
        memorizationStats: { select: { progressLevel: true, completionPercent: true } },
        invoices: { select: { status: true } },
      },
    }),
  ]);

  const rows: AdminStudentTableRow[] = students.map((s) => {
    const inv = s.invoices;
    const openInvoices = inv.filter((i) => i.status === "ISSUED" || i.status === "OVERDUE").length;
    const overdueInvoices = inv.filter((i) => i.status === "OVERDUE").length;
    const last = s.attendances[0] ?? null;
    return {
      id: s.id,
      fullName: s.fullName,
      age: s.age,
      status: s.status,
      level: s.level,
      phone: s.phone,
      parentPhone: s.parentPhone,
      accountEmail: s.profile?.user?.email ?? null,
      lastAttendanceDate: last?.date ?? null,
      lastAttendanceStatus: last?.status ?? null,
      progressLevel: s.memorizationStats?.progressLevel ?? null,
      completionPercent: s.memorizationStats?.completionPercent ?? null,
      openInvoices,
      overdueInvoices,
    };
  });

  return { rows, total };
}
