import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";

export type AdminOverviewStats = {
  studentsTotal: number;
  studentsRegular: number;
  attendanceRows30d: number;
  memorizationRecords30d: number;
  memorizationSessions30d: number;
  invoicesOpen: number;
};

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  let memorizationSessions30d = 0;
  try {
    memorizationSessions30d = await prisma.memorizationSession.count({
      where: { sessionDate: { gte: since30 }, status: "COMPLETED" },
    });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021")) throw e;
  }

  const [studentsTotal, studentsRegular, attendanceRows30d, memorizationRecords30d, invoicesOpen] = await Promise.all([
    prisma.student.count({ where: { NOT: { status: "ARCHIVED" } } }),
    prisma.student.count({ where: { status: "REGULAR" } }),
    prisma.attendance.count({ where: { date: { gte: since30 } } }),
    prisma.memorizationRecord.count({ where: { sessionDate: { gte: since30 } } }),
    prisma.invoice.count({ where: { status: { in: ["ISSUED", "OVERDUE"] } } }),
  ]);

  return {
    studentsTotal,
    studentsRegular,
    attendanceRows30d,
    memorizationRecords30d,
    memorizationSessions30d,
    invoicesOpen,
  };
}
