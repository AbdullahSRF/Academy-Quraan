import Link from "next/link";
import { Suspense } from "react";
import { HeartHandshake } from "lucide-react";
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

export default function ParentLoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:gap-10">
      <LoginPortalHeader
        icon={HeartHandshake}
        eyebrow="بوابة ولي الأمر"
        title="تسجيل دخول ولي الأمر"
        subtitle="متابعة الأبناء: الحضور، الواجب، التسميع، والفواتير. استخدم بريد حساب بدور «ولي أمر»."
        iconClassName="bg-violet-600 ring-violet-400/35"
      />

      <div className="grid w-full items-stretch gap-8 md:grid-cols-2 md:gap-8 lg:gap-10">
        <div className="min-w-0">
          <Suspense fallback={<LoginFallback />}>
            <LoginForm enforceRole="PARENT" visualVariant="parent" submitLabel="دخول لوحة ولي الأمر" />
          </Suspense>
        </div>
        <div className="min-w-0">
          <LoginCredentialsHelp />
        </div>
      </div>

      <LoginCrossLinks currentHref="/login/parent" />

      <p className="text-center text-xs font-bold text-muted">
        <Link href="/login/admin" className="text-primary underline-offset-2 hover:underline">
          دخول المشرف
        </Link>
        {" · "}
        <Link href="/login/student" className="text-primary underline-offset-2 hover:underline">
          دخول الطالب
        </Link>
      </p>
    </div>
  );
}
