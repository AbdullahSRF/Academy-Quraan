# نظام الحفظ v2 (مناطق + جلسات)

- التصميم: `docs/MEMORIZATION_SYSTEM.md`
- **إكمال حصة:** `completeMemorizationSessionAction` + `runCompleteMemorizationSession`
- **مناطق:** `data/zones.ts` — `ensureStudentMemorizationBootstrap` يُستدعى عند أول حصة
- **محرك الترقية:** `domain/promotion.ts` — `applySurahCompletionPromotion` عند إكمال السورة في الجديد (تلقائي أو بعلامة)
- **التغطية ونسبة الإنجاز:** `domain/coverage.ts` — اتحاد نطاقات المناطق ÷ 6236
- **مرجع صفحة/جزء/حزب:** `src/lib/quran/ayah-ref.ts` + `verse-meta.generated.ts` (يُولَّد بـ `npm run quran:build-meta` بعد تغيير أعداد الآيات)
- **سياسات:** `domain/policies/` — ترقية + وصف مكدس FAR
- **مسودة الحصة:** `application/plan-session-draft.ts` — يملأ النموذج من المناطق + آخر حصة
- **لوحة الطالب (إداري):** `/admin/students/[id]/memorization`
- **لوحة الطالب (دور STUDENT):** `/student` بعد ربط `User` ↔ `Profile` ↔ `Student`
- **مراجعة الحصة:** حقول اختيارية في النموذج + `nearWorkSnapshot` / `farWorkSnapshot` في `MemorizationSession`

الواجهة التجريبية: `/admin/memorization/session` — اختياريًا `?studentId=…` لبدء حصة مباشرة.
