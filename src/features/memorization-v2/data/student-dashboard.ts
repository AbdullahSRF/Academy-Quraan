import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";
import { memorizationCoveragePercent } from "../domain/coverage";
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
