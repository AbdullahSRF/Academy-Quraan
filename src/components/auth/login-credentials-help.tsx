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
            <strong className="text-foreground">تسجيل الدخول للمشرفين فقط:</strong> لا يوجد تسجيل عام. بيانات الدخول تُحدَّد من
            إدارة الأكاديمية أو من إعدادات الخادم (انظر أدناه للتطوير المحلي).
          </span>
        </li>
        <li className="flex gap-3">
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
          <span>
            <strong className="text-foreground">على جهازك أو بيئة التطوير:</strong> انسخ{" "}
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
            <code className="rounded-md bg-muted-bg px-1.5 py-0.5 text-sm text-foreground">npm run db:prepare</code> لإنشاء الجداول
            وبيانات التجربة. سجّل الدخول بالبريد وكلمة المرور من{" "}
            <code className="rounded-md bg-muted-bg px-1.5 py-0.5 text-sm text-foreground" dir="ltr">
              ADMIN_EMAIL
            </code>{" "}
            و{" "}
            <code className="rounded-md bg-muted-bg px-1.5 py-0.5 text-sm text-foreground" dir="ltr">
              ADMIN_PASSWORD
            </code>{" "}
            في <code className="rounded-md bg-muted-bg px-1.5 py-0.5 text-sm text-foreground" dir="ltr">.env</code>. عند تشغيل{" "}
            <code className="rounded-md bg-muted-bg px-1.5 py-0.5 text-sm text-foreground">npm run dev</code> أو{" "}
            <code className="rounded-md bg-muted-bg px-1.5 py-0.5 text-sm text-foreground">npm run start</code> يُحدَّث حساب المشرف
            تلقائيًا من هذه المتغيرات؛ لا حاجة لتشغيل <code className="rounded-md bg-muted-bg px-1.5 py-0.5 text-sm text-foreground">npm run db:seed</code> بعد كل تغيير لكلمة المرور.
          </span>
        </li>
      </ul>
    </section>
  );
}
