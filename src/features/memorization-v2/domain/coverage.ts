import type { Prisma } from "@prisma/client";
import { TOTAL_AYAHS } from "@/lib/quran/verse-counts";
import type { ZoneRow } from "./promotion";
import type { FarRangeSegment } from "./snapshot";

function parseFarRanges(json: Prisma.JsonValue | null): FarRangeSegment[] {
  if (!json || typeof json !== "object") return [];
  if (!Array.isArray(json)) return [];
  return json.filter((x) => x && typeof x === "object" && "startGlobalIndex" in x) as FarRangeSegment[];
}

/** يجمع كل النطاقات [start,end] شاملة من مناطق الطالب الحالية (بما فيها مكدس FAR). */
export function collectMemorizedIntervals(zones: { NEW: ZoneRow; NEAR: ZoneRow; FAR: ZoneRow }): [number, number][] {
  const out: [number, number][] = [];

  const pushRow = (z: ZoneRow) => {
    if (
      z.startGlobalIndex != null &&
      z.endGlobalIndex != null &&
      z.startGlobalIndex >= 1 &&
      z.endGlobalIndex >= z.startGlobalIndex
    ) {
      out.push([z.startGlobalIndex, z.endGlobalIndex]);
    }
  };

  pushRow(zones.NEW);
  pushRow(zones.NEAR);

  const farSegs = parseFarRanges(zones.FAR.farRanges);
  if (farSegs.length > 0) {
    for (const s of farSegs) {
      if (s.startGlobalIndex <= s.endGlobalIndex) out.push([s.startGlobalIndex, s.endGlobalIndex]);
    }
  } else {
    pushRow(zones.FAR);
  }

  return out;
}

/** دمج نطاقات متداخلة أو متلاصقة — عدّ الآيات الفريدة بعد الدمج. */
export function mergeIntervals(intervals: [number, number][]): [number, number][] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  let [cs, ce] = sorted[0]!;
  for (let i = 1; i < sorted.length; i++) {
    const [s, e] = sorted[i]!;
    if (s <= ce + 1) {
      ce = Math.max(ce, e);
    } else {
      merged.push([cs, ce]);
      cs = s;
      ce = e;
    }
  }
  merged.push([cs, ce]);
  return merged;
}

export function countAyahsInMerged(merged: [number, number][]): number {
  let n = 0;
  for (const [s, e] of merged) {
    n += e - s + 1;
  }
  return n;
}

/** نسبة مئوية 0…100 من اتحاد مناطق الحفظ الحالية مقابل إجمالي آيات المصحف. */
export function memorizationCoveragePercent(zones: { NEW: ZoneRow; NEAR: ZoneRow; FAR: ZoneRow }): number {
  const raw = collectMemorizedIntervals(zones);
  if (raw.length === 0) return 0;
  const merged = mergeIntervals(raw);
  const covered = countAyahsInMerged(merged);
  return Math.min(100, Math.round((covered / TOTAL_AYAHS) * 1000) / 10);
}

/** مستوى عرضي بسيط من النسبة (يمكن استبداله لاحقًا بسياسة أكاديمية). */
export function progressLevelFromPercent(p: number): string {
  if (p >= 90) return "متقدم جدًا";
  if (p >= 70) return "متقدم";
  if (p >= 40) return "متوسط";
  if (p >= 15) return "مبتدئ";
  return "بداية المسار";
}
