import { auth } from "@/auth";

/** جلسة أدمن صالحة مع `user.id` — للإجراءات والـ API. */
export async function requireAdminSession() {
  const s = await auth();
  if (s?.user?.role !== "ADMIN" || !s.user.id) return null;
  return s;
}
