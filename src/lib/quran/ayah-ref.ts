import { globalAyahIndex, globalIndexToSurahAyah, TOTAL_AYAHS } from "./verse-counts";
import { VERSE_COUNT, VERSE_HIZB, VERSE_JUZ, VERSE_PAGE } from "./verse-meta.generated";
import { formatSurahAyahLine, formatSurahWithNumber } from "./surah-names";

export type AyahLayout = {
  page: number;
  juz: number;
  hizb: number;
};

/** مرجع مصحف مدني (صفحة / جزء / حزب) لآية واحدة بالفهرس العالمي 1…6236. */
export function layoutForGlobalIndex(globalIndex: number): AyahLayout {
  if (!Number.isInteger(globalIndex) || globalIndex < 1 || globalIndex > VERSE_COUNT) {
    throw new Error(`global ayah index out of range: ${globalIndex}`);
  }
  return {
    page: VERSE_PAGE[globalIndex]!,
    juz: VERSE_JUZ[globalIndex]!,
    hizb: VERSE_HIZB[globalIndex]!,
  };
}

/** نطاق صفحات يغطي من البداية إلى النهاية (شاملة). */
export function pageSpanForGlobalRange(startGlobal: number, endGlobal: number): { from: number; to: number } {
  const lo = Math.min(startGlobal, endGlobal);
  const hi = Math.max(startGlobal, endGlobal);
  const a = layoutForGlobalIndex(lo);
  const b = layoutForGlobalIndex(hi);
  return { from: Math.min(a.page, b.page), to: Math.max(a.page, b.page) };
}

/** عرض مختصر: اسم السورة ورقمها + آية + جزء/حزب/صفحة (لللوحات والجلسات). */
export function formatAyahPoint(globalIndex: number): string {
  const { surah, ayah } = globalIndexToSurahAyah(globalIndex);
  const L = layoutForGlobalIndex(globalIndex);
  return `${formatSurahAyahLine(surah, ayah)} — ص${L.page} ج${L.juz} ح${L.hizb}`;
}

export function formatAyahRangeLine(startGlobal: number, endGlobal: number): string {
  const lo = Math.min(startGlobal, endGlobal);
  const hi = Math.max(startGlobal, endGlobal);
  const { surah: s1, ayah: a1 } = globalIndexToSurahAyah(lo);
  const { surah: s2, ayah: a2 } = globalIndexToSurahAyah(hi);
  const span = pageSpanForGlobalRange(startGlobal, endGlobal);
  if (s1 === s2) {
    return `من ${formatSurahWithNumber(s1)}: من الآية ${a1} إلى الآية ${a2} (صفحات ${span.from}–${span.to})`;
  }
  return `من ${formatSurahAyahLine(s1, a1)} إلى ${formatSurahAyahLine(s2, a2)} (صفحات ${span.from}–${span.to})`;
}

export { TOTAL_AYAHS, globalAyahIndex, globalIndexToSurahAyah };
