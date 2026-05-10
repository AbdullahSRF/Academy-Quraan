import type { MemorizationSession, StudentMemorizationStats } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ZoneRow } from "@/features/memorization-v2/domain/promotion";
import { progressLevelFromPercent } from "@/features/memorization-v2/domain/coverage";
import { formatAyahRangeLine } from "@/lib/quran/ayah-ref";

const ratingAr: Record<string, string> = {
  EXCELLENT: "ممتاز",
  VERY_GOOD: "جيد جدًا",
  GOOD: "جيد",
  WEAK: "ضعيف",
};

const payAr: Record<string, string> = {
  NOT_APPLICABLE: "لا يطبق",
  PENDING: "معلق",
  PAID: "مدفوع",
  WAIVED: "معفى",
};

function zoneLine(z: ZoneRow): string {
  if (!z.startGlobalIndex || !z.endGlobalIndex || !z.startSurah) return "—";
  try {
    return formatAyahRangeLine(z.startGlobalIndex, z.endGlobalIndex);
  } catch {
    return "—";
  }
}

function workSnapLine(json: unknown): string {
  if (!json || typeof json !== "object") return "—";
  const o = json as { startGlobalIndex?: unknown; endGlobalIndex?: unknown };
  if (typeof o.startGlobalIndex === "number" && typeof o.endGlobalIndex === "number") {
    try {
      return formatAyahRangeLine(o.startGlobalIndex, o.endGlobalIndex);
    } catch {
      return "—";
    }
  }
  return "—";
}

