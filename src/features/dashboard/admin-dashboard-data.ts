import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";

export type AdminRecentSession = {
  id: string;
  sessionDate: Date;
  rating: string | null;
  studentId: string;
  student: { fullName: string };
};

export type AdminActivityRow = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: Date;
};

export type AdminOverdueInvoice = {
  id: string;
  title: string;
  amount: Prisma.Decimal;
  dueDate: Date | null;
  student: { fullName: string };
};

export type AdminCalendarDay = { date: string; attendanceCount: number };

/** خلية في شبكة الشهر (أسبوع يبدأ السبت — شائع في التقويم العربي). */
export type AdminMonthCell = {
  key: string;
  date: string | null;
  day: number;
  attendanceCount: number;
  sessionsCount: number;
};

export type AdminMonthCalendar = {
  monthKey: string;
  titleAr: string;
  /** من اليمين لليسار: س ج خ ر ث ن ح (سبت → جمعة) */
  weekdayLabels: string[];
  cells: AdminMonthCell[];
};

export type AdminDashboardBundle = {
  todayStr: string;
  attendanceToday: number;
  sessionsToday: number;
  revenue30d: Prisma.Decimal;
  paymentsCount30d: number;
  recentSessions: AdminRecentSession[];
  overdueInvoices: AdminOverdueInvoice[];
  activity: AdminActivityRow[];
  calendar14: AdminCalendarDay[];
};

function utcDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** قراءة معلمات التقويم من الـ URL — `calMonth` من 1 إلى 12 (UTC). */
export function parseAdminCalendarView(sp: { calYear?: string; calMonth?: string }) {
  const now = new Date();
  let y = Number.parseInt(sp.calYear ?? "", 10);
  let m = Number.parseInt(sp.calMonth ?? "", 10);
  if (!Number.isFinite(y) || y < 2000 || y > 2100) y = now.getUTCFullYear();
  if (!Number.isFinite(m) || m < 1 || m > 12) m = now.getUTCMonth() + 1;
  return { year: y, month: m, monthIndex0: m - 1 };
}

/** ترتيب السبت أولًا (0 = سبت … 6 = جمعة) لمحاذاة الشبكة. */
function saturdayFirstPadding(utcDow: number): number {
  return utcDow === 6 ? 0 : utcDow + 1;
}

function buildMonthCalendarModel(
  ref: Date,
  attendanceCounts: Map<string, number>,
  sessionCounts: Map<string, number>,
): AdminMonthCalendar {
  const y = ref.getUTCFullYear();
  const m = ref.getUTCMonth();
  const first = new Date(Date.UTC(y, m, 1, 12, 0, 0, 0));
  const lastDayNum = new Date(Date.UTC(y, m + 1, 0, 12, 0, 0, 0)).getUTCDate();
  const padStart = saturdayFirstPadding(first.getUTCDay());

  const titleAr = new Intl.DateTimeFormat("ar", { month: "long", year: "numeric", calendar: "gregory" }).format(first);

  const cells: AdminMonthCell[] = [];
  for (let i = 0; i < padStart; i++) {
    cells.push({ key: `pad-s-${i}`, date: null, day: 0, attendanceCount: 0, sessionsCount: 0 });
  }
  for (let d = 1; d <= lastDayNum; d++) {
    const date = new Date(Date.UTC(y, m, d, 12, 0, 0, 0));
    const key = utcDay(date);
    cells.push({
      key,
      date: key,
      day: d,
      attendanceCount: attendanceCounts.get(key) ?? 0,
      sessionsCount: sessionCounts.get(key) ?? 0,
    });
  }
  const endPad = (7 - (cells.length % 7)) % 7;
  for (let i = 0; i < endPad; i++) {
    cells.push({ key: `pad-e-${i}`, date: null, day: 0, attendanceCount: 0, sessionsCount: 0 });
  }
  while (cells.length < 35) {
    for (let i = 0; i < 7; i++) {
      cells.push({ key: `pad-x-${cells.length}`, date: null, day: 0, attendanceCount: 0, sessionsCount: 0 });
    }
  }

  return {
    monthKey: `${y}-${String(m + 1).padStart(2, "0")}`,
    titleAr,
    weekdayLabels: ["س", "ج", "خ", "ر", "ث", "ن", "ح"],
    cells,
  };
}

