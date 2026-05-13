/** بيانات قابلة للتمرير من السيرفر إلى `"use client"` (بدون Decimal أو Date). */

import { getFixedPlanByCode } from "@/features/subscriptions/fixed-plans";

export type SubscriptionPlanClient = {
  id: string;
  name: string;
  code: string | null;
  priceMonthly: string;
  currency: string;
  sessionsPerMonth: number | null;
  description: string | null;
  _count: { subscriptions: number };
};

export type StudentSubscriptionClient = {
  id: string;
  status: string;
  startedAt: string;
  endsAt: string | null;
  student: { id: string; fullName: string; status: string };
  plan: {
    id: string;
    name: string;
    code: string | null;
    priceMonthly: string;
    currency: string;
    sessionsPerMonth: number | null;
  };
};

type PlanRowDb = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
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
  plan: { id: string; name: string; code: string | null; priceMonthly: { toString(): string }; currency: string };
};

export function serializePlansForClient(plans: PlanRowDb[]): SubscriptionPlanClient[] {
  return plans.map((p) => {
    const fixed = getFixedPlanByCode(p.code);
    return {
      id: p.id,
      name: p.name,
      code: p.code,
      priceMonthly: p.priceMonthly.toString(),
      currency: p.currency,
      sessionsPerMonth: fixed?.sessionsPerMonth ?? null,
      description: fixed?.description ?? p.description,
      _count: p._count,
    };
  });
}

export function serializeSubscriptionsForClient(subs: SubRowDb[]): StudentSubscriptionClient[] {
  return subs.map((s) => {
    const fixed = getFixedPlanByCode(s.plan.code);
    return {
      id: s.id,
      status: s.status,
      startedAt: s.startedAt.toISOString(),
      endsAt: s.endsAt ? s.endsAt.toISOString() : null,
      student: s.student,
      plan: {
        id: s.plan.id,
        name: s.plan.name,
        code: s.plan.code,
        priceMonthly: s.plan.priceMonthly.toString(),
        currency: s.plan.currency,
        sessionsPerMonth: fixed?.sessionsPerMonth ?? null,
      },
    };
  });
}
