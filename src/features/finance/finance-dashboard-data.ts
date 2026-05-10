import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";
import { countPendingMemorizationSessionPayments } from "@/features/finance/data";
import { getSubscriptionDashboardCounts } from "@/features/subscriptions/data";

export type SessionPaymentBreakdown = {
  NOT_APPLICABLE: number;
  PENDING: number;
  PAID: number;
  WAIVED: number;
};

export type FinanceDashboardData = {
  revenue30d: Prisma.Decimal;
  revenue365d: Prisma.Decimal;
  paymentsCount30d: number;
  paymentsCount365d: number;
  studentsRegular: number;
  studentsTotal: number;
  invoicesByStatus: Record<string, number>;
  openInvoicesCount: number;
  openInvoicesAmount: Prisma.Decimal;
  sessionsCompleted30d: number;
  sessionPaymentBreakdown30d: SessionPaymentBreakdown;
  pendingMemoPayments120d: number;
  recentPayments: {
    id: string;
    amount: Prisma.Decimal;
    paidAt: Date;
    method: string | null;
    student: { fullName: string };
  }[];
  /** اشتراكات من جداول Prisma */
  subscriptionPlansActive: number;
  subscriptionsActive: number;
  subscriptionsPaused: number;
  /** مجموع أسعار الباقة للاشتراكات النشطة — تقدير شهري تقريبي */
  subscriptionsMrrApprox: number;
};

export async function getFinanceDashboardData(): Promise<FinanceDashboardData> {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const since365 = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  const [
    pay30,
    pay365,
    studentsRegular,
    studentsTotal,
    invoicesSample,
    openAgg,
    recentPayments,
    pendingMemo,
    subCounts,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { paidAt: { gte: since30 } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.payment.aggregate({
      where: { paidAt: { gte: since365 } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.student.count({ where: { status: "REGULAR" } }),
    prisma.student.count({ where: { NOT: { status: "ARCHIVED" } } }),
    prisma.invoice.findMany({
      take: 200,
      orderBy: { issuedAt: "desc" },
      select: { status: true },
    }),
    prisma.invoice.aggregate({
      where: { status: { in: ["ISSUED", "OVERDUE"] } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.payment.findMany({
      take: 18,
      orderBy: { paidAt: "desc" },
      include: { student: { select: { fullName: true } } },
    }),
    countPendingMemorizationSessionPayments(120),
    getSubscriptionDashboardCounts(),
  ]);

  let sessionsCompleted30d = 0;
  const sessionPaymentBreakdown30d: SessionPaymentBreakdown = {
    NOT_APPLICABLE: 0,
    PENDING: 0,
    PAID: 0,
    WAIVED: 0,
  };
  try {
    sessionsCompleted30d = await prisma.memorizationSession.count({
      where: { status: "COMPLETED", sessionDate: { gte: since30 } },
    });
    const groups = await prisma.memorizationSession.groupBy({
      by: ["paymentStatus"],
      where: { status: "COMPLETED", sessionDate: { gte: since30 } },
      _count: { _all: true },
    });
    for (const g of groups) {
      const k = g.paymentStatus as keyof SessionPaymentBreakdown;
      if (k in sessionPaymentBreakdown30d) {
        sessionPaymentBreakdown30d[k] = g._count._all;
      }
    }
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021")) throw e;
  }

  const invoicesByStatus: Record<string, number> = {};
  for (const inv of invoicesSample) {
    invoicesByStatus[inv.status] = (invoicesByStatus[inv.status] ?? 0) + 1;
  }

  return {
    revenue30d: pay30._sum.amount ?? new Prisma.Decimal(0),
    revenue365d: pay365._sum.amount ?? new Prisma.Decimal(0),
    paymentsCount30d: pay30._count._all,
    paymentsCount365d: pay365._count._all,
    studentsRegular,
    studentsTotal,
    invoicesByStatus,
    openInvoicesCount: openAgg._count._all,
    openInvoicesAmount: openAgg._sum.amount ?? new Prisma.Decimal(0),
    sessionsCompleted30d,
    sessionPaymentBreakdown30d,
    pendingMemoPayments120d: pendingMemo,
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      amount: p.amount,
      paidAt: p.paidAt,
      method: p.method,
      student: p.student,
    })),
    subscriptionPlansActive: subCounts.activePlans,
    subscriptionsActive: subCounts.activeSubscriptions,
    subscriptionsPaused: subCounts.pausedSubscriptions,
    subscriptionsMrrApprox: subCounts.mrrApproxMonthly,
  };
}
