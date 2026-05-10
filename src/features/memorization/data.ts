import prisma from "@/infrastructure/db/prisma";

export async function listStudentsForMemorization() {
  return prisma.student.findMany({
    where: { status: { not: "ARCHIVED" } },
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true },
  });
}

export async function listRecentMemorization(limit = 40) {
  return prisma.memorizationRecord.findMany({
    take: limit,
    orderBy: { sessionDate: "desc" },
    include: { student: { select: { fullName: true } } },
  });
}