function clip(s: string | null | undefined, max: number): string {
  const t = (s ?? "").trim();
  if (!t) return "—";
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export type MonthlySessionRow = { monthKey: string; label: string; count: number };

type Props = {
  zones: { NEW: ZoneRow; NEAR: ZoneRow; FAR: ZoneRow };
  stats: StudentMemorizationStats | null;
  sessions: MemorizationSession[];
  livePercent: number;
  monthly: MonthlySessionRow[];
  absenceDays: number;
  /** عرض عمودي «مراجعة الحصة» في جدول الجلسات */
  showSessionWorkColumns?: boolean;
  /** أعمدة الجديد / الواجب / الملاحظات (ملف الطالب) */
  showExtendedSessionColumns?: boolean;
};

export function MemorizationDashboardBody({
  zones,
  stats,
  sessions,
  livePercent,
  monthly,
  absenceDays,
  showSessionWorkColumns = false,
  showExtendedSessionColumns = false,
}: Props) {
  const lastSession = sessions[0] ?? null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">نسبة التغطية (من المناطق)</CardTitle>
            <CardDescription>اتحاد نطاق NEW / NEAR / FAR مقابل 6236 آية</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{livePercent}%</p>
            {stats && stats.completionPercent !== Math.round(livePercent) ? (
              <p className="mt-1 text-xs font-bold text-muted">آخر قيمة مخزّنة: {stats.completionPercent}%</p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">مستوى التقدّم</CardTitle>
            <CardDescription>من النسبة الحالية</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-foreground">
              {stats?.progressLevel ?? progressLevelFromPercent(livePercent)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">حصص التسميع</CardTitle>
            <CardDescription>جلسات مناطق مكتملة</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{stats?.sessionsCount ?? sessions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">أيام الغياب</CardTitle>
            <CardDescription>سجلات حضور «غائب» في جدول الحضور</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">{absenceDays}</p>
            {stats != null && stats.absencesCount > 0 ? (
              <p className="mt-1 text-xs font-bold text-muted">من حصص التسميع (عداد): {stats.absencesCount}</p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">آخر حصة</CardTitle>
            <CardDescription>تاريخ وتقييم</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm font-bold text-foreground">
            {lastSession ? (
              <>
                <p dir="ltr">{lastSession.sessionDate.toISOString().slice(0, 10)}</p>
                <p>{lastSession.rating ? ratingAr[lastSession.rating] ?? lastSession.rating : "بدون تقييم"}</p>
              </>
            ) : (
              <p className="text-muted">لا توجد حصص بعد.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>مناطق الحفظ الحالية</CardTitle>
            <CardDescription>سورة/آية + صفحة (مصحف مدني)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm font-bold text-foreground">
            <div>
              <p className="text-primary">الجديد</p>
              <p className="text-muted">{zoneLine(zones.NEW)}</p>
            </div>
            <div>
              <p className="text-primary">الماضي القريب</p>
              <p className="text-muted">{zoneLine(zones.NEAR)}</p>
            </div>
            <div>
              <p className="text-primary">الماضي البعيد</p>
              <p className="text-muted">{zoneLine(zones.FAR)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الحصص الشهرية (UTC)</CardTitle>
            <CardDescription>عدد جلسات «تم التسميع» حسب شهر</CardDescription>
          </CardHeader>
          <CardContent>
            {monthly.length === 0 ? (
              <p className="text-sm font-bold text-muted">لا بيانات شهرية بعد.</p>
            ) : (
              <ul className="space-y-2 text-sm font-bold">
                {monthly.map((m) => (
                  <li key={m.monthKey} className="flex justify-between border-b border-border py-1">
                    <span dir="ltr">{m.label}</span>
                    <span className="text-primary">{m.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل جلسات التسميع</CardTitle>
          <CardDescription>حتى 180 حصة — تفاصيل كاملة للمشرف</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 sm:p-6">
          {sessions.length === 0 ? (
            <p className="px-6 py-6 text-center text-base font-bold text-muted">لا توجد جلسات.</p>
          ) : (
            <table
              className={`w-full border-collapse text-start text-sm font-bold ${showExtendedSessionColumns ? "min-w-[1100px]" : "min-w-[720px]"}`}
            >
              <thead>
                <tr className="border-b border-border bg-muted-bg/80 text-foreground">
                  <th className="px-4 py-3">التاريخ</th>
                  <th className="px-4 py-3">التقييم</th>
                  <th className="px-4 py-3">الدفع</th>
                  <th className="px-4 py-3">ترقية</th>
                  {showExtendedSessionColumns ? (
                    <>
                      <th className="px-4 py-3">الجديد (الحصة)</th>
                      <th className="px-4 py-3">الواجب التالي</th>
                      <th className="px-4 py-3">ملاحظات</th>
                    </>
                  ) : null}
                  {showSessionWorkColumns ? (
                    <>
                      <th className="px-4 py-3">مراجعة قريب</th>
                      <th className="px-4 py-3">مراجعة بعيد</th>
                    </>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-border odd:bg-muted-bg/30">
                    <td className="px-4 py-3 text-foreground" dir="ltr">
                      {s.sessionDate.toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-muted">{s.rating ? ratingAr[s.rating] ?? s.rating : "—"}</td>
                    <td className="px-4 py-3 text-muted">{payAr[s.paymentStatus] ?? s.paymentStatus}</td>
                    <td className="px-4 py-3 text-muted">{s.autoPromoteCompletedSurah ? "نعم" : "—"}</td>
                    {showExtendedSessionColumns ? (
                      <>
                        <td className="max-w-[14rem] px-4 py-3 text-xs font-bold text-muted">
                          {workSnapLine(s.newSnapshot)}
                        </td>
                        <td className="max-w-[12rem] px-4 py-3 text-xs text-muted" title={s.homeworkNext ?? ""}>
                          {clip(s.homeworkNext, 80)}
                        </td>
                        <td className="max-w-[12rem] px-4 py-3 text-xs text-muted" title={s.notes ?? ""}>
                          {clip(s.notes, 80)}
                        </td>
                      </>
                    ) : null}
                    {showSessionWorkColumns ? (
                      <>
                        <td className="max-w-[12rem] px-4 py-3 text-xs font-bold text-muted">
                          {workSnapLine(s.nearWorkSnapshot)}
                        </td>
                        <td className="max-w-[12rem] px-4 py-3 text-xs font-bold text-muted">
                          {workSnapLine(s.farWorkSnapshot)}
                        </td>
                      </>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
