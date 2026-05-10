# النشر الإنتاجي — أكاديمية التحفيظ

## 1) Vercel (موصى به لـ Next.js)

1. اربط المستودع بـ [Vercel](https://vercel.com).
2. عيّن **متغيرات البيئة** (انظر `.env.example` وقسم «هيكل المتغيرات» أدناه).
3. لقاعدة بيانات حقيقية استخدم **Neon** أو **Supabase** أو Postgres مُدار.
4. أوامر البناء الافتراضية:
   - `install`: `npm install` (يشغّل `postinstall` → `prisma generate`)
   - `build`: في `vercel.json` مضبوط على `prisma generate && next build`
5. بعد أول نشر: نفّذ **ترحيلات** أو `db push` ضد قاعدة الإنتاج (من الجهاز أو CI):
   ```bash
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```
   أو للتجارب السريعة (غير مفضّل لإنتاج طويل الأمد): `prisma db push`.
6. إن ظهرت صفحة بيضاء بعد تحديث: عيّن `NEXT_DISABLE_PWA=1` ثم أعد النشر، ثم أزلها بعد التأكد من الـ SW.

## 2) هيكل متغيرات البيئة (Production)

| المتغير | مطلوب | الوصف |
|---------|--------|--------|
| `DATABASE_URL` | نعم | سلسلة Postgres. مع Neon + Prisma: أضف `?sslmode=require` ويفضّل **pooler** (انظر الأسفل). |
| `AUTH_SECRET` | نعم | 32+ بايت عشوائي (`openssl rand -base64 32`). |
| `NEXTAUTH_URL` | نعم | عنوان الموقع العلني، مثل `https://your-domain.vercel.app`. |
| `NEXT_PUBLIC_APP_URL` | يُفضّل | نفس الأصل العلني للروابط المطلقة في البريد/الميتاداتا. |
| `NEXT_DISABLE_PWA` | لا | `1` لتعطيل PWA مؤقتًا. |
| `NODE_ENV` | تلقائي | `production` على Vercel. |

**Neon + Connection pooling**

- استخدم عنوان **Pooled connection** من لوحة Neon.
- أضف في نهاية الرابط إن لزم: `&pgbouncer=true&connection_limit=1` (توصية Prisma لـ serverless).

**النسخ الاحتياطي**

- استخدم `npm run backup` مع `pg_dump` مجدول (Task Scheduler / cron / GitHub Actions مع سرّ آمن).
- Neon يوفّر نسخًا احتياطية تلقائية حسب الخطة.

## 3) الأمان (ملخص)

- رؤوس أمان في `next.config.ts` (انظر المشروع).
- جلسات Auth.js JWT؛ Middleware يحمي `/admin` و`/student` و`/parent`.
- حد معدل بسيط لـ `/api/admin/search` (ذاكرة العقدة — للإنتاج متعدد العقد استخدم Redis/Upstash).
- إجراءات الخادم تتحقق من دور الأدمن حيث طُبّق `requireAdminSession`.

## 4) المراقبة

- `src/lib/logger.ts` — تسجيل موحّد.
- `src/lib/monitoring/analytics-ready.ts` — خطاف جاهز لربط Vercel Analytics / Plausible / غيره دون إجبار تبعية.
- جدول `AuditLog` في Prisma لسجل أحداث يمكن توسيع الكتابة إليه من الإجراءات الحساسة.

## 5) الاختبارات و CI

- `npm run test` — Vitest.
- `.github/workflows/ci.yml` — تثبيت، lint، بناء مع Postgres خدمة و `prisma db push`.

## 6) التقارير والتصدير

- `GET /api/admin/reports/export?format=csv|pdf&type=summary` — يتطلب جلسة أدمن (انظر المسار في الكود).
