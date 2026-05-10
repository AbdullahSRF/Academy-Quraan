import { Prisma } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";

export type SessionDraftPayload = {
  homeworkNext?: string;
  notes?: string;
  newStartSurah?: number;
  newStartAyah?: number;
  newEndSurah?: number;
  newEndAyah?: number;
  autoPromoteCompletedSurah?: boolean;
};

export async function upsertMemorizationSessionDraftDb(input: {
  studentId: string;
  sessionDate: Date;
  payload: SessionDraftPayload;
}) {
  const d = input.sessionDate;
  const dateOnly = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  return prisma.memorizationSessionDraft.upsert({
    where: { studentId_sessionDate: { studentId: input.studentId, sessionDate: dateOnly } },
    create: {
      studentId: input.studentId,
      sessionDate: dateOnly,
      payload: input.payload as Prisma.InputJsonValue,
    },
    update: { payload: input.payload as Prisma.InputJsonValue },
  });
}

export async function getMemorizationSessionDraftDb(studentId: string, sessionDate: Date) {
  const d = sessionDate;
  const dateOnly = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  try {
    return await prisma.memorizationSessionDraft.findUnique({
      where: { studentId_sessionDate: { studentId, sessionDate: dateOnly } },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021") return null;
    throw e;
  }
}
