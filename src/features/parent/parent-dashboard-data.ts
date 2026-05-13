import prisma from "@/infrastructure/db/prisma";
import { listChildrenForParentUser } from "@/features/parent/data";
import { loadStudentMemorizationDashboard } from "@/features/memorization-v2/data/student-dashboard";
import { getActiveStudentSubscriptionSummary } from "@/features/subscriptions/data";

export type ParentChildDashboardRow = {
  id: string;
  fullName: string;
  status: string;
  level: string | null;
  livePercent: number;
  lastSession: Date | null;
  lastRating: string | null;
  homework: string | null;
  attendanceStrip: { date: string; status: string }[];
  openInvoices: {
    id: string;
    title: string;
    amount: string;
    status: string;
    dueDate: string | null;
  }[];
  recentSessions: { sessionDate: string; rating: string | null; homeworkNext: string | null }[];
  subscriptionPlanName: string | null;
  subscriptionSessionsPerMonth: number | null;
  subscriptionPriceLabel: string | null;
};

export async function loadParentDashboardRows(userId: string): Promise<ParentChildDashboardRow[]> {
  const children = await listChildrenForParentUser(userId);
  const rows = await Promise.all(
    children.map(async (c) => {
      const [dash, atts, invs] = await Promise.all([
        loadStudentMemorizationDashboard(c.id),
        prisma.attendance.findMany({
          where: { studentId: c.id },
          orderBy: { date: "desc" },
          take: 21,
          select: { date: true, status: true },
        }),
        prisma.invoice.findMany({
          where: { studentId: c.id, status: { in: ["ISSUED", "OVERDUE"] } },
          orderBy: [{ dueDate: "asc" }, { issuedAt: "desc" }],
          take: 8,
          select: { id: true, title: true, amount: true, status: true, dueDate: true },
        }),
      ]);
      const last = dash.sessions[0] ?? null;
      const attendanceStrip = atts.map((a) => ({
        date: a.date.toISOString().slice(0, 10),
        status: a.status,
      }));
      const openInvoices = invs.map((i) => ({
        id: i.id,
        title: i.title,
        amount: i.amount.toString(),
        status: i.status,
        dueDate: i.dueDate ? i.dueDate.toISOString().slice(0, 10) : null,
      }));
      const recentSessions = dash.sessions.slice(0, 6).map((s) => ({
        sessionDate: s.sessionDate.toISOString().slice(0, 10),
        rating: s.rating,
        homeworkNext: s.homeworkNext,
      }));
      const subSummary = await getActiveStudentSubscriptionSummary(c.id);
      return {
        id: c.id,
        fullName: c.fullName,
        status: c.status,
        level: c.level,
        livePercent: dash.livePercent,
        lastSession: last?.sessionDate ?? null,
        lastRating: last?.rating ?? null,
        homework: last?.homeworkNext?.trim() ? last.homeworkNext.trim() : null,
        attendanceStrip,
        openInvoices,
        recentSessions,
        subscriptionPlanName: subSummary?.planName ?? null,
        subscriptionSessionsPerMonth: subSummary?.sessionsPerMonth ?? null,
        subscriptionPriceLabel: subSummary
          ? `${subSummary.priceMonthly} ج.م شهريًا`
          : null,
      };
    }),
  );
  return rows;
}

/** حضور وفواتير لطفل واحد (بعد التحقق من ربط ولي الأمر). */
export async function getParentChildFinanceAttendance(studentId: string) {
  const [atts, invs] = await Promise.all([
    prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
      take: 28,
      select: { id: true, date: true, status: true, note: true },
    }),
    prisma.invoice.findMany({
      where: { studentId },
      orderBy: { issuedAt: "desc" },
      take: 14,
      select: {
        id: true,
        title: true,
        amount: true,
        status: true,
        dueDate: true,
        issuedAt: true,
        payments: { select: { amount: true } },
      },
    }),
  ]);
  return { atts, invs };
}
