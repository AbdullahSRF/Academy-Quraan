import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";

export type StudentProfileUserMeta = {
  id: string;
  email: string | null;
  disabled: boolean;
  hasPassword: boolean;
};

export async function getStudentProfileBundle(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      schedules: true,
      profile: {
        include: {
          user: { select: { id: true, email: true, disabled: true, passwordHash: true } },
        },
      },
    },
  });
  if (!student) return null;

  const [invoices, attendances, subscriptions] = await Promise.all([
    prisma.invoice.findMany({
      where: { studentId },
      orderBy: { issuedAt: "desc" },
      take: 24,
      include: { payments: true },
    }),
    prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
      take: 40,
    }),
    prisma.studentSubscription.findMany({
      where: { studentId },
      orderBy: { startedAt: "desc" },
      include: {
        plan: true,
        student: { select: { id: true, fullName: true, status: true } },
      },
    }),
  ]);

  const u = student.profile?.user;
  const userMeta: StudentProfileUserMeta | null = u
    ? {
        id: u.id,
        email: u.email,
        disabled: u.disabled,
        hasPassword: !!u.passwordHash,
      }
    : null;

  const studentOut = {
    ...student,
    profile: student.profile
      ? {
          ...student.profile,
          user: userMeta,
        }
      : null,
  };

  return { student: studentOut, invoices, attendances, subscriptions };
}

export function sumPaymentsForInvoices(invoices: { payments: { amount: Prisma.Decimal }[] }[]): Prisma.Decimal {
  let t = new Prisma.Decimal(0);
  for (const inv of invoices) {
    for (const p of inv.payments) {
      t = t.add(p.amount);
    }
  }
  return t;
}
