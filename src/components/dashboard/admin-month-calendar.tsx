import type { AdminMonthCalendar as AdminMonthCalendarModel } from "@/features/dashboard/admin-dashboard-data";
import { cn } from "@/lib/utils";

export function AdminMonthCalendar({
  calendar,
  todayStr,
}: {
  calendar: AdminMonthCalendarModel;
  todayStr: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-bold text-foreground">{calendar.titleAr}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted sm:text-xs" role="row">
        {calendar.weekdayLabels.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label={`تقويم الحضور والحصص — ${calendar.titleAr}`}>
        {calendar.cells.map((c) => {
          if (!c.date) {
            return <div key={c.key} className="min-h-[2.75rem] rounded-lg border border-transparent bg-transparent sm:min-h-[3rem]" />;
          }
          const intensity = Math.min(100, (c.attendanceCount + c.sessionsCount * 2) * 25);
          const isToday = c.date === todayStr;
          return (
            <div
              key={c.key}
              title={`${c.date} — حضور: ${c.attendanceCount} — حصص: ${c.sessionsCount}`}
              className={cn(
                "flex min-h-[2.75rem] flex-col items-center justify-center rounded-lg border p-0.5 text-[10px] font-bold sm:min-h-[3rem] sm:text-xs",
                isToday ? "border-primary ring-2 ring-primary/30" : "border-border bg-muted-bg/40",
              )}
            >
              <span dir="ltr" className={cn("tabular-nums text-foreground", isToday && "text-primary")}>
                {c.day}
              </span>
              <span
                className="mt-0.5 h-1 w-full max-w-[1.75rem] rounded-full bg-primary/20"
                style={{ opacity: 0.35 + (intensity / 100) * 0.65 }}
                aria-hidden
              />
              <span className="mt-0.5 flex gap-0.5 text-[9px] text-muted tabular-nums" dir="ltr">
                <span title="حضور">{c.attendanceCount || ""}</span>
                {c.sessionsCount > 0 ? <span className="text-primary">·{c.sessionsCount}</span> : null}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-center text-[10px] font-bold leading-relaxed text-muted sm:text-xs">
        السطر السفلي: عدد سجلات الحضور · النقطة والرقم: حصص تسميع مكتملة ذلك اليوم.
      </p>
    </div>
  );
}
