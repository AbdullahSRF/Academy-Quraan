import Link from "next/link";
import { cn } from "@/lib/utils";

const links = [
  { href: "/login/admin", label: "دخول المشرف" },
  { href: "/", label: "الصفحة الرئيسية" },
] as const;

export function LoginCrossLinks({ currentHref }: { currentHref: string }) {
  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2 border-t border-border pt-6 text-sm font-bold"
      aria-label="روابط مفيدة"
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
