import "server-only";

import NextAuth from "next-auth";
import authConfig from "@/auth.config";

/**
 * قراءة الجلسة (JWT) فقط — بدون مزودات تعتمد على Node (bcrypt / Prisma).
 * يُستورد من Server Components ومسارات API؛ لا يُسحب إلى حزمة العميل كـ `crypto`.
 */
export const { auth } = NextAuth({
  ...authConfig,
  providers: [],
});
