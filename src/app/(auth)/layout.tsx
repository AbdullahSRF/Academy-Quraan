import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background p-4 sm:p-10">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_45%)]" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_90%_90%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_40%)]" />
      <div className="pointer-events-none absolute start-4 top-4 z-20 sm:start-8 sm:top-8">
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </div>
      <div className="relative w-full max-w-6xl px-2 sm:px-4">{children}</div>
    </div>
  );
}
