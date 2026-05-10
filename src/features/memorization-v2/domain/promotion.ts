import type { MemorizationZoneType, Prisma } from "@prisma/client";
import { globalAyahIndex, globalIndexToSurahAyah, lastAyahOfSurah } from "@/lib/quran/verse-counts";
import type { AyahRangeSnapshot, FarRangeSegment } from "./snapshot";

export type ZoneRow = {
  zone: MemorizationZoneType;
  startSurah: number | null;
  startAyah: number | null;
  endSurah: number | null;
  endAyah: number | null;
  startGlobalIndex: number | null;
  endGlobalIndex: number | null;
  farRanges: Prisma.JsonValue | null;
};

function rowToSnapshot(z: ZoneRow | null): AyahRangeSnapshot | null {
  if (!z?.startSurah || !z.startAyah || !z.endSurah || !z.endAyah) return null;
  if (!z.startGlobalIndex || !z.endGlobalIndex) return null;
  return {
    surahStart: z.startSurah,
    ayahStart: z.startAyah,
    surahEnd: z.endSurah,
    ayahEnd: z.endAyah,
    startGlobalIndex: z.startGlobalIndex,
    endGlobalIndex: z.endGlobalIndex,
  };
}

function parseFarRanges(json: Prisma.JsonValue | null): FarRangeSegment[] {
  if (!json || typeof json !== "object") return [];
  if (!Array.isArray(json)) return [];
  return json.filter((x) => x && typeof x === "object" && "startGlobalIndex" in x) as FarRangeSegment[];
}

function envelopeFromSegmentsSync(segments: FarRangeSegment[]): {
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  startGlobalIndex: number;
  endGlobalIndex: number;
} {
  let minG = Infinity;
  let maxG = -Infinity;
  for (const s of segments) {
    minG = Math.min(minG, s.startGlobalIndex);
    maxG = Math.max(maxG, s.endGlobalIndex);
  }
  const start = globalIndexToSurahAyah(minG);
  const end = globalIndexToSurahAyah(maxG);
  return {
    startSurah: start.surah,
    startAyah: start.ayah,
    endSurah: end.surah,
    endAyah: end.ayah,
    startGlobalIndex: minG,
    endGlobalIndex: maxG,
  };
}

/** هل نطاق الجديد يصل إلى آخر آية في سورة النهاية؟ */
export function isFullSurahCompleted(endSurah: number, endAyah: number): boolean {
  return endAyah >= lastAyahOfSurah(endSurah);
}

export type PromotionResult = {
  newZone: ZoneRow;
  nearZone: ZoneRow;
  farZone: ZoneRow;
};

/** بعد إكمال سورة في منطقة NEW: إزاحة المناطق (MVP). */
export function applySurahCompletionPromotion(zones: {
  NEW: ZoneRow;
  NEAR: ZoneRow;
  FAR: ZoneRow;
}): PromotionResult {
  const oldNew = zones.NEW;
  const oldNear = zones.NEAR;
  const oldFar = zones.FAR;

  const newNearSnapshot = rowToSnapshot(oldNew);
  if (!newNearSnapshot) {
    throw new Error("NEW zone incomplete; cannot promote");
  }

  const nearNear = rowToSnapshot(oldNear);
  const segments = parseFarRanges(oldFar.farRanges);
  const farBody = rowToSnapshot(oldFar);
  if (farBody && segments.length === 0) {
    segments.push({
      surahStart: farBody.surahStart,
      ayahStart: farBody.ayahStart,
      surahEnd: farBody.surahEnd,
      ayahEnd: farBody.ayahEnd,
      startGlobalIndex: farBody.startGlobalIndex,
      endGlobalIndex: farBody.endGlobalIndex,
    });
  }
  if (nearNear) {
    segments.push({
      surahStart: nearNear.surahStart,
      ayahStart: nearNear.ayahStart,
      surahEnd: nearNear.surahEnd,
      ayahEnd: nearNear.ayahEnd,
      startGlobalIndex: nearNear.startGlobalIndex,
      endGlobalIndex: nearNear.endGlobalIndex,
    });
  }

  const nextSurah = (oldNew.endSurah ?? 1) + 1;
  if (nextSurah > 114) {
    throw new Error("لا توجد سورة تالية بعد 114");
  }

  const nextStart = globalAyahIndex(nextSurah, 1);
  const newZone: ZoneRow = {
    zone: "NEW",
    startSurah: nextSurah,
    startAyah: 1,
    endSurah: nextSurah,
    endAyah: 1,
    startGlobalIndex: nextStart,
    endGlobalIndex: nextStart,
    farRanges: null,
  };

  const nearZone: ZoneRow = {
    zone: "NEAR_REVIEW",
    startSurah: newNearSnapshot.surahStart,
    startAyah: newNearSnapshot.ayahStart,
    endSurah: newNearSnapshot.surahEnd,
    endAyah: newNearSnapshot.ayahEnd,
    startGlobalIndex: newNearSnapshot.startGlobalIndex,
    endGlobalIndex: newNearSnapshot.endGlobalIndex,
    farRanges: null,
  };

  let farZone: ZoneRow;
  if (segments.length === 0) {
    farZone = {
      zone: "FAR_REVIEW",
      startSurah: null,
      startAyah: null,
      endSurah: null,
      endAyah: null,
      startGlobalIndex: null,
      endGlobalIndex: null,
      farRanges: [],
    };
  } else {
    const env = envelopeFromSegmentsSync(segments);
    farZone = {
      zone: "FAR_REVIEW",
      startSurah: env.startSurah,
      startAyah: env.startAyah,
      endSurah: env.endSurah,
      endAyah: env.endAyah,
      startGlobalIndex: env.startGlobalIndex,
      endGlobalIndex: env.endGlobalIndex,
      farRanges: segments as unknown as Prisma.JsonValue,
    };
  }

  return { newZone, nearZone, farZone };
}

/** تحديث نطاق NEW بعد حصة بدون ترقية كاملة — يمتد نهاية الجديد إلى أقصى تقدّم. */
export function extendNewZoneAfterSession(
  current: ZoneRow,
  sessionEndSurah: number,
  sessionEndAyah: number,
): ZoneRow {
  const sessionEndG = globalAyahIndex(sessionEndSurah, sessionEndAyah);
  const startG =
    current.startGlobalIndex ??
    globalAyahIndex(current.startSurah ?? sessionEndSurah, current.startAyah ?? 1);
  const prevEndG = current.endGlobalIndex ?? startG;
  const endG = Math.max(prevEndG, sessionEndG);
  const start = globalIndexToSurahAyah(startG);
  const end = globalIndexToSurahAyah(endG);
  return {
    ...current,
    zone: "NEW",
    startSurah: start.surah,
    startAyah: start.ayah,
    endSurah: end.surah,
    endAyah: end.ayah,
    startGlobalIndex: startG,
    endGlobalIndex: endG,
  };
}
