# أكاديمية التحفيظ — Qur’an Academy SaaS (MVP scaffold)

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + Prisma + PostgreSQL + Auth.js (Credentials / JWT) + PWA wrapper + RTL Arabic UI shell.

**التحديثات الأمنية:** ثبّت أحدث إصدار في سلسلة Next لديك (مثل **15.5.9+** لمسار 15.5.x وفق [إعلانات الأمان](https://nextjs.org/blog/security-update-2025-12-11)). استخدم `npx fix-react2shell-next` أو راجع التقرير بـ `npm audit`.

## الحزم والتحذيرات (npm)

- **`package.json` لا يحتوي `prisma.seed`** — الإعداد في [`prisma.config.ts`](./prisma.config.ts) فقط (توافق Prisma 7 لاحقًا).
- **`overrides` في `package.json`** تفرض إصدارات حديثة من `glob` (سلسلة v11) و`source-map` واستبدال `sourcemap-codec` بـ `@jridgewell/sourcemap-codec` لتقليل تحذيرات «deprecated» والثغرات الشائعة في التبعيات غير المباشرة. إن ظهر تحذير npm حول `glob` رغم ذلك، فغالبًا مسجل npm يعتبر أي إصدار قديمًا حتى يحدّث الحزم العلوية (مثل سلسلة أدوات PWA).
- **`npm warn Unknown env config "devdir"`**: يأتي من إعداد npm غير مدعوم في إعداداتك العامة (`%USERPROFILE%\.npmrc`). احذف السطر `devdir=...` أو صحّحه حسب [توثيق npm](https://docs.npmjs.com/cli/v11/using-npm/config).
- **`npm audit`**: جرّب أولًا `npm audit fix` (بدون `--force`). تجنّب `audit fix --force` إلا بعد مراجعة التغييرات.
- **`postinstall` يشغّل `prisma generate` مرة لكل `npm install`** — إن رأيت تكرارًا فذلك لأنك نفّذت `npm install` أكثر من مرة، أو لأن أداة/IDE أعادت التثبيت.
- **الترقية إلى Prisma 7** اختيارية وتحتاج [دليل الترحيل](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)؛ المشروع مثبت حاليًا على **Prisma 6.19.3** بشكل صريح.

## المتطلبات

- Node.js 20+
- PostgreSQL 15+ (محليًا أو Docker)
- أدوات `pg_dump` إن أردت استخدام `npm run backup`

## التشغيل السريع

```bash
cd D:\حديثا\Academy
copy .env.example .env
# عدّل DATABASE_URL و AUTH_SECRET و ADMIN_EMAIL و ADMIN_PASSWORD
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) ثم سجّل الدخول بحساب الأدمن من الـ seed.

**بعد سحب تحديثات تغيّر `schema.prisma`:** نفّذ `npm run db:push` (أو `npm run db:prepare`) حتى تُحدَّث PostgreSQL. إن رأيت أثناء `next build` رسالة مثل `invalid input value for enum "StudentStatus": "ARCHIVED"` فالمخطط في الكود أحدث من قاعدة البيانات — شغّل `db:push` ثم أعد البناء.

## الأوامر المفيدة

| الأمر | الوصف |
|--------|--------|
| `npm run dev` | التطوير (Turbopack) |
| `npm run build` | بناء إنتاج |
| `npm run test` | اختبارات Vitest |
| `npm run db:studio` | واجهة Prisma |
| `npm run db:seed` | إنشاء إعدادات الأكاديمية وحساب الأدمن |
| `npm run backup` | نسخ احتياطي يومي عبر `pg_dump` (يتطلب العميل على PATH) |

## النشر الإنتاجي

- عام: [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) (Vercel، Neon، المتغيرات، النسخ الاحتياطي، التصدير).
- **Firebase:** لا تستخدم Hosting الثابت فقط — استخدم **Firebase App Hosting** لـ Next.js كامل؛ راجع [`docs/FIREBASE_APP_HOSTING.md`](./docs/FIREBASE_APP_HOSTING.md) وملف [`apphosting.yaml`](./apphosting.yaml) في الجذر.

## الهيكل

- مرجع تفصيلي للمجلدات ومطابقة مراحل التطوير: [`docs/PROJECT_STRUCTURE.md`](./docs/PROJECT_STRUCTURE.md).
- `src/app` — مسارات App Router (تجميعات `(auth)` و `(dashboard)`).
- `src/auth.ts` + `src/auth.config.ts` — Auth.js (Edge-safe middleware عبر `auth.config` فقط).
- `src/infrastructure/db` — Prisma عميل موحّد.
- `src/features/*` — وحدات المنتج (مخططات Zod أولية للطلاب).
- `prisma/schema.prisma` — نموذج البيانات الكامل للـ MVP.

## ملاحظات إنتاج

- غيّر كلمة مرور الأدمن فورًا بعد أول نشر.
- خزّن `AUTH_SECRET` في مدير أسرار (Vault / KMS) وليس في المستودع.
- جدول `npm run backup` عبر Task Scheduler أو CI مع تخزين مشفّر (S3 / Azure Blob).
