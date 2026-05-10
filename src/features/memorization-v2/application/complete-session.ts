import { Prisma, type AttendanceStatus, type SessionPaymentStatus, type SessionRating } from "@prisma/client";
import prisma from "@/infrastructure/db/prisma";
import { globalAyahIndex } from "@/lib/quran/verse-counts";
import { memorizationCoveragePercent, progressLevelFromPercent } from "../domain/coverage";
import { shouldApplySurahPromotion } from "../domain/policies";
import { applySurahCompletionPromotion, extendNewZoneAfterSession } from "../domain/promotion";
import { assertWorkWithinZoneBounds, getFarZoneGlobalBounds, getNearZoneGlobalBounds } from "../domain/session-work-range";
import { ensureStudentMemorizationBootstrap, loadZonesAsRows, persistZones } from "../data/zones";
import type { AyahRangeSnapshot } from "../domain/snapshot";

function snap(s: number, a: number, e: number, ea: number): AyahRangeSnapshot {
  return {
    surahStart: s,
    ayahStart: a,
    surahEnd: e,
    ayahEnd: ea,
    startGlobalIndex: globalAyahIndex(s, a),
    endGlobalIndex: globalAyahIndex(e, ea),
  };
}

export async function runCompleteMemorizationSession(input: {
  studentId: string;
  sessionDate: Date;
  attendanceStatus: AttendanceStatus;
  rating: SessionRating | null;
  notes: string | null;
  homeworkNext: string | null;
  durationMinutes: number | null;
  paymentStatus: SessionPaymentStatus;
  newStartSurah: number;
  newStartAyah: number;
  newEndSurah: number;
  newEndAyah: number;
  /** نطاق عمل الماضي القريب في الحصة (اختياري). */
  nearWork:
    | { startSurah: number; startAyah: number; endSurah: number; endAyah: number }
    | null;
  /** نطاق عمل الماضي البعيد في الحصة (اختياري). */
  farWork:
    | { startSurah: number; startAyah: number; endSurah: number; endAyah: number }
    | null;
  autoPromoteCompletedSurah: boolean;
  createdById: string;
  /** عند `paymentStatus === PAID`: مبلغ الدفعة بالعملة المحلية (إلزامي من طبقة الإجراء). */
  paymentAmount: number | null;
  paymentMethod: string | null;
}) {
  await prisma.$transaction(async (tx) => {
    await ensureStudentMemorizationBootstrap(input.studentId, tx);
    const zonesBefore = await loadZonesAsRows(input.studentId, tx);

    const d = input.sessionDate;
    const dateOnly = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

    const att = await tx.attendance.upsert({
      where: { studentId_date: { studentId: input.studentId, date: dateOnly } },
      create: {
        studentId: input.studentId,
        date: dateOnly,
        status: input.attendanceStatus,
      },
      update: { status: input.attendanceStatus },
    });

    const newSnap = snap(input.newStartSurah, input.newStartAyah, input.newEndSurah, input.newEndAyah);

    const nearSnap =
      zonesBefore.NEAR.startSurah &&
      zonesBefore.NEAR.startAyah &&
      zonesBefore.NEAR.endSurah &&
      zonesBefore.NEAR.endAyah
        ? snap(
            zonesBefore.NEAR.startSurah,
            zonesBefore.NEAR.startAyah,
            zonesBefore.NEAR.endSurah,
            zonesBefore.NEAR.endAyah,
          )
        : null;

    const farSnap =
      zonesBefore.FAR.startSurah &&
      zonesBefore.FAR.startAyah &&
      zonesBefore.FAR.endSurah &&
      zonesBefore.FAR.endAyah
        ? snap(
            zonesBefore.FAR.startSurah,
            zonesBefore.FAR.startAyah,
            zonesBefore.FAR.endSurah,
            zonesBefore.FAR.endAyah,
          )
        : null;

    let nearWorkSnap: AyahRangeSnapshot | null = null;
    if (input.nearWork) {
      assertWorkWithinZoneBounds(
        "الماضي القريب",
        input.nearWork.startSurah,
        input.nearWork.startAyah,
        input.nearWork.endSurah,
        input.nearWork.endAyah,
        getNearZoneGlobalBounds(zonesBefore.NEAR),
      );
      nearWorkSnap = snap(
        input.nearWork.startSurah,
        input.nearWork.startAyah,
        input.nearWork.endSurah,
        input.nearWork.endAyah,
      );
    }

    let farWorkSnap: AyahRangeSnapshot | null = null;
    if (input.farWork) {
      assertWorkWithinZoneBounds(
        "الماضي البعيد",
        input.farWork.startSurah,
        input.farWork.startAyah,
        input.farWork.endSurah,
        input.farWork.endAyah,
        getFarZoneGlobalBounds(zonesBefore.FAR),
      );
      farWorkSnap = snap(
        input.farWork.startSurah,
        input.farWork.startAyah,
        input.farWork.endSurah,
        input.farWork.endAyah,
      );
    }

    const shouldPromote = shouldApplySurahPromotion(
      {
        autoPromoteCompletedSurah: input.autoPromoteCompletedSurah,
        newEndSurah: input.newEndSurah,
        newEndAyah: input.newEndAyah,
      },
      zonesBefore,
    );

    let zonesAfter = zonesBefore;
    if (shouldPromote) {
      const p = applySurahCompletionPromotion(zonesBefore);
      zonesAfter = { NEW: p.newZone, NEAR: p.nearZone, FAR: p.farZone };
    } else {
      zonesAfter = {
        ...zonesBefore,
        NEW: extendNewZoneAfterSession(zonesBefore.NEW, input.newEndSurah, input.newEndAyah),
      };
    }

    await persistZones(input.studentId, zonesAfter, tx);

    const incAbsent = input.attendanceStatus === "ABSENT" ? 1 : 0;
    const coveragePct = memorizationCoveragePercent(zonesAfter);
    const progressLevel = progressLevelFromPercent(coveragePct);

    const sessionRow = await tx.memorizationSession.create({
      data: {
        studentId: input.studentId,
        sessionDate: dateOnly,
        status: "COMPLETED",
        attendanceId: att.id,
        newSnapshot: newSnap as unknown as Prisma.InputJsonValue,
        nearSnapshot: nearSnap === null ? undefined : (nearSnap as unknown as Prisma.InputJsonValue),
        farSnapshot: farSnap === null ? undefined : (farSnap as unknown as Prisma.InputJsonValue),
        nearWorkSnapshot: nearWorkSnap === null ? undefined : (nearWorkSnap as unknown as Prisma.InputJsonValue),
        farWorkSnapshot: farWorkSnap === null ? undefined : (farWorkSnap as unknown as Prisma.InputJsonValue),
        rating: input.rating ?? undefined,
        paymentStatus: input.paymentStatus,
        notes: input.notes ?? undefined,
        homeworkNext: input.homeworkNext ?? undefined,
        durationMinutes: input.durationMinutes ?? undefined,
        autoPromoteCompletedSurah: input.autoPromoteCompletedSurah,
        createdById: input.createdById,
      },
    });

    if (input.paymentStatus === "PAID" && input.paymentAmount != null && input.paymentAmount > 0) {
      const pay = await tx.payment.create({
        data: {
          studentId: input.studentId,
          amount: new Prisma.Decimal(input.paymentAmount),
          method: input.paymentMethod?.trim() || null,
          note: `حصة تسميع ${dateOnly.toISOString().slice(0, 10)}`,
          recordedById: input.createdById,
        },
      });
      await tx.memorizationSession.update({
        where: { id: sessionRow.id },
        data: { paymentId: pay.id },
      });
    }

    await tx.memorizationRecord.create({
      data: {
        studentId: input.studentId,
        type: "NEW_MEMORIZATION",
        sessionDate: dateOnly,
        fromSurah: String(input.newStartSurah),
        fromAyah: input.newStartAyah,
        toSurah: String(input.newEndSurah),
        toAyah: input.newEndAyah,
        notes: input.notes,
        createdById: input.createdById,
      },
    });

    if (input.nearWork) {
      await tx.memorizationRecord.create({
        data: {
          studentId: input.studentId,
          type: "REVIEW",
          sessionDate: dateOnly,
          fromSurah: String(input.nearWork.startSurah),
          fromAyah: input.nearWork.startAyah,
          toSurah: String(input.nearWork.endSurah),
          toAyah: input.nearWork.endAyah,
          notes: "مراجعة — الماضي القريب",
          createdById: input.createdById,
        },
      });
    }
    if (input.farWork) {
      await tx.memorizationRecord.create({
        data: {
          studentId: input.studentId,
          type: "REVIEW",
          sessionDate: dateOnly,
          fromSurah: String(input.farWork.startSurah),
          fromAyah: input.farWork.startAyah,
          toSurah: String(input.farWork.endSurah),
          toAyah: input.farWork.endAyah,
          notes: "مراجعة — الماضي البعيد",
          createdById: input.createdById,
        },
      });
    }

    await tx.studentMemorizationStats.upsert({
      where: { studentId: input.studentId },
      create: {
        studentId: input.studentId,
        sessionsCount: 1,
        absencesCount: incAbsent,
        lastSessionAt: new Date(),
        lastRating: input.rating ?? undefined,
        completionPercent: Math.round(coveragePct),
        progressLevel,
      },
      update: {
        sessionsCount: { increment: 1 },
        absencesCount: { increment: incAbsent },
        lastSessionAt: new Date(),
        lastRating: input.rating ?? undefined,
        completionPercent: Math.round(coveragePct),
        progressLevel,
      },
    });
  });
}
