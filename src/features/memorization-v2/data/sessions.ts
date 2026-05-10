import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";

export async function listRecentMemorizationSessions(limit = 30) {
  try {
    return await prisma.memorizationSession.findMany({
      take: limit,
      orderBy: { sessionDate: "desc" },
      include: { student: { select: { fullName: true } } },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021") {
      return [];
    }
    throw e;
  }
}
