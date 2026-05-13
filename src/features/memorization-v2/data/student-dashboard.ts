import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";
import { memorizationCoveragePercent, progressLevelFromPercent } from "../domain/coverage";
import { ensureStudentMemorizationBootstrap, loadZonesAsRows } from "./zones";

export async function loadStudentMemorizationDashboard(studentId: string) {
  await ensureStudentMemorizationBootstrap(studentId);
  const zones = await loadZonesAsRows(studentId);

  const [stats, absenceDays] = await Promise.all([
    prisma.studentMemorizationStats.findUnique({ where: { studentId } }),
    prisma.attendance.count({ where: { studentId, status: "ABSENT" } }),
  ]);

  let sessions: Awaited<ReturnType<typeof prisma.memorizationSession.findMany>> = [];
  try {
    sessions = await prisma.memorizationSession.findMany({
      where: { studentId, status: "COMPLETED" },
      orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }],
      take: 180,
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021") {
      sessions = [];
    } else throw e;
  }

  const livePercent = memorizationCoveragePercent(zones);
  return { zones, stats, sessions, livePercent, absenceDays };
}

/** يعيد حساب إحصائيات الحفظ من الجلسات والحضور (مثلاً بعد حذف حصة). لا يعيد احتساب حدود المناطق. */
export async function recomputeStudentMemorizationStats(studentId: string, tx?: Prisma.TransactionClient) {
  const db = tx ?? prisma;
  await ensureStudentMemorizationBootstrap(studentId, tx);
  const completed = await db.memorizationSession.count({ where: { studentId, status: "COMPLETED" } });
  const absences = await db.attendance.count({ where: { studentId, status: "ABSENT" } });
  const last = await db.memorizationSession.findFirst({
    where: { studentId, status: "COMPLETED" },
    orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }],
    select: { sessionDate: true, rating: true },
  });
  const zones = await loadZonesAsRows(studentId, tx);
  const coveragePct = memorizationCoveragePercent(zones);
  const progressLevel = progressLevelFromPercent(coveragePct);

  await db.studentMemorizationStats.upsert({
    where: { studentId },
    create: {
      studentId,
      sessionsCount: completed,
      absencesCount: absences,
      lastSessionAt: last?.sessionDate ?? undefined,
      lastRating: last?.rating ?? undefined,
      completionPercent: Math.round(coveragePct),
      progressLevel,
    },
    update: {
      sessionsCount: completed,
      absencesCount: absences,
      lastSessionAt: last?.sessionDate ?? undefined,
      lastRating: last?.rating ?? undefined,
      completionPercent: Math.round(coveragePct),
      progressLevel,
    },
  });
}

export function countSessionsByUtcMonth(
  sessions: { sessionDate: Date }[],
): { monthKey: string; label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const s of sessions) {
    const y = s.sessionDate.getUTCFullYear();
    const m = s.sessionDate.getUTCMonth() + 1;
    const key = `${y}-${String(m).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  const rows = [...map.entries()].map(([monthKey, count]) => {
    const [y, mo] = monthKey.split("-").map(Number);
    const label = `${mo}/${y}`;
    return { monthKey, label, count };
  });
  rows.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  return rows.slice(0, 12);
}
