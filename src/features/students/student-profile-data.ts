import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";

export async function getStudentProfileBundle(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      schedules: true,
      profile: { include: { user: { select: { id: true, email: true } } } },
    },
  });
  if (!student) return null;

  const [invoices, attendances] = await Promise.all([
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
  ]);

  return { student, invoices, attendances };
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
