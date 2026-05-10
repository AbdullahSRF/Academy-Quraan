import prisma from "@/infrastructure/db/prisma";

export type ParentChildRow = {
  id: string;
  fullName: string;
  status: string;
  level: string | null;
};

/** أبناء ولي الأمر المرتبطين بحسابه. */
export async function listChildrenForParentUser(userId: string): Promise<ParentChildRow[]> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      parent: {
        select: {
          students: {
            select: {
              student: { select: { id: true, fullName: true, status: true, level: true } },
            },
          },
        },
      },
    },
  });

  const rows = profile?.parent?.students ?? [];
  return rows.map((sp) => ({
    id: sp.student.id,
    fullName: sp.student.fullName,
    status: sp.student.status,
    level: sp.student.level,
  }));
}

export async function getParentIdForUser(userId: string): Promise<string | null> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { parent: { select: { id: true } } },
  });
  return profile?.parent?.id ?? null;
}

/** يتحقق أن الطالب من ضمن أبناء ولي الأمر. */
export async function parentHasStudent(parentId: string, studentId: string): Promise<boolean> {
  const row = await prisma.studentParent.findFirst({
    where: { parentId, studentId },
    select: { studentId: true },
  });
  return !!row;
}
