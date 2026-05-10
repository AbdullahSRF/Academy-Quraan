# التشغيل والنسخ الاحتياطي والإنتاج

## 1. النسخ الاحتياطي اليومي (Logical)

- الأمر: `npm run backup` (يحمّل `DATABASE_URL` من ملف `.env` عبر `dotenv-cli`).
- المتطلبات: أداة **`pg_dump`** في `PATH` (عادة مع تثبيت PostgreSQL client).
- المخرجات: مجلد `backups/` يحتوي ملفات `.sql` بتاريخ الوقت.

### جدولة (Windows)

- **Task Scheduler**: تشغيل يومي لـ `cmd /c cd /d D:\path\to\Academy && npm run backup`؛ يكفي وجود `.env` في مجلد المشروع (أو عيّن `DATABASE_URL` في بيئة المهمة إن لم تستخدم `.env`).

### بدائل

- لقطات **RDS / Managed Postgres**.
- نسخ إلى تخزين سحابي (S3, Azure Blob) عبر CI ليليًا.

## 2. الإنتاج (Production)

- `NODE_ENV=production`
- `npm run build` ثم `npm run start`
- ضبط `AUTH_SECRET` عشوائي قوي؛ عدم رفع `.env`.
- مراجعة `NEXTAUTH_URL` / `AUTH_URL` ليطابق النطاق العام.
- تشغيل migrations بدل `db push` عند الاستقرار: `prisma migrate deploy`.

## 3. المراقبة (لاحقًا)

- تسجيل أخطاء الخادم (Sentry، إلخ).
- مؤشرات أداء قاعدة البيانات.
