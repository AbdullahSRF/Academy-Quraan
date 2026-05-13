import { PrismaClient } from "@prisma/client";
import { upsertAdminUserFromEnv } from "../src/lib/auth/upsert-admin-from-env";
import { globalAyahIndex } from "../src/lib/quran/verse-counts";
import { syncFixedSubscriptionPlans } from "../src/features/subscriptions/data";

const prisma = new PrismaClient();

/** مزامنة الباقات الثابتة وربط اشتراك تجريبي اختياري. */
async function seedSubscriptionDefaults() {
  await syncFixedSubscriptionPlans();

  const student = await prisma.student.findFirst({ orderBy: { fullName: "asc" } });
  const plan = await prisma.subscriptionPlan.findFirst({ where: { active: true, code: "ACADEMY_PLAN_8" } });
  if (!student || !plan) return;

  const hasActive = await prisma.studentSubscription.findFirst({
    where: { studentId: student.id, planId: plan.id, status: "ACTIVE" },
  });
  if (hasActive) return;

  const start = new Date();
  start.setUTCHours(12, 0, 0, 0);
  await prisma.studentSubscription.create({
    data: {
      studentId: student.id,
      planId: plan.id,
      status: "ACTIVE",
      startedAt: start,
      notes: "من الـ seed — يمكن تعديله من لوحة الاشتراكات",
    },
  });
  console.log("تم ربط اشتراك تجريبي لأول طالب:", student.fullName);
}

async function bootstrapMemorizationZonesForAllStudents() {
  const students = await prisma.student.findMany({ select: { id: true } });
  const start = globalAyahIndex(1, 1);
  for (const s of students) {
    const n = await prisma.studentMemorizationZone.count({ where: { studentId: s.id } });
    if (n > 0) continue;
    await prisma.studentMemorizationZone.createMany({
      data: [
        {
          studentId: s.id,
          zone: "NEW",
          startSurah: 1,
          startAyah: 1,
          endSurah: 1,
          endAyah: 1,
          startGlobalIndex: start,
          endGlobalIndex: start,
        },
        { studentId: s.id, zone: "NEAR_REVIEW" },
        { studentId: s.id, zone: "FAR_REVIEW" },
      ],
    });
    await prisma.studentMemorizationStats.upsert({
      where: { studentId: s.id },
      create: { studentId: s.id },
      update: {},
    });
  }
}

async function main() {
  if ((await prisma.academySettings.count()) === 0) {
    await prisma.academySettings.create({
      data: {
        academyName: "أكاديمية تحفيظ القرآن الكريم",
        timezone: "Asia/Riyadh",
      },
    });
  }

  await upsertAdminUserFromEnv(prisma);
  console.log("تم مزامنة حساب المشرف من .env (ADMIN_EMAIL / ADMIN_PASSWORD).");
  console.log("غيّر ADMIN_PASSWORD في الإنتاج ولا ترفع .env إلى Git.");

  await bootstrapMemorizationZonesForAllStudents();
  await seedSubscriptionDefaults();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
