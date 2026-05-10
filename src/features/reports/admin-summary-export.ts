import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";

export type AdminSummaryExport = {
  generatedAt: string;
  studentsTotal: number;
  studentsRegular: number;
  attendanceRows30d: number;
  memorizationSessions30d: number;
  revenue30d: string;
  openInvoices: number;
};

export async function buildAdminSummaryForExport(): Promise<AdminSummaryExport> {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  let memorizationSessions30d = 0;
  try {
    memorizationSessions30d = await prisma.memorizationSession.count({
      where: { sessionDate: { gte: since30 }, status: "COMPLETED" },
    });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021")) throw e;
  }

  const [studentsTotal, studentsRegular, attendanceRows30d, revenue30d, openInvoices] = await Promise.all([
    prisma.student.count({ where: { NOT: { status: "ARCHIVED" } } }),
    prisma.student.count({ where: { status: "REGULAR" } }),
    prisma.attendance.count({ where: { date: { gte: since30 } } }),
    prisma.payment.aggregate({
      where: { paidAt: { gte: since30 } },
      _sum: { amount: true },
    }),
    prisma.invoice.count({ where: { status: { in: ["ISSUED", "OVERDUE"] } } }),
  ]);

  const sum = revenue30d._sum.amount ?? new Prisma.Decimal(0);

  return {
    generatedAt: new Date().toISOString(),
    studentsTotal,
    studentsRegular,
    attendanceRows30d,
    memorizationSessions30d,
    revenue30d: sum.toString(),
    openInvoices,
  };
}

export function summaryToCsvRows(data: AdminSummaryExport): string[][] {
  return [
    ["field", "value"],
    ["generatedAt", data.generatedAt],
    ["studentsTotal", String(data.studentsTotal)],
    ["studentsRegular", String(data.studentsRegular)],
    ["attendanceRows30d", String(data.attendanceRows30d)],
    ["memorizationSessions30d", String(data.memorizationSessions30d)],
    ["revenue30d", data.revenue30d],
    ["openInvoices", String(data.openInvoices)],
  ];
}
