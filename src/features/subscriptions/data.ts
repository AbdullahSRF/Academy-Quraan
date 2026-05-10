import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";

function isMissingTable(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && (e.code === "P2021" || e.code === "P2010");
}

export async function listSubscriptionPlans() {
  try {
  return prisma.subscriptionPlan.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { subscriptions: true } } },
  });
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
      plan: { select: { id: true, name: true, priceMonthly: true, currency: true } },
    },
  });
  } catch (e) {
    if (isMissingTable(e)) return [];
    throw e;
  }
}

export async function getSubscriptionDashboardCounts() {
  try {
  const [activePlans, activeSubs, pausedSubs, activeRows] = await Promise.all([
    prisma.subscriptionPlan.count({ where: { active: true } }),
    prisma.studentSubscription.count({ where: { status: "ACTIVE" } }),
    prisma.studentSubscription.count({ where: { status: "PAUSED" } }),
    prisma.studentSubscription.findMany({
      where: { status: "ACTIVE" },
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
