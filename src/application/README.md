# Application

طبقة **حالات الاستخدام** في هذا المشروع تُنفَّذ عمليًا داخل:

- `src/features/<feature>/actions.ts` — Server Actions (تحقق، تنسيق، `revalidatePath`).
- `src/features/<feature>/data.ts` — استعلامات Prisma ومعاملات قاعدة البيانات.

عندما يكبر المشروع، يمكن استخراج خدمات إلى `src/application/services/*` دون تغيير واجهات الـ UI.
