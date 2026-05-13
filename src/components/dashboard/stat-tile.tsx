import { cn } from "@/lib/utils";

type StatTone = "emerald" | "amber" | "stone";

const toneClass: Record<StatTone, string> = {
  emerald: "text-primary",
  amber: "text-amber-600 dark:text-amber-400",
  stone: "text-foreground/80",
};

export function StatTile({
  label,
  value,
  hint,
  hintInline,
  tone = "emerald",
  className,
  /** للمبالغ والأسعار في الواجهة العربية (اتجاه RTL للرقم مع السياق). */
  valueDir,
}: {
  label: string;
  value: string | number;
  hint?: string;
  /** يعرض التلميح بجانب الرقم في سطر واحد (أنسب للأرقام + كلمة قصيرة مثل «مكتملة»). */
  hintInline?: boolean;
  tone?: StatTone;
  className?: string;
  valueDir?: "rtl" | "ltr";
}) {
  return (
    <div
      className={cn(
        "min-w-0 max-w-full overflow-hidden rounded-2xl border-2 border-border bg-card p-4 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <p className="truncate text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
      {hint && hintInline ? (
        <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0">
          <p className={cn("min-w-0 truncate text-2xl font-bold tabular-nums sm:text-3xl", toneClass[tone])} dir={valueDir}>
            {value}
          </p>
          <p className="shrink-0 text-xs font-bold text-muted">{hint}</p>
        </div>
      ) : (
        <p className={cn("mt-1 min-w-0 truncate text-2xl font-bold tabular-nums sm:text-3xl", toneClass[tone])} dir={valueDir}>
          {value}
        </p>
      )}
      {hint && !hintInline ? <p className="mt-1 truncate text-xs font-bold leading-snug text-muted">{hint}</p> : null}
    </div>
  );
}
