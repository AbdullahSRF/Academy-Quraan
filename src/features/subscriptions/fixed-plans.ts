/**
 * الباقات المعتمدة فقط — مصدر الحقيقة للعرض والمنطق.
 * تُزامَن مع جدول SubscriptionPlan عبر `code` الفريد.
 */
export const FIXED_SUBSCRIPTION_PLAN_CODES = ["ACADEMY_PLAN_8", "ACADEMY_PLAN_12", "ACADEMY_PLAN_16", "ACADEMY_PLAN_24"] as const;

export type FixedSubscriptionPlanCode = (typeof FIXED_SUBSCRIPTION_PLAN_CODES)[number];

export type FixedSubscriptionPlanDef = {
  code: FixedSubscriptionPlanCode;
  /** عدد الحصص المستهدف شهريًا */
  sessionsPerMonth: number;
  /** السعر الشهري بالجنيه المصري */
  priceMonthlyEgp: number;
  /** اسم العرض: عدد الحصص فقط */
  displayName: string;
  /** وصف مختصر */
  description: string;
};

export const FIXED_SUBSCRIPTION_PLANS: readonly FixedSubscriptionPlanDef[] = [
  {
    code: "ACADEMY_PLAN_8",
    sessionsPerMonth: 8,
    priceMonthlyEgp: 200,
    displayName: "8 حصص",
    description: "اشتراك شهري — 8 حصص في الشهر.",
  },
  {
    code: "ACADEMY_PLAN_12",
    sessionsPerMonth: 12,
    priceMonthlyEgp: 300,
    displayName: "12 حصة",
    description: "اشتراك شهري — 12 حصة في الشهر.",
  },
  {
    code: "ACADEMY_PLAN_16",
    sessionsPerMonth: 16,
    priceMonthlyEgp: 400,
    displayName: "16 حصة",
    description: "اشتراك شهري — 16 حصة في الشهر.",
  },
  {
    code: "ACADEMY_PLAN_24",
    sessionsPerMonth: 24,
    priceMonthlyEgp: 500,
    displayName: "24 حصة",
    description: "اشتراك شهري — 24 حصة في الشهر.",
  },
];

const byCode = new Map(FIXED_SUBSCRIPTION_PLANS.map((p) => [p.code, p]));

export function isFixedSubscriptionPlanCode(code: string | null | undefined): code is FixedSubscriptionPlanCode {
  return !!code && FIXED_SUBSCRIPTION_PLAN_CODES.includes(code as FixedSubscriptionPlanCode);
}

/** ترتيب عرض ثابت: 8 → 12 → 16 → 24 (مستقل عن السعر أو ترتيب الأحرف في قاعدة البيانات). */
export function compareFixedPlanCodesForSort(aCode: string | null, bCode: string | null): number {
  const rank = (c: string | null) => {
    if (!c || !isFixedSubscriptionPlanCode(c)) return FIXED_SUBSCRIPTION_PLAN_CODES.length + 1;
    return FIXED_SUBSCRIPTION_PLAN_CODES.indexOf(c);
  };
  return rank(aCode) - rank(bCode);
}

export function getFixedPlanByCode(code: string | null | undefined): FixedSubscriptionPlanDef | undefined {
  if (!code || !isFixedSubscriptionPlanCode(code)) return undefined;
  return byCode.get(code);
}

export function fixedPlanCodesForDb(): string[] {
  return [...FIXED_SUBSCRIPTION_PLAN_CODES];
}
