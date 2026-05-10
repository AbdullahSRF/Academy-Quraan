/**
 * عدد آيات كل سورة (1..114) — مرجع عُثماني شائع للمجموع 6236.
 * يُستخدم لحساب `globalAyahIndex` للنطاقات دون جدول QuranAyah كامل في الـ MVP.
 */
export const VERSES_PER_SURAH: readonly number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17,   19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
] as const;

const PREFIX: number[] = (() => {
  const p: number[] = [0];
  let s = 0;
  for (const n of VERSES_PER_SURAH) {
    s += n;
    p.push(s);
  }
  return p;
})();

/** 1 … 6236 */
export function globalAyahIndex(surah: number, ayah: number): number {
  if (surah < 1 || surah > 114) throw new Error("surah out of range");
  const max = VERSES_PER_SURAH[surah - 1];
  if (ayah < 1 || ayah > max) throw new Error("ayah out of range for surah");
  return PREFIX[surah - 1] + ayah;
}

export function lastAyahOfSurah(surah: number): number {
  if (surah < 1 || surah > 114) throw new Error("surah out of range");
  return VERSES_PER_SURAH[surah - 1];
}

export function globalIndexToSurahAyah(index: number): { surah: number; ayah: number } {
  if (index < 1 || index > PREFIX[114]) throw new Error("global index out of range");
  for (let surah = 1; surah <= 114; surah++) {
    if (index <= PREFIX[surah]) {
      return { surah, ayah: index - PREFIX[surah - 1] };
    }
  }
  throw new Error("unreachable");
}

export const TOTAL_AYAHS = PREFIX[114];
