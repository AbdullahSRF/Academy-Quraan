import prisma from "@/infrastructure/db/prisma";
import { ensureStudentMemorizationBootstrap, loadZonesAsRows } from "../data/zones";

/** اقتراحات افتراضية لنموذج «تم التسميع» من آخر حالة مناطق + آخر حصة. */
export type MemorizationSessionDraft = {
  newStartSurah: number;
  newStartAyah: number;
  newEndSurah: number;
  newEndAyah: number;
  homeworkNext: string | null;
  autoPromoteCompletedSurah: boolean;
  /** تُملأ من مسودة الخادم عند وجودها */
  notes?: string | null;
};

export async function planSessionDraft(studentId: string): Promise<MemorizationSessionDraft> {
  await ensureStudentMemorizationBootstrap(studentId);
  const zones = await loadZonesAsRows(studentId);

  const n = zones.NEW;
  const ns = n.startSurah ?? 1;
  const na = n.startAyah ?? 1;
  const es = n.endSurah ?? ns;
  const ea = n.endAyah ?? na;

  let homeworkNext: string | null = null;
  try {
    const last = await prisma.memorizationSession.findFirst({
      where: { studentId, status: "COMPLETED" },
      orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }],
      select: { homeworkNext: true },
    });
    homeworkNext = last?.homeworkNext ?? null;
  } catch {
    homeworkNext = null;
  }

  return {
    newStartSurah: ns,
    newStartAyah: na,
    newEndSurah: es,
    newEndAyah: ea,
    homeworkNext,
    autoPromoteCompletedSurah: false,
  };
}
