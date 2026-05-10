import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { globalAyahIndex } from "../src/lib/quran/verse-counts";

const prisma = new PrismaClient();

/** مناطق حفظ افتراضية لكل طالب (إن لم تكن موجودة). */
async function seedSubscriptionDefaults() {
  const planCount = await prisma.subscriptionPlan.count();
  if (planCount === 0) {
    await prisma.subscriptionPlan.createMany({
      data: [
        {
          name: "حلقة شهرية — قياسي",
          code: "MONTHLY_STD",
          description: "باقة افتراضية من الـ seed",
          priceMonthly: 300,
          currency: "SAR",
        },
        {
          name: "مراجعة مكثفة",
          code: "REVIEW_PLUS",
          description: "باقة أعلى سعرًا (مثال)",
          priceMonthly: 450,
          currency: "SAR",
        },
      ],
    });
    console.log("تم إنشاء باقات اشتراك افتراضية.");
  }

  const student = await prisma.student.findFirst({ orderBy: { fullName: "asc" } });
  const plan = await prisma.subscriptionPlan.findFirst({ where: { active: true, code: "MONTHLY_STD" } });
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
      notes: "من الـ seed — عدّل أو ألغِ من لوحة الاشتراكات",
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

function adminEmailFromEnv() {
  const raw = process.env.ADMIN_EMAIL ?? "admin@academy.local";
  return raw.trim().toLowerCase();
}

async function main() {
  const email = adminEmailFromEnv();
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);

  if ((await prisma.academySettings.count()) === 0) {
    await prisma.academySettings.create({
      data: {
        academyName: "أكاديمية تحفيظ القرآن الكريم",
        timezone: "Asia/Riyadh",
      },
    });
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        role: Role.ADMIN,
        emailVerified: new Date(),
      },
    });
    const hasProfile = await prisma.profile.findUnique({ where: { userId: existing.id } });
    if (!hasProfile) {
      await prisma.profile.create({ data: { userId: existing.id } });
    }
    console.log("تم تحديث كلمة مرور المشرف وربطها بـ .env الحالي:", email);
    await bootstrapMemorizationZonesForAllStudents();
    await seedSubscriptionDefaults();
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: "الشيخ عبدالله مخلوف",
      role: Role.ADMIN,
      passwordHash,
      emailVerified: new Date(),
    },
  });

  await prisma.profile.create({
    data: { userId: user.id },
  });

  console.log("تم إنشاء حساب المشرف:", email);
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
