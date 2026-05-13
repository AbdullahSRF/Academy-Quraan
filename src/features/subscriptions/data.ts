import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";
import {
  FIXED_SUBSCRIPTION_PLANS,
  compareFixedPlanCodesForSort,
  fixedPlanCodesForDb,
  getFixedPlanByCode,
} from "@/features/subscriptions/fixed-plans";

function isMissingTable(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && (e.code === "P2021" || e.code === "P2010");
}

/** يضمن وجود الباقات الأربع فقط، ثم يحذف أي سجل باقة قديم من قاعدة البيانات بعد ترحيل الاشتراكات إلى باقة 8 حصص. */
export async function syncFixedSubscriptionPlans(): Promise<void> {
  try {
    for (const def of FIXED_SUBSCRIPTION_PLANS) {
      await prisma.subscriptionPlan.upsert({
        where: { code: def.code },
        create: {
          code: def.code,
          name: def.displayName,
          description: def.description,
          priceMonthly: def.priceMonthlyEgp,
          currency: "EGP",
          active: true,
        },
        update: {
          name: def.displayName,
          description: def.description,
          priceMonthly: def.priceMonthlyEgp,
          currency: "EGP",
          active: true,
        },
      });
    }

    const codes = fixedPlanCodesForDb();
    const fallback = await prisma.subscriptionPlan.findUnique({
      where: { code: "ACADEMY_PLAN_8" },
      select: { id: true },
    });
    if (!fallback) return;

    const legacyPlans = await prisma.subscriptionPlan.findMany({
      where: { OR: [{ code: null }, { code: { notIn: codes } }] },
      select: { id: true },
    });
    const legacyIds = legacyPlans.map((p) => p.id).filter((id) => id !== fallback.id);
    if (legacyIds.length > 0) {
      await prisma.studentSubscription.updateMany({
        where: { planId: { in: legacyIds } },
        data: { planId: fallback.id },
      });
      await prisma.subscriptionPlan.deleteMany({
        where: { id: { in: legacyIds } },
      });
    }
  } catch (e) {
    if (isMissingTable(e)) return;
    throw e;
  }
}

/** الباقات المعتمدة فقط (للعرض والربط) — بعد المزامنة. */
export async function listFixedSubscriptionPlansWithCounts() {
  try {
    await syncFixedSubscriptionPlans();
    const rows = await prisma.subscriptionPlan.findMany({
      where: { active: true, code: { in: fixedPlanCodesForDb() } },
      include: { _count: { select: { subscriptions: true } } },
    });
    return [...rows].sort((a, b) => compareFixedPlanCodesForSort(a.code, b.code));
  } catch (e) {
    if (isMissingTable(e)) return [];
    throw e;
  }
}

export async function listStudentSubscriptions(limit = 80) {
  try {
    return prisma.studentSubscription.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { id: true, fullName: true, status: true } },
        plan: { select: { id: true, name: true, code: true, priceMonthly: true, currency: true } },
      },
    });
  } catch (e) {
    if (isMissingTable(e)) return [];
    throw e;
  }
}

export async function getSubscriptionDashboardCounts() {
  try {
    await syncFixedSubscriptionPlans();
    const codes = fixedPlanCodesForDb();
    const [activePlans, activeSubs, pausedSubs, activeRows] = await Promise.all([
      prisma.subscriptionPlan.count({ where: { active: true, code: { in: codes } } }),
      prisma.studentSubscription.count({
        where: { status: "ACTIVE", plan: { code: { in: codes } } },
      }),
      prisma.studentSubscription.count({
        where: { status: "PAUSED", plan: { code: { in: codes } } },
      }),
      prisma.studentSubscription.findMany({
        where: { status: "ACTIVE", plan: { code: { in: codes } } },
        select: { plan: { select: { priceMonthly: true } } },
      }),
    ]);

    let mrrApproxMonthly = 0;
    for (const r of activeRows) {
      mrrApproxMonthly += Number(r.plan.priceMonthly.toString());
    }

    return {
      activePlans,
      activeSubscriptions: activeSubs,
      pausedSubscriptions: pausedSubs,
      mrrApproxMonthly,
    };
  } catch (e) {
    if (isMissingTable(e)) {
      return {
        activePlans: 0,
        activeSubscriptions: 0,
        pausedSubscriptions: 0,
        mrrApproxMonthly: 0,
      };
    }
    throw e;
  }
}

export type ActiveStudentSubscriptionSummary = {
  planName: string;
  sessionsPerMonth: number;
  priceMonthly: string;
  currency: string;
};

export async function getActiveStudentSubscriptionSummary(
  studentId: string,
): Promise<ActiveStudentSubscriptionSummary | null> {
  try {
    const sub = await prisma.studentSubscription.findFirst({
      where: { studentId, status: "ACTIVE" },
      orderBy: { startedAt: "desc" },
      include: { plan: { select: { name: true, code: true, priceMonthly: true, currency: true } } },
    });
    if (!sub) return null;
    const fixed = getFixedPlanByCode(sub.plan.code);
    return {
      planName: fixed?.displayName ?? sub.plan.name,
      sessionsPerMonth: fixed?.sessionsPerMonth ?? 0,
      priceMonthly: sub.plan.priceMonthly.toString(),
      currency: sub.plan.currency,
    };
  } catch (e) {
    if (isMissingTable(e)) return null;
    throw e;
  }
}

export type SubscriptionPlanReportRow = { planLabel: string; sessionsPerMonth: number; activeCount: number };

export async function getActiveSubscriptionsByFixedPlan(): Promise<SubscriptionPlanReportRow[]> {
  try {
    await syncFixedSubscriptionPlans();
    const codes = fixedPlanCodesForDb();
    const grouped = await prisma.studentSubscription.groupBy({
      by: ["planId"],
      where: { status: "ACTIVE", plan: { code: { in: codes } } },
      _count: { _all: true },
    });
    const planIds = grouped.map((g) => g.planId);
    if (planIds.length === 0) {
      return FIXED_SUBSCRIPTION_PLANS.map((p) => ({
        planLabel: p.displayName,
        sessionsPerMonth: p.sessionsPerMonth,
        activeCount: 0,
      }));
    }
    const plans = await prisma.subscriptionPlan.findMany({
      where: { id: { in: planIds } },
      select: { id: true, code: true, name: true },
    });
    const idToMeta = new Map(plans.map((pl) => [pl.id, pl]));
    const mapCount = new Map<string, number>();
    for (const g of grouped) {
      mapCount.set(g.planId, g._count._all);
    }
    return FIXED_SUBSCRIPTION_PLANS.map((def) => {
      const row = [...idToMeta.entries()].find(([, pl]) => pl.code === def.code);
      const activeCount = row ? (mapCount.get(row[0]) ?? 0) : 0;
      return {
        planLabel: def.displayName,
        sessionsPerMonth: def.sessionsPerMonth,
        activeCount,
      };
    });
  } catch (e) {
    if (isMissingTable(e)) {
      return FIXED_SUBSCRIPTION_PLANS.map((p) => ({
        planLabel: p.displayName,
        sessionsPerMonth: p.sessionsPerMonth,
        activeCount: 0,
      }));
    }
    throw e;
  }
}

export async function assertFixedPlanId(planId: string): Promise<boolean> {
  await syncFixedSubscriptionPlans();
  const p = await prisma.subscriptionPlan.findFirst({
    where: { id: planId, active: true, code: { in: fixedPlanCodesForDb() } },
    select: { id: true },
  });
  return !!p;
}
