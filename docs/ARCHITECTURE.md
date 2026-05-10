# معمارية النظام — أكاديمية التحفيظ

## 1. المبادئ

- **Next.js 15 App Router**: التوجيه، التخطيطات، الـ RSC حيث ينفع، والـ Client فقط عند الحاجة (نماذج، تفاعل).
- **TypeScript**: عقود صريحة بين الطبقات.
- **Clean Architecture (عملي لـ Next)**: فصل **نطاق المشكلة** عن **التسليم** دون إفراط في طبقات غير ضرورية.
- **أمان**: مصادقة عبر **Auth.js**، جلسات JWT، حماية المسارات في `middleware`، تحقق من الدور لكل لوحة.
- **قابلية التوسع**: ميزات منفصلة تحت `src/features/*` مع Server Actions ووحدات بيانات واضحة.

## 2. طبقات المشروع (مقترح التنفيذ)

| طبقة | المسار | المسؤولية |
|------|--------|------------|
| **Presentation** | `src/app/*`, `src/components/*` | صفحات، تخطيطات، UI، استدعاء Actions |
| **Application** | `src/features/*/actions.ts`, `src/features/*/data.ts` | حالات استخدام، تنسيق، `revalidatePath` |
| **Domain** | `src/domain/*`, `src/features/*/schemas/*` | قواعد، أنواع، أخطاء نطاق، Zod |
| **Infrastructure** | `src/infrastructure/db/*`, `scripts/*` | Prisma، نسخ احتياطي، تكامل خارجي لاحقًا |

> **ملاحظة:** لا نضيف طبقة Repository مجردة لكل جدول إلا عندما يظهر تكرار أو اختبار يستدعي ذلك؛ Prisma يبقى خلف `data.ts` لكل ميزة.

## 3. تدفق الطلب (مثال: إنشاء طالب)

1. المستخدم يملأ النموذج (Client أو Server Form).
2. **Server Action** في `features/students/actions.ts` يقرأ `FormData` / JSON.
3. **Zod** (`schemas/student.schema.ts`) يتحقق من المدخلات.
4. **`data.ts`** ينفّذ `prisma.$transaction` (User → Profile → Student).
5. **`revalidatePath('/admin/students')`** لتحديث القائمة.

## 4. المصادقة والأدوار

- **ADMIN**: وصول كامل للوحدات الإدارية.
- **STUDENT** / **PARENT**: لوحات مخصصة؛ توسيع الصلاحيات لاحقًا عبر سياسات أو `Ability` إن لزم.
- **Middleware**: حماية المسارات `/admin`, `/student`, `/parent` وإعادة التوجيه لـ `/login`.

## 5. PWA

- `next-pwa` مع تعطيل التطوير؛ Service Worker في الإنتاء لتحسين التثبيت والتخزين المؤقت (مع مراعاة إبطال النسخ عند النشر).

## 6. Auto-save

- الخطاف `src/lib/use-auto-save.ts` للحقول الطويلة (ملاحظات حفظ/تسميع) مع debounce؛ يُربَط بـ Server Action صغير لكل حقل أو كيان.

## 7. النسخ الاحتياطي

- سكربت `scripts/backup-daily.ts` + `npm run backup` — يعتمد على `pg_dump`؛ التشغيل اليومي عبر **Task Scheduler** أو **CI** أو نسخ لقطة مُدارة (RDS).

## 8. خارطة طريق تقنية

1. إكمال CRUD الطلاب + الجداول الدراسية.
2. الحضور اليومي + التجميعات.
3. سجلات الحفظ مع Auto-save للملاحظات.
4. الفواتير والدفعات والتقارير المالية.
5. تقارير مجمّعة وتصدير CSV.
6. (اختياري) تعدد أكاديميات / SaaS متعدد المستأجرين — يتطلب عمود `academyId` على الجداول الرئيسية وتعديل Auth.
