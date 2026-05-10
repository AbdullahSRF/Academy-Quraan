import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";

export async function listStudentsForFinance() {
  return prisma.student.findMany({
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true },
  });
}

export async function listRecentInvoices(limit = 50) {
  return prisma.invoice.findMany({
    take: limit,
    orderBy: { issuedAt: "desc" },
    include: { student: { select: { fullName: true } }, payments: true },
  });
}

/** حصص تسميع (النموذج الجديد) بحالة دفع «معلق» — للمتابعة المالية. */
export async function countPendingMemorizationSessionPayments(lookbackDays = 120) {
  const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);
  try {
    return await prisma.memorizationSession.count({
      where: {
        paymentStatus: "PENDING",
        status: "COMPLETED",
        sessionDate: { gte: since },
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021") return 0;
    throw e;
  }
}
