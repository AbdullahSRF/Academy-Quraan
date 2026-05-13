import Link from "next/link";
import type { Session } from "next-auth";
import { BookOpen, CheckCircle2, LineChart, ShieldCheck, Sparkles, Users } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { logger } from "@/lib/logger";

function dashboardForRole(role: string) {
  if (role === "ADMIN") return "/admin";
  return "/login/admin";
}

const features = [
  {
    icon: Users,
    title: "إدارة الطلاب",
    text: "ملف لكل طالب: حضور، حفظ بالمناطق، مالية، وتقارير في مكان واحد.",
  },
  {
    icon: ShieldCheck,
    title: "حضور منظم",
    text: "تسجيل يومي سريع مع تنقّل بين التواريخ ومتابعة الغياب.",
  },
  {
    icon: BookOpen,
    title: "حصص تسميع عملية",
    text: "نطاق الجديد والمراجعة والتقييم — ثم زر واحد لحفظ الحصة وتحديث المناطق.",
  },
  {
    icon: LineChart,
    title: "مالية وتقارير",
    text: "فواتير ودفعات مع تتبّع أداء الحفظ خلال آخر فترات.",
  },
] as const;

const steps = [
  { n: "1", title: "تواصل مع الأكاديمية", desc: "يُنشأ لك حساب مشرف بصلاحية الدخول للوحة." },
  { n: "2", title: "استلم بيانات الدخول", desc: "بريد وكلمة مرور آمنة عبر القنوات الرسمية." },
  { n: "3", title: "ابدأ الاستخدام", desc: "من الجوال أو المتصفح — مع دعم التثبيت كتطبيق (PWA)." },
] as const;

/** `auth()` يعتمد على headers — منع prerender الثابت يتجنب أخطاء مضللة أثناء `next build`. */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let session: Session | null = null;
  let authFailure: string | null = null;
  try {
    session = await auth();
  } catch (e) {
    authFailure = e instanceof Error ? e.message : "فشل التحقق من الجلسة";
    logger.error("home auth() failed", { message: authFailure });
  }
  if (session?.user?.role) {
    redirect(dashboardForRole(session.user.role));
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_-10%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent)]"
      />
      {authFailure ? (
        <div
          role="alert"
          className="relative z-20 border-b-2 border-amber-500/60 bg-amber-500/15 px-5 py-3 text-center text-sm font-bold text-foreground sm:px-8"
        >
          تعذر التحقق من حالة الدخول تلقائيًا ({authFailure}). يمكنك متابعة التصفح والدخول يدويًا — إن استمر الأمر، راجع
          AUTH_SECRET وNEXTAUTH_URL على الخادم وليس بالضرورة انقطاع الإنترنت.
        </div>
      ) : null}
      <header className="relative z-10 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <span className="text-lg font-bold tracking-tight text-foreground sm:text-xl">أكاديمية التحفيظ</span>
          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
            <ThemeToggle />
            <Button asChild variant="default" size="sm" className="min-w-[5.5rem] sm:min-w-[6.5rem]">
              <Link href="/login/admin">دخول المشرف</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-primary shadow-sm">
              <Sparkles className="size-4 shrink-0" aria-hidden />
              تحفيظ القرآن الكريم — منصة حديثة
            </div>
            <h1 className="mt-8 text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              إدارة الأكاديمية ببساطة وسرعة
            </h1>
            <p className="mt-6 text-pretty text-lg font-bold leading-relaxed text-muted sm:text-xl">
              حضور يومي، حصص تسميع بالمناطق، فواتير وتقارير — لوحة للمشرف مع دعم الموبايل والوضع الليلي.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="min-h-12 min-w-[12rem] shadow-lg">
                <Link href="/login/admin">دخول المنصة</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-h-12">
                <Link href="#features">استكشف المميزات</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-border bg-muted-bg/40 py-16 sm:py-20" aria-labelledby="features-title">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 id="features-title" className="text-center text-2xl font-bold text-foreground sm:text-3xl">
              لماذا هذه المنصة؟
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-base font-bold text-muted">
              تصميم minimal يشبه تطبيقات SaaS الحديثة — مع هوية هادئة تناسب بيئة التحفيظ.
            </p>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, text }) => (
                <Card key={title} className="border-border shadow-sm">
                  <CardContent className="flex flex-col gap-3 p-5">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-inner">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="text-lg font-bold text-foreground">{title}</h3>
                    <p className="text-sm font-bold leading-relaxed text-muted">{text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20" aria-labelledby="about-title">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 id="about-title" className="text-2xl font-bold text-foreground sm:text-3xl">
                عن الأكاديمية
              </h2>
              <p className="mt-4 text-base font-bold leading-relaxed text-muted">
                منصة موحّدة تساعد المشرف على تنظيم الطلاب والحصص والمالية في يوم عمل واحد.
              </p>
              <ul className="mt-6 space-y-3 text-start">
                {["واجهة سريعة وmobile-first", "دعم الوضع الفاتح والداكن", "قابل للتثبيت كتطبيق (PWA)"].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm font-bold text-foreground">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <Card className="border-dashed border-primary/30 bg-accent/30">
              <CardContent className="space-y-4 p-6 sm:p-8">
                <h3 className="text-lg font-bold text-accent-foreground">طريقة التسجيل</h3>
                <p className="text-sm font-bold leading-relaxed text-muted">
                  لا يوجد تسجيل ذاتي عام. يتم إنشاء الحسابات من إدارة الأكاديمية لضمان الجودة والأمان.
                </p>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/login/admin">لدي بيانات دخول</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-t border-border bg-card/50 py-16 sm:py-20" aria-labelledby="steps-title">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 id="steps-title" className="text-center text-2xl font-bold text-foreground sm:text-3xl">
              خطوات البدء
            </h2>
            <ol className="mt-12 grid gap-6 sm:grid-cols-3">
              {steps.map((s) => (
                <li key={s.n}>
                  <Card className="h-full border-border">
                    <CardContent className="flex flex-col gap-2 p-6">
                      <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {s.n}
                      </span>
                      <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
                      <p className="text-sm font-bold text-muted">{s.desc}</p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="relative border-t border-border py-16 sm:py-20"
          aria-labelledby="cta-title"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              color-mix(in_oklab, var(--primary) 6%, transparent) 0px,
              color-mix(in_oklab, var(--primary) 6%, transparent) 1px,
              transparent 1px,
              transparent 12px
            )`,
          }}
        >
          <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
            <h2 id="cta-title" className="text-2xl font-bold text-foreground sm:text-3xl">
              جاهز للبدء؟
            </h2>
            <p className="mt-4 text-base font-bold leading-relaxed text-muted">
              استخدم بيانات الدخول التي زودتك بها الأكاديمية. المنصة مصممة للجوال والوضع الليلي والتثبيت كتطبيق.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="min-h-12 min-w-[10rem]">
                <Link href="/login/admin">دخول المنصة</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-h-12">
                <Link href="#features">عرض المميزات</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border py-6 text-center text-sm font-bold text-muted">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">أكاديمية تحفيظ القرآن الكريم</div>
      </footer>
    </div>
  );
}
