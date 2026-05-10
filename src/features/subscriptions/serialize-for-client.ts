/** بيانات قابلة للتمرير من السيرفر إلى `"use client"` (بدون Decimal أو Date). */

export type SubscriptionPlanClient = {
  id: string;
  name: string;
  code: string | null;
  priceMonthly: string;
  currency: string;
  _count: { subscriptions: number };
};

export type StudentSubscriptionClient = {
  id: string;
  status: string;
  startedAt: string;
  endsAt: string | null;
  student: { id: string; fullName: string; status: string };
  plan: { id: string; name: string; priceMonthly: string; currency: string };
};

type PlanRowDb = {
  id: string;
  name: string;
  code: string | null;
  priceMonthly: { toString(): string };
  currency: string;
  _count: { subscriptions: number };
};

type SubRowDb = {
  id: string;
  status: string;
  startedAt: Date;
  endsAt: Date | null;
  student: { id: string; fullName: string; status: string };
  plan: { id: string; name: string; priceMonthly: { toString(): string }; currency: string };
};

export function serializePlansForClient(plans: PlanRowDb[]): SubscriptionPlanClient[] {
  return plans.map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    priceMonthly: p.priceMonthly.toString(),
    currency: p.currency,
    _count: p._count,
  }));
}

export function serializeSubscriptionsForClient(subs: SubRowDb[]): StudentSubscriptionClient[] {
  return subs.map((s) => ({
    id: s.id,
    status: s.status,
    startedAt: s.startedAt.toISOString(),
    endsAt: s.endsAt ? s.endsAt.toISOString() : null,
    student: s.student,
    plan: {
      id: s.plan.id,
      name: s.plan.name,
      priceMonthly: s.plan.priceMonthly.toString(),
      currency: s.plan.currency,
    },
  }));
}
