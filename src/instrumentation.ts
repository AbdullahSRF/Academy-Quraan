import { getAuthSecret } from "@/lib/auth-env";
import { assertProductionSecrets } from "@/lib/env.server";

/** يُستدعى عند بدء خادم Node (مثل `next start`). لا يعمل على Edge. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    assertProductionSecrets();
  } catch (e) {
    console.error("[أكاديمية التحفيظ]", e instanceof Error ? e.message : e);
  }

  const secret = getAuthSecret();
  if (process.env.NODE_ENV === "production" && (!secret || String(secret).trim().length < 16)) {
    console.error(
      "[أكاديمية التحفيظ] AUTH_SECRET غير مضبوط أو قصير جدًا — عيّن قيمة قوية في .env (مثلاً: openssl rand -base64 32). بدونها تفشل الجلسات وتبدو المنصة «لا تفتح».",
    );
  }

  try {
    const { default: prisma } = await import("@/infrastructure/db/prisma");
    const { upsertAdminUserFromEnv } = await import("@/lib/auth/upsert-admin-from-env");
    await upsertAdminUserFromEnv(prisma);
  } catch (e) {
    console.warn(
      "[أكاديمية التحفيظ] لم تُزامَن بيانات المشرف من .env (تأكد من DATABASE_URL وتشغيل قاعدة البيانات):",
      e instanceof Error ? e.message : e,
    );
  }
}
