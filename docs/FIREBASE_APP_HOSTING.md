# نشر المشروع على Firebase — App Hosting (Next.js كامل)

## لماذا ليس «Firebase Hosting» القديم فقط؟

| المنتج | ماذا يستضيف؟ | مناسب لمشروعنا؟ |
|--------|----------------|------------------|
| **Hosting (كلاسيكي)** | HTML/CSS/JS ثابت من مجلد `public` | **لا** — لا يشغّل خادم Node ولا API ولا Prisma |
| **App Hosting** | تطبيق Next.js كامل (SSR + API + Middleware) على **Cloud Run** + CDN | **نعم** — هذا ما تحتاجه |

المرجع الرسمي: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting) و [الإعداد](https://firebase.google.com/docs/app-hosting/get-started).

---

## المتطلبات

1. حساب Google، ومشروع Firebase على خطة **Blaze** (الدفع حسب الاستخدام) — مطلوب لـ App Hosting.
2. مستودع **GitHub** (الربط من لوحة Firebase هو المسار الموصى به).
3. قاعدة بيانات **PostgreSQL** خارجية ومتاحة من الإنترنت (مثل **Neon**، **Supabase**، **Cloud SQL**) — Firebase لا يوفّر Postgres مدمجًا مع Prisma بهذا الشكل.
4. تثبيت [Firebase CLI](https://firebase.google.com/docs/cli) حديثًا (`firebase --version` ≥ 13.15 يُفضّل).

---

## الخطوات (ملخص)

### 1) إنشاء Backend من لوحة Firebase

1. افتح [App Hosting في Console](https://console.firebase.google.com/project/_/apphosting).
2. **Get started** / **Create backend**.
3. اختر **المنطقة** (مثل `us-central1` أو الأقرب لعملائك في المنطقة العربية).
4. اربط **مستودع GitHub** واختر الفرع الذي يُنشر منه (مثل `main`) — **دليل تفصيلي للخطوة 4:** [`docs/GITHUB_FIREBASE_STEP4.md`](./GITHUB_FIREBASE_STEP4.md).
5. **جذر التطبيق**: المجلد الذي فيه `package.json` (عادة **جذر المستودع** `/`).
6. أنشئ/اربط **Firebase Web App** إن طُلب.

بعد أول نشر تحصل على رابط مثل:  
`backend-id--project-id.us-central1.hosted.app`

### 2) متغيرات البيئة (إلزامي)

في **App Hosting → Backend → Settings → Environment** (أو عبر `apphosting.yaml` + Secret Manager)، عيّن على الأقل:

| المتغير | ملاحظة |
|---------|--------|
| `DATABASE_URL` | رابط Postgres (مع SSL؛ لـ Neon غالبًا `?sslmode=require`) |
| `AUTH_SECRET` | سر قوي (مثلاً `openssl rand -base64 32`) — **لا** تضعه في Git |
| `NEXTAUTH_URL` | **نفس** الرابط العلني للتطبيق بعد النشر، مثل `https://backend-id--project.us-central1.hosted.app` |
| `NEXT_PUBLIC_APP_URL` | نفس قيمة `NEXTAUTH_URL` تقريبًا (للميتاداتا والروابط المطلقة) |

**بعد ربط دومين مخصص:** حدّث `NEXTAUTH_URL` و `NEXT_PUBLIC_APP_URL` إلى `https://your-domain.com`.

الأسرار الأفضل عبر **Secret Manager** ومرجعها في `apphosting.yaml` (انظر الملف `apphosting.yaml` في الجذر).

### 3) قاعدة البيانات

- من جهازك (أو من CI) نفّذ ضد قاعدة **الإنتاج**:
  ```bash
  DATABASE_URL="postgresql://..." npx prisma migrate deploy
  ```
  أو للتجارب: `prisma db push` (أقل ملاءمة طويل المدى).
- ثبّت **Seed** مرة واحدة إن لزم: `npx tsx prisma/seed.ts` مع نفس `DATABASE_URL` (بحذر على الإنتاج).

### 4) البناء

المشروع يستخدم `postinstall` → `prisma generate`. أمر البناء الافتراضي في `package.json` هو `next build` — عادة **لا تحتاج** تغييرًا لـ App Hosting ما دام المحوّل الرسمي يكتشف Next.js.

إذا احتجت ذاكرة أكبر للبناء/التشغيل (Prisma + Next): راجع `runConfig` في `apphosting.yaml`.

### 5) PWA

إن ظهرت مشكلة بعد النشر (صفحة بيضاء / Service Worker): عيّن مؤقتًا في بيئة App Hosting:

`NEXT_DISABLE_PWA=1`

ثم أعد النشر. راجع أيضًا `next.config.ts` وملف `docs/DEPLOYMENT.md`.

---

## Auth.js و `trustHost`

المشروع يضبط `trustHost: true` في `auth.config.ts` — مناسب عندما يتغيّر اسم المضيف (نطاق Firebase ثم دومينك).

---

## ماذا عن `firebase.json`؟

ملف **`firebase.json` التقليدي** مع `hosting.public` يخص **الاستضافة الثابتة** فقط. لـ **App Hosting** الإعداد الأساسي يكون عبر **Console / CLI** وملف **`apphosting.yaml`**. يمكن الإبقاء على `firebase.json` لميزات أخرى (Functions قديمة، إلخ) دون أن يستبدل App Hosting.

---

## الخلاصة

- **لا تنشر هذا المشروع كموقع ثابت فقط على Hosting.**
- استخدم **Firebase App Hosting**، واربط **Postgres** خارجيًا، واضبط **الأسرار والروابط العلنية** كما فوق.

للدعم العام للنشر (غير Firebase): راجع [`DEPLOYMENT.md`](./DEPLOYMENT.md).
