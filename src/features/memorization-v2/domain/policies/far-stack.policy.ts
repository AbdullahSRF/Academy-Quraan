/**
 * سياسة مكدس الماضي البعيد (FAR_REVIEW):
 * - عند الترقية: يُحوَّل غلاف NEAR الحالي + أجزاء FAR السابقة إلى مصفوفة `farRanges`
 *   ثم يُحسب الغلاف الظاهر (min/max عالمي) للعرض والاستعلام.
 * - لا يوجد حد أقصى لعدد الشرائح في الـ MVP؛ يمكن لاحقًا دمج/قصّ حسب حجم الدورة.
 */
export const FAR_REVIEW_STACK_POLICY = {
  mode: "append_segments_then_envelope" as const,
  /** مستقبلًا: حد أقصى للشرائح قبل دمج آمن */
  maxSegmentsBeforeMerge: null as number | null,
};
