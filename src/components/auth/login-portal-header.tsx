import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoginPortalHeader({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  iconClassName,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  subtitle: string;
  iconClassName?: string;
}) {
  return (
    <>
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-primary underline-offset-4 transition-colors hover:bg-muted-bg"
        >
          العودة للرئيسية
        </Link>
      </div>

      <header className="flex flex-col items-center gap-5 text-center">
        <div
          className={cn(
            "flex size-[4.5rem] items-center justify-center rounded-2xl text-white shadow-lg ring-4",
            iconClassName ?? "bg-primary ring-primary/20",
          )}
        >
          <Icon className="size-9" aria-hidden />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold tracking-wide text-primary">{eyebrow}</p>
          <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">{title}</h1>
          <p className="mx-auto max-w-2xl text-base font-bold leading-relaxed text-muted">{subtitle}</p>
        </div>
      </header>
    </>
  );
}
