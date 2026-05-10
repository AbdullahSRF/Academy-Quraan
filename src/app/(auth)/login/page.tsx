import Link from "next/link";
import { Suspense } from "react";
import { BookOpen, GraduationCap, HeartHandshake, LayoutGrid, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { LoginCredentialsHelp } from "@/components/auth/login-credentials-help";
import { LoginPortalHeader } from "@/components/auth/login-portal-header";
import { LoginCrossLinks } from "@/components/auth/login-cross-links";

function LoginFallback() {
  return (
    <div className="flex min-h-[280px] w-full items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted-bg/50 text-base font-bold text-primary">
      جاري تحميل نموذج الدخول…
    </div>
  );
}

const portals = [
  {
    href: "/login/admin",
    title: "المشرف",
    desc: "إدارة كاملة للطلاب والحصص والمالية.",
    icon: Shield,
    btn: "دخول المشرف",
  },
  {
    href: "/login/student",
    title: "الطالب",
    desc: "الواجب، التقدم، والحضور.",
    icon: GraduationCap,
    btn: "دخول الطالب",
  },
  {
    href: "/login/parent",
    title: "ولي الأمر",
    desc: "متابعة الأبناء والفواتير.",
    icon: HeartHandshake,
    btn: "دخول ولي الأمر",
  },
] as const;

export default function LoginHubPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:gap-10">
      <LoginPortalHeader
        icon={LayoutGrid}
        eyebrow="أكاديمية التحفيظ"
        title="تسجيل الدخول"
        subtitle="اختر البوابة المناسبة لتقليل الأخطاء — أو سجّل أدناه بأي حساب صالح وسيتم توجيهك تلقائيًا حسب الدور."
        iconClassName="bg-primary"
      />

      <section aria-labelledby="portals-title" className="grid gap-4 sm:grid-cols-3">
        <h2 id="portals-title" className="sr-only">
          بوابات الدخول
        </h2>
        {portals.map(({ href, title, desc, icon: Icon, btn }) => (
          <Card key={href} className="border-border shadow-sm transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted-bg text-primary">
                <Icon className="size-5" aria-hidden />
              </div>
              <CardTitle className="text-lg text-foreground">{title}</CardTitle>
              <CardDescription className="font-bold text-muted">{desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href={href}>{btn}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid w-full items-stretch gap-8 md:grid-cols-2 md:gap-8 lg:gap-10">
        <div className="min-w-0 space-y-4">
          <h2 className="text-lg font-bold text-foreground">دخول عام (أي دور)</h2>
          <p className="text-sm font-bold text-muted">
            إن لم تكن متأكدًا من نوع حسابك، أدخل البريد وكلمة المرور هنا. بعد النجاح ستُوجَّه إلى لوحتك حسب الصلاحية.
          </p>
          <Suspense fallback={<LoginFallback />}>
            <LoginForm visualVariant="default" submitLabel="دخول" />
          </Suspense>
        </div>
        <div className="min-w-0">
          <LoginCredentialsHelp />
        </div>
      </div>

      <LoginCrossLinks currentHref="/login" />

      <p className="text-center text-xs font-bold text-muted">
        <Link href="/" className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline">
          <BookOpen className="size-3.5" aria-hidden />
          الصفحة التعريفية
        </Link>
      </p>
    </div>
  );
}
