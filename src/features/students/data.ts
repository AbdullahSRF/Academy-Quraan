import { Role } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";

export async function listStudentsForAdmin() {
  return prisma.student.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      schedules: true,
      profile: {
        include: {
          user: { select: { id: true, email: true } },
        },
      },
    },
  });
}

/** يربط حساب المستخدم (طالب) بسجل الطالب في الأكاديمية. */
export async function getStudentForUserId(userId: string) {
  return prisma.profile.findUnique({
    where: { userId },
    select: { student: { select: { id: true, fullName: true } } },
  });
}

export async function getStudentForAdmin(id: string) {
  return prisma.student.findUnique({
    where: { id },
    include: {
      schedules: true,
      profile: {
        include: {
          user: { select: { id: true, email: true } },
        },
      },
    },
  });
}

export async function createStudentRecord(input: {
  fullName: string;
  age?: number;
  phone?: string | null;
  parentPhone?: string | null;
  address?: string | null;
  level?: string | null;
  status: "REGULAR" | "PAUSED" | "FROZEN" | "WITHDRAWN" | "ARCHIVED";
}) {
  const internalEmail = `student.${crypto.randomUUID()}@internal.academy`;

  const created = await prisma.user.create({
    data: {
      email: internalEmail,
      name: input.fullName,
      role: Role.STUDENT,
      profile: {
        create: {
          student: {
            create: {
              fullName: input.fullName,
              age: input.age ?? null,
              phone: input.phone ?? null,
              parentPhone: input.parentPhone ?? null,
              address: input.address ?? null,
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
  }

  return created;
}

export async function updateStudentRecord(
  studentId: string,
  input: {
    fullName: string;
    age?: number;
    phone?: string | null;
    parentPhone?: string | null;
    address?: string | null;
    level?: string | null;
    status: "REGULAR" | "PAUSED" | "FROZEN" | "WITHDRAWN" | "ARCHIVED";
  },
) {
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
        address: input.address ?? null,
        level: input.level ?? null,
        status: input.status,
      },
    }),
  ]);
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
