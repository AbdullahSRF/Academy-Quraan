import prisma from "@/infrastructure/db/prisma";
import type { Role } from "@prisma/client";

export type UserAccountRow = {
  userId: string;
  name: string | null;
  email: string | null;
  role: Role;
  disabled: boolean;
  createdAt: Date;
  studentId: string | null;
  parentId: string | null;
};

export type UserAccountRowSerialized = Omit<UserAccountRow, "createdAt"> & { createdAt: string };

/** حسابات الطلاب وأولياء الأمور (بدون المشرفين) لجدول الإدارة. */
export async function listSchoolUserAccounts(): Promise<UserAccountRow[]> {
  const users = await prisma.user.findMany({
    where: { role: { in: ["STUDENT", "PARENT"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      disabled: true,
      createdAt: true,
      profile: {
        select: {
          student: { select: { id: true } },
          parent: { select: { id: true } },
        },
      },
    },
  });

  return users.map((u) => ({
    userId: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    disabled: u.disabled,
    createdAt: u.createdAt,
    studentId: u.profile?.student?.id ?? null,
    parentId: u.profile?.parent?.id ?? null,
  }));
}
