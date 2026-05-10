import type { Prisma } from "@prisma/client";
import { globalAyahIndex } from "@/lib/quran/verse-counts";
import type { ZoneRow } from "./promotion";
import type { FarRangeSegment } from "./snapshot";

function parseFarRanges(json: Prisma.JsonValue | null): FarRangeSegment[] {
  if (!json || typeof json !== "object") return [];
  if (!Array.isArray(json)) return [];
  return json.filter((x) => x && typeof x === "object" && "startGlobalIndex" in x) as FarRangeSegment[];
}

export function getNearZoneGlobalBounds(z: ZoneRow): { min: number; max: number } | null {
  if (!z.startGlobalIndex || !z.endGlobalIndex) return null;
  return {
    min: Math.min(z.startGlobalIndex, z.endGlobalIndex),
    max: Math.max(z.startGlobalIndex, z.endGlobalIndex),
  };
}

/** غلاف عالمي لمنطقة FAR (الصف الرئيسي + شرائح farRanges). */
export function getFarZoneGlobalBounds(z: ZoneRow): { min: number; max: number } | null {
  const vals: number[] = [];
  if (z.startGlobalIndex != null && z.endGlobalIndex != null) {
    vals.push(z.startGlobalIndex, z.endGlobalIndex);
  }
  for (const s of parseFarRanges(z.farRanges)) {
    vals.push(s.startGlobalIndex, s.endGlobalIndex);
  }
  if (vals.length === 0) return null;
  return { min: Math.min(...vals), max: Math.max(...vals) };
}

export function assertWorkWithinZoneBounds(
  label: string,
  startSurah: number,
  startAyah: number,
  endSurah: number,
  endAyah: number,
  bounds: { min: number; max: number } | null,
): void {
  if (!bounds) {
    throw new Error(`لا توجد منطقة ${label} حالية لتسجيل المراجعة ضمنها.`);
  }
  const ws = globalAyahIndex(startSurah, startAyah);
  const we = globalAyahIndex(endSurah, endAyah);
  const lo = Math.min(ws, we);
  const hi = Math.max(ws, we);
  if (lo < bounds.min || hi > bounds.max) {
    throw new Error(`نطاق مراجعة ${label} خارج حدود المنطقة الحالية.`);
  }
}
