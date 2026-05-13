import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "@/infrastructure/db/prisma";

export type ParentWithAccountRow = {
  parentId: string;
  userId: string;
  name: string | null;
  email: string | null;
  disabled: boolean;
  hasPassword: boolean;
  children: { studentId: string; fullName: string; relation: string | null; isPrimary: boolean }[];
};

export async function listParentsWithAccounts(): Promise<ParentWithAccountRow[]> {
  const parents = await prisma.parent.findMany({
    orderBy: { id: "desc" },
    include: {
      profile: {
        include: {
          user: { select: { id: true, name: true, email: true, disabled: true, passwordHash: true } },
        },
      },
      students: {
        include: { student: { select: { id: true, fullName: true } } },
      },
    },
  });

  return parents.map((p) => {
    const u = p.profile.user;
    return {
      parentId: p.id,
      userId: u.id,
      name: u.name,
      email: u.email,
      disabled: u.disabled,
      hasPassword: !!u.passwordHash,
      children: p.students.map((sp) => ({
        studentId: sp.student.id,
        fullName: sp.student.fullName,
        relation: sp.relation,
        isPrimary: sp.isPrimary,
      })),
    };
  });
}

export async function createParentUserRecord(input: { name: string; email: string; tempPassword: string }) {
  const emailNorm = input.email.trim().toLowerCase();
  const dup = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (dup) throw new Error("EMAIL_IN_USE");
  const passwordHash = await bcrypt.hash(input.tempPassword, 12);
  return prisma.user.create({
    data: {
      email: emailNorm,
      name: input.name.trim(),
      role: Role.PARENT,
      passwordHash,
      disabled: false,
      profile: {
        create: {
          parent: { create: {} },
        },
      },
    },
    include: {
      profile: { include: { parent: true } },
    },
  });
}

export async function linkParentToStudent(parentId: string, studentId: string, relation: string | null, isPrimary: boolean) {
  await prisma.studentParent.create({
    data: {
      parentId,
      studentId,
      relation: relation?.trim() || null,
      isPrimary,
    },
  });
}

export async function unlinkParentFromStudent(parentId: string, studentId: string) {
  await prisma.studentParent.delete({
    where: { studentId_parentId: { studentId, parentId } },
  });
}

export async function listStudentsMinimalForLinking() {
  return prisma.student.findMany({
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true, status: true },
    where: { status: { not: "ARCHIVED" } },
  });
}

export async function setParentPasswordByUserId(userId: string, plainPassword: string) {
  const hash = await bcrypt.hash(plainPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hash, disabled: false },
  });
}

export async function setParentDisabledByUserId(userId: string, disabled: boolean) {
  await prisma.user.update({
    where: { id: userId },
    data: { disabled },
  });
}
