import Link from "next/link";
import { cn } from "@/lib/utils";

const links = [
  { href: "/login/admin", label: "دخول المشرف" },
  { href: "/login/student", label: "دخول الطالب" },
  { href: "/login/parent", label: "دخول ولي الأمر" },
  { href: "/login", label: "كل البوابات" },
] as const;

export function LoginCrossLinks({ currentHref }: { currentHref: string }) {
  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2 border-t border-border pt-6 text-sm font-bold"
      aria-label="بوابات الدخول الأخرى"
    >
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "rounded-full border border-border px-4 py-2 transition-colors hover:bg-muted-bg",
            href === currentHref && "pointer-events-none border-primary bg-primary/10 text-primary",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
