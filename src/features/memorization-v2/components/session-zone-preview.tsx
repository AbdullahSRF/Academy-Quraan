import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ZoneRow } from "@/features/memorization-v2/domain/promotion";
import { ensureStudentMemorizationBootstrap, loadZonesAsRows } from "@/features/memorization-v2/data/zones";
import { formatAyahRangeLine } from "@/lib/quran/ayah-ref";

function line(z: ZoneRow): string {
  if (!z.startGlobalIndex || !z.endGlobalIndex || !z.startSurah) return "—";
  try {
    return formatAyahRangeLine(z.startGlobalIndex, z.endGlobalIndex);
  } catch {
    return "—";
  }
}

/** معاينة مناطق الحفظ قبل تعبئة الحصة (للمشرف). */
export async function SessionZonePreview({ studentId }: { studentId: string }) {
  await ensureStudentMemorizationBootstrap(studentId);
  const zones = await loadZonesAsRows(studentId);

  return (
    <Card className="border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">مناطق الحفظ الحالية</CardTitle>
        <CardDescription>مرجع سريع قبل تسجيل الحصة — تأكد أن نطاق «الجديد» والمراجعة ضمن هذه الحدود.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-100 bg-white/90 p-3">
          <p className="text-xs font-bold text-emerald-800">الجديد</p>
          <p className="mt-1 text-sm font-bold leading-snug text-stone-800">{line(zones.NEW)}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white/90 p-3">
          <p className="text-xs font-bold text-emerald-800">الماضي القريب</p>
          <p className="mt-1 text-sm font-bold leading-snug text-stone-800">{line(zones.NEAR)}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white/90 p-3">
          <p className="text-xs font-bold text-emerald-800">الماضي البعيد</p>
          <p className="mt-1 text-sm font-bold leading-snug text-stone-800">{line(zones.FAR)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
