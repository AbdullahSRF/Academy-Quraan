import Link from "next/link";
import { Suspense } from "react";
import { GraduationCap } from "lucide-react";
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

export default function StudentLoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:gap-10">
      <LoginPortalHeader
        icon={GraduationCap}
        eyebrow="بوابة الطالب"
        title="تسجيل دخول الطالب"
        subtitle="عرض الواجب، التقدم، الحضور، والفواتير. استخدم بريد حساب مرتبط بدور «طالب»."
        iconClassName="bg-sky-600 ring-sky-400/35"
      />

      <div className="grid w-full items-stretch gap-8 md:grid-cols-2 md:gap-8 lg:gap-10">
        <div className="min-w-0">
          <Suspense fallback={<LoginFallback />}>
            <LoginForm enforceRole="STUDENT" visualVariant="student" submitLabel="دخول لوحة الطالب" />
          </Suspense>
        </div>
        <div className="min-w-0">
          <LoginCredentialsHelp />
        </div>
      </div>

      <LoginCrossLinks currentHref="/login/student" />

      <p className="text-center text-xs font-bold text-muted">
        <Link href="/login/admin" className="text-primary underline-offset-2 hover:underline">
          دخول المشرف
        </Link>
        {" · "}
        <Link href="/login/parent" className="text-primary underline-offset-2 hover:underline">
          دخول ولي الأمر
        </Link>
      </p>
    </div>
  );
}
