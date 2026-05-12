/** إزالة مسافات/أحرف غير مرئية شائعة عند اللصق من واتساب أو محررات RTL */
const INVISIBLE = /[\u200B-\u200D\uFEFF\u202A-\u202E]/g;

export function normalizeLoginEmail(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.replace(INVISIBLE, "").trim().toLowerCase();
}

/** لا نُحوّل الأحرف إلى lowercase — فقط تنظيف الحواف والأحرف الخفية */
export function normalizeLoginPassword(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.replace(INVISIBLE, "").trim();
}
