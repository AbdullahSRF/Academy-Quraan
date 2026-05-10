import prisma from "@/infrastructure/db/prisma";

export async function listStudentsForAttendance() {
  return prisma.student.findMany({
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true },
  });
}

export async function listAttendanceForDate(date: Date) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  return prisma.attendance.findMany({
    where: { date: start },
    include: { student: { select: { fullName: true } } },
    orderBy: { student: { fullName: "asc" } },
  });
}
