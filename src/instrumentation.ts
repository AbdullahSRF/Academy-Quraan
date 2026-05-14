import { getAuthSecret } from "@/lib/auth-env";
import { assertProductionSecrets } from "@/lib/env.server";

/**
 * يُستدعى عند بدء الخادم.
 * لا نستورد هنا Prisma/bcrypt حتى لا تُسحَب إلى حزم Edge أو عميل Webpack (فشل `crypto` على Vercel).
 * مزامنة حساب المشرف من .env تتم عبر `npm run db:seed` (أو أمر seed في مرحلة النشر).
 */
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
}
