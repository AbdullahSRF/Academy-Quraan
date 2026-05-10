import { assertProductionSecrets } from "@/lib/env.server";

/** يُستدعى عند بدء خادم Node (مثل `next start`). لا يعمل على Edge. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    assertProductionSecrets();
  } catch (e) {
    console.error("[أكاديمية التحفيظ]", e instanceof Error ? e.message : e);
  }

  const secret = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || String(secret).trim().length < 16)) {
    console.error(
      "[أكاديمية التحفيظ] AUTH_SECRET غير مضبوط أو قصير جدًا — عيّن قيمة قوية في .env (مثلاً: openssl rand -base64 32). بدونها تفشل الجلسات وتبدو المنصة «لا تفتح».",
    );
  }
}
