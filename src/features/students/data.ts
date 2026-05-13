import { Role } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";
import type { StudentUpsertInput } from "@/features/students/schemas/student.schema";
import { syncStudentActiveSubscriptionPlan } from "@/features/students/student-subscription-sync";

export async function getStudentForAdmin(id: string) {
  return prisma.student.findUnique({
    where: { id },
    include: {
      schedules: true,
      profile: {
        include: {
          user: { select: { id: true, email: true, disabled: true } },
        },
      },
    },
  });
}

export async function createStudentRecord(input: StudentUpsertInput) {
  const created = await prisma.user.create({
    data: {
      email: null,
      name: input.fullName,
      role: Role.STUDENT,
      passwordHash: null,
      disabled: false,
      profile: {
        create: {
          student: {
            create: {
              fullName: input.fullName,
              age: input.age ?? null,
              phone: input.phone ?? null,
              parentPhone: input.parentPhone ?? null,
              level: input.level ?? null,
              status: input.status,
            },
          },
        },
      },
    },
    include: {
      profile: {
        include: { student: true },
      },
    },
  });

  const studentId = created.profile?.student?.id;
  if (studentId) {
    const { ensureStudentMemorizationBootstrap } = await import("@/features/memorization-v2/data/zones");
    await ensureStudentMemorizationBootstrap(studentId);
    await syncStudentActiveSubscriptionPlan(studentId, input.subscriptionPlanId);
  }

  return created;
}

export async function updateStudentRecord(studentId: string, input: StudentUpsertInput) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { profile: { include: { user: true } } },
  });
  if (!student?.profile?.user) {
    throw new Error("STUDENT_NOT_FOUND");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: student.profile.user.id },
      data: { name: input.fullName },
    }),
    prisma.student.update({
      where: { id: studentId },
      data: {
        fullName: input.fullName,
        age: input.age ?? null,
        phone: input.phone ?? null,
        parentPhone: input.parentPhone ?? null,
        level: input.level ?? null,
        status: input.status,
      },
    }),
  ]);

  await syncStudentActiveSubscriptionPlan(studentId, input.subscriptionPlanId);
}

export async function archiveStudentRecord(studentId: string) {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new Error("STUDENT_NOT_FOUND");
  await prisma.student.update({
    where: { id: studentId },
    data: { status: "ARCHIVED" },
  });
}

export async function deleteStudentCascade(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { profile: true },
  });
  if (!student) {
    throw new Error("STUDENT_NOT_FOUND");
  }

  await prisma.user.delete({
    where: { id: student.profile.userId },
  });
}