/** تقويم شهر محدد (UTC) — حضور + حصص تسميع مكتملة لكل يوم. */
export async function getAdminMonthCalendar(utcYear: number, utcMonthIndex0: number): Promise<AdminMonthCalendar> {
  const monthStart = new Date(Date.UTC(utcYear, utcMonthIndex0, 1, 12, 0, 0, 0));
  const monthEnd = new Date(Date.UTC(utcYear, utcMonthIndex0 + 1, 0, 12, 0, 0, 0));

  const [attendanceMonthByDay, sessionsMonthByDay] = await Promise.all([
    prisma.attendance.groupBy({
      by: ["date"],
      where: { date: { gte: monthStart, lte: monthEnd } },
      _count: { _all: true },
    }),
    (async () => {
      try {
        return await prisma.memorizationSession.groupBy({
          by: ["sessionDate"],
          where: { sessionDate: { gte: monthStart, lte: monthEnd }, status: "COMPLETED" },
          _count: { _all: true },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021") return [];
        throw e;
      }
    })(),
  ]);

  const attMonthMap = new Map<string, number>();
  for (const row of attendanceMonthByDay) {
    attMonthMap.set(utcDay(row.date), row._count._all);
  }
  const sessMonthMap = new Map<string, number>();
  for (const row of sessionsMonthByDay) {
    sessMonthMap.set(utcDay(row.sessionDate), row._count._all);
  }
  return buildMonthCalendarModel(monthStart, attMonthMap, sessMonthMap);
}

export async function getAdminDashboardBundle(): Promise<AdminDashboardBundle> {
  const todayStr = utcDay(new Date());
  const today = new Date(`${todayStr}T12:00:00.000Z`);
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const since14 = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000);
  const day14 = new Date(`${utcDay(since14)}T12:00:00.000Z`);

  const [attendanceToday, revenueAgg, recentSessionsRaw, overdueInvoices, activity, attendanceByDay] = await Promise.all([
    prisma.attendance.count({ where: { date: today } }),
    prisma.payment.aggregate({
      where: { paidAt: { gte: since30 } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    (async () => {
      try {
        return await prisma.memorizationSession.findMany({
          where: { status: "COMPLETED" },
          orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }],
          take: 10,
          include: { student: { select: { id: true, fullName: true } } },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021") return [];
        throw e;
      }
    })(),
    prisma.invoice.findMany({
      where: { status: "OVERDUE" },
      orderBy: { dueDate: "asc" },
      take: 8,
      include: { student: { select: { fullName: true } } },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 14,
      select: { id: true, action: true, entity: true, entityId: true, createdAt: true },
    }),
    prisma.attendance.groupBy({
      by: ["date"],
      where: { date: { gte: day14, lte: today } },
      _count: { _all: true },
    }),
  ]);

  let sessionsToday = 0;
  try {
    sessionsToday = await prisma.memorizationSession.count({
      where: { sessionDate: today, status: "COMPLETED" },
    });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021")) throw e;
  }

  const mapCounts = new Map<string, number>();
  for (const row of attendanceByDay) {
    mapCounts.set(utcDay(row.date), row._count._all);
  }
  const calendar14: AdminCalendarDay[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = utcDay(d);
    calendar14.push({ date: key, attendanceCount: mapCounts.get(key) ?? 0 });
  }

  const recentSessions: AdminRecentSession[] = recentSessionsRaw.map((s) => ({
    id: s.id,
    sessionDate: s.sessionDate,
    rating: s.rating,
    studentId: s.studentId,
    student: s.student,
  }));

  return {
    todayStr,
    attendanceToday,
    sessionsToday,
    revenue30d: revenueAgg._sum.amount ?? new Prisma.Decimal(0),
    paymentsCount30d: revenueAgg._count._all,
    recentSessions,
    overdueInvoices,
    activity,
    calendar14,
  };
}
