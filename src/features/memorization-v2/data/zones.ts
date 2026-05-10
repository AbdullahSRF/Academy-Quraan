import { Prisma, type MemorizationZoneType } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";
import { globalAyahIndex } from "@/lib/quran/verse-counts";
import type { ZoneRow } from "../domain/promotion";

const ZONE_KEYS = ["NEW", "NEAR_REVIEW", "FAR_REVIEW"] as const;

/** يضمن وجود 3 صفوف مناطق + صف إحصائيات لكل طالب. */
export async function ensureStudentMemorizationBootstrap(studentId: string, tx?: Prisma.TransactionClient) {
  const db = tx ?? prisma;
  const existing = await db.studentMemorizationZone.count({ where: { studentId } });
  if (existing === 0) {
    const start = globalAyahIndex(1, 1);
    await db.studentMemorizationZone.createMany({
      data: [
        {
          studentId,
          zone: "NEW",
          startSurah: 1,
          startAyah: 1,
          endSurah: 1,
          endAyah: 1,
          startGlobalIndex: start,
          endGlobalIndex: start,
        },
        { studentId, zone: "NEAR_REVIEW" },
        { studentId, zone: "FAR_REVIEW" },
      ],
    });
  }
  const stats = await db.studentMemorizationStats.findUnique({ where: { studentId } });
  if (!stats) {
    await db.studentMemorizationStats.create({ data: { studentId } });
  }
}

export async function loadZonesAsRows(studentId: string, tx?: Prisma.TransactionClient): Promise<{
  NEW: ZoneRow;
  NEAR: ZoneRow;
  FAR: ZoneRow;
}> {
  const db = tx ?? prisma;
  const rows = await db.studentMemorizationZone.findMany({ where: { studentId } });
  const map = new Map(rows.map((r) => [r.zone, r]));
  const get = (z: MemorizationZoneType): ZoneRow => {
    const r = map.get(z);
    if (!r) throw new Error(`Missing zone ${z}`);
    return {
      zone: r.zone,
      startSurah: r.startSurah,
      startAyah: r.startAyah,
      endSurah: r.endSurah,
      endAyah: r.endAyah,
      startGlobalIndex: r.startGlobalIndex,
      endGlobalIndex: r.endGlobalIndex,
      farRanges: r.farRanges,
    };
  };
  return { NEW: get("NEW"), NEAR: get("NEAR_REVIEW"), FAR: get("FAR_REVIEW") };
}

export async function persistZones(studentId: string, zones: { NEW: ZoneRow; NEAR: ZoneRow; FAR: ZoneRow }, tx: Prisma.TransactionClient) {
  for (const z of ZONE_KEYS) {
    const row = z === "NEW" ? zones.NEW : z === "NEAR_REVIEW" ? zones.NEAR : zones.FAR;
    await tx.studentMemorizationZone.update({
      where: { studentId_zone: { studentId, zone: z } },
      data: {
        startSurah: row.startSurah,
        startAyah: row.startAyah,
        endSurah: row.endSurah,
        endAyah: row.endAyah,
        startGlobalIndex: row.startGlobalIndex,
        endGlobalIndex: row.endGlobalIndex,
        farRanges: row.farRanges === null ? Prisma.DbNull : row.farRanges,
      },
    });
  }
}
