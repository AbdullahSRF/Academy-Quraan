import "server-only";

import { Role, type PrismaClient } from "@prisma/client";

export function adminEmailFromEnv(): string {
  const raw = process.env.ADMIN_EMAIL ?? "admin@academy.local";
  return raw.trim().toLowerCase();
}

/** إنشاء أو تحديث حساب المشرف من ADMIN_EMAIL و ADMIN_PASSWORD (نفس منطق الـ seed). */
export async function upsertAdminUserFromEnv(db: PrismaClient): Promise<void> {
  const bcrypt = (await import("bcryptjs")).default;
  const email = adminEmailFromEnv();
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    await db.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        role: Role.ADMIN,
        emailVerified: new Date(),
      },
    });
    const hasProfile = await db.profile.findUnique({ where: { userId: existing.id } });
    if (!hasProfile) {
      await db.profile.create({ data: { userId: existing.id } });
    }
    return;
  }

  const user = await db.user.create({
    data: {
      email,
      name: "الشيخ عبدالله مخلوف",
      role: Role.ADMIN,
      passwordHash,
      emailVerified: new Date(),
    },
  });

  await db.profile.create({
    data: { userId: user.id },
  });
}
