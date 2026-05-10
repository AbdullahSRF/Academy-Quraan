# هيكل المشروع والمراحل (مرجع واحد)

هذا المستودع (`quran-academy`) يطبّق المنتج كملفات قابلة للتشغيل تحت `src/` و`prisma/` و`public/`.  
**Tailwind CSS v4** يُضبط عبر `postcss.config.mjs` + `@import "tailwindcss"` و`@theme` في `src/app/globals.css` (لا يوجد `tailwind.config.ts` تقليدي — اختيار إطار العمل الرسمي لـ v4).

---

## خريطة المجلدات ووظيفتها

| المسار | الوظيفة |
|--------|---------|
| `src/app/` | App Router: صفحات، تخطيطات، `api/`، مجموعات `(auth)` و`(dashboard)`. |
| `src/components/` | مكوّنات مشتركة: `ui/` (shadcn-style + CVA)، `layout/`، `auth/`، `pwa/`، `dashboard/`. |
| `src/features/` | وحدات المنتج: بيانات، `actions.ts`، مخططات Zod، مكوّنات خاصة بالميزة (students, memorization-v2, finance, attendance, subscriptions, …). |
| `src/lib/` | أدوات عامة (`utils.ts`)، قرآن (`lib/quran/`)، إلخ. |
| `src/hooks/` | خطافات React مشتركة (أضف هنا أي `useX` يعاد استخدامه عبر الصفحات). |
| `src/store/` | Zustand: حالة واجهة لوحة التحكم (قائمة الجوال، ويمكن توسيعها للفلاتر). |
| `src/config/` | ثوابت الموقع والعلامة (`site.ts`). |
| `src/constants/` | ثوابت نصية/مسارات يمكن نقلها من هنا عند الحاجة (حاليًا كثير من الثوابت داخل الميزات). |
| `src/providers/` | دمج مع `src/components/providers.tsx` — طبّقات React للجذر (ثيم، جلسة، إلخ). |
| `src/auth.ts` + `src/auth.config.ts` | Auth.js: إعدادات الجلسة والأدوار والـ middleware الآمن. |
| `src/middleware.ts` | حماية المسارات حسب الدور. |
| `src/infrastructure/db/` | عميل Prisma موحّد. |
| `src/domain/` + `src/application/` | طبقات دومين/تطبيق خفيفة وأخطاء مشتركة (توسيع تدريجي). |
| `prisma/` | `schema.prisma`، `seed.ts`، مجلد `migrations/` لـ `prisma migrate`. |
| `scripts/` | أدوات بناء، splash، نسخ احتياطي، إلخ. |
| `public/` | أصول ثابتة، `manifest`، `offline.html`، service worker (مخرجات PWA). |

**لماذا لا يوجد جذر `actions/` أو `services/` منفصل؟**  
لتقليل الانتقال بين المجلدات، **إجراءات السيرفر** (`"use server"`) و**خدمات التطبيق** توضع بجانب الميزة: `src/features/<name>/actions.ts` و`application/` أو `data/` حسب الحاجة. هذا نمط **feature-sliced** مناسب للصيانة.

---

## مطابقة المراحل الـ 12

### المرحلة 1 — Project Setup
- `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `src/middleware.ts`
- `eslint.config.mjs`, `.prettierrc`, `.prettierignore`
- `prisma.config.ts`, `.env.example` (إن وُجد)

### المرحلة 2 — Folder Structure
- كما في الجدول أعلاه؛ التوثيق هنا هو «العقد» الرسمي للهيكل.

### المرحلة 3 — Design System
- `src/app/globals.css` (ألوان، داكن، `@theme`)
- `src/components/theme-provider.tsx`, `theme-toggle.tsx`
- `src/components/ui/*` — Button, Sheet, Tabs, Dialog, Command (`cmdk`), … + `class-variance-authority` عبر المكوّنات

### المرحلة 4 — Core Layouts
- `dashboard-shell.tsx` → `dashboard-app-frame.tsx`: شريط جانبي، توب بار، قائمة جوال (Sheet)، بحث أدمن، أوامر سريعة، `dashboard-command-menu.tsx`

### المرحلة 5 — Pages
- لاندنج: `src/app/page.tsx`
- تسجيل الدخول: `src/app/(auth)/login/**`
- أدمن: `src/app/(dashboard)/admin/**` (رئيسية، طلاب، ملف طالب، تحفيظ، حصة، حضور، مالية، اشتراكات، تقارير)
- ولي أمر: `src/app/(dashboard)/parent/**`
- طالب: `src/app/(dashboard)/student/**`

### المرحلة 6 — Components
- بطاقات، جداول، نماذج الحصة، التحفيظ، الحضور، المالية — تحت `src/features/*/components` و`src/components/dashboard`

### المرحلة 7 — State Management
- `src/store/dashboard-ui-store.ts` — حالة قائمة الجوال (Zustand)
- يمكن إضافة مخازن للفلاتر أو لوحات جانبية لاحقًا بنفس النمط

### المرحلة 8 — Auto Save
- `session-draft-textarea.tsx`: debounce + `localStorage` + مؤشر حفظ

### المرحلة 9 — PWA
- `next.config.ts` + `@ducanh2912/next-pwa`، `public/manifest`، `pwa-install-banner.tsx`، `offline.html`، روابط splash آبل

### المرحلة 10 — Authentication
- Auth.js، أدوار في `auth.config.ts`، حماية في `middleware.ts`

### المرحلة 11 — Prisma + Database
- `prisma/schema.prisma`, `prisma/seed.ts`, أوامر `db:*` في `package.json`

### المرحلة 12 — أثناء الكتابة
- التعديلات تتم في الملفات في Git وليس بنسخ يدوي طويل في الدردشة؛ استخدم هذا الملف + `README.md` كمرجع.

---

## أسلوب UI (Linear / Notion / Stripe)

- تباعد واضح، خط عريض (`font-bold`)، ألوان هادئة، حركات خفيفة (`framer-motion` في إطار الصفحة)، أولوية للجوال (`pb` آمن للمنطقة السفلية، شريط تنقل سفلي).

---

## أوامر سريعة

```bash
npm install
npm run db:prepare   # أو db:push + db:seed
npm run dev
npm run build
npm run lint
npm run format       # بعد إضافة Prettier
```
