import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import authConfig from "@/auth.config";
import prisma from "@/infrastructure/db/prisma";
import type { AppRole } from "@/auth.config";
import { normalizeLoginEmail, normalizeLoginPassword } from "@/lib/auth/login-normalize";
import { logger } from "@/lib/logger";

declare module "next-auth" {
  interface User {
    role: AppRole;
  }
}

const credentialsSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(1),
});

function isLikelyDatabaseConnectivityError(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientInitializationError) return true;
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    return ["P1001", "P1002", "P1017"].includes(e.code);
  }
  const msg = e instanceof Error ? e.message : String(e);
  return /Can't reach database server|connection refused|ECONNREFUSED|ETIMEDOUT|timeout/i.test(msg);
}

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
          const email = normalizeLoginEmail(credentials?.email);
          const password = normalizeLoginPassword(credentials?.password);
          const parsed = credentialsSchema.safeParse({ email, password });
          if (!parsed.success) return null;

          const user = await prisma.user.findFirst({
            where: { email: { equals: parsed.data.email, mode: "insensitive" } },
          });
          if (!user?.passwordHash) return null;

          const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email ? user.email.trim().toLowerCase() : undefined,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            role: user.role as AppRole,
          };
        } catch (e) {
          if (isLikelyDatabaseConnectivityError(e)) {
            logger.error("credentials authorize: database unreachable", { err: String(e) });
          } else {
            logger.error("credentials authorize failed", { err: String(e) });
          }
          return null;
        }
      },
    }),
  ],
});
