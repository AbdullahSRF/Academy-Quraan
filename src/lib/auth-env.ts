/** سر الجلسات — يدعم AUTH_SECRET واسم NextAuth القديم. */
export function getAuthSecret(): string | undefined {
  const s = process.env.AUTH_SECRET?.trim() ?? process.env.NEXTAUTH_SECRET?.trim();
  return s || undefined;
}

/** قاعدة التطبيق لـ Auth بدون شرطة مائلة أخيرة (متوافق مع توصيات الإنتاج). */
export function getNormalizedAuthBaseUrl(): string | undefined {
  const raw = process.env.AUTH_URL?.trim() ?? process.env.NEXTAUTH_URL?.trim();
  if (!raw) return undefined;
  return raw.replace(/\/$/, "");
}
