import { Suspense } from "react";
import { Shield } from "lucide-react";
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

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:gap-10">
      <LoginPortalHeader
        icon={Shield}
        eyebrow="بوابة المشرف"
        title="تسجيل دخول المشرف"
        subtitle="لوحة التحكم الكاملة: الطلاب، الحصص، المالية، والتقارير. استخدم بريد حساب يملك دور «مشرف»."
      />

      <div className="grid w-full items-stretch gap-8 md:grid-cols-2 md:gap-8 lg:gap-10">
        <div className="min-w-0">
          <Suspense fallback={<LoginFallback />}>
            <LoginForm enforceRole="ADMIN" visualVariant="admin" submitLabel="دخول لوحة المشرف" />
          </Suspense>
        </div>
        <div className="min-w-0">
          <LoginCredentialsHelp />
        </div>
      </div>

      <LoginCrossLinks currentHref="/login/admin" />
    </div>
  );
}
