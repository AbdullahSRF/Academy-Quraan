export function LoginCredentialsHelp() {
  return (
    <section
      className="h-full rounded-2xl border-2 border-border bg-card p-5 text-start shadow-md sm:p-6 md:sticky md:top-8"
      aria-labelledby="login-help-title"
    >
      <h2 id="login-help-title" className="text-lg font-bold text-foreground sm:text-xl">
        من أين أحصل على البريد وكلمة المرور؟
      </h2>
      <ul className="mt-4 space-y-4 text-base font-bold leading-relaxed text-muted">
        <li className="flex gap-3">
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
          <span>
            <strong className="text-foreground">مستخدم حقيقي (طالب / ولي أمر / مشرف):</strong> الحساب يُنشأ من{" "}
            <strong>إدارة الأكاديمية</strong>، ويُسلَّم لك البريد وكلمة المرور مباشرة أو عبر قنواتهم الرسمية. المنصة لا
            تعرض تسجيلًا عامًا لأي شخص.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
          <span>
            <strong className="text-foreground">أول تشغيل للمشروع على جهازك:</strong> انسخ ملف البيئة من{" "}
            <code className="rounded-md bg-muted-bg px-1.5 py-0.5 text-sm text-foreground" dir="ltr">
              .env.example
            </code>{" "}
            إلى{" "}
            <code className="rounded-md bg-muted-bg px-1.5 py-0.5 text-sm text-foreground" dir="ltr">
              .env
            </code>
            ، عيّن{" "}
            <code className="rounded-md bg-muted-bg px-1.5 py-0.5 text-sm text-foreground" dir="ltr">
              DATABASE_URL
            </code>
            ، شغّل PostgreSQL (مثلاً{" "}
            <code className="rounded-md bg-muted-bg px-1.5 py-0.5 text-sm text-foreground">npm run db:up</code>)، ثم مرة واحدة:{" "}
            <code className="rounded-md bg-muted-bg px-1.5 py-0.5 text-sm text-foreground">npm run db:prepare</code> (ينشئ قاعدة
            البيانات إن لزم، يطبّق الجداول، ويشغّل الـ seed). أو يدويًا:{" "}
            <code className="rounded-md bg-muted-bg px-1.5 py-0.5 text-sm text-foreground" dir="ltr">
              npx prisma db push
            </code>{" "}
            ثم{" "}
            <code className="rounded-md bg-muted-bg px-1.5 py-0.5 text-sm text-foreground">npm run db:seed</code>. بعدها سجّل الدخول
            بالقيمتين{" "}
            <code className="rounded-md bg-muted-bg px-1.5 py-0.5 text-sm text-foreground" dir="ltr">
              ADMIN_EMAIL
            </code>{" "}
            و{" "}
            <code className="rounded-md bg-muted-bg px-1.5 py-0.5 text-sm text-foreground" dir="ltr">
              ADMIN_PASSWORD
            </code>{" "}
            اللتين في <code className="rounded-md bg-muted-bg px-1.5 py-0.5 text-sm text-foreground" dir="ltr">.env</code> ثم نفّذ{" "}
            <code className="rounded-md bg-muted-bg px-1.5 py-0.5 text-sm text-foreground">npm run db:seed</code> عند تغييرهما
            لمزامنة كلمة المرور.
          </span>
        </li>
      </ul>
    </section>
  );
}
