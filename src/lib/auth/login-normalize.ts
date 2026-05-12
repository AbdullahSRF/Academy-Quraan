/** إزالة مسافات/أحرف غير مرئية شائعة عند اللصق من واتساب أو محررات RTL */
const INVISIBLE = /[\u200B-\u200D\uFEFF\u202A-\u202E]/g;

export function normalizeLoginEmail(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.replace(INVISIBLE, "").trim().toLowerCase();
}

/** لا نستخدم trim — قد تكون المسافات جزءًا من كلمة المرور؛ نزيل فقط الأحرف الخفية. */
export function normalizeLoginPassword(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.replace(INVISIBLE, "");
}

/** يستخرج قيمة الحقل من body الـ form (قد تصل كـ string أو مصفوفة عند تكرار الاسم). */
export function coerceCredentialField(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  if (value == null) return "";
  return String(value);
}
