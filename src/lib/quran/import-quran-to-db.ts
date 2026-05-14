import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import type { PrismaClient } from "@prisma/client";
import { globalAyahIndex, VERSES_PER_SURAH } from "./verse-counts";
import { VERSE_COUNT, VERSE_HIZB, VERSE_JUZ, VERSE_PAGE } from "./verse-meta.generated";

const EXPECTED_AYAHS = VERSE_COUNT;

type ChapterMeta = { id: number; name: string; type?: string; total_verses: number };
type ChapterFile = ChapterMeta & { verses: { id: number; text: string }[] };

function chaptersDir(): string {
  return path.join(process.cwd(), "node_modules", "quran-json", "dist", "chapters", "en");
}

function readChapter(surahId: number): ChapterFile {
  const p = path.join(chaptersDir(), `${surahId}.json`);
  return JSON.parse(readFileSync(p, "utf8")) as ChapterFile;
}

/**
 * يملأ جداول QuranSurah و QuranAyah من `quran-json` مع التحقق من 6236 آية وتطابق العدّ مع `verse-counts`.
 * آمن للإعادة: إن وُجدت 6236 آية مسبقًا يُتخطى الاستيراد.
 */
export async function importQuranLibraryToDb(prisma: PrismaClient): Promise<void> {
  const dir = chaptersDir();
  if (!existsSync(dir)) {
    throw new Error(
      "لم يُعثر على مجلد نصوص القرآن (quran-json). ثبّت الحزمة: npm install quran-json",
    );
  }

  const nAyah = await prisma.quranAyah.count();
  const nSurah = await prisma.quranSurah.count();
  if (nAyah === EXPECTED_AYAHS && nSurah === 114) {
    console.log("مكتبة القرآن في قاعدة البيانات مكتملة (6236 آية)، تخطي الاستيراد.");
    return;
  }

  if (nAyah > 0 || nSurah > 0) {
    console.log("إزالة بيانات قرآنية ناقصة أو قديمة ثم إعادة الاستيراد...");
    await prisma.quranAyah.deleteMany();
    await prisma.quranSurah.deleteMany();
  }

  const indexPath = path.join(dir, "index.json");
  const chaptersMeta = JSON.parse(readFileSync(indexPath, "utf8")) as ChapterMeta[];
  if (chaptersMeta.length !== 114) {
    throw new Error(`تعذر استيراد الفهرس: عدد السور ${chaptersMeta.length} بدلًا من 114`);
  }

  await prisma.quranSurah.createMany({
    data: chaptersMeta.map((c) => ({
      number: c.id,
      nameAr: c.name,
      verseCount: c.total_verses,
      revelation: c.type ?? null,
    })),
  });

  const ayahRows: {
    globalIndex: number;
    surahNumber: number;
    ayahNumber: number;
    text: string;
    page: number;
    juz: number;
    hizb: number;
  }[] = [];

  for (const meta of chaptersMeta) {
    const surahId = meta.id;
    const expected = VERSES_PER_SURAH[surahId - 1];
    if (expected === undefined) {
      throw new Error(`سورة غير معروفة: ${surahId}`);
    }
    if (meta.total_verses !== expected) {
      throw new Error(
        `عدم تطابق عدد آيات السورة ${surahId}: الملف ${meta.total_verses} — المرجع ${expected}`,
      );
    }

    const chapter = readChapter(surahId);
    if (chapter.verses.length !== expected) {
      throw new Error(`سورة ${surahId}: عدد عناصر الآيات في JSON (${chapter.verses.length}) ≠ ${expected}`);
    }

    for (const v of chapter.verses) {
      const ayahNumber = v.id;
      const globalIndex = globalAyahIndex(surahId, ayahNumber);
      if (!v.text || typeof v.text !== "string") {
        throw new Error(`سورة ${surahId} آية ${ayahNumber}: نص فارغ`);
      }
      ayahRows.push({
        globalIndex,
        surahNumber: surahId,
        ayahNumber,
        text: v.text,
        page: VERSE_PAGE[globalIndex]!,
        juz: VERSE_JUZ[globalIndex]!,
        hizb: VERSE_HIZB[globalIndex]!,
      });
    }
  }

  if (ayahRows.length !== EXPECTED_AYAHS) {
    throw new Error(`عدد الآيات المجمّع ${ayahRows.length} بدلًا من ${EXPECTED_AYAHS}`);
  }

  const chunk = 350;
  for (let i = 0; i < ayahRows.length; i += chunk) {
    await prisma.quranAyah.createMany({ data: ayahRows.slice(i, i + chunk) });
  }

  const finalCount = await prisma.quranAyah.count();
  if (finalCount !== EXPECTED_AYAHS) {
    throw new Error(`فشل التحقق النهائي: QuranAyah.count() = ${finalCount}`);
  }

  const first = await prisma.quranAyah.findUnique({ where: { globalIndex: 1 } });
  if (!first || first.surahNumber !== 1 || first.ayahNumber !== 1 || first.text.length < 8) {
    throw new Error("التحقق من أول آية فشل.");
  }

  const last = await prisma.quranAyah.findUnique({ where: { globalIndex: EXPECTED_AYAHS } });
  if (!last || last.surahNumber !== 114 || last.ayahNumber !== VERSES_PER_SURAH[113]) {
    throw new Error("التحقق من آخر آية فشل.");
  }

  console.log("تم استيراد مكتبة القرآن: 114 سورة و", finalCount, "آية.");
}
