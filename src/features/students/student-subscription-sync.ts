import prisma from "@/infrastructure/db/prisma";
import { assertFixedPlanId } from "@/features/subscriptions/data";

/** يربط أو يحدّث اشتراكًا نشطًا للطالب بباقة معتمدة (للاستدعاء بعد إنشاء/تحديث الطالب). */
export async function syncStudentActiveSubscriptionPlan(studentId: string, planId: string | undefined) {
  if (!planId?.trim()) return;
  if (!(await assertFixedPlanId(planId.trim()))) return;

  const started = new Date();
  started.setUTCHours(12, 0, 0, 0);

  const existing = await prisma.studentSubscription.findFirst({
    where: { studentId, status: "ACTIVE" },
    orderBy: { startedAt: "desc" },
  });

  if (existing) {
    await prisma.studentSubscription.update({
      where: { id: existing.id },
      data: { planId: planId.trim() },
    });
    return;
  }

  await prisma.studentSubscription.create({
    data: {
      studentId,
      planId: planId.trim(),
      status: "ACTIVE",
      startedAt: started,
    },
  });
}
