/** لقطة نطاق آيات — تُخزَّن في حقول Json في الجلسة والمناطق. */
export type AyahRangeSnapshot = {
  surahStart: number;
  ayahStart: number;
  surahEnd: number;
  ayahEnd: number;
  startGlobalIndex: number;
  endGlobalIndex: number;
};

export type FarRangeSegment = AyahRangeSnapshot;
