import { lastAyahOfSurah } from "@/lib/quran/verse-counts";
import { isFullSurahCompleted, type ZoneRow } from "../promotion";

export type ZonesTriple = { NEW: ZoneRow; NEAR: ZoneRow; FAR: ZoneRow };

/**
 * هل نُطبّق ترقية «سورة مكتملة في الجديد» بعد هذه الحصة؟
 *
 * - خيار المحفظ: دائمًا.
 * - إكمال آخر آية في **سورة نهاية منطقة الجديد** الحالية (مثال: المعارج كاملة).
 * - أو **الانتقال إلى سورة أرقامها أكبر من سورة نهاية الجديد** (مثال: انتهى المعارج وبدأ الحاقة:
 *   `newEndSurah` يصبح 78 بينما كانت `zonesBefore.NEW.endSurah` = 77) → نقل تلقائي للمناطق.
 */
export function shouldApplySurahPromotion(
  input: { autoPromoteCompletedSurah: boolean; newEndSurah: number; newEndAyah: number },
  zonesBefore: ZonesTriple,
): boolean {
  if (input.autoPromoteCompletedSurah) return true;

  const z = zonesBefore.NEW;
  if (!z.endSurah || !z.endAyah) return false;

  /** أصبحت الحصة في سورة لاحقة عن «واجهة» الجديد — يُفسر كإكمال السورة السابقة والانتقال (مثال 77 → 78). */
  if (input.newEndSurah > z.endSurah) return true;

  if (!isFullSurahCompleted(input.newEndSurah, input.newEndAyah)) return false;
  return input.newEndSurah === z.endSurah && input.newEndAyah === lastAyahOfSurah(z.endSurah);
}
