import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import authConfig from "@/auth.config";
import prisma from "@/infrastructure/db/prisma";
import type { AppRole } from "@/auth.config";
import { logger } from "@/lib/logger";

declare module "next-auth" {
  interface User {
    role: AppRole;
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "البريد", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const parsed = credentialsSchema.safeParse(credentials);
          if (!parsed.success) return null;

          const email = parsed.data.email.trim().toLowerCase();

          const user = await prisma.user.findUnique({
            where: { email },
          });
          if (!user?.passwordHash) return null;

          const valid = await bcrypt.compare(parsed.data.password.trim(), user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email ?? undefined,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            role: user.role as AppRole,
          };
        } catch (e) {
          logger.error("credentials authorize failed", { err: String(e) });
          return null;
        }
      },
    }),
  ],
});
